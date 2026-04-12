import type { QuestionSourceAdapter } from './base.js';
import { glassdoorAdapter } from './glassdoor.js';

export const adapterRegistry: Record<string, QuestionSourceAdapter> = {
  glassdoor: glassdoorAdapter,
};

export function getAdapter(name: string): QuestionSourceAdapter | null {
  return adapterRegistry[name] || null;
}
