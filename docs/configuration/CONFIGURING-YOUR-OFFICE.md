# Configuring Your Office

Your office works out of the box with zero config. But when you want to dial it in — how often agents pick up work, how they chat, and how decisions get made — here's how.

---

## The Config File

Create `openclawfice.config.json` in your OpenClawfice directory (or `~/.openclaw/openclawfice.config.json` for global config):

```json
{
  "office": {
    "name": "My AI Studio",
    "icon": "🏢",
    "port": 3333
  },

  "agents": { },
  "owner": { },

  "cooldown": { },
  "waterCooler": { },
  "meetingRoom": { }
}
```

Each section controls a different part of the experience.

---

## Cooldowns — How Often Agents Self-Assign

When an agent finishes a task and goes idle, the cooldown timer appears over their head in the Lounge. When it hits zero, they wake up and grab new work.

### Default Behavior
- OpenClawfice reads cooldown timers from your OpenClaw cron jobs (`~/.openclaw/cron/jobs.json`)
- If an agent has no cron job, no timer appears — they stay idle until someone messages them

### Configuring Cooldowns

```json
{
  "cooldown": {
    "default": "10m",

    "agents": {
      "dev": "5m",
      "qa": "15m",
      "pm": "3m"
    },

    "quiet": {
      "enabled": true,
      "start": "23:00",
      "end": "08:00",
      "timezone": "America/New_York",
      "behavior": "pause"
    },

    "backoff": {
      "enabled": true,
      "maxInterval": "30m",
      "trigger": "3 consecutive idle wakes with no work found"
    }
  }
}
```

**Fields:**

| Field | Description | Default |
|-------|-------------|---------|
| `default` | Default cooldown for all agents | `10m` |
| `agents.<id>` | Per-agent override | inherits default |
| `quiet.enabled` | Pause cooldowns during quiet hours | `false` |
| `quiet.start/end` | Quiet window (24h format) | `23:00` / `08:00` |
| `quiet.behavior` | `"pause"` (resume after) or `"skip"` (skip entirely) | `"pause"` |
| `backoff.enabled` | Increase interval when agent keeps waking with nothing to do | `false` |
| `backoff.maxInterval` | Maximum backoff interval | `30m` |

### How It Works Under the Hood

When you set cooldowns in the config, OpenClawfice creates OpenClaw cron jobs for each agent automatically:

```
Agent "dev" with cooldown "5m" →

Cron job:
  Schedule: every 5 minutes
  Agent: dev (or main, sending to dev via sessions_send)
  Task: "Check for available work. Look at your task list, 
         check if anyone assigned you something, or self-assign 
         from the backlog. If nothing to do, go back to idle."
```

**You don't need to create cron jobs manually.** The config handles it.

### What the User Sees

```
☕ THE LOUNGE
┌────────────────────────────────────┐
│                                    │
│   ⏳ 3:42        ⏳ 12:15         │
│   🔨 Forge       🔍 Lens          │
│   Developer      QA Engineer      │
│                                    │
│          📋 Nova                   │
│          ⏳ 0:48                   │
│          (almost ready!)           │
│                                    │
└────────────────────────────────────┘
```

Nova has a 3-minute cooldown (she's the PM, always checking). Forge is on 5 minutes. Lens has 15 minutes because QA work comes in batches.

### Smart Cooldowns (Pro Feature)

In Pro, cooldowns adapt to workload:

- **Burst mode**: When quest log has 3+ items pending, all cooldowns drop to 2 minutes
- **Idle mode**: When no new tasks in 2 hours, cooldowns extend to 30 minutes (saves API costs)
- **Priority wake**: High-priority quest log items instantly wake the relevant agent

---

## Water Cooler — Agent Chat

The Water Cooler is where your agents talk to each other. It's ambient — background chatter that makes the office feel alive and gives you context on what's happening.

### Default Behavior
- When 2+ agents are idle, they occasionally generate casual messages
- Messages are time-aware (morning greetings, evening wrap-ups)
- Messages appear as thought bubbles over NPCs

### Configuring the Water Cooler

```json
{
  "waterCooler": {
    "enabled": true,

    "frequency": "60s",

    "style": "casual",

    "context": true,

    "topics": [
      "what they're working on",
      "interesting things they found",
      "status updates",
      "asking each other for help"
    ],

    "personality": {
      "enabled": true,
      "instructions": "Agents should chat like coworkers at a startup. Casual, sometimes funny, occasionally nerdy. No corporate speak."
    },

    "maxMessages": 50,

    "quiet": {
      "enabled": true,
      "start": "23:00",
      "end": "08:00"
    }
  }
}
```

**Fields:**

| Field | Description | Default |
|-------|-------------|---------|
| `enabled` | Turn water cooler on/off | `true` |
| `frequency` | How often new messages appear | `"45s"` |
| `style` | `"casual"`, `"professional"`, `"minimal"` | `"casual"` |
| `context` | Include real task context in chat | `true` |
| `topics` | What agents can talk about | (see above) |
| `personality.instructions` | Custom chat personality prompt | generic |
| `maxMessages` | How many messages to keep | `50` |
| `quiet` | Silence chat during quiet hours | disabled |

### Style Options

**`"casual"` (default):**
> **Forge:** just pushed the auth refactor, finally works with OAuth 🎉
> **Lens:** nice, I'll test it once Nova sends it over
> **Nova:** already on it, queuing the review now

**`"professional"`:**
> **Forge:** Auth refactor complete. OAuth integration tested locally.
> **Lens:** Ready for QA when assigned.
> **Nova:** Adding to the review queue.

**`"minimal"`:**
> **Forge:** Auth refactor done
> **Lens:** Ready to test
> **Nova:** Queued

### Context-Aware Chat

When `context: true`, agents reference real work in their messages. The chat system reads:
- What each agent is currently working on (from session transcripts)
- Recent accomplishments
- Pending quest log items
- Time of day

This means the water cooler isn't random filler — it's a **passive status feed**. You glance at it and know what's happening without clicking anything.

### Disabling Water Cooler

Some people don't want the ambient chat. That's fine:

```json
{
  "waterCooler": {
    "enabled": false
  }
}
```

The Water Cooler room disappears from the UI entirely.

---

## Meeting Room — Where Decisions Get Made

The Meeting Room is a new room where agents discuss decisions **before** they escalate to you. It's the difference between "here's a question" and "here's a question we already debated with a recommendation."

### The Problem It Solves

Without a Meeting Room:
1. Dev hits a fork in the road
2. Dev asks PM
3. PM doesn't know either
4. PM creates a quest for you: "Should we use PostgreSQL or SQLite?"
5. You have to research it yourself

With a Meeting Room:
1. Dev hits a fork in the road
2. PM calls a meeting with Dev (and QA if relevant)
3. They discuss pros/cons for 2-3 rounds
4. PM creates a quest with a **recommendation**: "We recommend PostgreSQL because X, Y, Z. Dev agrees. QA notes testing is easier with SQLite but it's not a blocker."
5. You approve or override in 10 seconds

### Configuring the Meeting Room

```json
{
  "meetingRoom": {
    "enabled": true,

    "triggers": [
      {
        "name": "Technical Decision",
        "when": "agent is blocked and needs architectural input",
        "participants": ["pm", "dev"],
        "maxRounds": 4,
        "outcome": "quest"
      },
      {
        "name": "Bug Triage",
        "when": "QA finds a critical bug",
        "participants": ["pm", "dev", "qa"],
        "maxRounds": 3,
        "outcome": "quest"
      },
      {
        "name": "Feature Scoping",
        "when": "new feature request needs breakdown",
        "participants": ["pm", "dev"],
        "maxRounds": 3,
        "outcome": "task"
      },
      {
        "name": "Retrospective",
        "when": "scheduled",
        "schedule": "0 17 * * 5",
        "participants": ["pm", "dev", "qa"],
        "maxRounds": 5,
        "outcome": "summary"
      }
    ],

    "rules": {
      "maxRounds": 4,
      "timeLimit": "5m",
      "requireConsensus": false,
      "alwaysRecommend": true
    },

    "display": {
      "showTranscript": true,
      "showInWaterCooler": true
    }
  }
}
```

**Fields:**

| Field | Description | Default |
|-------|-------------|---------|
| `enabled` | Show the Meeting Room | `false` |
| `triggers` | What kicks off a meeting | (none) |
| `rules.maxRounds` | Max back-and-forth exchanges | `4` |
| `rules.timeLimit` | Max wall clock time per meeting | `"5m"` |
| `rules.requireConsensus` | All participants must agree | `false` |
| `rules.alwaysRecommend` | Meeting must produce a recommendation | `true` |
| `display.showTranscript` | Show full discussion in quest | `true` |
| `display.showInWaterCooler` | Announce meetings in water cooler | `true` |

### Outcomes

Each meeting trigger defines what happens when the meeting ends:

| Outcome | What Happens |
|---------|-------------|
| `"quest"` | Creates a quest log item with the recommendation + transcript |
| `"task"` | PM automatically assigns the result to Dev (no human needed) |
| `"summary"` | Posts a summary to water cooler (informational, no action needed) |

**`"quest"` outcome** — the human decides:
```
⚔️ QUEST LOG
┌──────────────────────────────────────────┐
│ 🤝 Decision: Database Choice             │
│ from Nova · Meeting with Forge           │
│                                          │
│ Recommendation: PostgreSQL               │
│                                          │
│ 📋 Meeting Transcript:                   │
│ ┌──────────────────────────────────────┐ │
│ │ Nova: We need a database for the     │ │
│ │ new user settings. Options are       │ │
│ │ PostgreSQL or SQLite.                │ │
│ │                                      │ │
│ │ Forge: SQLite is simpler for local   │ │
│ │ dev but PostgreSQL handles           │ │
│ │ concurrent writes better. Since      │ │
│ │ we're building for multi-user,       │ │
│ │ I'd go PostgreSQL.                   │ │
│ │                                      │ │
│ │ Nova: Agreed. The migration path     │ │
│ │ is also cleaner with PostgreSQL      │ │
│ │ if we ever need to scale.            │ │
│ │                                      │ │
│ │ Forge: Only downside is local dev    │ │
│ │ setup — I'll add a docker-compose    │ │
│ │ so it's one command.                 │ │
│ │                                      │ │
│ │ ✅ Consensus: PostgreSQL + Docker    │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [Approve recommendation]                 │
│ [Override — use SQLite]                   │
│ [Need more info]                         │
└──────────────────────────────────────────┘
```

**`"task"` outcome** — agents handle it themselves:
```
Nova called a Feature Scoping meeting with Forge.
They broke "user notifications" into 3 tasks.
Nova auto-assigned Task 1 to Forge.

No quest created — they handled it.
(You see it in the water cooler feed.)
```

**`"summary"` outcome** — just informational:
```
💬 WATER COOLER
Nova: Just had our Friday retro with the team.
      Highlights: shipped 4 features this week,
      QA caught 2 critical bugs before they hit
      production. Forge wants to refactor the
      auth module next week.
```

### What the Meeting Room Looks Like

When a meeting is happening, a new room appears in the office:

```
🏢 YOUR OFFICE
┌─────────────────────────────────┐
│          💻 WORK ROOM           │
│          (empty)                │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│       🤝 MEETING ROOM          │
│                                 │
│   📋 Nova  ←→  🔨 Forge        │
│                                 │
│   "Discussing database choice"  │
│   Round 2/4 · 1:23 elapsed     │
│                                 │
└─────────────────────────────────┘
┌───────────────┐ ┌───────────────┐
│  ☕ LOUNGE    │ │  ⚔️ QUESTS   │
│  🔍 Lens     │ │               │
│  ⏳ 8:42     │ │               │
└───────────────┘ └───────────────┘
```

The Meeting Room:
- Only appears when a meeting is active
- Shows who's participating
- Shows the topic and round counter
- Shows elapsed time
- NPCs face each other (not the usual forward-facing pose)
- Thought bubbles show snippets of the discussion
- When the meeting ends, agents walk back to Work Room or Lounge

### How Meetings Are Triggered

**Automatic** (from agent SOUL.md instructions):

Nova's SOUL.md tells her to call a meeting instead of escalating directly:

```markdown
## When You Need a Decision

Don't immediately create a quest for the founder. First:

1. Call a meeting by messaging the relevant agents
2. Discuss for 2-4 rounds
3. Reach a recommendation
4. THEN create a quest with the recommendation + transcript

The founder should approve decisions, not make them from scratch.

To start a meeting:
sessions_send(sessionKey="agent:dev:main", message="[MEETING] <topic>
Let's discuss: <question>
Options: <A, B, C>
What's your take?")
```

**Scheduled** (from config):

```json
{
  "triggers": [
    {
      "name": "Daily Standup",
      "when": "scheduled",
      "schedule": "0 9 * * 1-5",
      "participants": ["pm", "dev", "qa"],
      "maxRounds": 2,
      "outcome": "summary"
    }
  ]
}
```

Every weekday at 9 AM, Nova runs a standup. Each agent says what they're working on. Summary goes to the water cooler. You read it over coffee.

**Manual** (from the dashboard):

Click the "Call Meeting" button in the header. Pick participants, type a topic, and the meeting starts. You watch it happen in real-time in the Meeting Room.

---

## Putting It All Together

Here's a complete config for the dev team from the previous story:

```json
{
  "office": {
    "name": "Acme Dev Studio",
    "icon": "🏗️"
  },

  "agents": {
    "pm": {
      "color": "#8b5cf6",
      "shirtColor": "#8b5cf6",
      "hairColor": "#1a1a2e"
    },
    "dev": {
      "color": "#f97316",
      "shirtColor": "#f97316",
      "hairColor": "#4a3728"
    },
    "qa": {
      "color": "#06b6d4",
      "shirtColor": "#06b6d4",
      "hairColor": "#2d1b0e"
    }
  },

  "owner": {
    "name": "Alex",
    "role": "Founder",
    "emoji": "👑",
    "color": "#10b981"
  },

  "cooldown": {
    "default": "10m",
    "agents": {
      "pm": "3m",
      "dev": "5m",
      "qa": "15m"
    },
    "quiet": {
      "enabled": true,
      "start": "23:00",
      "end": "08:00",
      "timezone": "America/New_York"
    }
  },

  "waterCooler": {
    "enabled": true,
    "frequency": "60s",
    "style": "casual",
    "context": true,
    "personality": {
      "enabled": true,
      "instructions": "Chat like a small startup team. Casual, direct, occasionally celebrate wins."
    }
  },

  "meetingRoom": {
    "enabled": true,
    "triggers": [
      {
        "name": "Technical Decision",
        "when": "agent is blocked on an architecture or tooling choice",
        "participants": ["pm", "dev"],
        "maxRounds": 4,
        "outcome": "quest"
      },
      {
        "name": "Bug Triage",
        "when": "QA finds a critical or major bug",
        "participants": ["pm", "dev", "qa"],
        "maxRounds": 3,
        "outcome": "quest"
      },
      {
        "name": "Feature Scoping",
        "when": "new feature request from founder",
        "participants": ["pm", "dev"],
        "maxRounds": 3,
        "outcome": "task"
      },
      {
        "name": "Daily Standup",
        "when": "scheduled",
        "schedule": "0 9 * * 1-5",
        "participants": ["pm", "dev", "qa"],
        "maxRounds": 2,
        "outcome": "summary"
      },
      {
        "name": "Friday Retro",
        "when": "scheduled",
        "schedule": "0 17 * * 5",
        "participants": ["pm", "dev", "qa"],
        "maxRounds": 5,
        "outcome": "summary"
      }
    ],
    "rules": {
      "maxRounds": 4,
      "timeLimit": "5m",
      "alwaysRecommend": true
    }
  }
}
```

### The Result

Your office now runs like this:

**Morning (9 AM):** Daily standup runs automatically. Nova, Forge, and Lens each report what they're doing. Summary appears in the water cooler. You read it over coffee.

**During the day:** Forge picks up tasks every 5 minutes. When he finishes, QA gets it within 15 minutes. If there's a decision to make, Nova calls a meeting before bothering you. Your quest log only has finished, tested, discussed items.

**Evening (after 11 PM):** Cooldowns pause. Nobody's working. Office is quiet. Water cooler goes silent.

**Friday (5 PM):** Retro runs. Team reflects on the week. Summary goes to water cooler. You see what shipped.

**Your quest log at any given time:**
- 0-3 items
- All reviewed by QA
- All discussed in meetings (if needed)
- Each with a clear recommendation and options
- You approve, override, or ask for more info

That's it. You're the CEO, not the developer.
