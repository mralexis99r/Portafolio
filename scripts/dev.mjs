import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

// Keep local secrets out of source control while making `npm run dev`
// work without requiring users to export variables in every terminal.
if (existsSync('.env.local')) loadEnvFile('.env.local');
else if (existsSync('.env')) loadEnvFile('.env');

const processes = [
  spawn('npm', ['run', 'dev:server'], { shell: true, stdio: 'inherit' }),
  spawn('npm', ['run', 'dev:client'], { shell: true, stdio: 'inherit' })
];

function stop() {
  processes.forEach((process) => process.kill());
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
processes.forEach((process) => process.on('exit', (code) => {
  if (code && code !== 0) {
    stop();
    process.exitCode = code;
  }
}));
