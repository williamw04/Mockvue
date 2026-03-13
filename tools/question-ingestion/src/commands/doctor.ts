import fs from 'node:fs';
import { loadConfig } from '../config.js';

export async function runDoctorCommand(): Promise<void> {
  const config = loadConfig();
  const report = {
    outputDir: config.outputDir,
    cacheDir: config.cacheDir,
    outputDirExists: fs.existsSync(config.outputDir),
    cacheDirExists: fs.existsSync(config.cacheDir),
  };

  console.log('Question ingestion doctor report');
  console.log(JSON.stringify(report, null, 2));
}
