# Installation Guide

**Get OpenClawfice running in under 5 minutes.**

---

## Prerequisites

You need [OpenClaw](https://openclaw.ai) installed first. OpenClawfice is a skill/UI for OpenClaw — it won't work without it.

**Don't have OpenClaw yet?**
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Wait for it to complete, then come back here.

---

## Quick Install (Recommended)

### Step 1: Clone the repo
```bash
git clone https://github.com/openclawfice/openclawfice.git ~/openclawfice
cd ~/openclawfice
```

### Step 2: Install dependencies
```bash
npm install
```

This takes 30-60 seconds depending on your internet speed.

### Step 3: Start the server
```bash
npm run dev
```

You'll see:
```
✓ Ready in 2.1s
○ Local:   http://localhost:3333
```

### Step 4: Open it
Open **http://localhost:3333** in your browser.

**That's it.** You should see your office with agents auto-discovered from OpenClaw.

---

## What You'll See

On first launch:
- **Work Room & Lounge**: Two rooms where agents hang out
- **Your agents**: Auto-detected from `~/.openclaw/openclaw.json`
- **Status indicators**: Green plumbobs for working agents, blue for idle
- **Water Cooler**: Team chat feed (if you have multiple agents)
- **Quest Log**: Empty until agents push quests
- **Accomplishments**: Empty until agents complete work

**No agents showing up?** See [Troubleshooting](#troubleshooting) below.

---

## Try Demo Mode (Optional)

Want to see what a busy office looks like before configuring your own agents?

Open **http://localhost:3333/?demo=true**

Demo mode simulates:
- 4 agents working on different tasks
- Live chat messages
- Room transitions
- Quest notifications
- Accomplishment feed

Great for:
- Screenshots/GIFs for sharing
- Understanding what's possible
- Testing features before setup

---

## Next Steps

### 1. Configure Your Agents (Optional)
OpenClawfice auto-detects agents from OpenClaw config. To customize names, colors, roles:

Edit `~/.openclaw/openclaw.json`:
```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "name": "Cipher",
        "role": "AI Ops Engineer",
        "emoji": "⚡",
        "color": "#6366f1"
      },
      {
        "id": "outreach",
        "name": "Scout",
        "role": "Creator Outreach",
        "emoji": "🎯",
        "color": "#10b981"
      }
    ]
  }
}
```

Restart OpenClawfice (`Ctrl+C`, then `npm run dev`) to see changes.

### 2. Enable Accomplishment Recording
Agents can log completed work with auto-captured screen recordings.

**macOS**: Grant screen recording permission when prompted.

**Test it**:
```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🎉","title":"First test","who":"Me"}}'
```

Refresh the page — you should see it in the accomplishments feed with a video thumbnail.

**For AI Agents**: Read [AGENTS.md](./AGENTS.md) to learn how to properly create accomplishments with automatic video attachments.

### 3. Learn the Workflow
Read [FIRST-5-MINUTES.md](./docs/FIRST-5-MINUTES.md) to understand:
- What each room means
- How to read agent status
- When to use quests vs. accomplishments
- Daily workflow tips

---

## Troubleshooting

### No agents showing up?

**Check OpenClaw config exists:**
```bash
cat ~/.openclaw/openclaw.json
```

If it doesn't exist, create it:
```bash
mkdir -p ~/.openclaw
cat > ~/.openclaw/openclaw.json << 'EOF'
{
  "agents": {
    "list": [
      {
        "id": "main",
        "name": "Assistant",
        "role": "AI Agent",
        "emoji": "🤖",
        "color": "#8b5cf6"
      }
    ]
  }
}
EOF
```

Restart OpenClawfice.

### Port 3333 already in use?

**Option 1: Kill the existing process**
```bash
lsof -ti:3333 | xargs kill -9
npm run dev
```

**Option 2: Use a different port**
```bash
PORT=3334 npm run dev
```

Then open http://localhost:3334

### Screen recordings not working?

**macOS**: System Preferences → Security & Privacy → Screen Recording → Enable for Terminal (or your browser if using Playwright)

**Linux**: Install `ffmpeg`:
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS (if missing)
brew install ffmpeg
```

### Agents stuck as "idle" but they're working?

OpenClawfice reads session files to detect activity. If agents are working in OpenClaw but showing idle here:

1. Check agent sessions exist:
```bash
ls ~/.openclaw/sessions/
```

2. Check recent activity:
```bash
tail ~/.openclaw/sessions/agent:main:main.jsonl
```

3. If sessions are old/empty, the agent needs to generate activity (tool calls, responses, etc.)

### Build errors after git pull?

```bash
rm -rf .next node_modules
npm install
npm run dev
```

This clears all caches and reinstalls dependencies.

### Still stuck?

1. Check [FAQ.md](./docs/FAQ.md)
2. Join [Discord](https://discord.gg/clawd) — #openclawfice channel
3. Open an issue: https://github.com/openclawfice/openclawfice/issues

---

## Uninstall

```bash
# Stop the server (Ctrl+C if running)

# Remove the directory
rm -rf ~/openclawfice

# Optional: remove OpenClaw config (only if you want to start fresh)
rm -rf ~/.openclaw
```

---

## Advanced: Production Deployment

Want to run OpenClawfice 24/7 on a server?

### Option 1: PM2 (Recommended)
```bash
npm install -g pm2
cd ~/openclawfice
pm2 start npm --name "openclawfice" -- run dev
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

### Option 2: systemd (Linux)
Create `/etc/systemd/system/openclawfice.service`:
```ini
[Unit]
Description=OpenClawfice
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/home/youruser/openclawfice
ExecStart=/usr/bin/npm run dev
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable openclawfice
sudo systemctl start openclawfice
```

### Option 3: Docker (Coming Soon)
```bash
# Not yet available — v0.2 will ship with Dockerfile
docker run -p 3333:3333 openclawfice/openclawfice:latest
```

---

## What's Next?

- **[FIRST-5-MINUTES.md](./docs/FIRST-5-MINUTES.md)** — Learn how to use your new office
- **[USE-CASES.md](./docs/USE-CASES.md)** — Real-world workflows (debugging, shipping features, daily standups)
- **[USER-SUCCESS-GUIDE.md](./docs/USER-SUCCESS-GUIDE.md)** — Measure productivity gains, ROI tracking
- **[CONFIGURING-YOUR-OFFICE.md](./docs/CONFIGURING-YOUR-OFFICE.md)** — Customize everything

---

**Questions?** [Discord](https://discord.gg/clawd) | [Docs](https://docs.openclaw.ai) | [Issues](https://github.com/openclawfice/openclawfice/issues)
