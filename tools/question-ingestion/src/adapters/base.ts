import type { QuestionObservation, QuestionSourceDefinition } from '../types.js';

export interface AdapterRunContext {
  source: QuestionSourceDefinition;
  now: string;
}

export interface AdapterRunResult {
  observations: QuestionObservation[];
}

export interface QuestionSourceAdapter {
  readonly sourceName: string;
  run(context: AdapterRunContext): Promise<AdapterRunResult>;
}
