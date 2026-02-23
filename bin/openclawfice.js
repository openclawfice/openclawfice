#!/usr/bin/env node

const { spawn } = require('child_process');
const { join } = require('path');
const fs = require('fs');
const os = require('os');

const packageRoot = join(__dirname, '..');
const homeDir = os.homedir();
const openclawDir = join(homeDir, '.openclaw');
const openclawConfig = join(openclawDir, 'openclaw.json');
const statusDir = join(openclawDir, '.status');

// ─── Preflight Checks ───────────────────────────────────────────────

if (!fs.existsSync(openclawConfig)) {
  console.error('\n❌ OpenClaw not found!\n');
  console.error('OpenClawfice requires OpenClaw to be installed and configured.');
  console.error('Expected config at:', openclawConfig);
  console.error('\nVisit https://openclaw.ai to get started.\n');
  process.exit(1);
}

// ─── First-Run Setup ────────────────────────────────────────────────

const firstRunMarker = join(statusDir, '.openclawfice-init');

if (!fs.existsSync(firstRunMarker)) {
  console.log('🏗️  First run detected — setting up your office...\n');

  // Create .status directory
  fs.mkdirSync(statusDir, { recursive: true });

  // Discover agent names for welcome messages
  let agentNames = [];
  try {
    const config = JSON.parse(fs.readFileSync(openclawConfig, 'utf-8'));
    const agents = config.agents?.list || [];
    const defaultWorkspace = config.agents?.defaults?.workspace || '';

    for (const agent of agents) {
      const workspace = agent.workspace || defaultWorkspace;
      const identityFile = join(workspace, 'IDENTITY.md');
      let name = agent.id;
      try {
        if (fs.existsSync(identityFile)) {
          const content = fs.readFileSync(identityFile, 'utf-8');
          const match = content.match(/[-*]*\s*\*\*Name:\*\*\s*(.+)/);
          if (match) name = match[1].trim();
        }
      } catch {}
      agentNames.push(name);
    }
  } catch {}

  const now = Date.now();
  const firstAgent = agentNames[0] || 'Agent';

  // Seed water cooler with a welcome message
  if (!fs.existsSync(join(statusDir, 'chat.json'))) {
    const chat = [
      { from: firstAgent, text: '🏢 Office is open! Welcome to OpenClawfice.', ts: now },
    ];
    fs.writeFileSync(join(statusDir, 'chat.json'), JSON.stringify(chat, null, 2));
    console.log('  ✅ Water cooler ready');
  }

  // Create empty quest log
  if (!fs.existsSync(join(statusDir, 'actions.json'))) {
    fs.writeFileSync(join(statusDir, 'actions.json'), '[]');
    console.log('  ✅ Quest log ready');
  }

  // Create empty accomplishments
  if (!fs.existsSync(join(statusDir, 'accomplishments.json'))) {
    fs.writeFileSync(join(statusDir, 'accomplishments.json'), '[]');
    console.log('  ✅ Accomplishments feed ready');
  }

  // Create empty activity log
  if (!fs.existsSync(join(statusDir, 'activity.json'))) {
    fs.writeFileSync(join(statusDir, 'activity.json'), '[]');
    console.log('  ✅ Activity log ready');
  }

  // Write first-run marker
  fs.writeFileSync(firstRunMarker, JSON.stringify({ setupAt: new Date().toISOString(), version: '0.1.0' }));

  // Hint about config
  console.log('\n  💡 Tip: Create openclawfice.config.json to customize NPC colors.');
  console.log('     See openclawfice.config.example.json for reference.\n');

  console.log('  🎉 Setup complete!\n');
}

// ─── Launch ─────────────────────────────────────────────────────────

console.log('🏢 Starting OpenClawfice...\n');

// Detect port from args or env
const portArg = process.argv.find(a => a.startsWith('--port='));
const port = portArg ? portArg.split('=')[1] : (process.env.PORT || '3333');

const isDev = fs.existsSync(join(packageRoot, 'app', 'page.tsx'));

const args = isDev ? ['run', 'dev', '--', '-p', port] : ['start', '--', '-p', port];
const label = isDev ? 'development' : 'production';

console.log(`Running in ${label} mode on port ${port}...`);
console.log(`Open http://localhost:${port} in your browser\n`);

const child = spawn('npm', args, {
  cwd: packageRoot,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: port },
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down OpenClawfice...\n');
  process.exit(0);
});
