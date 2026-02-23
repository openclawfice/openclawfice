# Demo Mode Spec — Instant "Try It Now" Experience

**Goal:** Let people see OpenClawfice working in 10 seconds without installing anything  
**URL:** `openclawfice.com/demo` or `localhost:3333?demo=true`  
**Target:** First-time visitors who want to see it before committing to install

---

## The Experience

**Click "Try Demo" → See a fully operational office with 5 agents working → Understand the value prop in 10 seconds**

### What Users See

**A live office with:**
- 5 agents (mix of working + idle)
- Real-time activity (agents moving between rooms)
- Water cooler chat happening
- A quest in the quest log
- Recent accomplishments
- A meeting in progress (Meeting Room feature showcase)

**Key differentiator:** This isn't a static screenshot or video — it's a **functional simulation** that updates in real-time.

---

## Demo Agents (5 NPCs)

### Agent 1: Nova (PM) — Working
- **Name:** Nova
- **Role:** Product Manager
- **Emoji:** 📋
- **Color:** #8b5cf6 (purple)
- **Status:** Working
- **Current Task:** "Reviewing sprint velocity metrics"
- **Location:** Work Room

### Agent 2: Forge (Dev) — Working
- **Name:** Forge
- **Role:** Developer
- **Emoji:** 🔨
- **Color:** #f97316 (orange)
- **Status:** Working
- **Current Task:** "Building authentication module"
- **Location:** Work Room

### Agent 3: Lens (QA) — Idle
- **Name:** Lens
- **Role:** QA Engineer
- **Emoji:** 🔍
- **Color:** #06b6d4 (cyan)
- **Status:** Idle
- **Next Task:** In 3 minutes (cooldown timer showing)
- **Location:** Lounge

### Agent 4: Pixel (Designer) — Working (Meeting Room)
- **Name:** Pixel
- **Role:** Designer
- **Emoji:** 🎨
- **Color:** #ec4899 (pink)
- **Status:** In meeting
- **Current Task:** "Discussing color palette for dashboard"
- **Location:** Meeting Room

### Agent 5: Cipher (Ops) — Working (Meeting Room)
- **Name:** Cipher
- **Role:** Operations
- **Emoji:** ⚡
- **Color:** #10b981 (green)
- **Status:** In meeting
- **Current Task:** "Discussing deployment strategy"
- **Location:** Meeting Room

---

## Demo Data

### Quest Log (1 pending decision)

```json
{
  "id": "demo-quest-1",
  "type": "review",
  "icon": "👀",
  "title": "Review: User Dashboard Redesign",
  "description": "Pixel redesigned the main dashboard. Forge implemented it. Lens tested it. Ready for your approval.",
  "from": "Nova",
  "priority": "high",
  "createdAt": 1708644000000,
  "data": {
    "options": ["Approve", "Request changes", "Reject"]
  }
}
```

### Accomplishments (4 recent wins)

```json
[
  {
    "id": "demo-acc-1",
    "icon": "🚀",
    "title": "Shipped v2.0 Dashboard",
    "detail": "New UI with dark mode and real-time updates",
    "who": "Forge",
    "timestamp": 1708640000000
  },
  {
    "id": "demo-acc-2",
    "icon": "✅",
    "title": "Fixed critical auth bug",
    "detail": "Users can now log in without errors",
    "who": "Lens",
    "timestamp": 1708641000000
  },
  {
    "id": "demo-acc-3",
    "icon": "📊",
    "title": "Sprint planning complete",
    "detail": "Roadmap for next 2 weeks finalized",
    "who": "Nova",
    "timestamp": 1708642000000
  },
  {
    "id": "demo-acc-4",
    "icon": "🎨",
    "title": "New color system deployed",
    "detail": "Consistent design tokens across all components",
    "who": "Pixel",
    "timestamp": 1708643000000
  }
]
```

### Water Cooler Chat (6 messages)

```json
[
  {
    "from": "Nova",
    "text": "Morning team! Sprint planning today at 10 AM ☕",
    "ts": 1708640000000
  },
  {
    "from": "Forge",
    "text": "Just pushed the dashboard refactor 🎉",
    "ts": 1708641000000
  },
  {
    "from": "Lens",
    "text": "Testing it now, looks great so far!",
    "ts": 1708642000000
  },
  {
    "from": "Pixel",
    "text": "Love the new animations Forge added",
    "ts": 1708643000000
  },
  {
    "from": "Cipher",
    "text": "Deploying to staging in 5 minutes",
    "ts": 1708644000000
  },
  {
    "from": "Nova",
    "text": "Nice work everyone, we're shipping fast 🚀",
    "ts": 1708645000000
  }
]
```

### Meeting Room (active discussion)

```json
{
  "active": true,
  "topic": "Should we use Tailwind or styled-components?",
  "participants": ["pixel", "cipher"],
  "currentRound": 2,
  "maxRounds": 4,
  "startedAt": 1708645000000,
  "lastMessage": "I think Tailwind is faster for prototyping, but styled-components gives us better component isolation..."
}
```

---

## Demo Mode Features

### 1. Live Simulation
- Agents update status every 5-10 seconds (simulated activity)
- Water cooler messages appear every 15-20 seconds
- Meeting round counter increments every 30 seconds
- Accomplishments occasionally pop in (every 60 seconds)

### 2. Interactive Elements (All Functional)
- Click agents → See their detail panel (skills, XP, needs)
- Click quest → Expand to see full details (can't actually approve in demo)
- Filter/sort accomplishments → Works
- Water cooler broadcast input → Shows "Demo mode: messages disabled" tooltip

### 3. Demo Mode Indicator
- Top banner: "🎮 Demo Mode — See OpenClawfice in action! [Exit Demo] [Install OpenClawfice]"
- Banner is dismissible but comes back on refresh
- Clear visual distinction (subtle blue tint on background?)

### 4. Demo Persistence
- Demo state resets every 5 minutes (so it's always fresh)
- New visitors always see the same starting state
- No localStorage persistence (always starts clean)

---

## Demo Mode Flow

### Entry Point 1: Landing Page
```
openclawfice.com
  ↓
  [Try Live Demo] button (hero section)
  ↓
  openclawfice.com/demo
```

### Entry Point 2: Install Page
```
openclawfice.com/install
  ↓
  "Not sure yet? [Try the demo first]"
  ↓
  openclawfice.com/demo
```

### Entry Point 3: Query Param
```
localhost:3333?demo=true
  (for development/testing)
```

### Exit Flow
```
Demo mode
  ↓
  User clicks "Install OpenClawfice" in banner
  ↓
  openclawfice.com/install (install guide)
```

---

## Call-to-Action at End of Demo

After 2-3 minutes in demo mode, show a **non-intrusive modal**:

```
🎮 Ready to build your own team?

You just saw 5 agents working together. Now create your own office:

1. Install OpenClaw (2 minutes)
2. Create your first agent (3 minutes)
3. Watch your office come to life!

[Get Started →] [Keep Exploring Demo]
```

**Trigger:**
- After 2 minutes in demo mode
- Or after user clicks 3+ agents (shows engagement)
- Modal is dismissible and won't show again for 24h (cookie)

---

## Technical Implementation Notes

### Demo Mode Detection

```typescript
const isDemoMode = searchParams.get('demo') === 'true' || pathname === '/demo';
```

### Demo Data Source

**Option 1: Hardcoded (Recommended)**
```typescript
// app/demo/data.ts
export const DEMO_AGENTS = [...];
export const DEMO_QUESTS = [...];
export const DEMO_ACCOMPLISHMENTS = [...];
export const DEMO_CHAT = [...];
export const DEMO_MEETING = {...};
```

**Option 2: Mock API**
```typescript
// app/api/office/route.ts
if (isDemoMode) {
  return NextResponse.json(DEMO_DATA);
}
```

Recommendation: **Option 1** (simpler, no API overhead)

### Live Simulation Loop

```typescript
useEffect(() => {
  if (!isDemoMode) return;
  
  const interval = setInterval(() => {
    // Randomly update agent status
    // Add new water cooler message
    // Increment meeting round
    // Occasionally add accomplishment
  }, 5000); // every 5 seconds
  
  return () => clearInterval(interval);
}, [isDemoMode]);
```

### Demo Reset

```typescript
// Reset demo state every 5 minutes
useEffect(() => {
  if (!isDemoMode) return;
  
  const resetTimer = setTimeout(() => {
    location.reload(); // Simple reset
  }, 300000); // 5 minutes
  
  return () => clearTimeout(resetTimer);
}, [isDemoMode]);
```

---

## Success Metrics

**Primary Goal:** Convert demo viewers to installers

**Target Metrics:**
- 50%+ of landing page visitors try the demo
- 30%+ of demo viewers click "Install OpenClawfice"
- <5% bounce rate during demo (people stay and explore)

**Tracking:**
- Time spent in demo mode (avg 2+ minutes = engaged)
- Click-through rate to install page (30%+ = success)
- Agent detail panel opens (10+ opens = high engagement)

---

## Why This Works for Virality

1. **Instant gratification** — No install, no setup, just works
2. **Show don't tell** — See agents working, not a static video
3. **Interactive** — Click around, explore, feel the product
4. **Clear CTA** — "Ready to build your own team?" at the right moment
5. **Low friction** — Demo → Install guide → Running in 5 minutes total

**The hook:** People love seeing "their future office" before committing. Demo mode gives them that vision.

---

## Open Questions for Tyler

1. **Should demo mode auto-reset?** (Recommendation: Yes, every 5 minutes)
2. **Should we show a "Share Demo" button?** (Recommendation: Yes, for virality)
3. **Should demo mode have sound effects?** (Recommendation: No, keep it simple)
4. **Should we A/B test different demo agent personalities?** (Recommendation: Later, ship v1 first)

---

## Ship Priority

**Phase 1 (This Week):**
- Demo mode with hardcoded data
- 5 agents, 1 quest, 4 accomplishments, 6 chat messages, 1 meeting
- Live simulation (agents update, chat flows)
- "Install OpenClawfice" CTA banner

**Phase 2 (Next Week):**
- Modal CTA after 2 minutes
- Share demo button
- Analytics tracking (time spent, click-through rate)

**Phase 3 (Future):**
- Customizable demo (pick which agents to show)
- Demo templates (dev team, design team, ops team)
- Embed mode (iframe for blog posts)

---

## Files Forge Will Need to Create/Modify

**New Files:**
- `app/demo/page.tsx` (demo mode route)
- `app/demo/data.ts` (demo data constants)
- `app/demo/simulation.ts` (live update logic)

**Modified Files:**
- `app/page.tsx` (detect demo mode, load demo data)
- `app/layout.tsx` (demo mode banner)
- `app/api/office/route.ts` (optionally serve demo data)

**Estimated Time:** 4-6 hours (half a day)

---

## Demo Mode Mockup (Text)

```
┌─────────────────────────────────────────────────────────────┐
│ 🎮 Demo Mode — Try OpenClawfice! [Exit] [Install]          │
└─────────────────────────────────────────────────────────────┘

🏢 OPENCLAWFICE                    🟢 5 agents  ☕ 1  ⚔️ 1

┌──────────────────────────────────┐  ┌───────────────────┐
│       💻 WORK ROOM               │  │   ☕ THE LOUNGE   │
│                                  │  │                   │
│  📋 Nova        🔨 Forge         │  │   🔍 Lens         │
│  PM             Dev              │  │   QA Engineer     │
│  "Reviewing     "Building        │  │   ⏳ 2:45         │
│   metrics"       auth module"    │  │                   │
└──────────────────────────────────┘  └───────────────────┘

┌──────────────────────────────────────────────────────────┐
│          🤝 MEETING ROOM                                 │
│                                                          │
│   🎨 Pixel  ←→  ⚡ Cipher                              │
│                                                          │
│   "Discussing: Tailwind vs styled-components"           │
│   Round 2/4 · 1:30 elapsed                             │
└──────────────────────────────────────────────────────────┘

┌──────────────┐  ┌─────────────────────────────────────┐
│ ⚔️ QUEST LOG │  │      💬 WATER COOLER               │
│              │  │                                     │
│ 👀 Review:   │  │ Nova: Sprint planning at 10 AM ☕   │
│ Dashboard    │  │ Forge: Just pushed the refactor 🎉  │
│ Redesign     │  │ Lens: Testing now, looks great!    │
│              │  │ Pixel: Love the new animations     │
│ [Expand]     │  │ Cipher: Deploying to staging soon  │
└──────────────┘  └─────────────────────────────────────┘

🏆 ACCOMPLISHMENTS
┌────────────────────────────────────────────────────────┐
│ 🚀 Shipped v2.0 Dashboard · Forge · 2h ago            │
│ ✅ Fixed auth bug · Lens · 3h ago                     │
│ 📊 Sprint planning done · Nova · 4h ago               │
│ 🎨 New color system · Pixel · 5h ago                  │
└────────────────────────────────────────────────────────┘
```

---

**This is the spec. Forge can build from this. Ship it and we'll iterate based on user feedback.** 🚀
