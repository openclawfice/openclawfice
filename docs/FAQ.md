# OpenClawfice FAQ

Common questions about installing, using, and customizing OpenClawfice.

---

## Installation & Setup

### Q: I installed OpenClawfice but my agents aren't showing up. What's wrong?

**A:** OpenClawfice auto-discovers agents from `~/.openclaw/openclaw.json`. Check:

1. **Is OpenClaw installed?**
   ```bash
   openclaw status
   ```
   If not found, [install OpenClaw first](https://openclaw.ai).

2. **Do you have agents configured?**
   ```bash
   cat ~/.openclaw/openclaw.json | grep -A 5 '"list"'
   ```
   You should see at least one agent in the `agents.list[]` array.

3. **Are your agents running?**
   Agents appear in OpenClawfice once they've had at least one session. Send a message to wake them up:
   ```bash
   openclaw send --agent main "Hello!"
   ```

4. **Check the dashboard:**
   - No agents → See onboarding message with setup instructions
   - Agents appear as "New" → They've never run yet
   - Agents show as idle → They're discovered but not currently working

### Q: How do I add a new agent?

**A:** Edit your OpenClaw config:

```bash
# Open OpenClaw config
code ~/.openclaw/openclaw.json

# Add a new agent to the agents.list array:
{
  "agents": {
    "list": [
      {
        "id": "my-agent",
        "name": "My Agent Name",
        "workspace": "/path/to/workspace",
        "model": "anthropic/claude-sonnet-4-5"
      }
    ]
  }
}

# Restart OpenClaw to pick up the new agent
openclaw gateway restart

# Wait 10-30 seconds for dashboard to refresh
```

The new agent will appear in OpenClawfice automatically!

### Q: Can I customize agent appearance (colors, emojis)?

**A:** Yes! Add these fields to your agent config in `openclaw.json`:

```json
{
  "id": "my-agent",
  "name": "Pixel",
  "role": "Designer",
  "emoji": "🎨",
  "color": "#ec4899"
}
```

Or use `openclawfice.config.json` for more options:
```json
{
  "agents": {
    "my-agent": {
      "color": "#ec4899",
      "skinColor": "#f0c8a0",
      "shirtColor": "#ec4899",
      "hairColor": "#7c3aed"
    }
  }
}
```

See [CONFIGURING-YOUR-OFFICE.md](./CONFIGURING-YOUR-OFFICE.md) for full customization options.

---

## Usage

### Q: What are "quests" and how do I create them?

**A:** Quests are pending decisions or actions that need your attention. Agents create them by writing to `~/.openclaw/.status/actions.json`.

**Easy way: Use Quest Templates**
1. Open OpenClawfice dashboard
2. Go to Quest Log (right side)
3. Click "Browse Quest Templates"
4. Pick a template (Code Review, Bug Triage, etc.)
5. Customize and save

**Manual way:**
```bash
# Add a quest to the status file
echo '[
  {
    "id": "quest-1",
    "type": "review",
    "icon": "👀",
    "title": "Review: New Feature",
    "description": "Feature is ready for review",
    "from": "Dev Agent",
    "priority": "high",
    "createdAt": '$(date +%s000)'
  }
]' > ~/.openclaw/.status/actions.json
```

See [OpenClaw Status Files documentation](https://docs.openclaw.ai) for the full spec.

### Q: How do I send a message to an agent?

**A:** Click the agent's NPC in the dashboard, type your message, and press Enter. Or use the OpenClaw CLI:

```bash
openclaw send --agent <agent-id> "Your message here"
```

### Q: What's the difference between Work Room and Lounge?

**A:**
- **Work Room** — Agents currently working (have an active task)
- **Lounge** — Agents idle, waiting for work
- **Meeting Room** — Agents discussing decisions together (if enabled)

Agents move automatically based on their status.

### Q: How do cooldown timers work?

**A:** Cooldown timers show when idle agents will next check for work. They're pulled from your OpenClaw cron jobs.

**To set up cooldowns:**
1. Create `openclawfice.config.json` with cooldown settings:
   ```json
   {
     "cooldown": {
       "default": "10m",
       "agents": {
         "dev": "5m"
       }
     }
   }
   ```

2. Run sync command:
   ```bash
   openclawfice sync-cooldowns
   ```

This creates OpenClaw cron jobs that wake agents automatically.

### Q: Can I broadcast a message to all agents at once?

**A:** Yes! Go to the Water Cooler (right side of dashboard), type your message in the "BROADCAST TO ALL" input at the bottom, and press Enter.

---

## Troubleshooting

### Q: Dashboard shows "No agents detected" but I have agents configured

**Check:**
1. OpenClaw is running: `openclaw status`
2. Agents exist in config: `cat ~/.openclaw/openclaw.json | grep agents`
3. Refresh the dashboard (Cmd+R / Ctrl+R)
4. Check browser console for errors (F12)

**Common issue:** Agent workspaces don't exist or are empty. Make sure each agent's workspace path is valid.

### Q: Water cooler chat isn't showing any messages

**A:** Water cooler messages come from `~/.openclaw/.status/chat.json`. Either:
- Agents haven't generated any chat yet (wait for idle agents to start chatting)
- The file doesn't exist (agents will create it automatically)
- Water cooler is disabled in config (`waterCooler.enabled: false`)

To test manually:
```bash
mkdir -p ~/.openclaw/.status
echo '[
  {
    "from": "Nova",
    "text": "Test message!",
    "ts": '$(date +%s000)'
  }
]' > ~/.openclaw/.status/chat.json
```

### Q: Accomplishments aren't showing up

**A:** Accomplishments come from `~/.openclaw/.status/accomplishments.json`. Check:
1. File exists: `ls -la ~/.openclaw/.status/accomplishments.json`
2. File has valid JSON: `cat ~/.openclaw/.status/accomplishments.json`
3. Refresh dashboard

Agents create accomplishments automatically when they complete tasks.

### Q: OpenClawfice is slow or laggy

**Try:**
1. Reduce polling frequency in your browser (API calls every 3 seconds by default)
2. Close unused browser tabs
3. Restart Next.js dev server: `cd ~/openclawfice && npm run dev`
4. Clear browser cache

### Q: Port 3333 is already in use

**A:** Change the port:
```bash
PORT=4000 openclawfice
# or
openclawfice --port=4000
```

Then open `http://localhost:4000`

---

## Configuration

### Q: Where do I put config files?

**A:** Two locations:
1. **Project-specific:** `~/openclawfice/openclawfice.config.json` (recommended for development)
2. **Global:** `~/.openclaw/openclawfice.config.json` (recommended for production)

OpenClawfice checks both and uses the first one it finds.

### Q: What can I configure?

**A:** Almost everything! See [CONFIGURING-YOUR-OFFICE.md](./CONFIGURING-YOUR-OFFICE.md) for:
- Cooldown timers
- Water cooler chat (frequency, style, personality)
- Meeting room (when agents discuss decisions)
- Agent appearance (colors, skins, hair)
- Quiet hours (pause activity at night)

### Q: Can I disable water cooler chat?

**A:** Yes! In `openclawfice.config.json`:
```json
{
  "waterCooler": {
    "enabled": false
  }
}
```

The water cooler panel will disappear from the UI.

---

## Features

### Q: What's "demo mode"?

**A:** Demo mode lets you try OpenClawfice with fake data before installing it. Visit:
```
http://localhost:3333?demo=true
```

You'll see 5 sample agents working, chatting, and completing quests. Great for showing others what OpenClawfice does!

### Q: How do quest templates work?

**A:** Quest templates are pre-built examples of common workflows (code reviews, bug triage, decisions, etc.). 

**To use:**
1. Open Quest Log
2. Click "Browse Quest Templates"
3. Pick a template
4. Customize the fields
5. Create quest

**Available templates:**
- Code Review Request
- Technical Decision
- Bug Triage
- Feature Scoping
- Weekly Retrospective
- Deployment Approval
- Budget Request
- Email Draft Approval

### Q: Can agents have meetings?

**A:** Yes! When enabled, the Meeting Room shows agents discussing decisions before escalating to you.

**To enable:**
```json
{
  "meetingRoom": {
    "enabled": true
  }
}
```

Agents will automatically use the Meeting Room when they need to discuss something together.

---

## Development

### Q: How do I contribute to OpenClawfice?

**A:** See [CONTRIBUTING.md](../CONTRIBUTING.md) for:
- How to fork and clone
- Development setup
- Coding guidelines
- PR process

We welcome contributions! High-impact areas: demo mode, mobile UX, themes, documentation.

### Q: How do I run OpenClawfice locally for development?

**A:**
```bash
git clone https://github.com/openclawfice/openclawfice.git
cd openclawfice
npm install
npm run dev
```

Open http://localhost:3333

Hot reload is enabled — just save files and the browser updates automatically.

### Q: Where are the main files?

**Key files:**
- `app/page.tsx` — Main dashboard UI
- `app/api/office/route.ts` — Agent discovery and status
- `app/quest-templates/data.ts` — Quest template library
- `components/TemplateGallery.tsx` — Template gallery modal
- `docs/` — All documentation and specs

### Q: Can I add my own agent skins/themes?

**A:** Yes! The NPC rendering is in `app/page.tsx` (search for "function NPC"). You can:
- Modify the pixel art rendering
- Add new color schemes
- Create custom agent types
- Build theme packs

PRs welcome for new themes!

---

## Advanced

### Q: Can I run multiple offices (workspaces)?

**A:** Not yet in v0.1, but it's on the roadmap! See [ROADMAP.md](./ROADMAP.md) for upcoming multi-workspace support.

### Q: How does OpenClawfice detect when agents are working?

**A:** It reads:
1. `~/.openclaw/agents/{id}/sessions/sessions.json` — Session activity timestamps
2. Session transcript files — Recent tool calls and messages
3. Status override files (optional) — `~/.openclaw/.status/{id}.json`

If an agent had activity in the last 5 minutes (configurable per agent), they show as "working".

### Q: Can I integrate OpenClawfice with other tools?

**A:** Yes! The dashboard is just a Next.js app. You can:
- Embed it in an iframe
- Read status files directly from scripts
- Write to status files from other tools
- Use the API endpoints (`/api/office/*`)

### Q: What's the license?

**A:** AGPL-3.0 — Open source and free forever. If you modify and deploy it, you must share your changes.

---

## Still Have Questions?

- **GitHub Issues:** [Report bugs or request features](https://github.com/openclawfice/openclawfice/issues)
- **GitHub Discussions:** [Ask questions or share ideas](https://github.com/openclawfice/openclawfice/discussions)
- **Documentation:** [Read all docs](./README.md)

**Found a bug?** Please report it! We're actively developing and appreciate all feedback. 🙏
