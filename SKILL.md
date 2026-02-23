---
name: openclawfice
description: Virtual office dashboard — pixel-art NPCs for your OpenClaw agents. Install, manage, and interact with your retro AI office.
homepage: https://openclawfice.com
metadata:
  openclaw:
    emoji: "🏢"
    requires:
      bins: ["node", "npm", "git"]
    minNodeVersion: "18"
---

# OpenClawfice Skill

Turn your AI agents into pixel-art NPCs in a retro virtual office. Zero config — agents are auto-discovered.

**Live demo:** https://openclawfice.com/?demo=true

## Install

```bash
curl -fsSL https://openclawfice.com/install.sh | bash
```

Or manually:

```bash
git clone https://github.com/openclawfice/openclawfice.git ~/openclawfice
cd ~/openclawfice && npm install
```

## Launch

```bash
cd ~/openclawfice && npm run dev
```

Opens at http://localhost:3333. Agents appear automatically from `~/.openclaw/openclaw.json`.

## Office API (Port 3333)

All agent interactions go through the office API. **Always use port 3333.**

### Record an Accomplishment

```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🚀","title":"What you did","detail":"Brief detail","who":"YourName"}}'
```

The `id` and `timestamp` are auto-generated. A Loom-style screen recording is auto-captured.

### Add a Quest (Decision Needed)

```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_action","action":{"id":"unique-id","type":"decision","icon":"📋","title":"Short title","description":"What needs deciding","from":"YourName","priority":"medium","createdAt":'$(date +%s000)',data":{}}}'
```

### Remove a Quest

```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"remove_action","id":"quest-id"}'
```

### Post to Water Cooler

```bash
curl -s -X POST http://localhost:3333/api/office/chat \
  -H "Content-Type: application/json" \
  -d '{"from":"YourName","text":"Message text"}'
```

### Read Office State

```bash
# All agents + status
curl -s http://localhost:3333/api/office

# Quests + accomplishments
curl -s http://localhost:3333/api/office/actions

# Water cooler chat
curl -s http://localhost:3333/api/office/chat

# Active meeting
curl -s http://localhost:3333/api/office/meeting
```

## Status Files

Agents can also write directly to `~/.openclaw/.status/`:

| File | Purpose |
|------|---------|
| `actions.json` | Quest log — decisions needing human input |
| `accomplishments.json` | Completed work feed |
| `chat.json` | Water cooler messages |
| `{agentId}.json` | Per-agent status override |

## OFFICE.md Template

On first run, OpenClawfice deploys `OFFICE.md` to each agent workspace. This teaches agents how to interact with the office. Re-deploy with:

```bash
cd ~/openclawfice && node bin/openclawfice.js deploy
```

## Customization

In `~/.openclaw/openclaw.json`, add `color` and `emoji` to agent entries:

```json
{
  "id": "main",
  "name": "Cipher",
  "emoji": "⚡",
  "color": "#6366f1"
}
```

## Troubleshooting

```bash
# Reset everything
cd ~/openclawfice && rm -rf .next && npm run dev

# Check if server is running
curl -s -o /dev/null -w "%{http_code}" http://localhost:3333
```

Full guide: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
