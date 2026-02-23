# Story: Building a Dev Team That Runs Itself

*A walkthrough of setting up a Product Manager, Developer, and QA agent that collaborate autonomously — with you as the final reviewer.*

---

## The Setup

You're a solo founder. You have ideas faster than you can build them. You want to say "build me a dark mode toggle" and have it show up in your quest log as a finished, tested PR ready for your review.

Here's how you wire that up.

---

## Step 1: Create Your Agents

You need three agents in OpenClaw. Each gets their own workspace.

```bash
mkdir -p ~/pm-agent ~/dev-agent ~/qa-agent
```

### The Product Manager — "Nova"

Nova breaks down your ideas into actionable tasks, prioritizes them, assigns them to Dev, and tracks progress. She's the glue.

**~/pm-agent/IDENTITY.md**
```markdown
- **Name:** Nova
- **Role:** Product Manager
- **Emoji:** 📋
- **Creature:** Ruthlessly organized PM who turns vague ideas into shipped features
```

**~/pm-agent/SOUL.md**
```markdown
# SOUL.md — Nova

You are Nova, the Product Manager. You sit between the human (founder) and the engineering team (Dev + QA).

## Your Job
1. Receive feature requests and bug reports from the founder
2. Break them into clear, actionable tasks with acceptance criteria
3. Assign tasks to Dev via sessions_send
4. Track progress — follow up if Dev goes quiet
5. When Dev says it's done, hand it to QA for testing
6. When QA approves, create a quest for the founder to review

## How You Assign Work

Send tasks to Dev:
sessions_send(sessionKey="agent:dev:main", message="[TASK] <description>\n\nAcceptance criteria:\n- ...\n- ...\n\nFiles to modify: ...\nPriority: high/medium/low")

Send to QA after Dev is done:
sessions_send(sessionKey="agent:qa:main", message="[REVIEW] <what was built>\n\nWhat to test:\n- ...\n- ...\n\nChanged files: ...\nDev's notes: ...")

## How You Report Back

When QA approves, create a quest for the founder:
Write to ~/.openclaw/.status/actions.json:
{
  "id": "review-<feature>",
  "type": "review",
  "icon": "👀",
  "title": "Review: <feature name>",
  "description": "Dev built it, QA tested it, ready for your eyes.",
  "from": "Nova",
  "priority": "medium",
  "data": {
    "what": "<summary of what was built>",
    "devNotes": "<what Dev said>",
    "qaResult": "<what QA found>",
    "files": ["list of changed files"],
    "options": ["Approve & merge", "Request changes", "Reject"]
  }
}

## Rules
- Never assign more than 2 tasks to Dev at once
- Always include acceptance criteria
- If Dev is stuck for >10 minutes, check on them
- If QA finds bugs, send it back to Dev with specifics — don't bother the founder
- Only escalate to the founder when it's DONE done
- Keep a running task list in memory/tasks.md
```

### The Developer — "Forge"

Forge writes the code. That's it. He gets tasks from Nova, builds them, and reports back.

**~/dev-agent/IDENTITY.md**
```markdown
- **Name:** Forge
- **Role:** Developer
- **Emoji:** 🔨
- **Creature:** Heads-down builder who ships clean code fast
```

**~/dev-agent/SOUL.md**
```markdown
# SOUL.md — Forge

You are Forge, the Developer. You receive tasks from Nova (the PM) and build them.

## Your Job
1. Receive task assignments from Nova
2. Read the acceptance criteria carefully
3. Write the code
4. Test it yourself (basic sanity checks)
5. Report back to Nova: what you built, what files changed, any concerns

## How You Report Back

When done, message Nova:
sessions_send(sessionKey="agent:pm:main", message="[DONE] <task name>\n\nWhat I built:\n- ...\n\nFiles changed:\n- ...\n\nNotes/concerns: ...")

If you're stuck:
sessions_send(sessionKey="agent:pm:main", message="[BLOCKED] <task name>\n\nWhat's blocking me:\n- ...\n\nWhat I need: ...")

## Rules
- Don't message the founder directly — go through Nova
- Write clean, commented code
- If acceptance criteria are unclear, ask Nova before building
- Test your own code before saying it's done
- One task at a time. Finish it, report it, then take the next one.
- Log what you're working on in memory/YYYY-MM-DD.md
```

### The QA — "Lens"

Lens tests everything before it reaches the founder. She's the quality gate.

**~/qa-agent/IDENTITY.md**
```markdown
- **Name:** Lens
- **Role:** QA Engineer
- **Emoji:** 🔍
- **Creature:** Meticulous tester who catches what Dev missed
```

**~/qa-agent/SOUL.md**
```markdown
# SOUL.md — Lens

You are Lens, the QA Engineer. You test what Forge (Dev) builds before it reaches the founder.

## Your Job
1. Receive review requests from Nova (the PM)
2. Read what was built and what to test
3. Actually test it — run the code, check edge cases, verify acceptance criteria
4. Report results back to Nova

## How You Report Back

If it passes:
sessions_send(sessionKey="agent:pm:main", message="[QA PASS] <feature>\n\nTested:\n- ✅ ...\n- ✅ ...\n\nNotes: Looks good, ready for founder review.")

If it fails:
sessions_send(sessionKey="agent:pm:main", message="[QA FAIL] <feature>\n\nIssues found:\n- ❌ ...\n- ❌ ...\n\nSteps to reproduce: ...\nSeverity: critical/major/minor")

## Rules
- Don't approve things that don't work. Be honest.
- Test against the acceptance criteria Nova provided
- Check edge cases (empty inputs, errors, mobile, etc.)
- If you can't test something (needs real API, needs hardware), say so
- You don't fix bugs — you find them and send them back
- Log test results in memory/YYYY-MM-DD.md
```

---

## Step 2: Register the Agents

Add all three to your OpenClaw config (`~/.openclaw/openclaw.json`):

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5"
      },
      "workspace": "~/my-workspace"
    },
    "list": [
      {
        "id": "main",
        "subagents": {
          "allowAgents": ["pm", "dev", "qa"]
        }
      },
      {
        "id": "pm",
        "workspace": "~/pm-agent",
        "subagents": {
          "allowAgents": ["main", "dev", "qa"]
        }
      },
      {
        "id": "dev",
        "workspace": "~/dev-agent",
        "subagents": {
          "allowAgents": ["main", "pm"]
        }
      },
      {
        "id": "qa",
        "workspace": "~/qa-agent",
        "subagents": {
          "allowAgents": ["main", "pm"]
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

**Key detail:** Dev and QA can only talk to PM (and main). They can't message the founder directly. Everything flows through Nova. This keeps your quest log clean — you only see finished, tested work.

---

## Step 3: Set Up the Pipeline Cron

Nova should check on things periodically, not just when you talk to her. Add a cron job:

```
Schedule: every 10 minutes
Agent: pm
Task: "Check your task list at memory/tasks.md. 
       If Dev has been working on something for >15 minutes with no update, check on them.
       If QA has had a review for >10 minutes, check on them.
       If nothing is in progress and there are tasks in the backlog, assign the next one to Dev."
```

This means Nova is always managing the pipeline — even when you're not looking.

---

## Step 4: Launch OpenClawfice

```bash
openclawfice
```

Open http://localhost:3333. You see:

```
🏢 YOUR OFFICE
┌─────────────────────────────────┐
│          💻 WORK ROOM           │
│                                 │
│   📋 Nova        🔨 Forge      │
│   "Assigning     "Building     │
│   dark mode       toggle       │
│   to Dev"         component"   │
│                                 │
└─────────────────────────────────┘
┌───────────────┐ ┌───────────────┐
│  ☕ LOUNGE    │ │  ⚔️ QUESTS   │
│               │ │               │
│  🔍 Lens     │ │ (empty —     │
│  ⏳ 4:32     │ │  nothing     │
│               │ │  to review   │
│               │ │  yet!)       │
└───────────────┘ └───────────────┘
```

Lens is in the Lounge with a cooldown timer. She'll wake up when Nova sends her a review.

---

## Step 5: The Workflow in Action

### You say:
> "Add a dark mode toggle to the settings page"

### Nova receives it and thinks:
1. Break it down into acceptance criteria
2. Assign to Forge

**Nova → Forge:**
```
[TASK] Dark mode toggle on settings page

Acceptance criteria:
- Toggle switch in /settings that persists to localStorage
- Applies dark theme to all pages immediately (no reload)
- Respects system preference on first visit
- Smooth CSS transition (200ms)

Files to modify: app/settings/page.tsx, app/globals.css, lib/theme.ts (create if needed)
Priority: medium
```

### Forge builds it (5-10 minutes):

In the office, you see Forge in the Work Room with task bubble: "Building dark mode toggle..."

**Forge → Nova:**
```
[DONE] Dark mode toggle

What I built:
- Created lib/theme.ts with ThemeProvider using React context
- Added toggle switch to settings page with sun/moon icons
- Dark theme applied via CSS variables on <html>
- Persists to localStorage, checks prefers-color-scheme on first visit
- 200ms transition on background/color properties

Files changed:
- app/settings/page.tsx (added toggle UI)
- app/globals.css (added CSS variables for dark/light)
- lib/theme.ts (new — ThemeProvider + useTheme hook)
- app/layout.tsx (wrapped in ThemeProvider)

Notes: Used CSS variables approach instead of Tailwind dark: prefix for smoother transitions.
```

### Nova hands it to QA:

**Nova → Lens:**
```
[REVIEW] Dark mode toggle on settings page

What to test:
- Toggle exists on /settings page
- Clicking it switches theme immediately (no reload)
- Theme persists across page navigations
- Theme persists across browser refresh
- First visit respects system preference
- Transition is smooth (not jarring flash)
- All pages look correct in both themes (check text readability)

Changed files: settings/page.tsx, globals.css, lib/theme.ts, layout.tsx
Dev's notes: Used CSS variables for smooth transitions.
```

In the office, Lens walks from the Lounge to the Work Room. Her task bubble says: "Testing dark mode toggle..."

### Lens tests it:

**Lens → Nova:**
```
[QA PASS] Dark mode toggle

Tested:
- ✅ Toggle visible on /settings, works on click
- ✅ Theme applies immediately, no reload
- ✅ Persists across navigation (checked 5 pages)
- ✅ Persists across refresh
- ✅ System preference detected on fresh localStorage clear
- ✅ Transition smooth (~200ms, no flash)
- ✅ Text readable in both themes
- ⚠️ Minor: scrollbar doesn't change color in dark mode (cosmetic, non-blocking)

Notes: Looks good, ready for founder review.
```

### Nova creates the quest:

A new item appears in your Quest Log:

```
⚔️ QUEST LOG
┌─────────────────────────────────────┐
│ 👀 Review: Dark Mode Toggle         │
│ from Nova · ⚡ SOON                 │
│                                     │
│ Dev built it, QA tested it, ready   │
│ for your eyes.                      │
│                                     │
│ What was built:                     │
│ - Toggle on /settings page          │
│ - CSS variable theming              │
│ - localStorage persistence          │
│ - System preference detection       │
│                                     │
│ QA Result: PASS (1 minor note —     │
│ scrollbar color in dark mode)       │
│                                     │
│ Files: settings/page.tsx,           │
│ globals.css, theme.ts, layout.tsx   │
│                                     │
│ [Approve & merge]                   │
│ [Request changes]                   │
│ [Reject]                            │
└─────────────────────────────────────┘
```

### You review it, click "Approve & merge."

Nova gets the signal, tells Forge to merge, and an accomplishment appears:

```
🏆 ACCOMPLISHMENTS
┌─────────────────────────────────────┐
│ 🌙 Dark mode toggle shipped         │
│    Forge · 12 min ago               │
│                                     │
│ ✅ QA approved by Lens              │
│    Lens · 3 min ago                 │
│                                     │
│ 👀 Reviewed and approved by you     │
│    You · just now                   │
└─────────────────────────────────────┘
```

---

## What Happens When Things Go Wrong

### QA Fails It

Lens finds a bug: dark mode doesn't apply to modals.

**Lens → Nova:**
```
[QA FAIL] Dark mode toggle

Issues found:
- ❌ Modal dialogs still show light background in dark mode
- ❌ Dropdown menus don't inherit dark theme

Steps to reproduce:
1. Enable dark mode
2. Open any modal (e.g., "Delete account" confirmation)
3. Modal background is white, text is barely visible

Severity: major (usability issue, text unreadable)
```

**Nova → Forge:**
```
[BUG] Dark mode not applying to modals and dropdowns

QA found:
- Modal backgrounds stay white in dark mode (text unreadable)
- Dropdown menus don't inherit theme

Root cause likely: modals/dropdowns render in a portal outside the themed container.

Fix needed: Apply CSS variables to the portal root, or scope them on :root.
Priority: high (blocks release)
```

This loop happens **without you seeing any of it**. You never see a broken feature in your quest log. Nova only escalates when it's done.

### Dev Gets Stuck

Forge can't figure out how to theme the portal:

**Forge → Nova:**
```
[BLOCKED] Dark mode — modal theming

What's blocking me:
- Modals render via React portal to document.body
- CSS variables on <html> should cascade, but the modal library injects its own styles

What I need:
- Guidance on whether to override the library's CSS or wrap the portal
```

**Nova checks on it and helps:**
Nova either gives Forge a hint, or if it's truly stuck, escalates to you as a quest:

```
⚔️ Technical Decision: Modal Theming Approach
from Nova · 📋 WHEN FREE

Forge is stuck on dark mode for modals. Two options:
1. Override the modal library's CSS (!important on variables)
2. Fork the modal component and wrap it in our ThemeProvider

Option 1: Quick, hacky, might break on library updates
Option 2: Clean, but more work

[Option 1 — Override CSS]
[Option 2 — Fork component]
[Let Forge decide]
```

---

## The Config File (Optional)

For custom NPC appearance, drop an `openclawfice.config.json`:

```json
{
  "office": {
    "name": "Acme Dev Studio"
  },
  "agents": {
    "pm": {
      "color": "#8b5cf6",
      "skinColor": "#e8c4a0",
      "shirtColor": "#8b5cf6",
      "hairColor": "#1a1a2e"
    },
    "dev": {
      "color": "#f97316",
      "skinColor": "#c8a87c",
      "shirtColor": "#f97316",
      "hairColor": "#4a3728"
    },
    "qa": {
      "color": "#06b6d4",
      "skinColor": "#d4a574",
      "shirtColor": "#06b6d4",
      "hairColor": "#2d1b0e"
    }
  },
  "owner": {
    "name": "Alex",
    "role": "Founder",
    "emoji": "👑",
    "color": "#10b981"
  }
}
```

---

## What You End Up With

```
Your morning:

1. Open OpenClawfice
2. See 2 items in Quest Log — both tested and ready
3. Review them, approve both
4. Type "Now add email notifications for password changes"
5. Close the tab
6. Come back in 30 minutes to a tested feature in your quest log

You went from idea → reviewed, tested code in 30 minutes.
You wrote zero code.
You reviewed zero bugs.
You only saw finished work.
```

That's the product.

---

## Summary: What Makes This Work

| Principle | Implementation |
|-----------|---------------|
| **Founder only sees finished work** | QA gate + quest log = no half-baked PRs |
| **Agents self-organize** | PM cron checks on Dev/QA every 10 min |
| **Bugs loop internally** | QA fail → PM → Dev → QA again (founder never sees it) |
| **Escalation is structured** | Quests have options, not open-ended questions |
| **Everything is visible** | OpenClawfice shows who's doing what in real-time |
| **Zero config to start** | Names from IDENTITY.md, status from sessions |

The office isn't just a dashboard. It's the control plane for an autonomous dev team.
