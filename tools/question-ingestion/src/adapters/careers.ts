import crypto from 'node:crypto';
import type { QuestionSourceAdapter, AdapterRunContext, AdapterRunResult } from './base.js';
import type { QuestionObservation } from '../types.js';

type PlaywrightPage = Awaited<ReturnType<import('../browser.js').BrowserPool['createPage']>>;

const CAREERS_URL_PATTERNS = [
  (company: string) => `https://www.${company}.com/careers`,
  (company: string) => `https://careers.${company}.com`,
  (company: string) => `https://www.${company}.com/about`,
  (company: string) => `https://www.${company}.com/jobs`,
  (company: string) => `https://${company}.jobs`,
];

const COMPANY_URL_OVERRIDES: Record<string, string[]> = {
  stripe: ['https://stripe.com/careers', 'https://stripe.com/jobs'],
  google: ['https://careers.google.com'],
  amazon: ['https://amazon.jobs', 'https://www.amazon.jobs'],
  meta: ['https://www.metacareers.com', 'https://meta.com/careers'],
  airbnb: ['https://careers.airbnb.com', 'https://airbnb.com/careers'],
  microsoft: ['https://careers.microsoft.com'],
  apple: ['https://www.apple.com/careers'],
  netflix: ['https://jobs.netflix.com'],
  uber: ['https://www.uber.com/careers'],
  lyft: ['https://www.lyft.com/careers'],
  twitter: ['https://careers.twitter.com'],
  salesforce: ['https://www.salesforce.com/company/careers'],
  linkedin: ['https://careers.linkedin.com'],
};

function generateObservationId(sourceName: string, sourceUrl: string, questionText: string): string {
  const content = `${sourceName}:${sourceUrl}:${questionText}`;
  const hash = crypto.createHash('sha256').update(content).digest('base64url').slice(0, 16);
  return `obs-${hash}`;
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

function isNavigationLink(title: string): boolean {
  const navPatterns = [
    /^english$/i, /^deutsch$/i, /^français$/i, /^nederlands$/i, /^português$/i, /^italiano$/i,
    /^jobs$/i, /^careers$/i, /^home$/i, /^login$/i, /^sign in$/i, /^apply$/i,
    /^search$/i, /^menu$/i, /^close$/i, /^back$/i, /^next$/i, /^previous$/i,
    /^skip/i, /^accessibility$/i, /^cookies$/i, /^privacy$/i, /^terms$/i,
    /^contact$/i, /^help$/i, /^faq$/i, /^about$/i, /^blog$/i, /^news$/i,
    /^life at/i, /^benefits$/i, /^university$/i, /^how we operate$/i,
    /^see open roles$/i, /^find your role$/i, /^job categories$/i,
    /^military careers$/i, /^our culture$/i, /^diversity$/i,
  ];
  return navPatterns.some((p) => p.test(title));
}

async function extractPageContent(page: PlaywrightPage): Promise<{
  values: string[];
  mission: string | null;
  culture: string[];
}> {
  const values: string[] = [];
  let mission: string | null = null;
  const culture: string[] = [];

  const valueSelectors = [
    '[class*="value"]',
    '[class*="Value"]',
    '[class*="principle"]',
    '[class*="Principle"]',
    '.values li',
    '.core-values li',
    '[class*="beliefs"]',
  ];

  for (const selector of valueSelectors) {
    try {
      const texts = await page.$$eval(selector, (elements: unknown[]) => {
        return (elements as Element[])
          .map((el) => el.textContent?.trim() || '')
          .filter((text) => text.length > 10 && text.length < 300);
      });
      values.push(...texts);
    } catch {}
  }

  const missionSelectors = [
    '[class*="mission"]',
    '[class*="Mission"]',
    '[class*="vision"]',
    '[class*="Vision"]',
    '[class*="purpose"]',
    '.mission',
    '.vision',
  ];

  for (const selector of missionSelectors) {
    try {
      const texts = await page.$$eval(selector, (elements: unknown[]) => {
        return (elements as Element[])
          .map((el) => el.textContent?.trim() || '')
          .filter((text) => text.length > 30 && text.length < 500);
      });
      if (texts.length > 0 && !mission) {
        mission = texts[0];
      }
    } catch {}
  }

  const cultureSelectors = [
    '[class*="culture"]',
    '[class*="Culture"]',
    '[class*="benefit"]',
    '[class*="Benefit"]',
    '[class*="perk"]',
    '[class*="Perk"]',
    '[class*="diversity"]',
    '[class*="Diversity"]',
  ];

  for (const selector of cultureSelectors) {
    try {
      const texts = await page.$$eval(selector, (elements: unknown[]) => {
        return (elements as Element[])
          .map((el) => el.textContent?.trim() || '')
          .filter((text) => text.length > 15 && text.length < 500);
      });
      culture.push(...texts);
    } catch {}
  }

  try {
    const headingContent = await page.$$eval('h1, h2, h3', (elements: unknown[]) => {
      const results: { type: string; content: string }[] = [];
      for (const h of elements as Element[]) {
        const text = h.textContent?.toLowerCase() || '';
        const sibling = h.nextElementSibling;
        if (sibling) {
          const content = sibling.textContent?.trim() || '';
          if (content.length > 20 && content.length < 500) {
            if (text.includes('mission') || text.includes('vision')) {
              results.push({ type: 'mission', content });
            } else if (text.includes('value') || text.includes('principle')) {
              results.push({ type: 'value', content });
            } else if (text.includes('culture') || text.includes('life')) {
              results.push({ type: 'culture', content });
            }
          }
        }
      }
      return results;
    });

    for (const item of headingContent) {
      if (item.type === 'mission' && !mission) {
        mission = item.content;
      } else if (item.type === 'value' && !values.includes(item.content)) {
        values.push(item.content);
      } else if (item.type === 'culture' && !culture.includes(item.content)) {
        culture.push(item.content);
      }
    }
  } catch {}

  return { values: [...new Set(values)], mission, culture: [...new Set(culture)] };
}

async function extractJobsFromPage(page: PlaywrightPage): Promise<Array<{ title: string; description: string; url: string }>> {
  const jobs = await page.evaluate(() => {
    const results: Array<{ title: string; description: string; url: string }> = [];
    const seen = new Set<string>();

    const jobLinkPatterns = [
      'a[href*="/jobs/"]',
      'a[href*="/job/"]',
      'a[href*="/careers/"]',
      'a[href*="/position/"]',
      'a[href*="/opening/"]',
      'a[href*="/role/"]',
      'a[href*="job_id"]',
      'a[href*="jobId"]',
      '[data-job-id] a',
      '[class*="job-card"] a',
      '[class*="JobCard"] a',
      '[class*="job-listing"] a',
      '[class*="opening"] a',
    ];

    for (const selector of jobLinkPatterns) {
      try {
        const elements = Array.from(document.querySelectorAll(selector));
        for (const el of elements) {
          const link = el.tagName === 'A' ? (el as HTMLAnchorElement) : el.closest('a');
          if (!link) continue;

          const url = link.href;
          if (!url || seen.has(url) || url.includes('#') || url.includes('login') || url.includes('signup')) continue;
          seen.add(url);

          let title = '';
          const titleEl = el.querySelector('[class*="title"], [class*="Title"], h1, h2, h3, h4') ||
            link.querySelector('[class*="title"], [class*="Title"]') ||
            el;
          title = (titleEl.textContent?.trim() || '').replace(/\s+/g, ' ');

          if (title.length < 5 || title.length > 150) {
            title = link.textContent?.trim()?.replace(/\s+/g, ' ') || 'Untitled';
          }

          const isNav = /^(English|Deutsch|Français|Jobs|Careers|Home|Menu|Login|Search|Apply|Back|Next|Skip)$/i.test(title);
          if (isNav) continue;

          const descEl = el.querySelector('[class*="description"], [class*="summary"], [class*="details"], p') || el;
          const description = (descEl.textContent?.trim() || '').slice(0, 500);

          results.push({ title, description, url });
        }
      } catch {}
    }

    return results;
  });

  const seenUrls = new Set<string>();
  return jobs.filter((job) => {
    if (seenUrls.has(job.url) || isNavigationLink(job.title)) return false;
    seenUrls.add(job.url);
    return job.title.length > 3 && job.title.length < 150;
  }).slice(0, 25);
}

async function tryFetchUrl(
  page: PlaywrightPage,
  url: string,
  browserPool: { waitForRateLimit: (name: string) => Promise<void> }
): Promise<boolean> {
  try {
    await browserPool.waitForRateLimit('careers');
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    if (response && response.status() < 400) {
      await page.waitForTimeout(2000);
      return true;
    }
  } catch {
    try {
      await browserPool.waitForRateLimit('careers');
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (response && response.status() < 400) {
        await page.waitForTimeout(1500);
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}

function extractTechnicalRequirements(text: string): string[] {
  const requirements: string[] = [];
  const lowerText = text.toLowerCase();

  const techKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'kotlin', 'swift',
    'react', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'spring', 'rails',
    'aws', 'azure', 'gcp', 'kubernetes', 'docker', 'terraform', 'jenkins',
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'kafka',
    'graphql', 'rest', 'grpc', 'microservices', 'api',
    'machine learning', 'deep learning', 'nlp', 'data science',
    'agile', 'scrum', 'ci/cd', 'git', 'linux',
  ];

  for (const keyword of techKeywords) {
    if (lowerText.includes(keyword)) {
      const sentences = text.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(keyword)) {
          const cleaned = cleanText(sentence);
          if (cleaned.length > 20 && cleaned.length < 500) {
            requirements.push(cleaned);
          }
        }
      }
    }
  }

  return [...new Set(requirements)].slice(0, 10);
}

async function scrapeCompanyPage(
  page: PlaywrightPage,
  url: string,
  companyName: string,
  now: string,
  browserPool: { waitForRateLimit: (name: string) => Promise<void> }
): Promise<QuestionObservation[]> {
  const observations: QuestionObservation[] = [];

  const success = await tryFetchUrl(page, url, browserPool);
  if (!success) {
    console.log(`  Could not fetch ${url}`);
    return observations;
  }

  console.log(`  Successfully fetched ${url}`);

  try {
    const { values, mission, culture } = await extractPageContent(page);

    if (mission) {
      const cleaned = cleanText(mission);
      if (cleaned.length > 30) {
        console.log(`  Found mission: ${cleaned.slice(0, 60)}...`);
        observations.push({
          id: generateObservationId('careers', url, `mission:${cleaned}`),
          companyName,
          stage: 'mission',
          questionText: cleaned,
          provenance: {
            sourceName: 'careers',
            sourceUrl: url,
            fetchedAt: now,
            accessMethod: 'browser',
          },
        });
      }
    }

    for (const value of values) {
      const cleaned = cleanText(value);
      if (cleaned.length > 15 && cleaned !== mission) {
        console.log(`  Found value: ${cleaned.slice(0, 50)}...`);
        observations.push({
          id: generateObservationId('careers', url, `value:${cleaned}`),
          companyName,
          stage: 'values',
          questionText: cleaned,
          provenance: {
            sourceName: 'careers',
            sourceUrl: url,
            fetchedAt: now,
            accessMethod: 'browser',
          },
        });
      }
    }

    for (const item of culture) {
      const cleaned = cleanText(item);
      if (cleaned.length > 20 && cleaned !== mission && !values.includes(cleaned)) {
        console.log(`  Found culture: ${cleaned.slice(0, 50)}...`);
        observations.push({
          id: generateObservationId('careers', url, `culture:${cleaned}`),
          companyName,
          stage: 'culture',
          questionText: cleaned,
          provenance: {
            sourceName: 'careers',
            sourceUrl: url,
            fetchedAt: now,
            accessMethod: 'browser',
          },
        });
      }
    }
  } catch (error) {
    console.log(`  Error extracting values/mission: ${error}`);
  }

  try {
    const jobs = await extractJobsFromPage(page);
    console.log(`  Found ${jobs.length} job listings`);

    for (const job of jobs) {
      const requirements = extractTechnicalRequirements(job.description);
      for (const req of requirements) {
        observations.push({
          id: generateObservationId('careers', job.url, `req:${req}`),
          companyName,
          roleTitle: job.title,
          stage: 'requirements',
          questionText: req,
          provenance: {
            sourceName: 'careers',
            sourceUrl: job.url,
            fetchedAt: now,
            accessMethod: 'browser',
          },
        });
      }

      if (job.title && job.title.length > 5 && !isNavigationLink(job.title)) {
        observations.push({
          id: generateObservationId('careers', job.url, `job:${job.title}`),
          companyName,
          roleTitle: job.title,
          stage: 'job_posting',
          questionText: `Open role: ${job.title}`,
          provenance: {
            sourceName: 'careers',
            sourceUrl: job.url,
            fetchedAt: now,
            accessMethod: 'browser',
          },
        });
      }
    }
  } catch (error) {
    console.log(`  Error extracting jobs: ${error}`);
  }

  return observations;
}

export const careersAdapter: QuestionSourceAdapter = {
  sourceName: 'careers',

  async run(context: AdapterRunContext): Promise<AdapterRunResult> {
    const { companyName, now, browserPool } = context;
    const observations: QuestionObservation[] = [];

    console.log(`[careers] Starting scrape for company: ${companyName}`);

    const normalizedName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const urls = COMPANY_URL_OVERRIDES[normalizedName] || [];

    for (const pattern of CAREERS_URL_PATTERNS) {
      urls.push(pattern(normalizedName));
    }

    const uniqueUrls = [...new Set(urls)];
    console.log(`[careers] Trying ${uniqueUrls.length} URL patterns`);

    let page: PlaywrightPage | null = null;

    try {
      page = await browserPool.createPage('careers');

      for (const url of uniqueUrls) {
        if (observations.length >= 50) {
          break;
        }

        try {
          const pageObservations = await scrapeCompanyPage(page, url, companyName, now, browserPool);
          observations.push(...pageObservations);

          if (pageObservations.length > 0) {
            console.log(`[careers] Found ${pageObservations.length} observations from ${url}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log(`[careers] Error scraping ${url}: ${errorMessage}`);
        }
      }

      if (observations.length === 0) {
        console.log(`[careers] No data found for ${companyName}`);
      } else {
        console.log(`[careers] Total: ${observations.length} observations`);
      }
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }

    return { observations };
  },
};

export default careersAdapter;