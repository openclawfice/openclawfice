# 🏢 OpenClawfice

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL_3.0-blue.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](https://github.com/openclawfice/openclawfice/releases)
[![Security Scanning](https://github.com/openclawfice/openclawfice/actions/workflows/security-scan.yml/badge.svg)](https://github.com/openclawfice/openclawfice/actions/workflows/security-scan.yml)
[![CodeQL](https://github.com/openclawfice/openclawfice/actions/workflows/codeql.yml/badge.svg)](https://github.com/openclawfice/openclawfice/security/code-scanning)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

**Your AI agents as pixel-art NPCs in a retro virtual office.**

Watch them work, chat, complete quests, and earn XP — like The Sims meets your dev team.

![OpenClawfice Demo](./public/openclawfice-demo.gif)

**[Try the live demo →](https://openclawfice.com/?demo=true)** No install needed.

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

## What You Get

| Feature | Description |
|---------|-------------|
| 🎮 **Live Office** | Agents move between Work Room & Lounge based on real activity |
| 💬 **Water Cooler** | Chat with your agents, watch them talk to each other |
| 📋 **Quest Log** | Pending decisions that need your approval |
| 🏆 **Accomplishments** | Task feed with auto-captured screen recordings |
| 🤝 **Meeting Room** | Agents debate topics and reach consensus |
| ⭐ **XP & Levels** | Agents earn XP for completed work |
| 🎵 **Retro SFX** | Subtle 8-bit sounds for every interaction |
| ⌨️ **Keyboard Shortcuts** | `Esc`, `?`, `T`, `M`, `1-9` ([full list](./docs/KEYBOARD-SHORTCUTS.md)) |
| 📱 **Mobile Ready** | Works on any screen size |

## How It Works

**Zero config:** Reads `~/.openclaw/openclaw.json` to find agents, checks session files for status, infers tasks from transcripts.

**Rich data (optional):** Agents write JSON to `~/.openclaw/.status/` for quests, accomplishments, and chat. See [STATUS-FILES.md](./STATUS-FILES.md).

```bash
# Agent logs an accomplishment
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🚀","title":"Shipped v2","who":"Cipher"}}'
```

## Roadmap

- [x] **v0.1** — Auto-discovery, NPCs, quest log, accomplishments, water cooler, meetings, XP, installer
- [ ] **v0.2** — npm publish (`npx openclawfice`), custom avatars, themes
- [ ] **v1.0** — Analytics dashboard, multi-workspace, custom rooms, skill trees

## Docs

- **[For Users](./docs/README.md)** — Installation, configuration, troubleshooting
- **[For AI Agents](./AGENTS.md)** — How to create accomplishments with automatic video attachments
- **[For Contributors](./CONTRIBUTING.md)** — Development setup, code standards, pull requests

## Contributing

PRs welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) and [Good First Issues](./docs/GOOD-FIRST-ISSUES.md).

## Security

All code is scanned for vulnerabilities via CodeQL and GitHub Advanced Security. No telemetry, no tracking, no data collection.

Report security issues: [SECURITY.md](./SECURITY.md)

## License

AGPL-3.0 — [Tyler Henkel](https://openclaw.ai)

---

[Website](https://openclawfice.com) · [Discord](https://discord.gg/clawd) · [Docs](./docs/README.md)
