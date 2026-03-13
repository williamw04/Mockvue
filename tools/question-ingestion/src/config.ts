import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { QuestionIngestionConfig } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadConfig(): QuestionIngestionConfig {
  const packageRoot = path.resolve(__dirname, '..');

  return {
    outputDir: path.join(packageRoot, 'data', 'output'),
    cacheDir: path.join(packageRoot, 'data', 'cache'),
    defaultSourceNames: [],
  };
}
