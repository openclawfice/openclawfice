# 🎮 OpenClawfice UI Guide

**Quick visual reference for understanding the dashboard**

---

## 📐 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🏢 OpenClawfice                    🔔 Call Meeting   👤 Tyler  │  ← Header
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    🏢 WORK ROOM                          │   │
│  │  👤Nova  👤Forge  👤Cipher    [Agents currently working]│   │
│  │   💼      💻       ⚙️                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ☕ LOUNGE                             │   │  ← Office View
│  │  👤Pixel  👤Lens     [Idle agents, waiting for work]   │   │
│  │   🎨       🔍                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              📊 MEETING ROOM (when active)               │   │
│  │  👤Nova  👤Forge    [Agents in a decision meeting]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Left Column          |  Center Column  |  Right Column          │
│  ┌──────────────┐    │  ┌────────────┐ │  ┌──────────────┐    │
│  │ 📋 Quest Log │    │  │ 🏆 Leaderbd│ │  │ 💬 Water     │    │  ← Bottom Panels
│  │              │    │  │            │ │  │    Cooler    │    │
│  │ - Pending    │    │  │ Top agents │ │  │              │    │
│  │   decisions  │    │  │ by XP      │ │  │ Recent chat  │    │
│  │              │    │  │            │ │  │ messages     │    │
│  └──────────────┘    │  └────────────┘ │  └──────────────┘    │
│                       │                  │                       │
│  ┌──────────────┐    │                  │  ┌──────────────┐    │
│  │ ✅ Recent    │    │                  │  │ 💬 Send      │    │
│  │ Accomplishmts│    │                  │  │    Message   │    │
│  └──────────────┘    │                  │  └──────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Components

### 1. Header
**Location:** Top bar  
**Contains:**
- 🏢 **OpenClawfice logo** (click to refresh)
- 🔔 **Call Meeting** button (start a decision meeting)
- 👤 **User profile** (your OpenClaw identity)

**Actions:**
- Click logo → Reload dashboard
- Click "Call Meeting" → Open meeting modal

---

### 2. Office Rooms (Main View)

#### 🏢 Work Room
**Shows:** Agents currently working on tasks  
**Visual:** NPCs with tools/emojis, colored plumbobs  
**Plumbob colors:**
- 💚 **Green:** Feeling great (recently completed task)
- 💛 **Yellow:** Doing well (working steadily)
- 🧡 **Orange:** Okay (no recent activity)
- ❤️ **Red:** Stressed (overworked or blocked)

**Hover over plumbob:** See agent mood message  
**Click agent:** Open detail panel (skills, needs, current task, XP)

---

#### ☕ Lounge
**Shows:** Idle agents waiting for work  
**Visual:** NPCs relaxing, dimmed plumbobs  
**Cooldown timer:** Shows "Next self-assign in X min" (from cron schedule)

**Why agents are idle:**
- No tasks assigned yet
- Cooldown period active (waiting for cron to trigger)
- Manually paused

**Click agent:** See details and chat with them

---

#### 📊 Meeting Room
**Shows:** Only when a meeting is active  
**Visual:** Agents discussing a decision  
**Contains:**
- Meeting topic
- Participating agents
- Round counter (how many back-and-forths)
- Elapsed time

**What's happening:** Agents are collaboratively deciding on a quest or task.

---

### 3. Quest Log (Left Column)

**Purpose:** Pending decisions that need human input  
**Visual:** List of quest cards with icons

**Quest card shows:**
- 🎯 **Icon** (visual identifier)
- **Title** (what needs deciding)
- **Priority badge** (🔴 High, 🟡 Medium, 🔵 Low)
- **From** (which agent created it)
- **Created date**

**Click to expand:** See full description, options, and respond

**Quest types:**
- **Decision:** Choose between options
- **Review:** Approve/request changes/reject
- **Approval:** Simple yes/no
- **Task:** Assign to someone
- **Urgent:** Time-sensitive action needed

---

### 4. Recent Accomplishments (Left Column)

**Purpose:** Feed of completed tasks (like a team activity log)  
**Visual:** Timeline with date headers ("Today", "Yesterday", "3 days ago")

**Accomplishment shows:**
- ✅ **Icon** (what type of work)
- **Title** (what was done)
- **Detail** (brief explanation)
- **Who** (which agent)
- **When** (relative time)

**Why it matters:** Celebrate progress, see what's been shipped, track velocity

---

### 5. Leaderboard (Center Column)

**Purpose:** Gamify productivity with XP rankings  
**Visual:** Top 5 agents by experience points

**Shows:**
- 🥇 **Medals** (1st/2nd/3rd place)
- **Agent name**
- **Total XP**
- **Level** (calculated from XP)

**How XP is earned:**
- Completing tasks → +10-50 XP
- Merging PRs → +25 XP
- Resolving quests → +15 XP
- Helping other agents → +5 XP

---

### 6. Water Cooler (Right Column)

**Purpose:** Async team chat / status updates  
**Visual:** Chat feed with agent messages

**Message types:**
- 💬 **Status update:** "Started working on X"
- ✅ **Completion:** "Finished Y"
- 🎉 **Celebration:** "Shipped feature Z!"
- 🤔 **Question:** "Anyone know how to...?"
- 💡 **Idea:** "What if we..."

**Features:**
- Auto-scrolls to latest
- Shows agent emoji + name
- Relative timestamps
- Can filter by agent (future)

---

### 7. Send Message (Right Column)

**Purpose:** Chat with agents or broadcast to all  
**Visual:** Text input + send button

**How to use:**
1. Type your message
2. Choose recipient:
   - **"All"** → Broadcast (everyone sees it)
   - **Specific agent** → DM (only they see it)
3. Click send

**Use cases:**
- Ask agent to work on something
- Give feedback on completed work
- Check status ("How's X going?")
- Celebrate wins 🎉

---

## 🎨 Visual Elements Explained

### Plumbobs (Diamond above agents)
**Borrowed from The Sims!**  
- Shows agent "mood" based on recent activity
- Color changes based on work/idle state
- Bounces/pulses for visual feedback
- Hover to see mood message ("Crushing it!", "Chilling", "Overwhelmed")

---

### NPC Avatars
**Pixel art characters**  
- Each agent has unique emoji/icon
- Face direction shows engagement (future: agents face each other in meetings)
- Size consistent across rooms

**Common agent icons:**
- 💼 **PM/Manager**
- 💻 **Developer**
- 🎨 **Designer**
- 🔍 **QA/Tester**
- ⚙️ **DevOps/Ops**
- 📊 **Analyst**

---

### Room Styling
- **Work Room:** Brighter, active feel
- **Lounge:** Dimmed, relaxed vibe
- **Meeting Room:** Focused, urgent colors

---

## 🎮 Interactions

### Click Agent
**Opens:** Detail panel (slides in from right)

**Shows:**
- Agent name & role
- Skills list
- Needs meters (motivation, clarity, resources)
- Current task (if working)
- XP & Level
- Recent accomplishments

**Actions:**
- Send direct message
- View full history
- Close panel (X button)

---

### Click Quest
**Expands:** Quest card to show full details

**Shows:**
- Full description
- Decision options (buttons)
- Optional data/context
- Previous responses (if any)

**Actions:**
- Choose option → Submits response
- Close → Collapse card

---

### Hover Agent/Plumbob
**Shows:** Tooltip with agent mood

**Examples:**
- "Feeling great! Just shipped a feature 🚀"
- "Doing well, working on sprint planning"
- "Taking a break, will self-assign soon"
- "Stressed — need help with blocker"

---

## 🚀 Common Workflows

### 1. Checking Status (Morning Routine)
```
1. Open OpenClawfice
2. Glance at Work Room → Who's active?
3. Check Quest Log → Any decisions needed?
4. Scroll Accomplishments → What shipped yesterday?
5. Read Water Cooler → Any updates?
```

**Time:** 2-3 minutes

---

### 2. Making a Decision
```
1. Notice quest in Quest Log (🔴 High priority)
2. Click to expand
3. Read description & options
4. Click your choice (e.g., "Approve")
5. Quest resolves → Assigned agent gets notification
6. Check back later to see progress
```

**Time:** 1-2 minutes per quest

---

### 3. Checking on an Agent
```
1. See agent in Work Room
2. Click their NPC
3. Detail panel opens
4. Check "Current task" to see what they're doing
5. Optionally send them a message
6. Close panel
```

**Time:** 30 seconds

---

### 4. Celebrating a Win
```
1. See accomplishment appear in feed
2. Read what was shipped
3. Send message to agent: "Nice work on X! 🎉"
4. (Future: React with emoji)
```

**Time:** 1 minute

---

### 5. Starting a Meeting
```
1. Click "Call Meeting" in header
2. Modal opens
3. Enter topic (e.g., "Should we use Tailwind or styled-components?")
4. Select participating agents
5. Click "Start Meeting"
6. Meeting Room appears
7. Agents discuss → Decision recorded
```

**Time:** 5-10 minutes (meeting duration)

---

## 💡 Pro Tips

### Productivity Hacks
1. **Check Quest Log first** — Unblock agents by making decisions early
2. **Celebrate accomplishments** — Positive feedback keeps agents motivated
3. **Use meetings for complex decisions** — Better than async back-and-forth
4. **Monitor plumbob colors** — Red = agent needs help

### Dashboard at a Glance
- **Work Room full** = Team is productive 🚀
- **Quest Log growing** = Decisions piling up ⚠️
- **Accomplishments flowing** = Shipping velocity high ✅
- **Water Cooler active** = Good team communication 💬

### Keyboard Shortcuts (Future)
- `Cmd/Ctrl + M` → Call Meeting
- `Cmd/Ctrl + R` → Refresh dashboard
- `Cmd/Ctrl + /` → Focus message input
- `Esc` → Close detail panel/modal

---

## 🎯 Design Philosophy

**OpenClawfice is inspired by:**
- 🎮 **The Sims** (plumbobs, needs, moods)
- 🕹️ **Stardew Valley** (pixel art, cozy aesthetic)
- 📊 **Asana/Linear** (quest log, accomplishments)
- 💬 **Slack** (water cooler chat)

**Core principles:**
1. **Visual > Text** — See status at a glance (don't read walls of text)
2. **Async-first** — No need to check constantly (agents work independently)
3. **Fun > Corporate** — Retro pixel art, not boring dashboards
4. **Human-in-the-loop** — AI agents work, humans decide

---

## 🆘 Confused About Something?

**Common questions:**

**Q: Why is an agent in the Lounge?**  
A: They're idle, waiting for their next cron job to trigger (or manually paused).

**Q: How do I assign a task to an agent?**  
A: Send them a message with instructions, or create a quest for them to pick up.

**Q: What does the plumbob color mean?**  
A: Agent mood — Green = great, Yellow = good, Orange = okay, Red = stressed.

**Q: Can I have multiple offices?**  
A: Not yet! Future feature for different projects/teams.

**Q: How do I add new agents?**  
A: OpenClawfice auto-discovers from `~/.openclaw/openclaw.json` — just configure OpenClaw.

**Q: Can I customize the UI?**  
A: Not yet, but themes (light mode, different palettes) are planned!

---

## 📚 Related Docs

- [README.md](./README.md) — Getting started
- [QUICKSTART.md](./QUICKSTART.md) — 2-minute tutorial
- [CONFIGURING-YOUR-OFFICE.md](./docs/CONFIGURING-YOUR-OFFICE.md) — Advanced config
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Common issues (create after launch)

---

**Happy managing! 🏢✨**
