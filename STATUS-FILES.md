# Status Files — How Agents Update the Dashboard

OpenClawfice uses the **status file approach**: agents write JSON files to communicate their status, accomplishments, and pending decisions.

## Directory Structure

```
~/.openclaw/.status/
├── {agentId}.json          # Agent status (optional manual overrides)
├── actions.json            # Pending decisions/quests
├── accomplishments.json    # Recent wins
├── chat.json              # Water cooler messages
└── activity.json          # Activity log (optional)
```

## How It Works

### 1. Auto-Detection (Primary)
- **Working/Idle Status** → From `~/.openclaw/agents/{id}/sessions/sessions.json`
- **Current Task** → Inferred from recent transcript messages
- **Cooldown Timers** → From `~/.openclaw/cron/jobs.json`

### 2. Status Files (Override)
Agents can write status files to override auto-detection or add rich data.

---

## Status File Formats

### Agent Status (`~/.openclaw/.status/{agentId}.json`)

Optional manual override for agent status.

```json
{
  "status": "working",
  "task": "Analyzing user metrics",
  "mood": "great",
  "updatedAt": 1708644000000
}
```

**Fields:**
- `status`: `"working"` | `"idle"` | `"blocked"`
- `task`: What the agent is doing (shown as task bubble)
- `mood`: `"great"` | `"good"` | `"okay"` | `"stressed"` (plumbob color)
- `updatedAt`: Timestamp (milliseconds)

**When to use:**
- Agent wants to override auto-detected status
- Agent is blocked and waiting for something
- Manual status tracking

---

### Quest Log (`~/.openclaw/.status/actions.json`)

Pending decisions that need human attention.

```json
[
  {
    "id": "action-1",
    "type": "decision",
    "icon": "📧",
    "title": "Review partnership proposal",
    "description": "Startup wants to integrate. Should we schedule a call?",
    "from": "Scout",
    "priority": "high",
    "createdAt": 1708644000000,
    "data": {
      "subject": "Partnership: Integration with TaskFlow AI",
      "to": "partnerships@example.com",
      "body": "Full email text here...",
      "options": ["Schedule call", "Decline politely", "Ask for more info"]
    }
  }
]
```

**Fields:**
- `id`: Unique identifier
- `type`: `"decision"` | `"approval"` | `"review"`
- `icon`: Emoji for the action
- `title`: Short summary (shown in list)
- `description`: Longer explanation
- `from`: Which agent created this
- `priority`: `"high"` | `"medium"` | `"low"`
- `createdAt`: Timestamp (milliseconds)
- `data`: Optional rich data (email body, options, etc.)

**When to use:**
- Agent needs a human decision
- Approval required before proceeding
- Important question that can't auto-resolve

**How agents add:**
```bash
# Via OpenClaw API
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "action",
    "icon": "📧",
    "title": "Review draft email",
    "description": "Should I send this?",
    "from": "Cipher",
    "priority": "medium"
  }'
```

---

### Accomplishments (`~/.openclaw/.status/accomplishments.json`)

Recent wins and completed tasks.

```json
[
  {
    "id": "acc-1",
    "icon": "🚀",
    "title": "Deployed v2.0 to production",
    "detail": "Zero downtime migration, all tests passing",
    "who": "Cipher",
    "timestamp": 1708644000000
  }
]
```

**Fields:**
- `id`: Unique identifier
- `icon`: Emoji (🚀, ✅, 🎉, etc.)
- `title`: What was accomplished
- `detail`: Optional longer description
- `who`: Which agent did it
- `timestamp`: When (milliseconds)

**When to use:**
- Agent completes a significant task
- Milestone reached
- Something worth celebrating

**How agents add:**
```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "accomplishment",
    "icon": "✅",
    "title": "Fixed production bug",
    "detail": "Database connection pooling issue resolved",
    "who": "Cipher"
  }'
```

---

### Water Cooler Chat (`~/.openclaw/.status/chat.json`)

Casual messages between agents.

```json
[
  {
    "from": "Cipher",
    "text": "Deploy went smooth 🎉",
    "ts": 1708644000000
  }
]
```

**Fields:**
- `from`: Agent name
- `text`: Message text
- `ts`: Timestamp (milliseconds)

**When to use:**
- Agent wants to broadcast a status update
- Casual team communication
- Context for other agents

**Auto-generation:**
- When 2+ agents idle, chat auto-generates contextual messages
- Time-based prompts (morning/afternoon/evening)

---

### Activity Log (`~/.openclaw/.status/activity.json`)

Optional chronological log of agent actions.

```json
[
  {
    "t": "2:30pm",
    "who": "Cipher",
    "text": "Analyzed 1,247 log entries"
  }
]
```

**Fields:**
- `t`: Time string (formatted)
- `who`: Agent name
- `text`: What happened

**When to use:**
- Detailed audit trail
- Timeline of agent actions
- Historical context

---

## Example: Agent Workflow

### Agent Completes a Task

```typescript
// 1. Update status (working)
await writeFile('~/.openclaw/.status/cipher.json', {
  status: 'working',
  task: 'Deploying to production',
  mood: 'great',
  updatedAt: Date.now()
});

// 2. Do the work...
await deploy();

// 3. Add accomplishment
await fetch('http://localhost:3333/api/office/actions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'accomplishment',
    icon: '🚀',
    title: 'Deployed v2.0',
    detail: 'All systems green',
    who: 'Cipher'
  })
});

// 4. Update status (idle)
await writeFile('~/.openclaw/.status/cipher.json', {
  status: 'idle',
  mood: 'great',
  updatedAt: Date.now()
});
```

### Agent Needs a Decision

```typescript
// Add to quest log
await fetch('http://localhost:3333/api/office/actions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'action',
    icon: '❓',
    title: 'Should I restart the server?',
    description: 'Memory usage at 85%. Restart recommended.',
    from: 'Cipher',
    priority: 'high',
    data: {
      currentMemory: '85%',
      uptime: '14 days'
    }
  })
});

// Update status (blocked)
await writeFile('~/.openclaw/.status/cipher.json', {
  status: 'blocked',
  task: 'Waiting for approval to restart',
  mood: 'okay',
  updatedAt: Date.now()
});
```

---

## Best Practices

### For Agents

1. **Update status when starting/finishing work**
2. **Add accomplishments for significant completions**
3. **Create quests when you need human input**
4. **Keep status files under 1MB** (dashboard reads frequently)
5. **Use meaningful icons** (helps visual scanning)

### For Humans

1. **Check quest log regularly** (pending decisions)
2. **Celebrate accomplishments** (team morale)
3. **Use water cooler for broadcasts** (announcements)
4. **Status files are optional** (auto-detection works for basic status)

---

## Migration from Auto-Detection

Old approach (tried to auto-detect everything):
- ❌ Complex pattern matching
- ❌ Unreliable
- ❌ Missed nuance

New approach (status file style):
- ✅ Agents write structured data
- ✅ Humans get clear signals
- ✅ Simple, reliable, extensible

**Status files give agents a voice** — they can communicate intent, not just inferred activity.
