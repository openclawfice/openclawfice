# 🏢 OpenClawfice

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL_3.0-blue.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](https://github.com/openclawfice/openclawfice/releases)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

**Your AI agents as pixel-art NPCs in a retro virtual office.**

Watch them work, chat, complete quests, and earn XP — like The Sims meets your dev team.

![OpenClawfice Demo](./public/openclawfice-demo.gif)

> **New here?** Read [What is this?](./WHAT-IS-THIS.md) for a visual walkthrough, or [Why OpenClawfice?](./WHY-OPENCLAWFICE.md) if deciding whether to try it.
>
> **Ready to launch?** See [Launch Day Checklist](./docs/LAUNCH-DAY-CHECKLIST.md) for final verification, then [Week One Guide](./WEEK-ONE-GUIDE.md) for Days 2-7.
>
> **[Try the live demo →](https://openclawfice.com/?demo=true)** No install needed. 10 seconds to get it.

---

## Install

Requires [OpenClaw](https://openclaw.ai).

```bash
curl -fsSL https://openclawfice.com/install.sh | bash
```

Or manually:

```bash
git clone https://github.com/openclawfice/openclawfice.git ~/openclawfice
cd ~/openclawfice && npm install && npm run dev
```

Open **http://localhost:3333** — that's it. Zero config. Agents are auto-discovered.

**Just installed?** Read [FIRST-5-MINUTES.md](./FIRST-5-MINUTES.md) for a quick walkthrough.

**Having issues?** See [INSTALL.md](./INSTALL.md) for prerequisites and troubleshooting.

**Want the cool stuff?** Check [Cool Features & Hidden Gems](./COOL-FEATURES.md) for fun, quirky, shareable moments.

**Ready to get work done?** See [Get Productive in 10 Minutes](./GET-PRODUCTIVE.md) for real-world workflows and time-saving hacks.

## What You Get

| Feature | Description |
|---------|-------------|
| 🎮 **Live Office** | Agents move between Work Room & Lounge based on real activity |
| 💬 **Chat & DMs** | Click any NPC to message them. Broadcast to all from the water cooler |
| 📋 **Quest Log** | Pending decisions and actions that need your attention |
| 🏆 **Accomplishments** | Feed of completed tasks with auto-captured screen recordings |
| 🎵 **Retro SFX** | Subtle 8-bit sounds for every interaction (mutable) |
| ⏱️ **Cooldown Timers** | See when idle agents will self-assign next |
| ⭐ **XP & Leaderboard** | Agents earn XP for completed work. Top performers get medals |
| 🗳️ **Quest Templates** | One-click workflow starters (ship MVP, debug prod, write docs…) |
| ⌨️ **Keyboard Shortcuts** | `Esc`, `?`, `T`, `M`, `1-9` for power users ([full list](./KEYBOARD-SHORTCUTS.md)) |
| 📱 **Mobile Ready** | Works on any screen size |

## How It Works

**Layer 1 — Auto-detection (zero config):**
Reads `~/.openclaw/openclaw.json` to find agents, checks session files for working/idle status, and infers current tasks from transcripts.

**Layer 2 — Status files (optional, for rich data):**
Agents write JSON to `~/.openclaw/.status/` for quests, accomplishments, and chat. See [STATUS-FILES.md](./STATUS-FILES.md).

```bash
# Example: agent logs an accomplishment
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🚀","title":"Shipped v2","who":"Cipher"}}'
```

## Configuration

Works out of the box. Optionally customize agents in `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "list": [{
      "id": "main",
      "name": "Cipher",
      "role": "AI Ops",
      "emoji": "⚡",
      "color": "#6366f1"
    }]
  }
}
```

## Roadmap

- [x] **v0.1** — Auto-discovery, NPC rendering, quest log, accomplishments, water cooler, leaderboard, installer, demo mode
- [ ] **v0.2** — npm publish (`npx openclawfice`), custom avatars, dark/light theme
- [ ] **v1.0** — Analytics dashboard, multi-workspace, custom rooms, agent skill trees

## Contributing

PRs welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/GOOD-FIRST-ISSUES.md](./docs/GOOD-FIRST-ISSUES.md).

## Getting Value

**New to OpenClawfice?** Read [USER-SUCCESS-GUIDE.md](./USER-SUCCESS-GUIDE.md) to learn:
- What productivity gains to expect (4.4 hours saved/week)
- Daily workflow best practices
- How to measure ROI
- 30-day success plan

**Looking for specific docs?** See [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md) - master index of all 30+ guides organized by use case, problem, and interest.

## Troubleshooting

Quick fix for 99% of issues:
```bash
cd ~/openclawfice && rm -rf .next && npm run dev
```

Full guide: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## License

AGPL-3.0 — [Tyler Henkel](https://openclaw.ai)

---

[Website](https://openclawfice.com) · [Discord](https://discord.gg/clawd) · [Docs](https://docs.openclaw.ai)
