import { spawn } from 'node:child_process';

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
