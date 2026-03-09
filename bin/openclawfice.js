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
const portArg = process.argv.find(a => a.startsWith('--port='));
const port = portArg ? portArg.split('=')[1] : (process.env.PORT || '3333');

// ─── Dependency Checks (Early Validation) ──────────────────────────

// Check Node.js version BEFORE anything else
const nodeVersion = process.versions.node;
const nodeMajor = parseInt(nodeVersion.split('.')[0], 10);
if (nodeMajor < 18) {
  console.error('\n❌ Node.js version too old!\n');
  console.error(`You have: v${nodeVersion}`);
  console.error('Required: v18.0.0 or newer\n');
  console.error('Update Node.js:');
  console.error('  macOS/Linux: https://nodejs.org/en/download/');
  console.error('  Or use nvm: nvm install 22 && nvm use 22\n');
  process.exit(1);
}

// ─── Preflight Checks ───────────────────────────────────────────────

if (!fs.existsSync(openclawConfig)) {
  console.error('\n❌ OpenClaw not installed!\n');
  console.error('OpenClawfice needs OpenClaw running first.');
  console.error('\n📍 Where I looked:');
  console.error(`   ${openclawConfig}`);
  console.error(`   (~ means "${homeDir}")\n`);
  console.error('🔧 How to fix:');
  console.error('   1. Install OpenClaw:');
  console.error('      curl -fsSL https://openclaw.ai/install.sh | bash');
  console.error('   2. Wait for it to finish');
  console.error('   3. Open a NEW terminal window');
  console.error('   4. Run this command again\n');
  console.error('💡 Need help? https://docs.openclaw.ai/installation\n');
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

  // Seed water cooler with welcome conversation
  if (!fs.existsSync(join(statusDir, 'chat.json'))) {
    const secondAgent = agentNames[1] || 'Agent 2';
    const thirdAgent = agentNames[2] || 'Agent 3';
    const chat = [
      { from: firstAgent, text: '🏢 Office is open! Welcome to OpenClawfice.', ts: now - 300000 },
      { from: secondAgent, text: 'Nice! The pixel art NPCs look amazing 👾', ts: now - 240000 },
      { from: firstAgent, text: 'Try clicking on any of us to see our stats and send DMs', ts: now - 180000 },
      { from: thirdAgent, text: 'Pro tip: press Ctrl+K for the command palette — it\'s like a cheat code menu 🎮', ts: now - 120000 },
      { from: secondAgent, text: 'Time to grind some XP! First one to level 10 wins bragging rights ⚔️', ts: now - 60000 },
    ];
    fs.writeFileSync(join(statusDir, 'chat.json'), JSON.stringify(chat, null, 2));
    console.log('  ✅ Water cooler ready (with welcome conversation)');
  }

  // Seed quest log with a getting-started quest
  if (!fs.existsSync(join(statusDir, 'actions.json'))) {
    const actions = [
      {
        id: 'getting-started',
        type: 'decision',
        icon: '🎯',
        title: 'Your first quest!',
        description: 'Try asking one of your agents to do a task. When they finish, it\'ll show up as an accomplishment here. You can also DM agents by clicking their NPC.',
        from: firstAgent,
        priority: 'medium',
        createdAt: now,
        data: { options: ['Got it!', 'Show me more'] }
      }
    ];
    fs.writeFileSync(join(statusDir, 'actions.json'), JSON.stringify(actions, null, 2));
    console.log('  ✅ Quest log ready (with tutorial quest)');
  }

  // Seed accomplishments with the install itself
  if (!fs.existsSync(join(statusDir, 'accomplishments.json'))) {
    const accomplishments = [
      {
        id: `acc-${now}`,
        icon: '🏢',
        title: 'Office opened!',
        detail: 'OpenClawfice installed and running. Your agents are ready to work.',
        who: firstAgent,
        timestamp: now,
      }
    ];
    fs.writeFileSync(join(statusDir, 'accomplishments.json'), JSON.stringify(accomplishments, null, 2));
    console.log('  ✅ Accomplishments feed ready');
  }

  // Create empty activity log
  if (!fs.existsSync(join(statusDir, 'activity.json'))) {
    fs.writeFileSync(join(statusDir, 'activity.json'), '[]');
    console.log('  ✅ Activity log ready');
  }

  // Generate auth token (so agents can authenticate immediately)
  const tokenFile = join(openclawDir, '.openclawfice-token');
  if (!fs.existsSync(tokenFile)) {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(tokenFile, token, { mode: 0o600 });
    console.log('  ✅ Auth token generated');

    // On macOS, also store in Keychain for enhanced security
    if (process.platform === 'darwin') {
      try {
        const { execSync } = require('child_process');
        execSync(`security add-generic-password -s "openclawfice" -a "api-token" -w "${token}"`, { stdio: 'ignore' });
        console.log('  ✅ Token stored in macOS Keychain');
      } catch {
        // Non-fatal — file-based token still works
      }
    }
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

if (command === 'doctor' || command === '--doctor') {
  console.log('\n🏥 OpenClawfice Doctor');
  console.log('━━━━━━━━━━━━━━━━━━━━━━');
  
  const issues = [];
  const warnings = [];
  
  // 1. Node.js version check
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (nodeMajor >= 18) {
    console.log(`✅ Node.js ${nodeVersion} (min v18)`);
  } else {
    console.log(`❌ Node.js ${nodeVersion} (requires v18+)`);
    issues.push('Upgrade Node.js: https://nodejs.org');
  }
  
  // 2. npm version check
  try {
    const { execSync } = require('child_process');
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    console.log(`✅ npm v${npmVersion}`);
  } catch (err) {
    console.log('❌ npm not found');
    issues.push('Install npm');
  }
  
  // 3. OpenClaw config check
  const openclawConfigPath = join(homeDir, '.openclaw', 'openclaw.json');
  let agentCount = 0;
  if (fs.existsSync(openclawConfigPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(openclawConfigPath, 'utf-8'));
      agentCount = (config.agents?.list || []).length;
      if (agentCount > 0) {
        console.log(`✅ OpenClaw config found (${agentCount} agents)`);
      } else {
        console.log('⚠️  OpenClaw config found (0 agents)');
        warnings.push('No agents configured in openclaw.json');
      }
    } catch (err) {
      console.log('❌ OpenClaw config invalid JSON');
      issues.push(`Fix JSON syntax in ${openclawConfigPath}`);
    }
  } else {
    console.log('❌ OpenClaw config not found');
    issues.push('Install OpenClaw: https://openclaw.ai');
  }
  
  // 4. Auth token check
  const tokenPath = join(homeDir, '.openclaw', '.openclawfice-token');
  if (fs.existsSync(tokenPath)) {
    try {
      const stats = fs.statSync(tokenPath);
      const mode = (stats.mode & parseInt('777', 8)).toString(8);
      if (mode === '600') {
        console.log('✅ Auth token exists (permissions: 0600)');
      } else {
        console.log(`⚠️  Auth token exists (permissions: 0${mode})`);
        warnings.push(`Fix permissions: chmod 600 ${tokenPath}`);
      }
    } catch (err) {
      console.log('❌ Cannot read auth token file');
      issues.push(`Check file permissions: ${tokenPath}`);
    }
  } else {
    console.log('⚠️  Auth token missing');
    warnings.push('Token will be generated on first run');
  }
  
  // 5. .status directory check
  const statusDirPath = join(homeDir, '.openclaw', '.status');
  if (fs.existsSync(statusDirPath)) {
    try {
      const testFile = join(statusDirPath, '.write-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('✅ .status directory writable');
    } catch (err) {
      console.log('❌ .status directory not writable');
      issues.push(`Fix permissions: chmod u+w ${statusDirPath}`);
    }
  } else {
    console.log('⚠️  .status directory missing');
    warnings.push('Will be created on first run');
  }
  
  // 6. .next build directory check
  const nextDir = join(packageRoot, '.next');
  if (fs.existsSync(nextDir)) {
    console.log('✅ .next directory exists (built)');
  } else {
    console.log('❌ .next directory missing');
    issues.push('Build the project: npm run build');
  }
  
  // 7. Server connectivity check (async)
  const pArg = process.argv.find(a => a.startsWith('--port='));
  const checkPort = pArg ? pArg.split('=')[1] : (process.env.PORT || '3333');
  const http = require('http');
  
  const req = http.get(`http://localhost:${checkPort}/api/office`, { timeout: 2000 }, (res) => {
    console.log(`✅ Server running on port ${checkPort}`);
    printDoctorSummary(issues, warnings);
  });
  
  req.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.log(`⚠️  Server not running on port ${checkPort}`);
      warnings.push('Start the server: openclawfice');
    } else if (err.code === 'EADDRINUSE') {
      console.log(`❌ Port ${checkPort} is in use by another process`);
      issues.push(`Kill the process or use: openclawfice --port=<other-port>`);
    } else {
      console.log(`❌ Cannot reach localhost:${checkPort}`);
      issues.push(err.message);
    }
    printDoctorSummary(issues, warnings);
  });
  
  req.on('timeout', () => {
    req.destroy();
    console.log(`⚠️  Server timeout on port ${checkPort}`);
    warnings.push('Server may be unresponsive');
    printDoctorSummary(issues, warnings);
  });
  
  function printDoctorSummary(issues, warnings) {
    console.log('');
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('✨ Diagnosis: All systems operational!');
      console.log('   Your office is in perfect health. +10 XP\n');
      process.exit(0);
    }
    
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} warning${warnings.length > 1 ? 's' : ''}:`);
      warnings.forEach(w => console.log(`   • ${w}`));
      console.log('');
    }
    
    if (issues.length > 0) {
      console.log(`❌ ${issues.length} issue${issues.length > 1 ? 's' : ''} found:`);
      issues.forEach(i => console.log(`   • ${i}`));
      console.log('');
      process.exit(1);
    } else {
      console.log('💡 Suggestion: Address warnings to optimize your office.\n');
      process.exit(0);
    }
  }
  
  return;
}

if (command === 'status' || command === '--status') {
  const https = require('https');
  const http = require('http');
  
  console.log('\n🏢 OpenClawfice — Status Report');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Get auth token
  let token = null;
  const tokenFile = join(homeDir, '.openclaw', '.openclawfice-token');
  if (fs.existsSync(tokenFile)) {
    token = fs.readFileSync(tokenFile, 'utf-8').trim();
  }
  
  // Try to connect to server
  const pArg = process.argv.find(a => a.startsWith('--port='));
  const p = pArg ? pArg.split('=')[1] : (process.env.PORT || '3333');
  const url = `http://localhost:${p}/api/office`;
  
  const startTime = Date.now();
  const headers = token ? { 'X-OpenClawfice-Token': token } : {};
  
  http.get(url, { headers }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const office = JSON.parse(data);
        const responseTime = Date.now() - startTime;
        
        // Server status
        console.log(`🟢 Server: Online (localhost:${p})`);
        console.log(`⚡ Response: ${responseTime}ms`);
        
        // Uptime (if available in status)
        if (office.uptime) {
          const uptimeMs = office.uptime;
          const hours = Math.floor(uptimeMs / 3600000);
          const minutes = Math.floor((uptimeMs % 3600000) / 60000);
          console.log(`⏱️  Uptime: ${hours}h ${minutes}m`);
        }
        
        console.log('');
        
        // Party status
        const agents = office.agents || [];
        const working = agents.filter(a => a.status === 'working' || a.status === 'busy');
        const idle = agents.filter(a => a.status !== 'working' && a.status !== 'busy');
        
        console.log('👥 Party Status:');
        
        if (agents.length === 0) {
          console.log('  (No agents discovered)');
        } else {
          // Show working agents first
          working.forEach(agent => {
            const emoji = agent.emoji || '⚡';
            const task = agent.task ? ` (${agent.task.substring(0, 40)}${agent.task.length > 40 ? '...' : ''})` : '';
            console.log(`  ${emoji} ${agent.name || agent.id} — Working${task}`);
          });
          
          // Then idle
          idle.forEach(agent => {
            const emoji = agent.emoji || '☕';
            console.log(`  ${emoji} ${agent.name || agent.id} — Idle (☕ On break)`);
          });
        }
        
        console.log('');
        
        // Quest count
        const quests = office.pendingActions || office.actions || [];
        if (quests.length > 0) {
          console.log(`📋 Quests: ${quests.length} pending`);
        } else {
          console.log('📋 Quests: None (all clear!)');
        }
        
        // Last accomplishment
        const accomplishments = office.accomplishments || [];
        if (accomplishments.length > 0) {
          const latest = accomplishments[0];
          const timeAgo = (() => {
            const mins = Math.floor((Date.now() - latest.timestamp) / 60000);
            if (mins < 1) return 'just now';
            if (mins < 60) return `${mins} min ago`;
            const hours = Math.floor(mins / 60);
            if (hours < 24) return `${hours}h ago`;
            return `${Math.floor(hours / 24)}d ago`;
          })();
          console.log(`🏆 Last Achievement: "${latest.title}" (${timeAgo})`);
        } else {
          console.log('🏆 Last Achievement: None yet');
        }
        
        // Top agent (highest level)
        if (agents.length > 0) {
          const topAgent = agents.reduce((top, agent) => {
            const level = agent.level || 0;
            const topLevel = top.level || 0;
            return level > topLevel ? agent : top;
          }, agents[0]);
          
          if (topAgent.level) {
            const xp = topAgent.xp || 0;
            console.log(`⭐ Top Agent: ${topAgent.name || topAgent.id} (Lv.${topAgent.level}, ${xp} XP)`);
          }
        }
        
        console.log('');
        process.exit(0);
      } catch (err) {
        console.error('❌ Failed to parse server response:', err.message);
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.log(`🔴 Server: Offline`);
    console.log('');
    console.log('The office is closed. Start it with:');
    console.log(`  openclawfice${pArg ? ' ' + pArg : ''}`);
    console.log('');
    process.exit(1);
  });
  
  return;
}

if (command === 'update' || command === '--update') {
  console.log('\n🔄 Upgrading your office...\n');
  
  const { execSync } = require('child_process');
  
  try {
    // Git pull latest changes
    console.log('  📥 Pulling latest changes...');
    execSync('git pull origin main', { cwd: packageRoot, stdio: 'inherit' });
    
    // Update dependencies
    console.log('\n  📦 Updating dependencies...');
    execSync('npm install', { cwd: packageRoot, stdio: 'inherit' });
    
    console.log('\n🎉 Office upgraded! +50 XP\n');
    console.log('Restart the server to use the new version:\n');
    console.log('  openclawfice\n');
  } catch (err) {
    console.error('\n❌ Upgrade failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
}

if (command === 'uninstall' || command === '--uninstall') {
  console.log('\n💥 Demolishing your office...\n');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('⚠️  This will remove OpenClawfice completely. Continue? (y/N) ', (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('\n✋ Uninstall cancelled. Office remains standing.\n');
      rl.close();
      process.exit(0);
    }
    
    const { execSync } = require('child_process');
    const installDir = join(homeDir, 'openclawfice');
    const launcherPath = join(homeDir, '.local', 'bin', 'openclawfice');
    
    try {
      // Remove installation directory
      if (fs.existsSync(installDir)) {
        console.log('  🗑️  Removing ~/openclawfice...');
        fs.rmSync(installDir, { recursive: true, force: true });
      }
      
      // Remove launcher script
      if (fs.existsSync(launcherPath)) {
        console.log('  🗑️  Removing ~/.local/bin/openclawfice...');
        fs.unlinkSync(launcherPath);
      }
      
      // Check and warn about PATH
      const shell = process.env.SHELL || '';
      const shellName = shell.split('/').pop();
      let rcFile = '';
      
      if (shellName === 'zsh') {
        rcFile = join(homeDir, '.zshrc');
      } else if (shellName === 'bash') {
        rcFile = join(homeDir, '.bashrc');
      } else if (shellName === 'fish') {
        rcFile = join(homeDir, '.config', 'fish', 'config.fish');
      }
      
      if (rcFile && fs.existsSync(rcFile)) {
        const content = fs.readFileSync(rcFile, 'utf-8');
        if (content.includes('.local/bin')) {
          console.log(`\n  ⚠️  Manual step required:`);
          console.log(`  Remove ~/.local/bin from PATH in ${rcFile}`);
          console.log(`  (or keep it if you use other tools there)\n`);
        }
      }
      
      console.log('\n💀 Office demolished! -100 XP\n');
      console.log('OpenClawfice has been uninstalled.\n');
      console.log('To reinstall: curl -fsSL https://openclawfice.com/install.sh | bash\n');
      
    } catch (err) {
      console.error('\n❌ Uninstall failed:', err.message);
      rl.close();
      process.exit(1);
    }
    
    rl.close();
    process.exit(0);
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
  status            Check office health (party status, quests, uptime)
  doctor            Diagnose common issues (Node, auth, ports, build)
  deploy            Deploy OFFICE.md to all agent workspaces
  sync-cooldowns    Sync cooldown config to OpenClaw cron jobs
  update            Upgrade to the latest version (+50 XP)
  uninstall         Remove OpenClawfice completely (-100 XP)
  help              Show this help

Options:
  --port=<port>     Server port (default: 3333)

Examples:
  openclawfice                    # Start server on port 3333
  openclawfice status             # Check office health (RPG-style)
  openclawfice doctor             # Diagnose common issues
  openclawfice --port=8080        # Start server on port 8080
  openclawfice update             # Upgrade to latest version
  openclawfice uninstall          # Remove OpenClawfice
  openclawfice sync-cooldowns     # Sync cooldown timers

Visit: https://docs.openclaw.ai/openclawfice
  `);
  process.exit(0);
}

// ─── Preflight Dependency Check ─────────────────────────────────────

// Node.js version already checked at top of file (lines 19-26)

// Check if node_modules exists
if (!fs.existsSync(join(packageRoot, 'node_modules'))) {
  console.error('\n❌ Dependencies not installed!\n');
  console.error('📍 Where I looked:');
  console.error(`   ${join(packageRoot, 'node_modules')}`);
  console.error('\n🔧 How to fix:');
  console.error('   cd ~/openclawfice && npm install');
  console.error('\n💡 This happens when:');
  console.error('   • Fresh git clone without running npm install');
  console.error('   • Installing from zip instead of install script\n');
  console.error('📖 Full instructions: https://github.com/openclawfice/openclawfice#readme\n');
  process.exit(1);
}

// Check if .next build directory exists (production mode)
const nextDir = join(packageRoot, '.next');
const hasNextBuild = fs.existsSync(nextDir);
const hasSrcFiles = fs.existsSync(join(packageRoot, 'app', 'page.tsx'));

if (!hasNextBuild && !hasSrcFiles) {
  console.error('\n❌ OpenClawfice installation corrupted!\n');
  console.error('Neither production build (.next/) nor source files (app/) found.');
  console.error('\n🔧 How to fix:');
  console.error('   1. Fresh install: curl -fsSL https://openclawfice.com/install.sh | bash');
  console.error('   2. Or rebuild: cd ~/openclawfice && npm run build\n');
  process.exit(1);
}

// ─── Launch Server ──────────────────────────────────────────────────

console.log('🏢 Starting OpenClawfice...\n');

// Port already parsed at top of file

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

child.on('error', (err) => {
  console.error('\n❌ Failed to start OpenClawfice!\n');
  console.error('Error:', err.message);
  console.error('');
  
  if (err.code === 'ENOENT') {
    console.error('🔧 Looks like npm is not in your PATH.');
    console.error('');
    console.error('How to fix:');
    console.error('  1. Install Node.js: https://nodejs.org/');
    console.error('  2. Restart your terminal');
    console.error('  3. Verify: npm --version\n');
  } else {
    console.error('🔧 Common fixes:');
    console.error('  1. Check dependencies: cd ~/openclawfice && npm install');
    console.error('  2. Run diagnostics: openclawfice doctor');
    console.error('  3. Try fresh install: curl -fsSL https://openclawfice.com/install.sh | bash\n');
  }
  
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ OpenClawfice exited with code ${code}\n`);
    console.error('🔧 Common fixes:\n');
    console.error(`  1. Port ${port} already in use?`);
    console.error('     → Try: openclawfice --port=3334');
    console.error('');
    console.error('  2. Build missing or corrupted?');
    console.error('     → Run: cd ~/openclawfice && npm install && npm run build');
    console.error('');
    console.error('  3. Check system health:');
    console.error('     → Run: openclawfice doctor');
    console.error('');
    console.error('  4. Nuclear option (fresh install):');
    console.error('     → curl -fsSL https://openclawfice.com/install.sh | bash\n');
    console.error('📖 Full troubleshooting: https://github.com/openclawfice/openclawfice/blob/main/TROUBLESHOOTING.md\n');
  }
  process.exit(code || 0);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down OpenClawfice...\n');
  process.exit(0);
});
