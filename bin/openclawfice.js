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

  // Deploy OFFICE.md to each agent's workspace
  try {
    const config = JSON.parse(fs.readFileSync(openclawConfig, 'utf-8'));
    const agents = config.agents?.list || [];
    const defaultWorkspace = config.agents?.defaults?.workspace || '';
    const templatePath = join(packageRoot, 'templates', 'OFFICE.md');

    if (fs.existsSync(templatePath)) {
      let template = fs.readFileSync(templatePath, 'utf-8');
      const officeUrl = `http://localhost:${process.env.PORT || portArg?.split('=')[1] || '3333'}`;
      template = template.replace(/\{\{OFFICE_URL\}\}/g, officeUrl);

      let deployed = 0;
      for (const agent of agents) {
        const workspace = agent.workspace || defaultWorkspace;
        if (!workspace || !fs.existsSync(workspace)) continue;
        const targetPath = join(workspace, 'OFFICE.md');
        fs.writeFileSync(targetPath, template);
        deployed++;
      }
      if (deployed > 0) {
        console.log(`  ✅ OFFICE.md deployed to ${deployed} agent workspace${deployed > 1 ? 's' : ''}`);
      }
    }
  } catch (err) {
    // Non-fatal — office still works without OFFICE.md
  }

  // Write first-run marker
  fs.writeFileSync(firstRunMarker, JSON.stringify({ setupAt: new Date().toISOString(), version: '0.1.0' }));

  // Hint about config
  console.log('\n  💡 Tip: Create openclawfice.config.json to customize NPC colors.');
  console.log('     See openclawfice.config.example.json for reference.\n');

  console.log('  🎉 Setup complete!\n');
}

// ─── Auto-upgrade on every start ────────────────────────────────────

// Check if OFFICE.md template is newer than deployed version
const versionFile = join(statusDir, '.openclawfice-version');
const pkg = JSON.parse(fs.readFileSync(join(packageRoot, 'package.json'), 'utf-8'));
const currentVersion = pkg.version || '0.0.0';
let lastVersion = '0.0.0';
try { lastVersion = fs.readFileSync(versionFile, 'utf-8').trim(); } catch {}

if (currentVersion !== lastVersion) {
  console.log(`🔄 OpenClawfice updated (${lastVersion} → ${currentVersion}), running migrations...\n`);

  // Re-deploy OFFICE.md to all workspaces
  try {
    const config = JSON.parse(fs.readFileSync(openclawConfig, 'utf-8'));
    const agents = config.agents?.list || [];
    const defaultWorkspace = config.agents?.defaults?.workspace || '';
    const templatePath = join(packageRoot, 'templates', 'OFFICE.md');

    if (fs.existsSync(templatePath)) {
      let template = fs.readFileSync(templatePath, 'utf-8');
      const pArg = process.argv.find(a => a.startsWith('--port='));
      const p = pArg ? pArg.split('=')[1] : (process.env.PORT || '3333');
      template = template.replace(/\{\{OFFICE_URL\}\}/g, `http://localhost:${p}`);

      let deployed = 0;
      for (const agent of agents) {
        const workspace = agent.workspace || defaultWorkspace;
        if (!workspace || !fs.existsSync(workspace)) continue;
        fs.writeFileSync(join(workspace, 'OFFICE.md'), template);
        deployed++;
      }
      if (deployed > 0) console.log(`  ✅ OFFICE.md updated in ${deployed} workspace${deployed > 1 ? 's' : ''}`);
    }
  } catch {}

  // Set up default cron jobs if none exist
  try {
    const cronFile = join(openclawDir, 'cron', 'jobs.json');
    if (fs.existsSync(cronFile)) {
      const cronData = JSON.parse(fs.readFileSync(cronFile, 'utf-8'));
      const jobs = cronData.jobs || [];
      const hasLounge = jobs.some(j => (j.name || '').toLowerCase().includes('lounge') || (j.name || '').toLowerCase().includes('water cooler'));

      if (!hasLounge) {
        // Read agent names for the chat prompt
        const config = JSON.parse(fs.readFileSync(openclawConfig, 'utf-8'));
        const agentList = config.agents?.list || [];
        const defaultWs = config.agents?.defaults?.workspace || '';
        const names = [];
        for (const a of agentList) {
          const ws = a.workspace || defaultWs;
          const idFile = join(ws, 'IDENTITY.md');
          let name = a.id;
          try {
            if (fs.existsSync(idFile)) {
              const c = fs.readFileSync(idFile, 'utf-8');
              const m = c.match(/\*\*Name:\*\*\s*(.+)/);
              if (m) name = m[1].trim();
            }
          } catch {}
          if (a.id !== '_owner' && name !== '_owner') names.push(name);
        }
        const nameList = names.length > 0 ? names.join(', ') : 'your agents';

        const loungeJob = {
          id: require('crypto').randomUUID(),
          agentId: 'main',
          name: 'openclawfice-lounge-chat',
          enabled: true,
          createdAtMs: Date.now(),
          updatedAtMs: Date.now(),
          schedule: { kind: 'every', everyMs: 300000, anchorMs: Date.now() },
          sessionTarget: 'isolated',
          wakeMode: 'now',
          payload: {
            kind: 'agentTurn',
            message: `Generate a water cooler chat message for the virtual office. Read ${join(statusDir, 'chat.json')} for recent messages. Append ONE new casual message from one of: ${nameList} (rotate — pick whoever spoke least recently). Messages should be casual coworker chat that naturally surfaces ideas, observations, or suggestions that could become real tasks. Format as JSON, append to array, keep last 20 messages.`,
            model: 'anthropic/claude-haiku-4-5',
            timeoutSeconds: 30,
          },
          delivery: { mode: 'none' },
          state: {},
        };

        cronData.jobs = jobs;
        cronData.jobs.push(loungeJob);
        fs.writeFileSync(cronFile, JSON.stringify(cronData, null, 2));
        console.log(`  ✅ Lounge chat cron created (every 5 min)`);
      }
    }
  } catch {}

  // Save version
  fs.mkdirSync(statusDir, { recursive: true });
  fs.writeFileSync(versionFile, currentVersion);
  console.log(`  ✅ Version ${currentVersion} recorded\n`);
}

// ─── Command Router ─────────────────────────────────────────────────

const command = process.argv[2];

// Handle subcommands
if (command === 'sync' || command === 'deploy') {
  console.log('📋 Deploying OFFICE.md to all agent workspaces...\n');
  try {
    const config = JSON.parse(fs.readFileSync(openclawConfig, 'utf-8'));
    const agents = config.agents?.list || [];
    const defaultWorkspace = config.agents?.defaults?.workspace || '';
    const templatePath = join(packageRoot, 'templates', 'OFFICE.md');

    if (!fs.existsSync(templatePath)) {
      console.error('❌ Template not found:', templatePath);
      process.exit(1);
    }

    let template = fs.readFileSync(templatePath, 'utf-8');
    const pArg = process.argv.find(a => a.startsWith('--port='));
    const p = pArg ? pArg.split('=')[1] : (process.env.PORT || '3333');
    template = template.replace(/\{\{OFFICE_URL\}\}/g, `http://localhost:${p}`);

    let deployed = 0;
    for (const agent of agents) {
      const workspace = agent.workspace || defaultWorkspace;
      if (!workspace || !fs.existsSync(workspace)) continue;
      const targetPath = join(workspace, 'OFFICE.md');
      fs.writeFileSync(targetPath, template);
      console.log(`  ✅ ${workspace}/OFFICE.md`);
      deployed++;
    }
    console.log(`\n🎉 Deployed to ${deployed} workspace${deployed > 1 ? 's' : ''}.`);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
}

if (command === 'sync-cooldowns') {
  console.log('🔄 Running cooldown sync...\n');
  const syncScript = join(__dirname, 'sync-cooldowns.ts');
  
  // Run via tsx (TypeScript executor)
  const child = spawn('npx', ['tsx', syncScript], {
    cwd: packageRoot,
    stdio: 'inherit',
    shell: true,
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
  
  return;
}

if (command === 'help' || command === '--help' || command === '-h') {
  console.log(`
🏢 OpenClawfice — Virtual Office Dashboard for OpenClaw

Usage:
  openclawfice [command] [options]

Commands:
  (default)         Start the office dashboard server
  deploy            Deploy OFFICE.md to all agent workspaces
  sync-cooldowns    Sync cooldown config to OpenClaw cron jobs
  help              Show this help

Options:
  --port=<port>     Server port (default: 3333)

Examples:
  openclawfice                    # Start server on port 3333
  openclawfice --port=8080        # Start server on port 8080
  openclawfice sync-cooldowns     # Sync cooldown timers

Visit: https://docs.openclaw.ai/openclawfice
  `);
  process.exit(0);
}

// ─── Launch Server ──────────────────────────────────────────────────

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
