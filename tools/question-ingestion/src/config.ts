import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { QuestionIngestionConfig } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CliOptions {
  company: string;
  sources?: string[];
  headless?: boolean;
  rateLimitMs?: number;
}

export function loadConfig(options: CliOptions): QuestionIngestionConfig {
  const packageRoot = path.resolve(__dirname, '..');

  return {
    outputDir: path.join(packageRoot, 'data', 'output'),
    cacheDir: path.join(packageRoot, 'data', 'cache'),
    dbPath: path.join(packageRoot, 'data', 'cache', 'ingestion.db'),
    companyName: options.company,
    sourceNames: options.sources ?? ['glassdoor', 'reddit', 'leetcode', 'careers'],
    headless: options.headless ?? true,
    rateLimitMs: options.rateLimitMs ?? 2000,
  };
}