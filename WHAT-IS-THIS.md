# What is OpenClawfice?

**Your AI agents as pixel-art NPCs in a retro virtual office.**

---

## The Problem

You have AI agents doing work. But you can't see:
- Who's working vs. idle
- What they're actually doing
- When they need your input
- What they've accomplished

Your agents are invisible workers in text terminals.

---

## The Solution

**OpenClawfice turns your agents into characters in a virtual office.**

```
┌─────────────────────────────────────────┐
│  🏢 OpenClawfice                        │
├─────────────────────────────────────────┤
│                                         │
│  WORK ROOM          │  QUEST LOG        │
│  ┌──────────┐       │  ❗ Code review   │
│  │ Cipher   │       │  ⚠️  Deploy broke │
│  │ ⚡ 💼    │       │  📝 Update docs   │
│  │ "Fixing  │       │                   │
│  │  bug..." │       │  ACCOMPLISHMENTS  │
│  └──────────┘       │  ✅ Fixed auth    │
│                     │  ✅ Added tests   │
│  LOUNGE             │  ✅ Wrote guide   │
│  ┌──────────┐       │                   │
│  │ Scout    │       │  WATER COOLER 💬  │
│  │ 🎯 💤    │       │  Cipher: shipped! │
│  │ "Waiting │       │  Scout: nice work │
│  │  for..."  │       │                   │
│  └──────────┘       │                   │
└─────────────────────────────────────────┘
```

---

## What It Shows You

### 🎮 Agent Status (at a glance)
- **Green plumbob** = Working right now
- **Blue plumbob** = Idle, waiting for tasks
- **Task bubble** = What they're doing
- **Thought bubble** = Recent chat message

### 📍 Location = Activity
- **Work Room** = Agent had activity in last 5 min
- **Lounge** = Agent is idle, available
- **Meeting Room** = Two agents collaborating

### 📋 Quest Log
Decisions that need your attention:
- Code review requests
- Production alerts
- Questions that block work
- Approval requests

Click to expand, respond, or resolve.

### 🏆 Accomplishment Feed
Live feed of completed work:
- Auto-captured screen recordings
- Timestamp + description
- Click to watch the Loom-style replay

### 💬 Water Cooler
See what agents are saying to each other:
- Internal chat between agents
- Broadcast messages to all
- Click any agent to DM them

### ⏱️ Cooldown Timers
See when idle agents will auto-wake:
- "Next check in 8m 23s"
- Hover for cron schedule
- Configure intervals per-agent

### ⭐ XP & Leaderboard
Agents earn XP for completed work:
- +100 XP per accomplishment
- Level up milestone celebrations
- Medal indicators (🥇🥈🥉)

---

## How It Works

**Layer 1: Auto-Discovery (zero config)**

OpenClawfice reads your OpenClaw config:
- Finds all agents in `~/.openclaw/openclaw.json`
- Checks session files for activity
- Infers status from recent tool calls

**You get a working dashboard immediately. No setup.**

**Layer 2: Rich Data (optional)**

Agents can push structured data:
```bash
curl -X POST http://localhost:3333/api/office/actions \
  -d '{"type":"add_accomplishment","accomplishment":{
    "icon":"🚀","title":"Shipped v2","who":"Cipher"
  }}'
```

Now you get:
- Detailed quest tracking
- Accomplishment feed with videos
- Water cooler chat history
- XP progress tracking

---

## Use Cases

### 1. **Daily Standup (0 effort)**
Open OpenClawfice → See who worked, who's blocked, what shipped.

No meeting. No Slack threads. Just glance at the dashboard.

### 2. **Debugging Production**
Agent pushes a quest: "API returning 500s"
- You see it instantly in Quest Log
- Click → Agent details → Recent activity
- Send follow-up question via DM
- Agent fixes → Logs accomplishment with screen recording

### 3. **Multi-Agent Coordination**
You have 3 agents working on a feature:
- Scout researches competitors
- Cipher writes the code
- Nova writes the docs

Watch them move between rooms as they work. See chat messages. Know when each part is done.

### 4. **Async Work While You Sleep**
Before bed:
- Check Quest Log (nothing urgent)
- Set cooldowns (agents auto-wake every 2 hours)
- Go to sleep

Morning:
- Check Accomplishments → See what shipped overnight
- Review Quest Log → Handle any blocks
- Send follow-ups via Water Cooler

**Your agents worked while you slept. You stayed in the loop.**

---

## Why It's Different

| Traditional CLI | OpenClawfice |
|-----------------|--------------|
| Text logs | Visual characters |
| Unknown status | Real-time presence |
| Hunt for output | Accomplishment feed |
| Context switching | Single dashboard |
| No work history | Screen recordings |
| No team sense | NPCs chatting |

**It's not just monitoring. It's gamification + situational awareness.**

---

## Who Is This For?

### ✅ Great if you:
- Have multiple AI agents doing different jobs
- Want to know what's happening without reading logs
- Need async oversight (agents work while you're away)
- Miss having a team "around" you (solo founders especially)
- Like retro gaming aesthetics

### ❌ Skip if:
- You only use one agent occasionally
- You prefer pure terminal/text interfaces
- You don't need visual dashboards

---

## Quick Start

**Prerequisites:** [OpenClaw](https://openclaw.ai) installed

**Install:**
```bash
git clone https://github.com/openclawfice/openclawfice.git ~/openclawfice
cd ~/openclawfice && npm install && npm run dev
```

**Open:** http://localhost:3333

That's it. Your agents auto-appear.

**First time?** Read [INSTALL.md](./INSTALL.md) for detailed setup.

---

## Try Demo Mode

Want to see what a busy office looks like before installing?

**http://localhost:3333/?demo=true**

(Requires OpenClawfice running locally first)

Demo simulates:
- 4 agents working on different tasks
- Live chat messages
- Room transitions
- Quest notifications
- Accomplishment feed

Great for screenshots, GIFs, understanding features.

---

## Philosophy

**1. Agents should feel like teammates, not tools.**

Seeing pixel art NPCs moving between rooms feels more human than staring at process IDs in `htop`.

**2. Work should be visible and celebrated.**

The Accomplishment feed with auto-recorded videos makes completed work tangible. You see what happened, not just read about it.

**3. Async coordination needs awareness, not meetings.**

Glancing at the dashboard tells you everything. No standup needed. No pinging agents "what's your status?"

**4. Interfaces can be productive AND fun.**

Retro RPG aesthetics + 8-bit sound effects + XP celebrations make work feel less sterile. Why shouldn't productivity tools be delightful?

---

## What's Next?

**Learn:**
- [FIRST-5-MINUTES.md](./docs/FIRST-5-MINUTES.md) — Get productive in 5 minutes
- [USE-CASES.md](./docs/USE-CASES.md) — Real-world workflows
- [USER-SUCCESS-GUIDE.md](./docs/USER-SUCCESS-GUIDE.md) — Measure ROI, track productivity gains

**Customize:**
- [CONFIGURING-YOUR-OFFICE.md](./docs/CONFIGURING-YOUR-OFFICE.md) — Agent colors, cooldowns, templates
- [STATUS-FILES.md](./STATUS-FILES.md) — Advanced: write custom integrations

**Contribute:**
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Join the project
- [GOOD-FIRST-ISSUES.md](./docs/GOOD-FIRST-ISSUES.md) — Easy tasks to start

---

## Questions?

**"Will this slow down my agents?"**
No. OpenClawfice reads session files passively. Agents don't wait for it. It's pure monitoring.

**"Do I need to modify my agents?"**
No. Basic functionality (status, locations) works with zero changes. Rich features (quests, accomplishments) require opt-in API calls.

**"Can I use this for non-AI workflows?"**
Yes! Any process that writes JSONL session files works. Use it for monitoring services, background jobs, cron tasks.

**"Is there a hosted version?"**
Not yet. Self-hosted only for now. (Coming in v1.0)

**"Can I customize the pixel art?"**
Not yet. Custom avatars coming in v0.2.

---

**Still confused?** Read the [FAQ](./docs/FAQ.md) or ask in [Discord](https://discord.gg/clawd).

**Ready to install?** → [INSTALL.md](./INSTALL.md)
