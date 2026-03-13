import type { QuestionSourceAdapter } from './base.js';

export const adapterRegistry: Record<string, QuestionSourceAdapter> = {};

export function getAdapter(name: string): QuestionSourceAdapter | null {
  return adapterRegistry[name] || null;
}
