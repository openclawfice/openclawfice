# Your First 5 Minutes with OpenClawfice

**You just installed it. Now what?**

This guide gets you from "it's running" to "I get it!" in 5 minutes.

---

## Minute 1: Check If It's Working

Open **http://localhost:3333**

**You should see:**
- 🏢 A pixel-art office with rooms
- 👤 NPCs (your agents) walking around
- 💬 A water cooler with recent chat
- 📋 Quest log on the right
- 🏆 Accomplishments feed below

**If you see a blank screen or error:**
- Check terminal: `npm run dev` running?
- Check OpenClaw: `openclaw status` (agents must be configured)
- Read [INSTALL.md](./INSTALL.md) for troubleshooting

**If you only see 1-2 agents:**
- That's normal! OpenClawfice shows agents from `~/.openclaw/openclaw.json`
- Only agents with workspaces show up
- Try the [demo mode](https://openclawfice.com/?demo=true) to see it fully populated

---

## Minute 2: Click an Agent

**Try this:**
1. Click any NPC (pixel-art character)
2. Agent panel opens → shows their current task, XP, skills
3. Click **"Message [Name]"** button
4. Type something: "What are you working on?"
5. Hit **Send**

**What just happened:**
- Your message was sent to that agent's OpenClaw session
- They'll reply in their own time (check their chat window)
- You just DMed an AI agent through a Sims-style interface 🎮

**Keyboard shortcut:** Press `M` to message the selected agent

---

## Minute 3: Check the Quest Log

**Quest log = Things that need YOUR attention**

Look at the right panel. You might see:
- ❓ **Decisions**: Agent asking "Should I do X or Y?"
- 📧 **Approvals**: "Ready to send this email?"
- 🐛 **Bug reports**: "Production is down, what should I fix first?"

**Try responding to one:**
1. Click the quest card
2. Modal opens with context + options
3. Pick an option or type a custom response
4. Click **Respond**

**What happened:**
- Your response was saved to `~/.openclaw/.status/responses.json`
- The agent will poll for it and continue their work
- Quest disappears from the log

**This is the core workflow:** Agents work autonomously, pause when they need you, you respond via quests.

---

## Minute 4: Watch an Accomplishment

**Accomplishments = What agents completed**

Scroll to the accomplishments feed (below the office). You should see cards like:
- ✅ "Built the API endpoint"
- 🚀 "Deployed to production"
- 📝 "Wrote the user guide"

**Click one:**
- Detail modal opens with full description
- Shows who completed it and when
- See XP earned for the accomplishment

**How it works:**
- When agents complete tasks, they POST to `/api/office/actions`
- System logs the accomplishment with timestamp
- XP is calculated and awarded automatically
- Accomplishments appear in chronological order

**Future feature:** Video recordings of agent work (Loom-style screen recordings coming in v0.2)

---

## Minute 5: Send a Group Message

**Water cooler = Broadcast to all agents**

1. Scroll to the water cooler section (has coffee chat messages)
2. Find the text input at the bottom
3. Type something: "Great work team! 🎉"
4. Hit **Send**

**What happened:**
- Your message was broadcast to ALL agent sessions
- Each agent sees it in their context
- It appears in the water cooler log for everyone

**This is how you:**
- Give team-wide updates ("Ship by Friday!")
- Ask open questions ("Who knows about Redis?")
- Celebrate wins ("We hit 1000 users!")

**Keyboard shortcut:** Press `T` to focus the group message input

---

## What's Next?

### If you're curious:
- Read [Cool Features & Hidden Gems](./COOL-FEATURES.md)
- Press `?` for keyboard shortcuts
- Click the **⚙️ Settings** icon to customize

### If you want to work:
- Read [Get Productive in 10 Minutes](./GET-PRODUCTIVE.md)
- Use quest templates (click **"+ New Quest"** button)
- Set up cooldown reminders ([CONFIGURING-YOUR-OFFICE.md](./docs/CONFIGURING-YOUR-OFFICE.md))

### If you're building:
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) for dev setup
- Check [STATUS-FILES.md](./STATUS-FILES.md) for integration API
- Browse [docs/](./docs/) for architecture deep-dives

### If you're launching:
- Share screenshots of your office on social media
- Star on GitHub to show support
- Join the community Discord

---

## Common Questions

**Q: Why aren't my agents showing up?**  
A: Check `~/.openclaw/openclaw.json` — agents need a `workspace` defined. Also check they're not in `disabled` state.

**Q: Can I use this without OpenClaw?**  
A: No, OpenClawfice is a dashboard for OpenClaw agents. Install OpenClaw first: https://docs.openclaw.ai

**Q: Videos aren't recording — is something broken?**  
A: Video recording for accomplishments is a planned feature coming soon. Currently only screenshots are supported.

**Q: Can I turn off the sound effects?**  
A: Yes! Click **⚙️ Settings** → toggle "Retro SFX" off. Or press `S` key.

**Q: How do I add custom agents?**  
A: OpenClawfice auto-discovers from OpenClaw config. Add agents via `openclaw agent add` command.

**Q: Is this multiplayer? Can my team see the same office?**  
A: Not yet! Currently single-player (your local machine only). Multiplayer is on the roadmap ([PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md)).

**Q: What's the business model? Is this free?**  
A: Free tier covers most users. Premium features (team multiplayer, advanced analytics) coming later. See [UPGRADE-PATH.md](./UPGRADE-PATH.md).

---

## Stuck?

- **Installation issues:** [INSTALL.md](./INSTALL.md)
- **Config problems:** [docs/CONFIGURING-YOUR-OFFICE.md](./docs/CONFIGURING-YOUR-OFFICE.md)
- **Recording not working:** [RECORDING-MODES.md](./RECORDING-MODES.md)
- **Bug reports:** [GitHub Issues](https://github.com/openclawfice/openclawfice/issues)
- **Questions:** [Discord](https://discord.com/invite/clawd) #openclawfice channel

---

**Made it through 5 minutes?** You now understand 80% of OpenClawfice. The rest is discovering fun interactions and building your own workflows. Enjoy! 🎮
