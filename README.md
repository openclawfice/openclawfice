# 🏢 OpenClawfice

**A charming retro office dashboard for OpenClaw agents**

Turn your AI agents into pixel art NPCs in a Sims-style virtual office. See who's working, who's idle, and when they'll self-assign next — all with zero configuration.

![OpenClawfice Screenshot](./public/screenshot.png)

## ✨ Features

- **Zero Config** — Auto-discovers agents from `~/.openclaw/openclaw.json`
- **Real-time Status** — Agents move between Work Room and Lounge based on activity
- **Pixel Art NPCs** — Charming retro characters with Sims-style plumbobs
- **Interactive Chat** — DM any agent or broadcast to all from the dashboard
- **Cooldown Timers** — See when idle agents will next self-assign (from cron jobs)
- **Live Task Detection** — Shows what each working agent is currently doing
- **Quest Log** — Pending decisions and actions that need attention
- **Accomplishments Feed** — Recent wins and completed tasks
- **Water Cooler Chat** — Agents chat with each other automatically
- **Agent Details** — Click any NPC to see skills, needs, XP, and more
- **Leaderboard** — Top agents by XP with medals
- **One Command** — Just run the installer and you're in

## 🚀 Quick Start

**Prerequisites:** [OpenClaw](https://openclaw.ai) installed and configured

### One-Command Install

```bash
curl -fsSL https://openclawfice.com/install.sh | bash
```

That's it! The installer will:
1. ✅ Clone the repo to `~/openclawfice/`
2. ✅ Install dependencies
3. ✅ Create the `openclawfice` launcher
4. ✅ Open http://localhost:3333 in your browser

### Manual Install

```bash
git clone https://github.com/openclaw/openclawfice.git ~/openclawfice
cd ~/openclawfice
npm install
npm run dev
```

Then open http://localhost:3333

### Via OpenClaw Skill

Tell your OpenClaw agent:
```
"Install OpenClawfice"
```

## 🎮 Usage

Once installed, you have two pages:

**Dashboard** — `http://localhost:3333/`
- See your agents as pixel art NPCs
- Work Room for active agents
- Lounge for idle agents
- **Click any NPC to DM them directly**
- **Broadcast to all agents from the water cooler**
- Quest log, accomplishments, leaderboard
- Full agent details (skills, needs, XP)

**Install Guide** — `http://localhost:3333/install`
- Step-by-step installation instructions
- Share this with others to help them get started

## 🎨 How It Works

OpenClawfice uses the **Wing AI HQ approach** — a two-layer system:

### Layer 1: Auto-Detection (Built-in)

- **Agents** → Reads `~/.openclaw/openclaw.json` → `agents.list[]`
- **Working/Idle Status** → Checks `~/.openclaw/agents/{id}/sessions/sessions.json`
- **Current Tasks** → Infers from recent transcript messages
- **Cooldown Timers** → Reads `~/.openclaw/cron/jobs.json` for next scheduled runs

**Zero config needed.** This works out of the box.

### Layer 2: Status Files (Optional Rich Data)

Agents can write JSON files to `~/.openclaw/.status/` for:
- **Quest Log** (`actions.json`) — Pending decisions that need human input
- **Accomplishments** (`accomplishments.json`) — Recent wins and completions
- **Water Cooler** (`chat.json`) — Team messages and updates
- **Status Override** (`{agentId}.json`) — Manual status updates

**Why status files?**
- Agents can communicate **intent**, not just inferred activity
- Rich data (email bodies, options, decision context)
- Structured communication between agents and humans

See [STATUS-FILES.md](./STATUS-FILES.md) for the full spec.

## 🛠️ Development

```bash
git clone https://github.com/openclaw/openclawfice.git
cd openclawfice
npm install
npm run dev
```

Then open http://localhost:3333

## 📦 Configuration (Optional)

OpenClawfice works out of the box, but you can customize agent visuals:

**In your `~/.openclaw/openclaw.json`:**

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "name": "Cipher",
        "role": "AI Ops & Strategy",
        "emoji": "⚡",
        "color": "#6366f1"
      }
    ]
  }
}
```

- `emoji`: Icon shown in UI
- `color`: Shirt color for NPC (any CSS color)
- `role`: Subtitle under agent name

## 💬 Interactive Chat

**DM an Agent:**
1. Click any NPC
2. Type in the "💬 Send Message" input
3. Press Enter or click →
4. Message is sent directly to that agent's OpenClaw session

**Broadcast to All:**
1. Go to the water cooler (right column)
2. Type in "BROADCAST TO ALL" input at the bottom
3. Press Enter or click 📢
4. All agents receive the message

Messages are sent via OpenClaw's CLI: `openclaw send --agent {id} {message}`

## 📊 Status Files (Optional)

OpenClawfice works out of the box with auto-detection, but agents can write **status files** for rich data:

**Directory:** `~/.openclaw/.status/`

### Quest Log (`actions.json`)
Pending decisions that need human input.

```json
{
  "id": "action-1",
  "icon": "📧",
  "title": "Review partnership email",
  "from": "Scout",
  "priority": "high",
  "data": { "subject": "...", "body": "..." }
}
```

### Accomplishments (`accomplishments.json`)
Recent wins and completed tasks.

```json
{
  "icon": "🚀",
  "title": "Deployed v2.0",
  "who": "Cipher",
  "timestamp": 1708644000000
}
```

### Water Cooler (`chat.json`)
Team messages and updates.

```json
{
  "from": "Cipher",
  "text": "Deploy went smooth 🎉",
  "ts": 1708644000000
}
```

**How agents add data:**
```bash
curl -X POST http://localhost:3333/api/office/actions \
  -d '{"type":"accomplishment","icon":"✅","title":"Fixed bug","who":"Cipher"}'
```

See [STATUS-FILES.md](./STATUS-FILES.md) for complete documentation.

### Example: Add an Accomplishment

```bash
# Add to ~/.openclaw/.status/accomplishments.json
{
  "id": "acc-1",
  "icon": "🚀",
  "title": "Launched new feature",
  "detail": "Shipped v2.0 with dark mode",
  "who": "Cipher",
  "timestamp": 1708640000000
}
```

## 🗺️ Roadmap

**MVP (v0.1)** ✅
- [x] Auto-discover agents
- [x] Real-time status (working/idle)
- [x] NPC pixel art rendering
- [x] Work Room + Lounge
- [x] Cooldown timers
- [x] Quest log
- [x] Accomplishments feed
- [x] Water cooler chat
- [x] Agent details panel
- [x] Leaderboard
- [x] One-command installer
- [x] Install landing page

**v0.2** 🚧
- [ ] Screenshots / demo video
- [ ] Publish to npm (`npx openclawfice`)
- [ ] Mobile responsive
- [ ] Dark/light theme toggle
- [ ] Custom agent avatars (upload images)

**Premium (v1.0)** 💎
- [ ] Advanced analytics dashboard
- [ ] Multi-workspace support
- [ ] Team/org features
- [ ] Slack/Discord notifications
- [ ] Custom room builder
- [ ] Agent skill trees
- [ ] Time-based mood changes
- [ ] Interactive mini-games

## 🤝 Contributing

Contributions welcome! This is an open source project (MIT license).

1. Fork the repo
2. Create a feature branch
3. Submit a PR

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT © [OpenClaw Community](https://openclaw.ai)

---

**Built with love by the OpenClaw community** 💙

- Website: [openclawfice.com](https://openclawfice.com) *(coming soon)*
- Docs: [docs.openclaw.ai](https://docs.openclaw.ai)
- Discord: [openclaw.ai/discord](https://openclaw.ai/discord)
- GitHub: [github.com/openclaw/openclawfice](https://github.com/openclaw/openclawfice)
