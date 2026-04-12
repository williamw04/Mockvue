import type { QuestionSourceAdapter } from './base.js';
import { redditAdapter } from './reddit.js';

export const adapterRegistry: Record<string, QuestionSourceAdapter> = {
  reddit: redditAdapter,
};

export function getAdapter(name: string): QuestionSourceAdapter | null {
  return adapterRegistry[name] || null;
}
