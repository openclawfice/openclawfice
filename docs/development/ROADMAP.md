# OpenClawfice Roadmap

**Mission:** Make OpenClawfice a popular dashboard for OpenClaw agents  
**Focus:** Easy to use, productive, fun/quirky like a retro RPG

---

## Shipped ✅

### Core Features (v0.1)
- [x] Auto-discovery from openclaw.json
- [x] Real-time agent status (working/idle)
- [x] Pixel art NPCs with Sims plumbobs
- [x] Work Room + Lounge rooms
- [x] Quest Log (pending decisions)
- [x] Accomplishments feed
- [x] Water Cooler chat
- [x] Agent detail panels
- [x] Meeting Room (shows agent discussions)
- [x] Cooldown timers (from cron jobs)
- [x] Mobile responsive layout
- [x] Empty state onboarding
- [x] DM/broadcast messaging

### Config System
- [x] Cooldown config (`sync-cooldowns` CLI)
- [x] Water cooler config (frequency, style, personality, quiet hours)
- [x] Meeting room config
- [x] Agent customization (colors, appearance)

### Viral Features
- [x] **Quest Templates** (060c5b9) — 8 pre-built workflow examples
  - Code review, tech decision, bug triage, feature scoping
  - Retro, deployment approval, budget request, email draft
  - Template gallery modal with hover previews
  - "Browse Quest Templates" in empty Quest Log
  - **Impact:** Instant onboarding, users see real examples

- [x] **Demo Mode** (b26ebe1) — Try-before-install in 10 seconds
  - 5 agents working in live office (Nova, Forge, Lens, Pixel, Cipher)
  - Pre-loaded quest, accomplishments, chat, meeting
  - Demo API endpoints (`/api/demo/*`)
  - DemoBanner component with "Install OpenClawfice" CTA
  - Entry: `localhost:3333?demo=true` or `/demo` route
  - Read-only experience (all writes are no-ops)
  - **Impact:** #1 viral feature — no install barrier, instant value demo

---

## In Progress 🚧

_No active development tasks at the moment. All P0/P1 features shipped!_

---

## Planned (Near-Term)

### P2 — Nice to Have
- [ ] "Call Meeting" button in header
- [x] **Date headers on accomplishments** (10bc15f) — "Today", "Yesterday", "X days ago"
  - Smart grouping by date
  - Pixel-art headers in Press Start 2P font
  - Improves scannability of history
- [x] **Mood tooltips** (18e751a) — Hover plumbobs to see agent mood
  - "Feeling great", "Doing well", "Okay", "Stressed"
  - Makes mood system more discoverable
  - Adds charm to retro aesthetic
- [x] **Share Your Office** (580058a) — Screenshot + social share for viral growth
  - Camera button in header opens share modal
  - One-click screenshot (print dialog)
  - Copy pre-written share text with stats
  - Includes demo link + GitHub link
  - Encourages Twitter/Reddit/Discord/HN sharing
  - **Impact:** Frictionless viral sharing loop
- [x] **Feature Showcase Page** (4213b41) — Marketing landing page
  - `/showcase` route with 8 feature cards
  - Interactive hover effects and colors
  - Screenshot section + install CTAs
  - Perfect for social sharing and paid ads
  - Professional marketing aesthetic
  - **Impact:** Visual content for viral campaigns
- [ ] Agent detail panel config (customize skills/XP/needs via config)
- [ ] Dark/light theme toggle
- [ ] Custom agent avatars (upload images)

### User-Created Templates (Next Sprint)
- [ ] "Save as Template" on existing quests
- [ ] Share templates with team or community
- [ ] Template marketplace (community submissions)

### Analytics Dashboard
- [ ] Response rates, time-to-completion
- [ ] Agent productivity metrics
- [ ] Quest funnel (created → resolved)
- [ ] ROI tracking

---

## Future Vision

### Phase 2: Multi-Workspace
- Support multiple offices (personal, work, side projects)
- Switch between workspaces
- Share agents across workspaces

### Phase 3: Team Features
- Invite collaborators to your office
- Real-time collaboration (multiple users)
- Shared quest log
- Team chat integration (Slack, Discord)

### Phase 4: Premium Features
- Advanced analytics
- Custom room builder
- Agent skill trees
- Time-based mood changes
- Interactive mini-games
- AI-powered suggestions

### Phase 5: Community
- Skill marketplace (share agent configs)
- Template marketplace (share quest templates)
- Office themes (cyberpunk, fantasy, sci-fi)
- Agent personality packs
- Community leaderboard

---

## Success Metrics

### Virality (Current Focus)
- **Demo Mode Conversion:** 30%+ of demo viewers click "Install"
- **Template Adoption:** 60%+ of new users try at least one template
- **Social Sharing:** Users share office screenshots on Twitter/Reddit/HN
- **GitHub Stars:** 1K+ stars in first month
- **npm Installs:** 5K+ downloads in first month

### Retention
- **Daily Active Users:** 40%+ of installers use it daily
- **Session Length:** 5+ minutes average
- **Quest Creation:** 3+ quests per user per week
- **Agent Count:** Average 3+ agents per office

### Community Growth
- **Contributors:** 20+ outside contributors in first 3 months
- **Pull Requests:** 50+ PRs merged
- **Discord Members:** 500+ in community server
- **Documentation:** 90%+ of features documented

---

## How to Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**High-impact areas:**
- Demo mode implementation (current priority)
- Mobile UX improvements
- Custom themes/skins
- Agent personality packs
- Documentation and tutorials
- Community template submissions

---

## License

MIT — Free forever, premium features coming later

---

**Last updated:** 2026-02-23  
**Next milestone:** Demo Mode launch (ETA: this week)
