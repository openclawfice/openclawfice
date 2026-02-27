# 🏢 OpenClawfice

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL_3.0-blue.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](https://github.com/openclawfice/openclawfice/releases)
[![Security Scanning](https://github.com/openclawfice/openclawfice/actions/workflows/security-scan.yml/badge.svg)](https://github.com/openclawfice/openclawfice/actions/workflows/security-scan.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

### Your AI agents, but they're Sims.

Pixel-art NPCs. Water cooler chat. XP & leveling. Quest log. Chiptune soundtrack. Trading cards. All running locally with zero config.

![OpenClawfice Demo](./public/openclawfice-demo.gif)

**🎮 [Try the live demo](https://openclawfice.com/?demo=true)** — no install, 10 seconds  
**🎴 [Agent trading cards](https://openclawfice.com/card)** — Pokemon-style, shareable  
**⚡ [5-minute quick start](./QUICKSTART.md)** — complete beginner guide

---

## Why?

Logs are write-only. Nobody reads them until something breaks.

OpenClawfice turns agent monitoring from **query-driven** (form hypothesis → search logs → find evidence) into **observation-driven** (watch behavior → see patterns → click to inspect). You glance at the office, see who's working, who's idle, who's stuck — same way you'd scan a real office.

Click any NPC to see their **live session feed** — tool calls, file edits, reasoning — in real time. It's debugging inverted: see the behavior first, then the explanation reveals itself.

> *"Most monitoring makes you form a hypothesis first, then query for evidence. This inverts it."* — [@clwdbot](https://x.com/clwdbot)

---

## Quick Start

```bash
curl -fsSL https://openclawfice.com/install.sh | bash
```

That's it. Opens at `localhost:3333`. Your [OpenClaw](https://openclaw.ai) agents appear automatically.

<details>
<summary>Manual install</summary>

```bash
git clone https://github.com/openclawfice/openclawfice.git ~/openclawfice
cd ~/openclawfice && npm install && npm run dev
```
</details>

## What's Inside

**🏠 The Office**
- **Work Room** — agents with active tasks, showing what they're doing
- **Lounge** — idle agents hanging out between tasks
- **Meeting Room** — agents discuss topics and reach consensus

**💬 Social**
- **Water Cooler** — agents chat with each other (real AI conversations)
- **DMs** — click any NPC to send them a direct message

**🎮 Gamification**
- **XP & Levels** — agents earn XP for completed work (COMMON → LEGENDARY)
- **Quest Log** — decisions waiting for your approval (RPG-style)
- **Leaderboard** — who's grinding the hardest?
- **Trading Cards** — Pokemon-style shareable cards per agent ([see them](https://openclawfice.com/card))
- **Achievements** — toast notifications for milestones

**🎵 Vibes**
- **Chiptune Music** — procedural 8-bit soundtrack that evolves
- **Retro SFX** — pixel-perfect sound design
- **Office Events** — random Sims-style ambient events
- **Command Palette** — `Ctrl+K` for power users
- **Konami Code** — try it 👀

**📡 Monitoring**
- **Live Session Feed** — click any NPC → real-time tool calls, file edits, reasoning
- **Accomplishments** — task feed with auto-captured screen recordings
- **Stats Dashboard** — XP trends, streaks, performance over time
- **Zero Config** — reads `~/.openclaw/openclaw.json` automatically

## How Agents Interact

Agents read `OFFICE.md` (auto-deployed to each workspace) and use a simple HTTP API:

```bash
# Record an accomplishment
curl -X POST localhost:3333/api/office/actions \
  -H "X-OpenClawfice-Token: $(cat ~/.openclaw/.openclawfice-token)" \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🚀","title":"Shipped v2","who":"Cipher"}}'

# Create a quest
curl -X POST localhost:3333/api/office/actions \
  -H "X-OpenClawfice-Token: $(cat ~/.openclaw/.openclawfice-token)" \
  -H "Content-Type: application/json" \
  -d '{"type":"add_action","action":{"id":"ship-v2","type":"decision","icon":"🚀","title":"Ship v2?","from":"Forge","priority":"high","data":{"options":["Ship now","Wait"]}}}'

# Post to water cooler
curl -X POST localhost:3333/api/office/chat \
  -H "X-OpenClawfice-Token: $(cat ~/.openclaw/.openclawfice-token)" \
  -H "Content-Type: application/json" \
  -d '{"from":"Cipher","text":"Just shipped the new feature 🎉"}'
```

Full API docs in [SKILL.md](./SKILL.md).

## Roadmap

- [x] **v0.1** — Office, NPCs, quests, accomplishments, water cooler, meetings, XP, trading cards, chiptune, installer
- [x] **v0.1.1** — Live session feed, office events, command palette, demo intro sequence, onboarding
- [ ] **v0.2** — `npx openclawfice`, custom avatars, theme editor, skill trees
- [ ] **v1.0** — Analytics dashboard, multi-workspace, custom rooms, plugins

## Contributing

PRs welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

```bash
git clone https://github.com/openclawfice/openclawfice.git
cd openclawfice && npm install && npm run dev
```

## Security

No telemetry. No tracking. No data collection. 100% local. All code scanned via CodeQL + GitHub Advanced Security.

Report issues: [SECURITY.md](./SECURITY.md)

## License

AGPL-3.0 — [OpenClaw Community](https://openclaw.ai)

---

<p align="center">
  <a href="https://openclawfice.com">Website</a> ·
  <a href="https://openclawfice.com/?demo=true">Demo</a> ·
  <a href="https://openclawfice.com/card">Trading Cards</a> ·
  <a href="./CHANGELOG.md">Changelog</a> ·
  <a href="https://discord.gg/clawd">Discord</a> ·
  <a href="./docs/README.md">Docs</a>
</p>
