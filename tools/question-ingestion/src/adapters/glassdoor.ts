import crypto from 'node:crypto';
import type { Page } from 'playwright';
import type { QuestionSourceAdapter, AdapterRunContext, AdapterRunResult } from './base.js';
import type { QuestionObservation } from '../types.js';

const GLASSDOOR_BASE_URL = 'https://www.glassdoor.com';

function generateObservationId(sourceName: string, sourceUrl: string, questionText: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${sourceName}:${sourceUrl}:${questionText}`)
    .digest('base64url')
    .slice(0, 16);
  return `obs-${hash}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLikelyInterviewQuestion(text: string): boolean {
  const trimmed = text.trim();
  
  // Length requirements
  if (trimmed.length < 20 || trimmed.length > 500) return false;
  
  // Exclude common non-question content
  const excludePatterns = [
    /^(how about|click|sign|log|join|explore|popular destinations)/i,
    /javascript/i,
    /var |const |let |function\s*\(/i,
    /\.prototype|__esModule/i,
    /cdn-cgi|beacon/i,
    /[;{}]/,
    /=>/,
    /\w+\.\w+\./,
  ];
  
  for (const pattern of excludePatterns) {
    if (pattern.test(trimmed)) return false;
  }
  
  // Must have words
  const words = trimmed.split(/\s+/).filter(w => /[a-zA-Z]{3,}/.test(w));
  if (words.length < 4) return false;
  
  // Should be a question or interview-related statement
  const questionIndicators = [
    /\?$/,
    /^(what|how|why|when|where|describe|tell|explain|walk me|give me|can you|do you|are you|is there)/i,
    /interview/i,
    /experience/i,
    /process/i,
    /technical/i,
    /coding/i,
    /system design/i,
    /behavioral/i,
    /question/i,
  ];
  
  return questionIndicators.some(p => p.test(trimmed));
}

export const glassdoorAdapter: QuestionSourceAdapter = {
  sourceName: 'glassdoor',

  async run(context: AdapterRunContext): Promise<AdapterRunResult> {
    const { companyName, browserPool, now: fetchedAt } = context;
    const observations: QuestionObservation[] = [];

    console.log(`[Glassdoor] Starting scrape for company: ${companyName}`);

    let page: Page | null = null;

    try {
      page = await browserPool.createPage('glassdoor');
      await browserPool.waitForRateLimit('glassdoor');

      const companySlug = companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Try Glassdoor's interview search results page
      const searchUrl = `${GLASSDOOR_BASE_URL}/Interview/${encodeURIComponent(companyName)}-interview-questions-SRCH_KE0,${companyName.length}.htm`;
      console.log(`[Glassdoor] Navigating to search: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(3000);

      // Try to find company link in search results
      const companyLinkSelectors = [
        `a[href*="${companySlug}"][href*="Interview"]`,
        `a[href*="${companySlug}"][href*="-E"]`,
        `a[href*="Interview-Questions"][href*="${companySlug}"]`,
      ];

      let interviewPageUrl: string | null = null;
      
      for (const selector of companyLinkSelectors) {
        const links = await page.$$(selector);
        for (const link of links) {
          const href = await link.getAttribute('href');
          if (href && href.includes('Interview') && href.includes('-E')) {
            interviewPageUrl = href.startsWith('http') ? href : GLASSDOOR_BASE_URL + href;
            console.log(`[Glassdoor] Found interview page: ${interviewPageUrl}`);
            break;
          }
        }
        if (interviewPageUrl) break;
      }

      // Navigate to the interview page if found
      if (interviewPageUrl) {
        await browserPool.waitForRateLimit('glassdoor');
        console.log(`[Glassdoor] Navigating to interview page: ${interviewPageUrl}`);
        await page.goto(interviewPageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(3000);
      }

      const currentUrl = page.url();
      console.log(`[Glassdoor] Current URL: ${currentUrl}`);

      // Extract interview questions
      console.log('[Glassdoor] Extracting interview questions...');
      
      // Look for interview question content
      const questionSelectors = [
        // Specific Glassdoor question elements
        '[data-test="interview-question-content"]',
        '[data-test="InterviewQuestion"]',
        '.interviewQuestion',
        // Question text in review cards
        '[data-test="review-content"] p',
        '[data-test="question-text"]',
        // Generic content areas that might contain questions
        '[class*="Question"]',
        '[class*="question"]',
      ];

      for (const selector of questionSelectors) {
        const elements = await page.$$(selector);
        console.log(`[Glassdoor] Selector "${selector}" found ${elements.length} elements`);
        
        for (const el of elements) {
          try {
            const text = await el.textContent();
            if (text && isLikelyInterviewQuestion(text)) {
              // Try to find job title context
              let roleTitle: string | undefined;
              const parentCard = await el.$('xpath/ancestor::*[contains(@class, "Review") or contains(@class, "Card") or contains(@data-test, "review")][1]');
              if (parentCard) {
                const titleEl = await parentCard.$('[class*="title"], [class*="job"], [data-test*="title"]');
                if (titleEl) {
                  const titleText = await titleEl.textContent();
                  if (titleText && titleText.length < 80 && !titleText.includes('Interview')) {
                    roleTitle = titleText.trim();
                  }
                }
              }

              const questionText = text.trim();
              console.log(`[Glassdoor] Found question: "${questionText.slice(0, 100)}..."`);
              
              const observation: QuestionObservation = {
                id: generateObservationId('glassdoor', currentUrl, questionText),
                companyName,
                roleTitle,
                questionText,
                provenance: {
                  sourceName: 'glassdoor',
                  sourceUrl: currentUrl,
                  fetchedAt,
                  accessMethod: 'browser',
                },
              };
              observations.push(observation);
            }
          } catch {
            // Skip failed elements
          }
        }
        
        if (observations.length > 0) {
          console.log(`[Glassdoor] Found ${observations.length} questions, stopping selector loop`);
          break;
        }
      }

      // Fallback: extract from page body text
      if (observations.length === 0) {
        console.log('[Glassdoor] Trying fallback extraction from visible text...');
        
        // Use $$eval to extract text from all elements
        const allText = await page.$$eval('p, div, span, li', (elements) => {
          return elements.map(el => el.textContent?.trim() || '').filter(t => t.length >= 20);
        });

        for (const text of allText) {
          if (isLikelyInterviewQuestion(text)) {
            console.log(`[Glassdoor] Fallback found: "${text.slice(0, 100)}..."`);
            const observation: QuestionObservation = {
              id: generateObservationId('glassdoor', currentUrl, text),
              companyName,
              questionText: text,
              provenance: {
                sourceName: 'glassdoor',
                sourceUrl: currentUrl,
                fetchedAt,
                accessMethod: 'browser',
              },
            };
            observations.push(observation);
          }
        }
      }

      // Try to get company values
      await browserPool.waitForRateLimit('glassdoor');
      
      const overviewUrl = currentUrl.replace('/Interview/', '/Overview/').replace('-Interview-Questions', '-Working-at');
      console.log(`[Glassdoor] Trying company overview: ${overviewUrl}`);
      
      try {
        await page.goto(overviewUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await sleep(2000);
        
        const valuesSelectors = [
          '[data-test="mission"]',
          '[data-test="values"]',
          '[class*="mission"]',
          '[class*="values"]',
          '[class*="Mission"]',
          '[class*="Values"]',
        ];

        for (const selector of valuesSelectors) {
          const elements = await page.$$(selector);
          for (const el of elements) {
            const text = await el.textContent();
            if (text && text.trim().length > 20 && text.trim().length < 500) {
              const valueText = text.trim();
              const observation: QuestionObservation = {
                id: generateObservationId('glassdoor', overviewUrl, `[Value] ${valueText}`),
                companyName,
                questionText: `[Company Value] ${valueText}`,
                provenance: {
                  sourceName: 'glassdoor',
                  sourceUrl: overviewUrl,
                  fetchedAt,
                  accessMethod: 'browser',
                },
              };
              observations.push(observation);
              console.log(`[Glassdoor] Found value: "${valueText.slice(0, 50)}..."`);
            }
          }
        }
      } catch {
        console.log('[Glassdoor] Could not access company overview');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Glassdoor] Error during scraping: ${errorMessage}`);
    } finally {
      if (page) {
        try {
          await page.close();
        } catch {
          // Ignore close errors
        }
      }
    }

    // Deduplicate
    const seen = new Set<string>();
    const uniqueObservations = observations.filter(obs => {
      if (seen.has(obs.id)) return false;
      seen.add(obs.id);
      return true;
    });

    console.log(`[Glassdoor] Total unique observations: ${uniqueObservations.length}`);
    return { observations: uniqueObservations };
  },
};

export default glassdoorAdapter;