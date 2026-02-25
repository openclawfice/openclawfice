# 🎮 Your First 5 Minutes with OpenClawfice

**Complete beginner's guide — zero to productive in under 5 minutes.**

---

## What You'll Learn

1. How to install OpenClawfice (30 seconds)
2. What you see when it first loads (the office layout)
3. How to interact with your agents (3 key actions)
4. How to customize your office (themes, sounds, layout)
5. Where to get help if something breaks

**Expected time:** 5 minutes  
**Difficulty:** Absolute beginner  
**Prerequisites:** OpenClaw already installed

---

## Step 1: Install (30 seconds)

### Quick Install (Recommended)

```bash
curl -fsSL https://openclawfice.com/install.sh | bash
```

**What this does:**
- Clones the repo to `~/openclawfice`
- Installs dependencies (`npm install`)
- Starts the dev server on `http://localhost:3333`
- Auto-opens your browser

### Manual Install (If curl fails)

```bash
git clone https://github.com/openclawfice/openclawfice.git ~/openclawfice
cd ~/openclawfice
npm install
npm run dev
```

Then open: **http://localhost:3333**

---

## Step 2: The Boot Sequence (10 seconds)

When you first open OpenClawfice, you'll see:

```
🏢
OPENCLAWFICE
v0.1.0 BETA

[████████████████████] 100%

INITIALIZING...
SCANNING FOR AGENTS...
READY!
```

**This is intentional.** It sets the retro vibe — like booting up a Game Boy.

**First-time users:** The boot runs once. Subsequent visits skip directly to the office.

---

## Step 3: Understanding the Office (60 seconds)

### The Layout

```
┌─────────────────────────────────────┐
│  🏢 OPENCLAWFICE     [⚙️] [?] [📋] │  ← Toolbar
├─────────────────────────────────────┤
│                                      │
│      WORK ROOM                       │  ← Active agents here
│      ▼▼▼▼▼▼▼▼▼▼                     │
│      🧑🧑🧑                          │
│                                      │
│   ─────────────────                  │
│                                      │
│      LOUNGE / BREAK ROOM             │  ← Idle agents here
│      ▼▼▼▼▼▼▼▼▼▼▼▼▼                 │
│      🧑🧑                            │
│                                      │
├─────────────────────────────────────┤
│  💬 WATER COOLER                     │  ← Chat with agents
│  Agent: "Working on user auth..."    │
│  You: "Nice! ETA?"                   │
│  Agent: "20 minutes 🚀"              │
└─────────────────────────────────────┘
```

### What Each Section Means

**Toolbar (top)**
- 🏢 **Title** — Click to go home
- ⚙️ **Settings** — Theme, sounds, layout
- ? **Help** — Keyboard shortcuts
- 📋 **Quests** — Pending decisions (badge shows count)

**Work Room**
- Shows agents currently working
- Status emoji: ⚡ (working), 💤 (idle), 🤝 (in meeting)
- Mood emoji: 😊 (happy), 😰 (stressed), 😌 (chill)
- Click an agent → see their current task

**Lounge**
- Shows idle agents
- Cooldown timer: "Next self-assign: 3m 24s"
- Click an agent → see their recent accomplishments

**Water Cooler (bottom)**
- Real-time chat with agents
- Type a message → agents reply
- Agents also chat with each other

---

## Step 4: 3 Key Actions (90 seconds)

### Action #1: Check What Agents Are Doing

**Goal:** See who's working on what.

1. Look at the **Work Room**
2. Click an agent (the pixel-art character)
3. **Agent Panel** slides in from the right:
   ```
   🧑 Cipher
   Status: ⚡ Working
   Mood: 😊 Happy
   Current Task: "Refactoring auth system"
   XP: 4,500 (Level 18)
   ```

**Shortcut:** Press `1-9` to quick-select agents.

---

### Action #2: Chat with an Agent

**Goal:** Ask questions, give instructions.

1. Scroll to **Water Cooler** (bottom section)
2. Type: `"Hey Cipher, how's auth going?"`
3. Press **Enter** or click **SEND**
4. Agent replies within 5-10 seconds:
   ```
   Cipher: "Almost done! Testing OAuth flow now. ETA: 15 min 🚀"
   ```

**Why this matters:** You can steer agents without opening terminals or reading logs.

---

### Action #3: Review Accomplishments

**Goal:** See what got shipped today.

1. Look at the right sidebar → **ACCOMPLISHMENTS** section
2. Scroll through the feed:
   ```
   🚀 Cipher — Shipped v2 auth
      "Migrated to JWT + refresh tokens"
      [📹 Watch recording]

   ✅ Scout — Found 5 creator leads
      "Total reach: 2.1M followers"
      [📋 See details]
   ```

3. Click **[📹 Watch recording]** → plays a screen capture of the work

**Why this matters:** You know exactly what happened while you were AFK.

---

## Step 5: Customize Your Office (60 seconds)

### Change Theme

1. Click **⚙️ Settings** (top right)
2. **Theme:** Light / Dark / Auto
3. **Accent Color:** Green / Purple / Blue / Pink
4. **Animations:** On / Off (disable if laggy)

### Toggle Sounds

1. **⚙️ Settings → Sound Effects**
2. Options:
   - ✅ Button clicks
   - ✅ Agent status changes
   - ✅ New accomplishments
   - ❌ Background music (not implemented yet)

### Keyboard Shortcuts

Press **`?`** to see all shortcuts:

```
ESC — Close panels
? — Show this help
T — Open water cooler chat
M — Call a meeting
1-9 — Quick-select agents
Ctrl+K — Command palette
```

**Power user tip:** Press **Ctrl+K** to fuzzy-search everything (agents, actions, settings).

---

## Step 6: What to Do Next (60 seconds)

### If You Have Agents Running

✅ **You're done!** Just watch the office. Agents will:
- Move between rooms as they start/finish work
- Chat with each other
- Earn XP for completed tasks
- Alert you when they need decisions

### If You Don't Have Agents Yet

1. **Install OpenClaw:** https://openclaw.ai
2. **Create an agent:**
   ```bash
   openclaw agents add my-agent
   ```
3. **Start a task:**
   ```bash
   openclaw run my-agent "Research competitors"
   ```
4. Refresh OpenClawfice → your agent appears!

### If Something Breaks

1. Check **Troubleshooting:** `docs/TROUBLESHOOTING-FLOWCHART.md`
2. Ask in Discord: https://discord.gg/clawd
3. Open an issue: https://github.com/openclawfice/openclawfice/issues

---

## Common First-Time Questions

### "Why are all my agents in the Lounge?"

**Answer:** They're idle. OpenClawfice reads from OpenClaw session files. If no agents are actively running tasks, they show as idle.

**Fix:** Give them work:
```bash
openclaw run my-agent "Analyze user feedback"
```

---

### "The water cooler isn't working"

**Answer:** Agents need to be running to reply. Idle agents don't respond.

**Fix:** Make sure at least one agent is in the Work Room (actively running a task).

---

### "I don't see any agents at all"

**Answer:** OpenClawfice auto-discovers agents from `~/.openclaw/openclaw.json`. If that file is empty or misconfigured, no agents load.

**Fix:**
1. Check OpenClaw config:
   ```bash
   cat ~/.openclaw/openclaw.json
   ```
2. Verify agents exist:
   ```bash
   openclaw agents list
   ```
3. Restart OpenClawfice:
   ```bash
   cd ~/openclawfice
   npm run dev
   ```

---

### "Can I use this without OpenClaw?"

**Answer:** No. OpenClawfice is a **dashboard for OpenClaw agents**. You need OpenClaw installed first.

**Get OpenClaw:** https://openclaw.ai

---

### "Is this free?"

**Answer:** Yes. AGPL-3.0 open source. Zero telemetry, zero tracking, zero data collection.

**Catch:** If you modify and distribute OpenClawfice, you must open-source your changes (AGPL requirement).

---

## Tips for Power Users

### Hotkey Mastery

Learn these 5 shortcuts:
- **`Esc`** — Close any panel instantly
- **`?`** — Quick help (memorize shortcuts)
- **`T`** — Jump to water cooler chat
- **`Ctrl+K`** — Command palette (fuzzy search)
- **`1-9`** — Select agents without clicking

**Challenge:** Can you navigate the entire office without touching your mouse?

---

### Demo Mode

Want to show off OpenClawfice without your real agents?

```bash
# Open demo version
open http://localhost:3333/?demo=true
```

**What it does:**
- Loads fake agents (Cipher, Scout, Nova, etc.)
- Simulates realistic activity
- Shows all features (quests, accomplishments, meetings)

**Use cases:**
- Screenshots for social media
- Recording tutorials
- Showing to non-technical people

---

### Share Your Office

Press **`S`** or click **📤 Share** (top right) to generate a shareable card:

```
┌────────────────────────────┐
│  🏢 MY AI OFFICE            │
│                             │
│  📊 5 agents working        │
│  🎉 23 tasks shipped today  │
│  ⭐ Level 42 team           │
│                             │
│  Try it: openclawfice.com   │
└────────────────────────────┘
```

**Where to share:**
- Twitter (attach as image)
- Discord (show off your setup)
- LinkedIn (professional flex)
- Reddit r/homelab, r/selfhosted

**Pro tip:** Use the `/stats` page for detailed charts.

---

## What You've Learned ✅

- [x] Installed OpenClawfice in 30 seconds
- [x] Understood the office layout (Work Room, Lounge, Water Cooler)
- [x] Performed 3 key actions (check status, chat, review accomplishments)
- [x] Customized theme/sounds
- [x] Learned keyboard shortcuts
- [x] Know where to get help

**Next steps:**
1. **Explore the `/stats` page** — See XP charts, leaderboards, achievements
2. **Read COOL-FEATURES.md** — Hidden gems (Konami code, dark mode, command palette)
3. **Join Discord** — https://discord.gg/clawd (show us your office!)

---

**Time elapsed:** ~5 minutes  
**Complexity:** Beginner-friendly  
**Support:** Available in Discord

🎮 Welcome to OpenClawfice! Now go build something cool with your agents.
