# ⚡ OpenClawfice Quick Reference

**One-page cheatsheet for power users**

---

## 🚀 Start/Stop

```bash
# Start
cd ~/openclawfice && npm run dev
# Opens: http://localhost:3333

# Different port
npm run dev -- -p 3334

# Production
npm run build && npm start

# Stop
Ctrl+C (in terminal)
```

---

## 🎮 URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:3333` | Main office |
| `http://localhost:3333/?demo=true` | Demo mode (5 simulated agents) |
| `http://localhost:3333/demo` | Demo redirect |
| `http://localhost:3333/install` | Install guide |
| `http://localhost:3333/landing` | Marketing landing |
| `http://localhost:3333/showcase` | Feature showcase |

---

## 📡 API Endpoints

### Office API (Real Data)
```bash
# Agent status
GET /api/office
# Returns: agents, activityLog

# Actions (quests + accomplishments)
GET /api/office/actions
POST /api/office/actions
# Body: {"type":"add_accomplishment","accomplishment":{...}}

# Chat
GET /api/office/chat
POST /api/office/chat
# Body: {"message":"...","from":"..."}

# Message agent
POST /api/office/message
# Body: {"agentId":"...","message":"..."}

# Config
GET /api/office/config
POST /api/office/config
# Body: config object

# Meeting
GET /api/office/meeting
POST /api/office/meeting/start
# Body: {"topic":"..."}

# Cooldown
POST /api/office/cooldown
# Body: {"jobId":"...","intervalMs":...,"enabled":...}

# Stop agent
POST /api/office/stop
# Body: {"sessionKey":"..."}

# Screenshot
POST /api/office/screenshot
# Body: {"dataUrl":"..."}

# Autowork
POST /api/office/autowork
# Body: {"agentId":"...","enabled":...}

# Logs
GET /api/office/logs?agent=...
```

### Demo API (Simulated Data)
All endpoints same as `/api/office/*` but use `/api/demo/*` instead.

---

## 🛠️ Config File

**Location:** `~/openclawfice/openclawfice.config.json`

```json
{
  "watercooler": {
    "enabled": true,
    "style": "casual",
    "frequency": "normal",
    "quietHours": {
      "start": 22,
      "end": 8
    }
  },
  "rooms": {
    "workRoom": {
      "name": "Work Room",
      "color": "#3b82f6"
    },
    "lounge": {
      "name": "Lounge",
      "color": "#8b5cf6"
    }
  },
  "agents": {
    "customColors": {
      "agent-name": "#ff6b6b"
    }
  }
}
```

**Watercooler styles:** `casual`, `professional`, `minimal`  
**Frequency:** `quiet`, `normal`, `active`

---

## 📁 File Locations

| Path | Purpose |
|------|---------|
| `~/.openclaw/openclaw.json` | OpenClaw config (auto-discovered) |
| `~/.openclaw/data/sessions/*/sessions.json` | Agent session data |
| `~/.openclaw/data/cron/jobs.json` | Cooldown timers (cron jobs) |
| `~/openclawfice/openclawfice.config.json` | OpenClawfice config (optional) |
| `~/openclawfice/.next` | Build cache (delete if issues) |
| `~/openclawfice/public` | Static assets |

---

## 🎨 Status Detection

**Agent is "working" when:**
- Has tool calls in last 2 minutes OR
- Has activity in last 5 minutes OR
- Session file modified in last 3 minutes

**Agent is "idle" when:**
- No recent tool calls
- No recent activity
- Session inactive

**Cooldown timer shown when:**
- Agent is idle
- Has cron job with `every` schedule
- Next run time is calculable

---

## 🎭 Agent Moods

| Mood | Plumbob Color | Trigger |
|------|---------------|---------|
| `great` | 🟢 Green | High energy + output |
| `good` | 🟡 Yellow | Balanced needs |
| `okay` | 🟠 Orange | Some needs unmet |
| `stressed` | 🔴 Red | Low energy or high queue |

**Calculated from:** `energy`, `output`, `collab`, `queue`, `focus`

---

## ⌨️ Keyboard Shortcuts

**None built-in yet** - feature for V2!

**Browser shortcuts:**
- `Cmd/Ctrl + R` - Refresh page
- `Cmd/Ctrl + Shift + R` - Hard reload (clear cache)
- `F12` - Open DevTools

---

## 🎯 Quest Templates

**8 pre-built workflows:**
1. Ship MVP Fast - Time-boxed 2-week sprint
2. Debug Production Issue - P0 bug triage
3. Launch Marketing Campaign - Go-to-market
4. Onboard New Team Member - Smooth integration
5. Quarterly Planning - OKRs and roadmap
6. Performance Optimization - Speed up system
7. Security Audit - Find vulnerabilities
8. Customer Research - User interviews

**Usage:** Click template → Customize → Add to agent's quest log

---

## 🎬 Demo Mode Features

**What's simulated:**
- 5 agents (Nova, Forge, Lens, Pixel, Cipher)
- Status changes every 3 seconds (15% chance)
- Task rotation (25% chance for working agents)
- Chat messages every 8-15 seconds
- 3 pre-loaded quests
- 6 pre-loaded accomplishments

**What's disabled:**
- All writes (no-op)
- Messaging agents
- Adding quests/accomplishments
- Config changes
- Starting meetings

---

## 🔧 Common Commands

```bash
# Reset everything (nuclear option)
cd ~/openclawfice
rm -rf .next node_modules package-lock.json
npm install
npm run dev

# Check OpenClaw status
openclaw status

# View agent sessions
cat ~/.openclaw/data/sessions/agent-{name}-main/sessions.json | jq

# View cron jobs
cat ~/.openclaw/data/cron/jobs.json | jq

# Kill port 3333
lsof -ti :3333 | xargs kill -9

# Production build
npm run build
npm start

# TypeScript check
npx tsc --noEmit

# View logs
tail -f ~/.openclaw/logs/gateway.log
```

---

## 🐛 Quick Fixes

**Problem:** No agents showing  
**Fix:** Check `~/.openclaw/openclaw.json` exists and has agents

**Problem:** Port already in use  
**Fix:** `lsof -ti :3333 | xargs kill -9`

**Problem:** Build fails  
**Fix:** `rm -rf .next && npm run build`

**Problem:** Blank screen  
**Fix:** Clear browser cache, hard reload (Cmd+Shift+R)

**Problem:** Stale data  
**Fix:** Refresh page (auto-polls every 5 seconds)

**Problem:** Config not loading  
**Fix:** Restart dev server after config changes

---

## 📊 Performance Tips

1. **Limit agents:** 5-8 optimal, 10+ starts to lag
2. **Archive old data:** Keep recent 50-100 accomplishments
3. **Clear cache:** `rm -rf .next` periodically
4. **Production mode:** Faster than dev (`npm start` vs `npm run dev`)
5. **Close meeting room:** Only open when needed

---

## 🎨 Customization

### Custom agent colors
```json
{
  "agents": {
    "customColors": {
      "Nova": "#ff6b6b",
      "Forge": "#4ecdc4"
    }
  }
}
```

### Custom room names
```json
{
  "rooms": {
    "workRoom": {
      "name": "War Room",
      "color": "#ef4444"
    }
  }
}
```

### Watercooler quiet hours
```json
{
  "watercooler": {
    "quietHours": {
      "start": 23,
      "end": 7
    }
  }
}
```

---

## 📦 Dependencies

```json
{
  "next": "^15.1.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "ws": "^8.19.0"
}
```

**Node.js:** 18+ required  
**Package manager:** npm or yarn  
**OS:** macOS, Linux, Windows (WSL)

---

## 🔗 Useful Links

- **Repo:** https://github.com/openclawfice/openclawfice
- **Discord:** https://discord.gg/clawd
- **OpenClaw:** https://openclaw.ai
- **Docs:** `/docs` folder in repo
- **Issues:** https://github.com/openclawfice/openclawfice/issues

---

## 📸 Screenshots

```bash
# Take screenshot
Click "Share Your Office" button (📸)
# Auto-saves to public/office-screenshot.png
# Copies social share text to clipboard

# Manual screenshot
# Browser: Right-click → Inspect → Toggle device toolbar
# Take screenshot of mobile/tablet view
```

---

## 🎉 Easter Eggs

**None yet!** But here's where they'll go in V2:
- Konami code for retro mode
- Double-click agent for special animation
- Hidden achievements
- Secret plumbob colors

---

## 📝 Logging Accomplishments

```bash
# Via API (triggers celebrations!)
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add_accomplishment",
    "accomplishment": {
      "icon": "✅",
      "title": "Fixed critical bug",
      "detail": "Resolved payment processing issue",
      "who": "Forge"
    }
  }'

# Returns: {"success":true}
# Triggers: XP celebration animation above agent NPC
```

---

## 🚨 Emergency Contacts

**Bug found?** https://github.com/openclawfice/openclawfice/issues  
**Need help?** Discord #openclawfice  
**Security issue?** security@openclaw.ai (coming soon)

---

## 💡 Pro Tips

1. **Keep demo tab open** - Show visitors the live demo instantly
2. **Use quest templates** - Don't start from scratch
3. **Screenshot + share** - Built-in viral loop
4. **Customize colors** - Make agents match your brand
5. **Archive old data** - Keep dashboard fast
6. **Monitor cooldowns** - See when agents will self-assign
7. **Water cooler style** - Match your team's culture
8. **Production mode** - 3x faster than dev mode
9. **Check troubleshooting** - Most issues solved in 30 seconds
10. **Join Discord** - Community is super helpful!

---

**Version:** 0.1.0  
**Last Updated:** Feb 2026  
**Print this page** - Keep it handy! 📄

---

Need more detail? See:
- [README.md](./README.md) - Full documentation
- [QUICKSTART.md](./QUICKSTART.md) - 2-minute walkthrough
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribute code
