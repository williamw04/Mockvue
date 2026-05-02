import type { QuestionSourceAdapter } from './base.js';
import { glassdoorAdapter } from './glassdoor.js';
import { redditAdapter } from './reddit.js';
import { leetcodeAdapter } from './leetcode.js';
import { careersAdapter } from './careers.js';

export const adapterRegistry: Record<string, QuestionSourceAdapter> = {
  glassdoor: glassdoorAdapter,
  reddit: redditAdapter,
  leetcode: leetcodeAdapter,
  careers: careersAdapter,
};

export function getAdapter(name: string): QuestionSourceAdapter | null {
  return adapterRegistry[name] || null;
}