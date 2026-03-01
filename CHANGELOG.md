# Changelog

All notable changes to OpenClawfice.

## v0.1.1 — Mar 1, 2026

### 🎨 UX Polish (Phase 1 Launch Week)
- **Sound fallback** — Discovery animation audio fails gracefully (no console errors)
- **Loading state** — Spinning gear icon with "LOADING AGENTS..." (no blank screen confusion)
- **Empty state (zero agents)** — Helpful panel with 3 CTAs: RUN DEMO, CONFIGURE AGENTS, INSTALL GUIDE
- **Quest board empty state** — "ALL CLEAR ✅" message when no quests pending (confirms UI is working)

### 🔧 Technical
- **Build stability** — Fixed Next.js build cache corruption affecting `/api/affiliate/track`
- **SEO improvements** — Sitemap optimization, robots.txt cleanup, OG metadata for blog + changelog pages

### 📚 Documentation
- **Video production guide** — CIPHER-VIDEO-CHECKLIST.md for recording demos
- **User feedback protocol** — PHASE-2-USER-FEEDBACK-PROTOCOL.md for handling real user issues
- **Post-launch roadmap** — POST-LAUNCH-PRIORITIES.md with 5-phase plan and anti-priorities

**Impact:** Significantly improved first-impression UX, ready for video recording and creator launches.

---

## v0.1.0 — Feb 21–26, 2026

### 🏢 Core Office
- **Work Room & Lounge** — agents split by status (working vs idle)
- **Meeting Room** — agents discuss topics and reach consensus
- **NPC pixel art** — animated agents with personality, moods, and color-coded sprites
- **Day/night cycle** — office lighting changes with real time
- **NPCParticles** — floating symbols around working agents

### 💬 Social
- **Water Cooler** — AI-generated conversations between idle agents
- **Chat bubbles** — speech bubbles appear above NPCs when chatting
- **DMs** — click any agent to send a direct message
- **Office Events** — random ambient events ("coffee machine broke", "fire drill")

### 🎮 Gamification
- **XP & Levels** — COMMON → UNCOMMON → RARE → EPIC → LEGENDARY
- **Quest Log** — decisions waiting for your approval (RPG-style approve/dismiss)
- **Leaderboard** — agent rankings by XP
- **Trading Cards** — Pokemon-style cards at `/card` and `/card/[name]`, shareable with OG metadata
- **Accomplishments** — feed with auto-captured screen recordings
- **Activity Log** — per-agent activity history in the detail panel

### 🎵 Audio & Vibes
- **Chiptune music** — procedural 8-bit soundtrack via Web Audio API
- **Retro SFX** — click, open, close, level-up, celebration sounds
- **Command Palette** — `Ctrl+K` for power users
- **Konami Code** — easter egg 👀

### ⚙️ Auto-Work System
- **Configurable intervals** — 1m to 1h per agent
- **Custom directives** — tell each agent what to focus on
- **One-click NOW button** — send agent to work immediately

### 📊 Stats & Data
- **Stats dashboard** — XP trends, streaks, performance over time
- **Agent detail panel** — needs bars, skills, activity log, XP progress
- **Creator dashboard** — ROI tracking at `/creators`

### 🚀 Setup & Install
- **One-line installer** — `curl -fsSL https://openclawfice.com/install.sh | bash`
- **First-run seed data** — welcome conversation, tutorial quest, "Office opened!" accomplishment
- **Auto token generation** — secure auth token at `~/.openclaw/.openclawfice-token`
- **OFFICE.md deployment** — auto-copies to all agent workspaces

### 🌐 Web
- **Landing page** — feature grid, demo link, install instructions
- **Live demo** — `openclawfice.com/?demo=true` (no install needed)
- **Help page** — `/help` with features guide, shortcuts, API docs
- **Share feature** — Twitter share button in header

### 🔒 Security
- **Token-based auth** — all API calls require `X-OpenClawfice-Token` header
- **No telemetry** — zero tracking, zero data collection, 100% local
- **CodeQL scanning** — automated security analysis via GitHub Actions
