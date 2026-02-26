# Show HN: I turned my AI agents into Sims NPCs

I run 5 AI agents (OpenClaw) to help with my business — one handles outreach, one does dev work, one manages projects, etc. The problem? I had no idea what they were doing unless I grep'd through logs.

So I built OpenClawfice — a virtual office where your agents show up as pixel art NPCs. Working agents are at their desks. Idle agents hang out in the lounge. They chat at the water cooler about their tasks. They earn XP and level up.

**Demo (no install):** https://openclawfice.com/?demo=true

**GitHub:** https://github.com/openclawfice/openclawfice

## What it actually does

- Your OpenClaw agents auto-appear as pixel art NPCs
- Work Room shows who's actively working (with their current task)
- Lounge shows idle agents chatting
- Quest Log = decisions waiting for your approval
- Accomplishments feed with auto-captured screen recordings
- XP system — agents level up from COMMON to LEGENDARY
- Pokemon-style trading cards you can share
- Chiptune soundtrack generated via Web Audio API (no audio files)
- Water cooler chat — agents discuss their work every few seconds

## Why it exists

Someone on Twitter told me "logs are write-only — nobody reads them until something breaks." That's exactly the problem. I was running a team of agents but had zero visibility into what was happening.

Dashboards are boring. Logs are unreadable. But a virtual office where you can see your agents walking around? I actually check that. Turns out gamification works on humans managing AI agents too.

## Tech

- Next.js 15 + TypeScript
- All sprites procedurally generated from name hashes
- All sounds procedural (Web Audio API, zero audio files)
- Reads agent config from `~/.openclaw/openclaw.json`
- Token auth, no telemetry, 100% local
- One-line install: `curl -fsSL https://openclawfice.com/install.sh | bash`

## What's next

- Custom pixel art avatars
- Theme editor
- Skill trees for agent specializations
- `npx openclawfice` (zero-install)

It's open source (AGPL-3.0) and free. Would love feedback on the UX — especially from anyone running multi-agent setups.

---

# Discord Version (shorter)

## 🏢 OpenClawfice — Your AI agents, but they're Sims

Turn your OpenClaw agents into pixel art NPCs in a retro virtual office.

**What you get:**
- Agents auto-appear as animated NPCs
- See who's working, idle, or chatting at the water cooler
- Quest log for decisions that need your input
- XP system with leveling (COMMON → LEGENDARY)
- Pokemon-style trading cards
- Chiptune soundtrack
- Auto-work system — agents check in on a schedule

**Try it now:**
🎮 Demo: https://openclawfice.com/?demo=true
📦 Install: `curl -fsSL https://openclawfice.com/install.sh | bash`
⭐ GitHub: https://github.com/openclawfice/openclawfice

One-line install, zero config. Your agents show up automatically.

---

# Reddit r/OpenClaw Version

**I built a virtual office for my AI agent team and it's unreasonably fun**

Was running 5 OpenClaw agents but couldn't tell what any of them were doing without reading logs. Built a dashboard where they show up as pixel art Sims NPCs walking around an office.

Now I check on my agents more than Slack. They chat at a water cooler. They earn XP. They have trading cards.

I think I accidentally made The Sims but for AI agents.

Demo (no install needed): https://openclawfice.com/?demo=true
GitHub: https://github.com/openclawfice/openclawfice
Install: `curl -fsSL https://openclawfice.com/install.sh | bash`

Would love to hear what features you'd want. Currently working on custom avatars and skill trees.
