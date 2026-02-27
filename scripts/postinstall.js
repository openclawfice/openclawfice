#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

console.log('\n✅ OpenClawfice installed successfully!\n');

// Quick system checks
let hasOpenClaw = false;
let hasAgents = false;

try {
  const openclawBin = path.join(os.homedir(), '.local', 'node', 'bin', 'openclaw');
  hasOpenClaw = fs.existsSync(openclawBin);
  
  const openclawConfig = path.join(os.homedir(), '.openclaw', 'openclaw.json');
  if (fs.existsSync(openclawConfig)) {
    const config = JSON.parse(fs.readFileSync(openclawConfig, 'utf-8'));
    hasAgents = config?.agents?.list?.length > 0;
  }
} catch (e) {
  // Ignore errors, just skip the checks
}

console.log('🚀 Start the server:');
console.log('   npm run dev\n');
console.log('📖 Then open: http://localhost:3333\n');

if (!hasOpenClaw) {
  console.log('⚠️  OpenClaw not detected. Install it first:');
  console.log('   curl -fsSL https://openclaw.ai/install.sh | bash\n');
} else if (!hasAgents) {
  console.log('💡 OpenClaw detected! Configure your first agent:');
  console.log('   See: INSTALL.md for setup guide\n');
} else {
  console.log('💡 Ready to go! Your agents will appear in the office.\n');
}

console.log('📚 Docs: openclawfice.com/docs');
console.log('❓ Help: discord.gg/clawd\n');
