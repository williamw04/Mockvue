import { loadConfig } from '../config.js';
import type { IngestionResult } from '../types.js';

export async function runIngestCommand(): Promise<IngestionResult> {
  const config = loadConfig();
  const run = {
    id: `ingestion-run-${Date.now()}`,
    sourceNames: config.defaultSourceNames,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };

  const result: IngestionResult = {
    run,
    observationCount: 0,
    normalizedCount: 0,
  };

  console.log('Question ingestion scaffold ready.');
  console.log(JSON.stringify(result, null, 2));
  return result;
}
