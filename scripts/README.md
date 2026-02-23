# OpenClawfice Scripts

Utility scripts for development, testing, and demos.

---

## Available Scripts

### `verify-launch-ready.sh`

**Purpose:** Pre-flight check before launching OpenClawfice  
**Usage:**
```bash
./scripts/verify-launch-ready.sh
```

**What it checks:**
- ✅ Server running at localhost:3333
- ✅ Demo API working with 5 agents
- ✅ Live simulation functioning (agents change status)
- ✅ All documentation files exist
- ✅ Build passes without errors
- ✅ Git status (uncommitted changes, remote URL)
- ✅ Install script exists and is executable

**Expected output:**
```
🚀 OpenClawfice Launch Readiness Check
=======================================

📡 Server Status
✅ Server running at localhost:3333

🎮 Demo Mode
✅ Demo API working (5 agents)
✅ Live simulation working (agents change status)

📚 Documentation
✅ README.md exists
✅ QUICKSTART.md exists
... (all docs checked)

📊 Summary
✅ Passed: 15
❌ Failed: 0
⚠️  Warnings: 2

🎉 Launch ready! All critical checks passed.
```

**When to use:** Before posting to Discord, Twitter, or HN. Ensures nothing is broken.

---

### `test-demo-simulation.sh`

**Purpose:** Test the live simulation in demo mode  
**Usage:**
```bash
./scripts/test-demo-simulation.sh
```

**What it does:**
- Polls the demo API 5 times with 5-second intervals
- Shows agent status/tasks changing
- Shows water cooler chat messages appearing
- Verifies simulation is working correctly

**Requirements:**
- OpenClawfice server running (`npm run dev`)
- Demo mode endpoints available at `localhost:3333`

**Expected output:**
```
🎮 Testing OpenClawfice Demo Mode Simulation
==============================================

Poll #1 (16:56:53)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Agents:
  📋 Nova: working - Reviewing sprint velocity metrics
  🔨 Forge: idle - idle
  🔍 Lens: idle - idle
  🎨 Pixel: working - Creating mockups
  ⚡ Cipher: working - Discussing deployment strategy

💬 Water Cooler (last 3 messages):
  Pixel: Love the new animations Forge added
  Cipher: Deploying to staging in 5 minutes
  Nova: Nice work everyone, we're shipping fast 🚀
```

After 5 polls, you should see:
- Agents changing status (working ↔ idle)
- New tasks appearing for working agents
- New chat messages in the water cooler

---

### `record-demo-gif.sh`

**Purpose:** Guide Tyler through recording the viral demo GIF manually  
**Usage:**
```bash
./scripts/record-demo-gif.sh
```

**What it does:**
- Checks if demo mode is running
- Detects available recording tools (Kap, Gifski, FFmpeg)
- Provides exact recording script (00:00-00:15 timeline)
- Opens demo mode in browser
- Gives compression tips

**Expected workflow:**
1. Run script
2. Follow on-screen recording instructions
3. Record 10-15 second demo
4. Export as GIF (<5MB)
5. Save to `/public/openclawfice-demo.gif`

**Best for:** Manual recording with full control over cursor movements

---

### `auto-generate-demo-gif.js`

**Purpose:** Automatically generate demo GIF using Playwright  
**Usage:**
```bash
# One-time setup
npm install -D playwright
npx playwright install chromium

# Generate GIF
node scripts/auto-generate-demo-gif.js
```

**What it does:**
- Launches browser automatically
- Executes predefined scene script (hover agent, click quest, etc.)
- Captures frames at 30 FPS
- Converts to GIF using ffmpeg
- Outputs to `/public/openclawfice-demo.gif`

**Pros:**
- Fully automated (no manual recording)
- Consistent results every time
- Perfect timing

**Cons:**
- Requires Playwright installation
- Less natural cursor movements
- May need selector adjustments

**Best for:** Quick iteration or when consistent output is needed

---

### `record-loom.sh`

**Purpose:** Record agent accomplishments as "Loom-style" screen recordings  
**Usage:** Called automatically by the system when agents complete work

---

## Testing Workflow

### Test Demo Mode Simulation
```bash
# 1. Start the server
npm run dev

# 2. Run the test script
./scripts/test-demo-simulation.sh

# 3. Or test in browser
open http://localhost:3333/?demo=true
```

### Manual API Testing
```bash
# Poll agents
curl -s http://localhost:3333/api/demo | jq '.agents[] | {name, status, task}'

# Poll chat
curl -s http://localhost:3333/api/demo/chat | jq '.messages[-3:]'
```

Wait 10-15 seconds between polls to see simulation changes.

---

## Troubleshooting

### Script shows empty output
**Cause:** Server not running or not listening on port 3333  
**Fix:**
```bash
# Check if server is running
ps aux | grep "node.*openclawfice\|next.*3333"

# Start server if needed
npm run dev
```

### Agents not changing
**Cause:** Simulation is random, may need multiple polls  
**Fix:** Run script again or increase poll count in the script

### Chat not updating
**Cause:** Chat simulation has timing threshold (8 seconds minimum)  
**Fix:** Wait longer between polls or adjust timing in `/app/api/demo/chat/route.ts`

---

## Adding New Scripts

When adding scripts:
1. Make them executable: `chmod +x scripts/your-script.sh`
2. Add usage docs here
3. Include helpful output messages
4. Test before committing

---

For more details on demo mode simulation, see:
- `/docs/DEMO-MODE-SIMULATION.md` — Technical details
- `/docs/TRY-DEMO.md` — User-facing guide
