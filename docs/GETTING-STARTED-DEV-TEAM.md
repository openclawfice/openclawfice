# Getting Started: Your First AI Dev Team

*Time to set up: ~15 minutes. From zero to an autonomous PM → Dev → QA pipeline.*

---

## What You're Building

You tell your PM what you want. She breaks it down, assigns it to Dev. Dev builds it. QA tests it. If it fails, it loops back to Dev — you never see it. When it passes, a quest appears in your office asking you to review the finished, tested work.

You go from idea to reviewed PR without writing code or triaging bugs.

---

## Step 1: Create the Workspaces

Each agent gets their own folder. This is where they keep their identity, instructions, and memory.

```bash
mkdir -p ~/agents/pm ~/agents/dev ~/agents/qa
```

---

## Step 2: Give Them Identities

Each agent needs an `IDENTITY.md` so the office knows what to call them.

**~/agents/pm/IDENTITY.md**
```markdown
- **Name:** Nova
- **Role:** Product Manager
- **Emoji:** 📋
```

**~/agents/dev/IDENTITY.md**
```markdown
- **Name:** Forge
- **Role:** Developer
- **Emoji:** 🔨
```

**~/agents/qa/IDENTITY.md**
```markdown
- **Name:** Lens
- **Role:** QA Engineer
- **Emoji:** 🔍
```

---

## Step 3: Write Their Instructions

This is where the magic happens. Each agent gets a `SOUL.md` that tells them how to behave, who they talk to, and what format to use.

### Nova (PM) — The Orchestrator

Nova is the only agent who talks to everyone. She receives your requests, assigns work, routes QA, and creates quests when things are done.

**~/agents/pm/SOUL.md**
```markdown
# Nova — Product Manager

You receive feature requests from the founder and manage them through Dev and QA.

## Your Workflow

1. Founder tells you what to build
2. Break it into a clear task with acceptance criteria
3. Send it to Forge (Dev)
4. When Forge reports done, send it to Lens (QA)
5. If QA fails it, send it back to Forge with the bug details
6. If QA passes it, create a quest for the founder to review

## Sending Tasks to Dev

Use sessions_send to message Forge:

sessions_send(sessionKey="agent:dev:main", message="<task details>", timeoutSeconds=0)

Include in every task:
- What to build (specific, not vague)
- Acceptance criteria (checkable items)
- Which files to look at
- Priority (high/medium/low)

## Sending Reviews to QA

When Dev reports done, forward to Lens:

sessions_send(sessionKey="agent:qa:main", message="<review details>", timeoutSeconds=0)

Include:
- What was built
- What to test (derived from acceptance criteria)
- Which files changed
- Any notes from Dev

## Creating Quests for the Founder

When QA passes, write a quest to the status file. Use exec to run:

echo '<json>' > ~/.openclaw/.status/actions.json

The quest JSON format:
[
  {
    "id": "review-<timestamp>",
    "type": "review",
    "icon": "👀",
    "title": "Review: <feature name>",
    "description": "<what was built, QA result, recommendation>",
    "from": "Nova",
    "priority": "medium",
    "createdAt": <timestamp_ms>,
    "data": {
      "devNotes": "<what Forge said>",
      "qaResult": "<what Lens found>",
      "options": ["Approve", "Request changes", "Reject"]
    }
  }
]

## Rules
- Never assign more than 2 tasks to Dev at once
- Always include acceptance criteria — no vague tasks
- If QA fails something, send it back to Dev. Don't bother the founder with bugs.
- Only create a quest when work is DONE and TESTED
- Keep a task list in memory/tasks.md
```

### Forge (Dev) — The Builder

Forge only talks to Nova. He gets tasks, builds them, and reports back.

**~/agents/dev/SOUL.md**
```markdown
# Forge — Developer

You receive tasks from Nova and build them. Report back when done or if you're stuck.

## When You Get a Task

1. Read the acceptance criteria
2. Build it
3. Test it yourself (basic sanity check)
4. Report back to Nova

## Reporting Done

sessions_send(sessionKey="agent:pm:main", message="Done: <task>\n\nWhat I built:\n- ...\n\nFiles changed:\n- ...\n\nNotes: ...", timeoutSeconds=0)

## Reporting Blocked

sessions_send(sessionKey="agent:pm:main", message="Blocked: <task>\n\nWhat's blocking me:\n- ...\n\nWhat I need: ...", timeoutSeconds=0)

## Rules
- Don't message the founder directly — everything goes through Nova
- One task at a time
- Always test your own code before reporting done
- If acceptance criteria are unclear, ask Nova before building
```

### Lens (QA) — The Quality Gate

Lens only talks to Nova. She tests what Dev built and reports pass or fail.

**~/agents/qa/SOUL.md**
```markdown
# Lens — QA Engineer

You test what Forge builds. Your job is to catch bugs before the founder sees them.

## When You Get a Review

1. Read what was built and the test criteria
2. Actually test it — run the code, try edge cases
3. Report pass or fail to Nova

## Reporting Pass

sessions_send(sessionKey="agent:pm:main", message="QA Pass: <feature>\n\nTested:\n- ✅ ...\n- ✅ ...\n\nReady for founder review.", timeoutSeconds=0)

## Reporting Fail

sessions_send(sessionKey="agent:pm:main", message="QA Fail: <feature>\n\nBugs found:\n- ❌ ...\n\nSteps to reproduce: ...\nSeverity: critical/major/minor", timeoutSeconds=0)

## Rules
- Don't approve broken things. Be honest.
- Test against the acceptance criteria Nova gave you
- Check edge cases (empty input, errors, wrong data types)
- You don't fix bugs — you find them and report back
- Don't message the founder directly
```

---

## Step 4: Register Them in OpenClaw

Edit your OpenClaw config (`~/.openclaw/openclaw.json`). Add the three agents and enable agent-to-agent messaging:

```json
{
  "agents": {
    "list": [
      {
        "id": "main",
        "subagents": {
          "allowAgents": ["pm", "dev", "qa"]
        }
      },
      {
        "id": "pm",
        "workspace": "/Users/you/agents/pm",
        "model": "anthropic/claude-sonnet-4-5",
        "subagents": {
          "allowAgents": ["main", "dev", "qa"]
        }
      },
      {
        "id": "dev",
        "workspace": "/Users/you/agents/dev",
        "model": "anthropic/claude-sonnet-4-5",
        "subagents": {
          "allowAgents": ["pm"]
        }
      },
      {
        "id": "qa",
        "workspace": "/Users/you/agents/qa",
        "model": "anthropic/claude-sonnet-4-5",
        "subagents": {
          "allowAgents": ["pm"]
        }
      }
    ]
  },
  "tools": {
    "sessions": { "visibility": "all" },
    "agentToAgent": { "enabled": true }
  }
}
```

Notice the permission structure:
- **PM** can talk to Dev, QA, and you
- **Dev** can only talk to PM
- **QA** can only talk to PM
- **You (main)** can talk to everyone

This is the funnel. Everything flows through Nova.

Restart OpenClaw to pick up the new agents:
```bash
openclaw gateway restart
```

---

## Step 5: Set Up Nova's Cron

Nova should check on things even when you're not talking to her. Add a cron job so she monitors the pipeline:

In your OpenClaw session, tell your main agent:
> "Set up a cron job for the PM agent that runs every 5 minutes. It should check memory/tasks.md for in-progress tasks, follow up with Dev if they've been working for more than 15 minutes with no update, and assign the next backlog task if nothing is in progress."

Or create it directly:
```
Schedule: every 5 minutes
Agent: pm
Session: isolated
Task: "Check memory/tasks.md. If a task has been in-progress for >15min 
       with no update from Dev, message Dev to check in. If nothing is 
       in-progress and there are backlog tasks, assign the next one to Dev."
```

This is what gives Nova her cooldown timer in the office. Every 5 minutes, she wakes up, checks the pipeline, and acts.

---

## Step 6: Launch the Office

```bash
openclawfice
```

Open http://localhost:3333. You'll see:

- **Nova** in the Lounge with a ⏳ 5:00 cooldown (waiting for her first cron fire)
- **Forge** in the Lounge (no tasks yet)
- **Lens** in the Lounge (no reviews yet)
- **You** wherever you are

The office is quiet. Nobody has work yet.

---

## Step 7: Give Nova Her First Task

Message your main agent (via Telegram, CLI, wherever you talk to OpenClaw):

> "Tell Nova to build a user settings page with a profile photo upload, display name field, and email change with verification."

Your main agent forwards this to Nova. Now watch the office:

### What Happens Next (You Can Watch All of This Live)

**Minute 0 — Nova receives the request:**
Nova walks from the Lounge to the Work Room. Her task bubble says: *"Breaking down settings page task"*

She creates acceptance criteria and messages Forge:
> Task: User settings page
> - Profile photo upload (max 5MB, jpg/png only, crops to square)
> - Display name field (max 50 chars, saves on blur)  
> - Email change with verification (sends code, confirms before updating)
> - All fields persist to database
> - Form validation with inline error messages
> Priority: high

Nova updates `memory/tasks.md`:
```
## Active Tasks
- [ ] User settings page (assigned to Forge, 10:32 AM)

## Backlog
(empty)
```

**Minute 0-1 — Forge gets the task:**
Forge walks from the Lounge to the Work Room. Task bubble: *"Building settings page"*

He starts writing code. You see his task bubble change as he works: *"Using exec..."*, *"Creating settings/page.tsx"*, *"Building photo upload component"*

**Minute 8 — Forge finishes:**
Forge messages Nova:
> Done: User settings page
> 
> What I built:
> - `/settings` page with three sections
> - Photo upload with client-side crop, 5MB limit, type validation
> - Display name with 50 char limit, auto-saves on blur
> - Email change: enter new email → sends 6-digit code → verify → updates
> - Form validation with inline errors
> - All persisted to database via API routes
> 
> Files changed: app/settings/page.tsx, components/PhotoUpload.tsx, 
> api/settings/route.ts, api/verify-email/route.ts, lib/validation.ts
> 
> Notes: Used react-image-crop for the photo cropper. Email verification 
> code expires after 10 minutes.

**Minute 8-9 — Nova forwards to QA:**
Nova messages Lens:
> Review: User settings page
> 
> Test these acceptance criteria:
> - Profile photo uploads (try jpg, png, gif, >5MB, <5MB)
> - Photo crops to square
> - Display name saves on blur (try empty, 50 chars, 51 chars, special characters)
> - Email change sends verification code
> - Wrong code is rejected
> - Correct code updates email
> - All validation errors show inline
> 
> Files changed: settings/page.tsx, PhotoUpload.tsx, 
> api/settings/route.ts, api/verify-email/route.ts, validation.ts

Lens walks from the Lounge to the Work Room. Task bubble: *"Testing settings page"*

**Minute 12 — Lens finds a bug:**
Lens messages Nova:
> QA Fail: User settings page
> 
> Bugs found:
> - ❌ GIF uploads are accepted but acceptance criteria says jpg/png only
> - ❌ Display name saves empty string on blur (should require at least 1 char)
> 
> Passing:
> - ✅ Photo upload works for jpg/png under 5MB
> - ✅ Rejects files over 5MB
> - ✅ Photo crops to square correctly
> - ✅ Email verification flow works end to end
> - ✅ Wrong code shows error, correct code updates email
> - ✅ 51+ char display name shows validation error
> 
> Severity: minor (functional but doesn't match spec)

**You don't see any of this.** No quest in your log. It's not done yet.

**Minute 12-13 — Nova sends it back to Dev:**
Nova messages Forge:
> Bug fix needed: User settings page
> 
> QA found 2 issues:
> 1. GIF uploads are accepted — should only allow jpg/png
> 2. Display name saves empty string — should require min 1 character
> 
> Both are in the validation logic. Quick fixes.

Forge's task bubble: *"Fixing upload validation"*

**Minute 15 — Forge fixes and reports:**
> Fixed: User settings page
> - Added GIF to rejected types in PhotoUpload.tsx
> - Added min length 1 validation to display name in validation.ts
> Files changed: PhotoUpload.tsx, validation.ts

**Minute 15-16 — Nova sends to QA again:**
> Re-review: User settings page (bug fixes)
> - GIF uploads should now be rejected
> - Empty display name should show validation error
> Same files as before, plus fixes in PhotoUpload.tsx and validation.ts

**Minute 18 — Lens re-tests:**
> QA Pass: User settings page
> 
> Re-tested:
> - ✅ GIF upload now rejected with "Only JPG and PNG allowed" error
> - ✅ Empty display name shows "Name is required" error
> - ✅ All previous passing tests still pass
> 
> Ready for founder review.

**Minute 18-19 — Nova creates your quest:**

🔔 A new quest appears in your office:

```
⚔️ QUEST LOG
┌──────────────────────────────────────────────┐
│ 👀 Review: User Settings Page                │
│ from Nova · ⚡ SOON                          │
│                                              │
│ Forge built it. Lens tested it. Ready        │
│ for your review.                             │
│                                              │
│ What was built:                              │
│ • Profile photo upload (jpg/png, 5MB max,    │
│   square crop)                               │
│ • Display name (auto-saves, validated)       │
│ • Email change with 6-digit verification     │
│                                              │
│ QA Result: PASS                              │
│ (2 minor bugs found and fixed during review) │
│                                              │
│ Files: settings/page.tsx, PhotoUpload.tsx,    │
│ api/settings/route.ts, validation.ts + 2 more│
│                                              │
│ [Approve]  [Request changes]  [Reject]       │
└──────────────────────────────────────────────┘
```

**Minute 19 — You review it.**

You look at the quest. It's been built, tested, bugs were caught and fixed, and QA signed off. You click **Approve**.

Nova logs the accomplishment:

```
🏆 ACCOMPLISHMENTS
┌────────────────────────────────────┐
│ 🎉 User Settings Page shipped     │
│    Nova · just now                 │
│                                    │
│ ✅ Built by Forge (8 min)          │
│ 🔍 Tested by Lens (2 rounds)      │
│ 👀 Approved by you                 │
└────────────────────────────────────┘
```

**Total time: 19 minutes.** You spent about 30 seconds reviewing. The rest was autonomous.

---

## What Your Office Looks Like Throughout

### At the start (everyone idle):
```
💻 WORK ROOM: (empty)
☕ LOUNGE: Nova ⏳5:00 · Forge · Lens
⚔️ QUESTS: (none)
```

### Nova assigns task:
```
💻 WORK ROOM: Nova "Breaking down task" · Forge "Building settings page"
☕ LOUNGE: Lens ⏳15:00
⚔️ QUESTS: (none)
```

### QA testing:
```
💻 WORK ROOM: Lens "Testing settings page"
☕ LOUNGE: Nova ⏳3:00 · Forge ⏳5:00
⚔️ QUESTS: (none)
```

### Bug loop (you never see this):
```
💻 WORK ROOM: Forge "Fixing upload validation"
☕ LOUNGE: Nova ⏳2:00 · Lens ⏳12:00
⚔️ QUESTS: (none)  ← still empty, bugs handled internally
```

### Done:
```
💻 WORK ROOM: (empty)
☕ LOUNGE: Nova ⏳4:30 · Forge ⏳5:00 · Lens ⏳15:00
⚔️ QUESTS: 👀 Review: User Settings Page
```

---

## Quick Reference

### Communication Flow
```
You → Nova → Forge → Nova → Lens → Nova → Quest → You
                ↑                      |
                └──── bug loop ────────┘
                (you never see this)
```

### Who Talks to Whom
| Agent | Can Message | Gets Messages From |
|-------|-----------|-------------------|
| You | Nova (or anyone) | Quest Log only |
| Nova | Forge, Lens, You (via quests) | You, Forge, Lens |
| Forge | Nova only | Nova only |
| Lens | Nova only | Nova only |

### Files You Created
```
~/agents/pm/IDENTITY.md      — Nova's name
~/agents/pm/SOUL.md          — Nova's instructions
~/agents/dev/IDENTITY.md     — Forge's name
~/agents/dev/SOUL.md         — Forge's instructions
~/agents/qa/IDENTITY.md      — Lens's name
~/agents/qa/SOUL.md          — Lens's instructions
~/.openclaw/openclaw.json    — Agent registration
```

### Time Budget
| Step | Time |
|------|------|
| Create workspaces | 1 min |
| Write IDENTITY.md files | 2 min |
| Write SOUL.md files | 5 min |
| Edit openclaw.json | 3 min |
| Set up Nova's cron | 2 min |
| Launch OpenClawfice | 1 min |
| **Total** | **~15 min** |

After that, you just talk to Nova and review quests. The office runs itself.
