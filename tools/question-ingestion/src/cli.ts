import { runDoctorCommand } from './commands/doctor.js';
import { runIngestCommand } from './commands/ingest.js';

async function main(): Promise<void> {
  const command = process.argv[2] || 'doctor';

  switch (command) {
    case 'doctor':
      await runDoctorCommand();
      break;
    case 'ingest':
      await runIngestCommand();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exitCode = 1;
  }
}

void main();
