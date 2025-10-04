import { spawn } from 'child_process';
import { createServer } from 'vite';
import electron from 'electron';

const startElectron = () => {
  const electronProcess = spawn(electron, ['.'], {
    env: { ...process.env, VITE_DEV_SERVER_URL: 'http://localhost:5173' },
    stdio: 'inherit',
  });

  electronProcess.on('close', () => {
    process.exit();
  });
};

const startVite = async () => {
  const server = await createServer({
    configFile: './vite.config.ts',
  });

  await server.listen();
  
  console.log('Vite dev server started on http://localhost:5173');
  
  // Give vite a moment to fully start, then launch electron
  setTimeout(startElectron, 1000);
};

startVite();

