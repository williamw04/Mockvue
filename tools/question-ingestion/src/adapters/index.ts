import type { QuestionSourceAdapter } from './base.js';
import { leetcodeAdapter } from './leetcode.js';

export const adapterRegistry: Record<string, QuestionSourceAdapter> = {
  leetcode: leetcodeAdapter,
};

export function getAdapter(name: string): QuestionSourceAdapter | null {
  return adapterRegistry[name] || null;
}
