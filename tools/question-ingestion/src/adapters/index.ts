import type { QuestionSourceAdapter } from './base.js';
import { careersAdapter } from './careers.js';

export const adapterRegistry: Record<string, QuestionSourceAdapter> = {
  careers: careersAdapter,
};

export function getAdapter(name: string): QuestionSourceAdapter | null {
  return adapterRegistry[name] || null;
}
