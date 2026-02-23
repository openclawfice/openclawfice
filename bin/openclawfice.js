#!/usr/bin/env node

const { spawn } = require('child_process');
const { join } = require('path');
const fs = require('fs');

const packageRoot = join(__dirname, '..');

// Check if OpenClaw config exists
const openclawConfig = join(require('os').homedir(), '.openclaw', 'openclaw.json');
if (!fs.existsSync(openclawConfig)) {
  console.error('\n❌ OpenClaw not found!\n');
  console.error('OpenClawfice requires OpenClaw to be installed and configured.');
  console.error('Expected config at:', openclawConfig);
  console.error('\nVisit https://openclaw.ai to get started.\n');
  process.exit(1);
}

console.log('🏢 Starting OpenClawfice...\n');

// Check if we're in development or installed via npm
const isDev = fs.existsSync(join(packageRoot, 'app', 'page.tsx'));

if (isDev) {
  // Development mode
  console.log('Running in development mode...');
  const dev = spawn('npm', ['run', 'dev'], {
    cwd: packageRoot,
    stdio: 'inherit',
    shell: true,
  });
  
  dev.on('exit', (code) => {
    process.exit(code || 0);
  });
} else {
  // Production mode (TODO: build and serve static export)
  console.log('Running in production mode...');
  const start = spawn('npm', ['start'], {
    cwd: packageRoot,
    stdio: 'inherit',
    shell: true,
  });
  
  start.on('exit', (code) => {
    process.exit(code || 0);
  });
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down OpenClawfice...\n');
  process.exit(0);
});
