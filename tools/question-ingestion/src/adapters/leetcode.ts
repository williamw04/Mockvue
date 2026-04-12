import type { QuestionSourceAdapter, AdapterRunContext, AdapterRunResult } from './base.js';
import type { QuestionObservation } from '../types.js';
import crypto from 'crypto';

type PlaywrightPage = Awaited<ReturnType<import('../browser.js').BrowserPool['createPage']>>;

function generateObservationId(sourceName: string, sourceUrl: string, questionText: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${sourceName}:${sourceUrl}:${questionText}`)
    .digest('base64url')
    .slice(0, 16);
  return `obs-${hash}`;
}

function extractQuestionFromTitle(title: string): string | null {
  const patterns = [
    /^(?:LeetCode\s*)?(\d+)\.?\s*(.+?)(?:\s*[-|]\s*.+)?$/i,
    /^(.+?)\s*[-|]\s*(?:Google|Amazon|Meta|Microsoft|Apple|Netflix|Uber|Lyft|Airbnb)/i,
    /^\[?(?:Google|Amazon|Meta|Microsoft|Apple|Netflix|Uber|Lyft|Airbnb)\]?\s*[-:]?\s*(.+)$/i,
    /^(.+?)\s*\((?:Easy|Medium|Hard)\)/i,
    /^Interview\s*(?:Question|Experience)?:?\s*(.+)$/i,
    /^Phone\s*Screen:?\s*(.+)$/i,
    /^Onsite:?\s*(.+)$/i,
    /^OA:?\s*(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const question = match[match.length - 1].trim();
      if (question.length > 10 && question.length < 500) {
        return question;
      }
    }
  }

  const cleanTitle = title
    .replace(/^\[[^\]]+\]\s*/, '')
    .replace(/\s*[-|]\s*(Google|Amazon|Meta|Microsoft|Apple|Netflix|Uber|Lyft|Airbnb).*$/gi, '')
    .trim();

  if (cleanTitle.length > 15 && cleanTitle.length < 300) {
    return cleanTitle;
  }

  return null;
}

function extractRoleFromTitle(title: string): string | undefined {
  const rolePatterns: [RegExp, string][] = [
    [/software engineer/i, 'Software Engineer'],
    [/senior/i, 'Senior Software Engineer'],
    [/staff/i, 'Staff Software Engineer'],
    [/principal/i, 'Principal Software Engineer'],
    [/frontend/i, 'Frontend Engineer'],
    [/backend/i, 'Backend Engineer'],
    [/full.?stack/i, 'Full Stack Engineer'],
    [/data scientist/i, 'Data Scientist'],
    [/ml engineer|machine learning/i, 'ML Engineer'],
    [/devops/i, 'DevOps Engineer'],
    [/sre|site reliability/i, 'SRE'],
    [/intern/i, 'Software Engineering Intern'],
    [/new grad|graduate/i, 'New Grad'],
    [/l[3-8]|level\s*[3-8]/i, 'Software Engineer'],
  ];

  for (const [pattern, role] of rolePatterns) {
    if (pattern.test(title)) {
      return role;
    }
  }

  return undefined;
}

function extractStageFromTitle(title: string): string | undefined {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('phone') || lowerTitle.includes('phone screen')) {
    return 'phone-screen';
  }
  if (lowerTitle.includes('onsite')) {
    return 'onsite';
  }
  if (lowerTitle.includes('oa') || lowerTitle.includes('online assessment')) {
    return 'online-assessment';
  }
  if (lowerTitle.includes('technical')) {
    return 'technical';
  }
  if (lowerTitle.includes('behavioral') || lowerTitle.includes('behavioural')) {
    return 'behavioral';
  }
  if (lowerTitle.includes('system design')) {
    return 'system-design';
  }
  if (lowerTitle.includes('coding')) {
    return 'coding';
  }

  return undefined;
}

export class LeetCodeAdapter implements QuestionSourceAdapter {
  readonly sourceName = 'leetcode';

  async run(context: AdapterRunContext): Promise<AdapterRunResult> {
    const { companyName, browserPool, now } = context;
    const observations: QuestionObservation[] = [];

    console.log(`[LeetCode] Starting scrape for company: ${companyName}`);

    const page = await browserPool.createPage('leetcode');

    try {
      await browserPool.waitForRateLimit('leetcode');

      const searchUrl = `https://leetcode.com/discuss/interview-question?query=${encodeURIComponent(companyName)}`;
      console.log(`[LeetCode] Navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3000);
      await page.waitForSelector('a[href*="/discuss/"], .discuss-list-container, [class*="discuss"]', { timeout: 20000 }).catch(() => {});

      await browserPool.waitForRateLimit('leetcode');

      const posts = await this.extractPostsFromPage(page, companyName);
      console.log(`[LeetCode] Found ${posts.length} posts on search page`);

      for (const post of posts.slice(0, 20)) {
        try {
          await browserPool.waitForRateLimit('leetcode');
          
          const postObservations = await this.extractQuestionsFromPost(page, post, companyName, now);
          observations.push(...postObservations);
          
          if (observations.length >= 50) {
            console.log('[LeetCode] Reached observation limit (50)');
            break;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(`[LeetCode] Error processing post: ${message}`);
        }
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[LeetCode] Error during scraping: ${message}`);
    } finally {
      await page.close().catch(() => {});
    }

    console.log(`[LeetCode] Completed with ${observations.length} observations`);
    return { observations };
  }

  private async extractPostsFromPage(page: PlaywrightPage, companyName: string): Promise<Array<{ url: string; title: string }>> {
    const posts: Array<{ url: string; title: string }> = [];

    try {
      const postElements = await page.$$eval(
        'a[href*="/discuss/"]',
        (links: unknown[], company: string) => {
          const results: Array<{ url: string; title: string }> = [];
          const lowerCompany = company.toLowerCase();
          
          for (const link of links as Element[]) {
            const href = link.getAttribute('href') || '';
            const text = link.textContent?.trim() || '';
            
            if (href.includes('/discuss/') && 
                (href.includes('/topic') || 
                text.toLowerCase().includes(lowerCompany) ||
                text.toLowerCase().includes('interview'))) {
              results.push({
                url: href.startsWith('http') ? href : `https://leetcode.com${href}`,
                title: text,
              });
            }
          }
          
          return results;
        },
        companyName
      );

      const seen = new Set<string>();
      for (const post of postElements) {
        if (!seen.has(post.url) && post.title.length > 5) {
          posts.push(post);
          seen.add(post.url);
        }
      }
    } catch (error) {
      console.error('[LeetCode] Error extracting posts:', error);
    }

    try {
      const additionalPosts = await page.$$eval(
        'a[href*="/discuss/topic/"]',
        (links: Element[]) => {
          const results: Array<{ url: string; title: string }> = [];
          
          for (const link of links) {
            const href = link.getAttribute('href') || '';
            const text = link.textContent?.trim() || '';
            
            results.push({
              url: href.startsWith('http') ? href : `https://leetcode.com${href}`,
              title: text,
            });
          }
          
          return results;
        }
      );

      const seen = new Set(posts.map(p => p.url));
      for (const post of additionalPosts) {
        if (!seen.has(post.url) && post.title.length > 5) {
          posts.push(post);
          seen.add(post.url);
        }
      }
    } catch (error) {
      console.error('[LeetCode] Error extracting additional posts:', error);
    }

    return posts;
  }

  private async extractQuestionsFromPost(
    page: PlaywrightPage,
    post: { url: string; title: string },
    companyName: string,
    fetchedAt: string
  ): Promise<QuestionObservation[]> {
    const observations: QuestionObservation[] = [];

    console.log(`[LeetCode] Visiting post: ${post.title.substring(0, 50)}...`);

    try {
      await page.goto(post.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForSelector('body', { timeout: 5000 }).catch(() => {});
    } catch {
      const titleQuestion = extractQuestionFromTitle(post.title);
      if (titleQuestion) {
        observations.push({
          id: generateObservationId(this.sourceName, post.url, titleQuestion),
          companyName,
          roleTitle: extractRoleFromTitle(post.title),
          stage: extractStageFromTitle(post.title),
          questionText: titleQuestion,
          provenance: {
            sourceName: this.sourceName,
            sourceUrl: post.url,
            fetchedAt,
            accessMethod: 'browser',
          },
        });
      }
      return observations;
    }

    try {
      const content = await page.$eval('body', (el: Element) => {
        const titleEl = el.querySelector('h1, [class*="title"], [class*="topic-title"]');
        const bodyEl = el.querySelector('[class*="content"], [class*="post"], [class*="body"], article, .discuss-markdown');
        
        return {
          title: titleEl?.textContent?.trim() || '',
          body: bodyEl?.textContent?.trim() || '',
        };
      });

      const fullText = `${content.title} ${content.body}`;
      
      const questionPatterns = [
        /(?:question|problem|asked):\s*(.+?)(?:\n|\.|$)/gi,
        /(?:given|find|design|implement|write)\s+.+?(?:\n\n|$)/gi,
        /(?:the problem was|the question was|they asked)\s*[:.]?\s*(.+?)(?:\n\n|$)/gi,
      ];

      const extractedQuestions: string[] = [];
      
      const titleQuestion = extractQuestionFromTitle(content.title || post.title);
      if (titleQuestion) {
        extractedQuestions.push(titleQuestion);
      }

      for (const pattern of questionPatterns) {
        const matches = fullText.matchAll(pattern);
        for (const match of matches) {
          const question = match[1] || match[0];
          const cleanQuestion = question.trim().replace(/\s+/g, ' ').substring(0, 500);
          if (cleanQuestion.length > 15) {
            extractedQuestions.push(cleanQuestion);
          }
        }
      }

      if (extractedQuestions.length === 0 && content.body) {
        const sentences = content.body.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
        for (const sentence of sentences.slice(0, 3)) {
          const clean = sentence.trim().replace(/\s+/g, ' ');
          if (clean.length > 30 && clean.length < 300) {
            const questionMatch = clean.match(/(?:asked|question|problem|given|find|design|implement)/i);
            if (questionMatch) {
              extractedQuestions.push(clean);
            }
          }
        }
      }

      for (const questionText of extractedQuestions) {
        const observation: QuestionObservation = {
          id: generateObservationId(this.sourceName, post.url, questionText),
          companyName,
          roleTitle: extractRoleFromTitle(fullText) || extractRoleFromTitle(post.title),
          stage: extractStageFromTitle(fullText) || extractStageFromTitle(post.title),
          questionText,
          provenance: {
            sourceName: this.sourceName,
            sourceUrl: post.url,
            fetchedAt,
            accessMethod: 'browser',
          },
        };
        observations.push(observation);
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[LeetCode] Error extracting content: ${message}`);
      
      const titleQuestion = extractQuestionFromTitle(post.title);
      if (titleQuestion) {
        observations.push({
          id: generateObservationId(this.sourceName, post.url, titleQuestion),
          companyName,
          roleTitle: extractRoleFromTitle(post.title),
          stage: extractStageFromTitle(post.title),
          questionText: titleQuestion,
          provenance: {
            sourceName: this.sourceName,
            sourceUrl: post.url,
            fetchedAt,
            accessMethod: 'browser',
          },
        });
      }
    }

    return observations;
  }
}

export const leetcodeAdapter = new LeetCodeAdapter();