import crypto from 'crypto';
import type { Page } from 'playwright';
import type { QuestionObservation, ProvenanceRecord } from '../types.js';
import type { AdapterRunContext, AdapterRunResult, QuestionSourceAdapter } from './base.js';

const SEARCH_SUBREDDITS = ['cscareerquestions', 'interviews'];
const MAX_POSTS_PER_SEARCH = 25;
const MAX_POSTS_TO_PROCESS = 30;

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  permalink: string;
  num_comments: number;
}

interface RedditSearchResponse {
  kind: string;
  data: {
    children: Array<{
      kind: string;
      data: RedditPost;
    }>;
  };
}

function generateObservationId(sourceName: string, sourceUrl: string, questionText: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${sourceName}:${sourceUrl}:${questionText}`)
    .digest('hex')
    .slice(0, 16);
  return `obs-${hash}`;
}

function extractQuestionsFromText(text: string): string[] {
  const questions: string[] = [];

  const sentences = text.split(/[.!?\n]+/);
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.endsWith('?') && trimmed.length > 10 && trimmed.length < 500) {
      questions.push(trimmed);
    }
  }

  const questionPatterns = [
    /(?:asked|received|got|was asked|question was)[:\s]*["']?([^"'.?!?]+\?)["']?/gi,
    /["']([^"']+\?)["']/g,
  ];

  for (const pattern of questionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const extracted = match[1]?.trim();
      if (extracted && extracted.length > 10 && extracted.length < 500) {
        questions.push(extracted);
      }
    }
  }

  return [...new Set(questions)];
}

function extractRoleInfo(text: string): { roleTitle?: string; stage?: string } {
  const result: { roleTitle?: string; stage?: string } = {};

  const rolePatterns = [
    /(?:position|role|title|applying for)[:\s]*([A-Za-z\s]+(?:Engineer|Developer|Analyst|Manager|Designer|Intern))/i,
    /(Software Engineer|Frontend Engineer|Backend Engineer|Full Stack|Data Scientist|Product Manager|SWE|SDE)/i,
  ];

  for (const pattern of rolePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.roleTitle = match[1]?.trim();
      break;
    }
  }

  const stagePatterns = [
    /(?:stage|round|phase)[:\s]*(phone screen|technical|onsite|behavioral|system design|coding|hr|final)/i,
    /(phone screen|phone interview|technical interview|onsite|behavioral interview|system design interview)/i,
  ];

  for (const pattern of stagePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.stage = match[1]?.trim().toLowerCase();
      break;
    }
  }

  return result;
}

async function searchReddit(
  page: Page,
  query: string,
  subreddit?: string
): Promise<RedditPost[]> {
  let searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${MAX_POSTS_PER_SEARCH}&sort=relevance`;
  if (subreddit) {
    searchUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=${MAX_POSTS_PER_SEARCH}&sort=relevance`;
  }

  try {
    const response = await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!response || !response.ok()) {
      console.warn(`Reddit search failed for query: ${query}`);
      return [];
    }

    const text = await response.text();
    const json = JSON.parse(text) as RedditSearchResponse;
    return json.data?.children?.map(child => child.data) || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`Reddit search error for "${query}": ${errorMessage}`);
    return [];
  }
}

function isRelevantPost(post: RedditPost, companyName: string): boolean {
  const text = `${post.title} ${post.selftext}`.toLowerCase();
  const companyLower = companyName.toLowerCase();
  return text.includes(companyLower);
}

export class RedditAdapter implements QuestionSourceAdapter {
  readonly sourceName = 'reddit';

  async run(context: AdapterRunContext): Promise<AdapterRunResult> {
    const { companyName, browserPool, now } = context;
    const observations: QuestionObservation[] = [];
    const seenQuestions = new Set<string>();

    console.log(`[${this.sourceName}] Starting scrape for company: ${companyName}`);

    const page = await browserPool.createPage('reddit');

    await page.setExtraHTTPHeaders({
      'Accept': 'application/json',
    });

    const allPosts: RedditPost[] = [];

    for (const subreddit of SEARCH_SUBREDDITS) {
      try {
        await browserPool.waitForRateLimit('reddit');

        const query = `${companyName} interview`;
        console.log(`[${this.sourceName}] Searching r/${subreddit} for: ${query}`);

        const posts = await searchReddit(page, query, subreddit);
        console.log(`[${this.sourceName}] Found ${posts.length} posts in r/${subreddit}`);
        allPosts.push(...posts);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[${this.sourceName}] Error searching r/${subreddit}: ${errorMessage}`);
      }
    }

    try {
      await browserPool.waitForRateLimit('reddit');
      console.log(`[${this.sourceName}] Searching all of Reddit for: ${companyName} interview`);
      const generalPosts = await searchReddit(page, `${companyName} interview questions`);
      console.log(`[${this.sourceName}] Found ${generalPosts.length} posts in general search`);
      allPosts.push(...generalPosts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[${this.sourceName}] Error in general search: ${errorMessage}`);
    }

    const uniquePosts = new Map<string, RedditPost>();
    for (const post of allPosts) {
      if (!uniquePosts.has(post.id) && isRelevantPost(post, companyName)) {
        uniquePosts.set(post.id, post);
      }
    }

    console.log(`[${this.sourceName}] Processing ${uniquePosts.size} unique relevant posts`);

    let processedCount = 0;
    for (const post of uniquePosts.values()) {
      if (processedCount >= MAX_POSTS_TO_PROCESS) break;
      processedCount++;

      const postUrl = `https://www.reddit.com${post.permalink}`;
      const fullText = `${post.title} ${post.selftext}`;
      const roleInfo = extractRoleInfo(fullText);
      const questions = extractQuestionsFromText(fullText);

      for (const questionText of questions) {
        const id = generateObservationId(this.sourceName, postUrl, questionText);
        if (seenQuestions.has(id)) continue;
        seenQuestions.add(id);

        const provenance: ProvenanceRecord = {
          sourceName: this.sourceName,
          sourceUrl: postUrl,
          fetchedAt: now,
          accessMethod: 'browser',
        };

        observations.push({
          id,
          companyName,
          roleTitle: roleInfo.roleTitle,
          stage: roleInfo.stage,
          questionText,
          provenance,
        });
      }
    }

    console.log(`[${this.sourceName}] Completed: ${observations.length} observations found`);

    await page.close();

    return { observations };
  }
}

export const redditAdapter = new RedditAdapter();