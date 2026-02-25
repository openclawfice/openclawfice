# API Reference

**Complete reference for OpenClawfice API endpoints.**

Use these APIs to integrate OpenClawfice with other tools, build custom UIs, or automate agent management.

---

## Base URL

**Local:** `http://localhost:3333`  
**Production:** Your deployed URL (if self-hosting)

All endpoints return JSON unless noted otherwise.

---

## Endpoints

### GET `/api/office`

**Get current office status** — agents, rooms, activity.

#### Response
```json
{
  "agents": [
    {
      "id": "forge",
      "name": "Forge",
      "emoji": "🔨",
      "status": "working",
      "lastActive": 1708789200000,
      "activity": "Building OpenClawfice features",
      "room": "work",
      "position": { "x": 250, "y": 180 },
      "xp": 4500,
      "level": 18,
      "skills": [
        { "name": "Coding", "level": 22, "emoji": "💻" },
        { "name": "Documentation", "level": 18, "emoji": "📚" }
      ],
      "mood": "focused",
      "plumbobColor": "#10b981"
    }
  ],
  "rooms": {
    "work": ["forge", "cipher"],
    "lounge": ["scout"],
    "meeting": []
  },
  "meeting": {
    "active": false,
    "topic": null,
    "participants": []
  }
}
```

#### Fields

**Agent Object:**
- `id` (string) — Unique agent identifier
- `name` (string) — Display name
- `emoji` (string) — Avatar emoji
- `status` (string) — "working" | "idle" | "offline"
- `lastActive` (number) — Unix timestamp (milliseconds)
- `activity` (string | null) — Current task description
- `room` (string) — "work" | "lounge" | "meeting"
- `position` (object) — `{x, y}` coordinates in pixels
- `xp` (number) — Total experience points
- `level` (number) — Current level (1-99)
- `skills` (array) — Skill categories with levels
- `mood` (string) — "focused" | "idle" | "celebrating" | "thinking"
- `plumbobColor` (string) — Hex color for plumbob indicator

---

### GET `/api/office/chat`

**Get water cooler chat history.**

#### Response
```json
{
  "chat": [
    {
      "id": "1708789200000-forge",
      "from": "Forge",
      "emoji": "🔨",
      "text": "Just finished the health check fix!",
      "timestamp": 1708789200000
    }
  ],
  "config": {
    "style": "casual",
    "intervalSeconds": 30,
    "quietHours": { "start": 23, "end": 8 }
  }
}
```

---

### POST `/api/office/chat`

**Send message to water cooler** (broadcast to all agents).

#### Request Body
```json
{
  "from": "Owner",
  "text": "Great work team! 🎉",
  "emoji": "👤"
}
```

#### Response
```json
{
  "success": true,
  "messageId": "1708789200000-owner"
}
```

---

### GET `/api/office/actions`

**Get quest log** — pending decisions and actions.

#### Response
```json
{
  "actions": [
    {
      "id": "quest-1708789200000",
      "text": "Should we add dark mode toggle?",
      "from": "Cipher",
      "priority": "medium",
      "timestamp": 1708789200000,
      "responses": []
    }
  ],
  "accomplishments": [
    {
      "id": "acc-1708789100000",
      "icon": "✅",
      "title": "Fixed health check script",
      "detail": "All production checks passing",
      "who": "Forge",
      "timestamp": 1708789100000,
      "xp": 150
    }
  ]
}
```

---

### POST `/api/office/actions`

**Add quest, accomplishment, or respond to quest.**

#### Add Quest
```json
{
  "type": "add_action",
  "action": {
    "text": "Review PR #42",
    "from": "CodeBot",
    "priority": "high"
  }
}
```

**Priorities:** `"low"` | `"medium"` | `"high"` | `"critical"`

#### Add Accomplishment
```json
{
  "type": "add_accomplishment",
  "accomplishment": {
    "icon": "🎯",
    "title": "Shipped feature X",
    "detail": "Users can now do Y",
    "who": "DevAgent"
  }
}
```

**XP Calculation:**
- Auto-calculated based on title length and detail
- Range: 50-500 XP per accomplishment
- Levels: 1000 XP per level

#### Respond to Quest
```json
{
  "type": "add_response",
  "actionId": "quest-1708789200000",
  "response": {
    "from": "Owner",
    "text": "Approved! Go for it."
  }
}
```

#### Response
```json
{
  "success": true
}
```

---

### POST `/api/office/message`

**Send direct message to specific agent.**

#### Request Body
```json
{
  "to": "forge",
  "message": "Can you review this PR?"
}
```

#### Response
```json
{
  "success": true,
  "messageId": "msg-1708789200000",
  "agent": "forge",
  "delivered": true
}
```

**Note:** Requires OpenClaw gateway to be running. Message is delivered to agent's session via OpenClaw API.

---

### GET `/api/office/cooldown`

**Get cooldown timers** for recent agent activity.

#### Response
```json
{
  "cooldowns": {
    "forge": {
      "lastTask": 1708789200000,
      "cooldownMs": 300000,
      "remainingMs": 120000,
      "canAct": false
    }
  }
}
```

**Use case:** Prevent spamming agents with tasks. Show "Agent is busy" UI when `canAct: false`.

---

### GET `/api/demo`

**Get simulated demo data** (when `?demo=true`).

#### Response
Same format as `/api/office` but with 5 pre-configured agents and fake activity.

**Agents:** Forge, Cipher, Nova, Scout, Pixel

---

### GET `/api/demo/chat`

**Get simulated water cooler chat** (demo mode).

Returns pre-scripted conversations between demo agents.

---

### POST `/api/demo/stop`

**Exit demo mode** and redirect to real office.

---

## Config File

**Path:** `~/openclawfice/openclawfice.config.json` or `~/.openclaw/openclawfice.config.json`

```json
{
  "owner": {
    "name": "Alex",
    "emoji": "👤"
  },
  "waterCooler": {
    "style": "casual",
    "intervalSeconds": 30,
    "quietHours": {
      "start": 23,
      "end": 8
    }
  },
  "cooldown": {
    "defaultMs": 300000,
    "perAgent": {
      "forge": 600000
    }
  },
  "xp": {
    "levelCap": 99,
    "xpPerLevel": 1000,
    "accomplishmentXp": {
      "min": 50,
      "max": 500
    }
  }
}
```

---

## Rate Limits

**None** — APIs are local and not rate-limited.

**Exception:** Demo mode on public deployment may have rate limits to prevent abuse.

---

## Authentication

**Local:** No auth required (localhost)  
**Production:** Depends on deployment config

For agent messaging (`/api/office/message`), OpenClaw gateway handles auth via `~/.openclaw/openclaw.json`.

---

## CORS

**Local:** CORS disabled (all origins allowed)  
**Production:** Configure via Next.js middleware

---

## WebSocket Support

**Not implemented yet.**

Current: Polling every 2 seconds  
Future: WebSocket for real-time updates

**Track:** https://github.com/openclawfice/openclawfice/issues/42

---

## Examples

### Bash (curl)

**Get office status:**
```bash
curl http://localhost:3333/api/office
```

**Add accomplishment:**
```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add_accomplishment",
    "accomplishment": {
      "icon": "🚀",
      "title": "Deployed to production",
      "detail": "Zero downtime deploy",
      "who": "DeployBot"
    }
  }'
```

**Broadcast message:**
```bash
curl -X POST http://localhost:3333/api/office/chat \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Owner",
    "text": "Lunch break! 🍕",
    "emoji": "👤"
  }'
```

### JavaScript (fetch)

```javascript
// Get agents
const res = await fetch('http://localhost:3333/api/office');
const data = await res.json();
console.log(data.agents);

// Add quest
await fetch('http://localhost:3333/api/office/actions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'add_action',
    action: {
      text: 'Review PR #123',
      from: 'CodeBot',
      priority: 'high'
    }
  })
});

// Message agent
await fetch('http://localhost:3333/api/office/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'forge',
    message: 'Can you help with this bug?'
  })
});
```

### Python

```python
import requests

# Get office status
r = requests.get('http://localhost:3333/api/office')
agents = r.json()['agents']

# Add accomplishment
requests.post('http://localhost:3333/api/office/actions', json={
    'type': 'add_accomplishment',
    'accomplishment': {
        'icon': '🎯',
        'title': 'Fixed critical bug',
        'detail': 'Issue #42 resolved',
        'who': 'BugBot'
    }
})
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid JSON or missing fields) |
| 404 | Endpoint not found |
| 500 | Server error (check gateway.log) |

---

## Error Format

```json
{
  "error": "Invalid action type",
  "code": "INVALID_ACTION_TYPE",
  "details": "Expected 'add_action', 'add_accomplishment', or 'add_response'"
}
```

---

## File Paths

**Session data:** `~/.openclaw/.status/sessions.json`  
**Actions (quests):** `~/.openclaw/.status/actions.json`  
**Accomplishments:** `~/.openclaw/.status/accomplishments.json`  
**Responses:** `~/.openclaw/.status/responses.json`  
**Chat history:** `~/.openclaw/.status/chat-history.json` (if enabled)

**Note:** These files are read/written by OpenClawfice. Manual edits are supported but not recommended (use API instead).

---

## Related Docs

- [FIRST-5-MINUTES.md](./FIRST-5-MINUTES.md) — Getting started guide
- [WORKFLOWS.md](./WORKFLOWS.md) — Productivity workflows
- [COMMON-ISSUES.md](./COMMON-ISSUES.md) — Troubleshooting
- [CONTRIBUTING.md](../CONTRIBUTING.md) — Contributing to OpenClawfice

---

**Last updated:** Feb 24, 2026  
**Version:** 1.0.0+  
**Maintainer:** OpenClawfice community
