import { runDoctorCommand } from './commands/doctor.js';
import { runIngestCommand } from './commands/ingest.js';
import type { CliOptions } from './config.js';

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    company: '',
    sources: undefined,
    headless: true,
    rateLimitMs: 2000,
  };

  let command: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--company' || arg === '-c') {
      options.company = args[++i] ?? '';
    } else if (arg === '--sources' || arg === '-s') {
      options.sources = args[++i]?.split(',').map((s) => s.trim());
    } else if (arg === '--headless') {
      options.headless = true;
    } else if (arg === '--no-headless') {
      options.headless = false;
    } else if (arg === '--rate-limit' || arg === '-r') {
      options.rateLimitMs = parseInt(args[++i] ?? '2000', 10);
    } else if (!arg.startsWith('-') && !command) {
      command = arg;
    }
  }

  return options;
}

function getCommand(): string {
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (!arg.startsWith('-')) {
      return arg;
    }
  }
  return 'doctor';
}

async function main(): Promise<void> {
  const options = parseArgs();
  const command = getCommand();

  if (command === 'ingest' && !options.company) {
    console.error('Error: --company is required for ingest command');
    console.error('Usage: npm run ingest -- --company "Stripe"');
    process.exitCode = 1;
    return;
  }

  switch (command) {
    case 'doctor':
      await runDoctorCommand(options);
      break;
    case 'ingest':
      await runIngestCommand(options);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exitCode = 1;
  }
}

void main();