import { loadConfig, type CliOptions } from '../config.js';
import { Storage } from '../storage.js';
import { getBrowserPool, closeBrowserPool } from '../browser.js';
import { getAdapter } from '../adapters/index.js';
import { normalizeQuestions } from '../normalize.js';
import type { IngestionResult, QuestionObservation, IngestionRun } from '../types.js';

export async function runIngestCommand(options: CliOptions): Promise<IngestionResult> {
  const config = loadConfig(options);
  const storage = new Storage({ dbPath: config.dbPath });
  const browserPool = getBrowserPool({
    headless: config.headless,
    rateLimitMs: config.rateLimitMs,
  });

  const run: IngestionRun = {
    id: `ingestion-run-${Date.now()}`,
    sourceNames: config.sourceNames,
    startedAt: new Date().toISOString(),
  };

  storage.createRun(run, config.companyName);

  const allObservations: QuestionObservation[] = [];
  const now = new Date().toISOString();
  const stats: Record<string, { fetched: number; errors: number }> = {};

  console.log(`Starting ingestion for company: ${config.companyName}`);
  console.log(`Sources: ${config.sourceNames.join(', ')}`);

  for (const sourceName of config.sourceNames) {
    const adapter = getAdapter(sourceName);
    if (!adapter) {
      console.warn(`Warning: No adapter registered for source "${sourceName}"`);
      stats[sourceName] = { fetched: 0, errors: 1 };
      continue;
    }

    console.log(`Running adapter: ${sourceName}`);

    try {
      const result = await adapter.run({
        source: {
          name: sourceName,
          kind: 'community',
          riskLevel: 'medium',
          enabled: true,
          description: `Adapter for ${sourceName}`,
        },
        now,
        companyName: config.companyName,
        browserPool,
      });

      const observations = result.observations;
      allObservations.push(...observations);
      storage.upsertObservations(observations, run.id);
      stats[sourceName] = { fetched: observations.length, errors: 0 };

      console.log(`  ${sourceName}: ${observations.length} observations`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  ${sourceName}: Error - ${errorMessage}`);
      stats[sourceName] = { fetched: 0, errors: 1 };
    }
  }

  console.log('\nNormalizing questions...');
  const normalizedResult = normalizeQuestions(allObservations);

  for (const question of normalizedResult.normalizedQuestions) {
    storage.upsertNormalizedQuestion(question);
  }

  for (const cluster of normalizedResult.clusters) {
    storage.upsertCluster(cluster);
  }

  run.completedAt = new Date().toISOString();
  storage.completeRun(run.id, normalizedResult.stats.totalObservations, normalizedResult.stats.uniqueQuestions);

  const result: IngestionResult = {
    run,
    observationCount: normalizedResult.stats.totalObservations,
    normalizedCount: normalizedResult.stats.uniqueQuestions,
  };

  console.log('\n=== Ingestion Summary ===');
  console.log(`Total observations: ${result.observationCount}`);
  console.log(`Normalized questions: ${result.normalizedCount}`);
  console.log('\nPer-source stats:');
  for (const [source, stat] of Object.entries(stats)) {
    console.log(`  ${source}: ${stat.fetched} fetched, ${stat.errors} errors`);
  }

  storage.close();
  await closeBrowserPool();

  return result;
}