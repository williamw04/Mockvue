import fs from 'node:fs';
import { loadConfig, type CliOptions } from '../config.js';

export async function runDoctorCommand(options: CliOptions): Promise<void> {
  const config = loadConfig(options);

  const report = {
    outputDir: config.outputDir,
    cacheDir: config.cacheDir,
    dbPath: config.dbPath,
    outputDirExists: fs.existsSync(config.outputDir),
    cacheDirExists: fs.existsSync(config.cacheDir),
    dbExists: fs.existsSync(config.dbPath),
    companyName: config.companyName,
    sourceNames: config.sourceNames,
    headless: config.headless,
    rateLimitMs: config.rateLimitMs,
  };

  console.log('Question ingestion doctor report');
  console.log(JSON.stringify(report, null, 2));
}