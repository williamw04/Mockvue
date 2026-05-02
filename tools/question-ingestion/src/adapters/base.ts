import type { QuestionObservation, QuestionSourceDefinition } from '../types.js';
import type { BrowserPool } from '../browser.js';

export interface AdapterRunContext {
  source: QuestionSourceDefinition;
  now: string;
  companyName: string;
  browserPool: BrowserPool;
}

export interface AdapterRunResult {
  observations: QuestionObservation[];
}

export interface QuestionSourceAdapter {
  readonly sourceName: string;
  run(context: AdapterRunContext): Promise<AdapterRunResult>;
}