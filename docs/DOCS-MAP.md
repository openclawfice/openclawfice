# 🗺️ Documentation Map

**91 docs. One map. Find what you need in 10 seconds.**

**Jump to:** [I want to...](#i-want-to) • [I'm stuck](#im-stuck) • [I'm launching](#im-launching) • [I'm building](#im-building) • [All Docs](#all-docs-a-z)

---

## 🎯 I want to...

### Try it before installing
→ **[Try Demo](https://openclawfice.com/?demo=true)** (no install, 10 seconds)  
→ [WHAT-IS-THIS.md](./WHAT-IS-THIS.md) (visual walkthrough)

### Install OpenClawfice
→ **[README.md](./README.md)** (start here)  
→ [INSTALL.md](./INSTALL.md) (step-by-step)  
→ [app/install/page.tsx](./app/install/page.tsx) (web version)

### Get productive quickly
→ [FIRST-5-MINUTES.md](./FIRST-5-MINUTES.md) (quickstart)  
→ [GET-PRODUCTIVE.md](./GET-PRODUCTIVE.md) (real workflows)  
→ [KEYBOARD-SHORTCUTS.md](./KEYBOARD-SHORTCUTS.md) (power user)

### Customize my office
→ [README.md](./README.md#configuration) (config examples)  
→ [STATUS-FILES.md](./STATUS-FILES.md) (API reference)  
→ [OFFICE.md](./OFFICE.md) (template for agents)

### Fix a problem
→ **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** (common issues)  
→ [GET-HELP.md](./GET-HELP.md) (where to ask)  
→ [GitHub Issues](https://github.com/openclawfice/openclawfice/issues)

### Contribute
→ [CONTRIBUTING.md](./CONTRIBUTING.md) (how to help)  
→ [CONTRIBUTING_QUICK_START.md](./CONTRIBUTING_QUICK_START.md) (fast track)  
→ [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) (community rules)

### Understand a feature
→ [COOL-FEATURES.md](./COOL-FEATURES.md) (hidden gems)  
→ [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md) (all docs organized)  
→ [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) (one-page cheatsheet)

---

## 🆘 I'm stuck...

### Install failed
→ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#installation-issues)  
→ `npm install` errors → Try `npm install --legacy-peer-deps`  
→ Port 3333 in use → `PORT=3334 openclawfice`

### Page won't load
→ Check: Is `openclawfice` running? (Terminal should show "Ready")  
→ Check: http://localhost:3333 (not https)  
→ Try: Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

### No agents showing
→ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#no-agents-detected)  
→ Check: Is OpenClaw installed? (`ls ~/.openclaw/openclaw.json`)  
→ Check: Are agents running? (Send a message in OpenClaw)  
→ Try: [Demo mode](http://localhost:3333/?demo=true) to verify app works

### Feature not working
→ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) (check common issues)  
→ [GET-HELP.md](./GET-HELP.md#bug-reporting) (how to report)  
→ [GitHub Issues](https://github.com/openclawfice/openclawfice/issues) (search existing)

### "How do I...?"
→ [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) (one-page answers)  
→ [COOL-FEATURES.md](./COOL-FEATURES.md) (feature guide)  
→ [KEYBOARD-SHORTCUTS.md](./KEYBOARD-SHORTCUTS.md) (all shortcuts)

---

## 🚀 I'm launching...

### Pre-Launch (Tyler - before posting)
→ **[LAUNCH-DAY-CHECKLIST.md](./LAUNCH-DAY-CHECKLIST.md)** (5-min verification)  
→ [LAUNCH-IN-5-MINUTES.md](./LAUNCH-IN-5-MINUTES.md) (copy/paste launch)  
→ [.github/RELEASE_TEMPLATE.md](./.github/RELEASE_TEMPLATE.md) (GitHub release)

### Launch Day (Hours 0-6)
→ **[POST-LAUNCH-MONITORING.md](./POST-LAUNCH-MONITORING.md)** (what to watch)  
→ [SOCIAL-MEDIA-TEMPLATES.md](./SOCIAL-MEDIA-TEMPLATES.md) (ready-to-post)  
→ [FIRST-24-HOURS-PLAYBOOK.md](./FIRST-24-HOURS-PLAYBOOK.md) (marketing tactics)

### Days 2-7 (Build momentum)
→ **[WEEK-ONE-AFTER-LAUNCH.md](./WEEK-ONE-AFTER-LAUNCH.md)** (day-by-day plan)  
→ [docs/QUICK-WIN-IMPROVEMENTS.md](./docs/QUICK-WIN-IMPROVEMENTS.md) (features to ship)  
→ [VIRAL-LAUNCH-COPY.md](./VIRAL-LAUNCH-COPY.md) (messaging guide)

### Responding to feedback
→ [POST-LAUNCH-MONITORING.md](./POST-LAUNCH-MONITORING.md#response-templates)  
→ [GET-HELP.md](./GET-HELP.md#community-support) (support strategy)  
→ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) (link users here)

---

## 🛠️ I'm building...

### Understanding the codebase
→ [README.md](./README.md#how-it-works) (architecture)  
→ [STATUS-FILES.md](./STATUS-FILES.md) (API reference)  
→ [docs/XP-CELEBRATION-SPEC.md](./docs/XP-CELEBRATION-SPEC.md) (feature example)

### Adding a feature
→ [CONTRIBUTING.md](./CONTRIBUTING.md) (contribution guide)  
→ [docs/QUICK-WIN-IMPROVEMENTS.md](./docs/QUICK-WIN-IMPROVEMENTS.md) (ideas)  
→ [docs/FIRST-RUN-OPTIMIZATION.md](./docs/FIRST-RUN-OPTIMIZATION.md) (UX guide)

### Fixing a bug
→ [CONTRIBUTING_QUICK_START.md](./CONTRIBUTING_QUICK_START.md) (fast start)  
→ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) (known issues)  
→ [POST-LAUNCH-MONITORING.md](./POST-LAUNCH-MONITORING.md#quick-fix-procedures)

### Writing documentation
→ [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md) (existing docs)  
→ This file (DOCS-MAP.md) - update me when adding new docs!  
→ Link from README.md for discoverability

### Testing
→ Demo mode: `http://localhost:3333/?demo=true`  
→ Production build: `npm run build`  
→ Mobile: Use browser dev tools (Cmd+Opt+I → device toolbar)

---

## 📚 All Docs (A-Z)

### Core Documentation
- **[README.md](./README.md)** - Start here (install, features, config)
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [LICENSE](./LICENSE) - AGPL-3.0
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community guidelines

### Getting Started
- [WHAT-IS-THIS.md](./WHAT-IS-THIS.md) - Visual intro for new users
- [WHY-OPENCLAWFICE.md](./WHY-OPENCLAWFICE.md) - Value proposition
- [INSTALL.md](./INSTALL.md) - Installation guide
- [FIRST-5-MINUTES.md](./FIRST-5-MINUTES.md) - Quickstart tutorial

### Using OpenClawfice
- [GET-PRODUCTIVE.md](./GET-PRODUCTIVE.md) - Real workflows
- [COOL-FEATURES.md](./COOL-FEATURES.md) - Hidden gems
- [KEYBOARD-SHORTCUTS.md](./KEYBOARD-SHORTCUTS.md) - All shortcuts
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - One-page cheatsheet
- [STATUS-FILES.md](./STATUS-FILES.md) - API reference

### Help & Support
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [GET-HELP.md](./GET-HELP.md) - Where to get support
- [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md) - All docs organized

### Contributing
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [CONTRIBUTING_QUICK_START.md](./CONTRIBUTING_QUICK_START.md) - Fast track
- [OFFICE.md](./OFFICE.md) - Agent integration template

### Launch Resources (Tyler)
- [LAUNCH-DAY-CHECKLIST.md](./LAUNCH-DAY-CHECKLIST.md) - Pre-launch verification
- [LAUNCH-IN-5-MINUTES.md](./LAUNCH-IN-5-MINUTES.md) - Quick launch steps
- [POST-LAUNCH-MONITORING.md](./POST-LAUNCH-MONITORING.md) - First 48 hours
- [WEEK-ONE-AFTER-LAUNCH.md](./WEEK-ONE-AFTER-LAUNCH.md) - Days 2-7
- [FIRST-24-HOURS-PLAYBOOK.md](./FIRST-24-HOURS-PLAYBOOK.md) - Marketing tactics
- [SOCIAL-MEDIA-TEMPLATES.md](./SOCIAL-MEDIA-TEMPLATES.md) - Ready-to-post content
- [VIRAL-LAUNCH-COPY.md](./VIRAL-LAUNCH-COPY.md) - Messaging guide

### Technical Specs
- [docs/XP-CELEBRATION-SPEC.md](./docs/XP-CELEBRATION-SPEC.md) - Feature spec example
- [docs/QUICK-WIN-IMPROVEMENTS.md](./docs/QUICK-WIN-IMPROVEMENTS.md) - Feature backlog
- [docs/FIRST-RUN-OPTIMIZATION.md](./docs/FIRST-RUN-OPTIMIZATION.md) - UX guide
- [docs/DEMO-MODE-INTEGRATION.md](./docs/DEMO-MODE-INTEGRATION.md) - Demo implementation

### Internal/Team Docs
- [docs/internal/](./docs/internal/) - Planning, strategy, team notes (43 files)
- [.github/RELEASE_TEMPLATE.md](./.github/RELEASE_TEMPLATE.md) - Release notes template

---

## 🔍 Search by Topic

### Installation
- Install guide → [INSTALL.md](./INSTALL.md)
- Install failed → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#installation-issues)
- Install script → [public/install.sh](./public/install.sh)
- Prerequisites → [INSTALL.md](./INSTALL.md#prerequisites)

### Configuration
- Config overview → [README.md](./README.md#configuration)
- Agent customization → [README.md](./README.md#configuration)
- API reference → [STATUS-FILES.md](./STATUS-FILES.md)
- Agent integration → [OFFICE.md](./OFFICE.md)

### Features
- All features → [README.md](./README.md#what-you-get)
- Cool features → [COOL-FEATURES.md](./COOL-FEATURES.md)
- XP celebrations → [docs/XP-CELEBRATION-SPEC.md](./docs/XP-CELEBRATION-SPEC.md)
- Quest templates → [COOL-FEATURES.md](./COOL-FEATURES.md#quest-templates)
- Keyboard shortcuts → [KEYBOARD-SHORTCUTS.md](./KEYBOARD-SHORTCUTS.md)

### Troubleshooting
- Common issues → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- No agents → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#no-agents-detected)
- Port conflicts → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#port-already-in-use)
- Performance → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#performance-issues)

### Development
- Contributing → [CONTRIBUTING.md](./CONTRIBUTING.md)
- Quick start → [CONTRIBUTING_QUICK_START.md](./CONTRIBUTING_QUICK_START.md)
- Feature ideas → [docs/QUICK-WIN-IMPROVEMENTS.md](./docs/QUICK-WIN-IMPROVEMENTS.md)
- Bug fixes → [POST-LAUNCH-MONITORING.md](./POST-LAUNCH-MONITORING.md#quick-fix-procedures)

### Launch
- Pre-launch → [LAUNCH-DAY-CHECKLIST.md](./LAUNCH-DAY-CHECKLIST.md)
- Launch now → [LAUNCH-IN-5-MINUTES.md](./LAUNCH-IN-5-MINUTES.md)
- Post-launch → [POST-LAUNCH-MONITORING.md](./POST-LAUNCH-MONITORING.md)
- Week one → [WEEK-ONE-AFTER-LAUNCH.md](./WEEK-ONE-AFTER-LAUNCH.md)

---

## 💡 Pro Tips

### For New Users
1. Start with [WHAT-IS-THIS.md](./WHAT-IS-THIS.md) (visual intro)
2. Try [demo mode](https://openclawfice.com/?demo=true) (10 seconds)
3. Read [FIRST-5-MINUTES.md](./FIRST-5-MINUTES.md) (after installing)
4. Bookmark [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) (one-pager)

### For Power Users
1. Learn [keyboard shortcuts](./KEYBOARD-SHORTCUTS.md) (30 sec → save hours)
2. Read [COOL-FEATURES.md](./COOL-FEATURES.md) (hidden gems)
3. Explore [STATUS-FILES.md](./STATUS-FILES.md) (API for automation)
4. Check [docs/QUICK-WIN-IMPROVEMENTS.md](./docs/QUICK-WIN-IMPROVEMENTS.md) (upcoming features)

### For Contributors
1. Read [CONTRIBUTING_QUICK_START.md](./CONTRIBUTING_QUICK_START.md) (10 min start)
2. Pick a feature from [docs/QUICK-WIN-IMPROVEMENTS.md](./docs/QUICK-WIN-IMPROVEMENTS.md)
3. Follow [CONTRIBUTING.md](./CONTRIBUTING.md) (full guidelines)
4. Check [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) (be kind!)

### For Tyler (Launch)
1. **Day 0:** Read [LAUNCH-IN-5-MINUTES.md](./LAUNCH-IN-5-MINUTES.md) → Execute
2. **Hours 0-6:** Monitor [POST-LAUNCH-MONITORING.md](./POST-LAUNCH-MONITORING.md)
3. **Days 2-7:** Follow [WEEK-ONE-AFTER-LAUNCH.md](./WEEK-ONE-AFTER-LAUNCH.md)
4. **Ship 1 quick win/day:** Use [docs/QUICK-WIN-IMPROVEMENTS.md](./docs/QUICK-WIN-IMPROVEMENTS.md)

---

## 🎯 Decision Tree

```
WHERE DO I START?
│
├─ Never heard of this?
│  └─ Read: WHAT-IS-THIS.md → Try: Demo mode
│
├─ Want to try it?
│  └─ Read: README.md → Run: curl install.sh
│
├─ Just installed?
│  └─ Read: FIRST-5-MINUTES.md
│
├─ Want to do real work?
│  └─ Read: GET-PRODUCTIVE.md
│
├─ Something broke?
│  └─ Read: TROUBLESHOOTING.md
│
├─ Want to customize?
│  └─ Read: README.md#configuration
│
├─ Want to contribute?
│  └─ Read: CONTRIBUTING_QUICK_START.md
│
└─ Launching OpenClawfice?
   └─ Read: LAUNCH-DAY-CHECKLIST.md
```

---

## 📊 Documentation Stats

- **Total docs:** 91 markdown files
- **Core guides:** 15+ user-facing docs
- **Total content:** ~200KB of documentation
- **Launch guides:** 10+ specific to launch/post-launch
- **Internal docs:** 43 in `docs/internal/`

**Most important 5 docs:**
1. [README.md](./README.md) - Start here
2. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - When stuck
3. [FIRST-5-MINUTES.md](./FIRST-5-MINUTES.md) - After install
4. [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - Quick answers
5. [CONTRIBUTING.md](./CONTRIBUTING.md) - Want to help

---

## 🔄 Keeping This Updated

When you add a new doc:

1. Add it to this file (appropriate section)
2. Link from README.md if user-facing
3. Update [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)
4. Consider adding to [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)

---

**Can't find what you need?**

- Search all docs: `grep -r "search term" *.md docs/*.md`
- Check [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md) (organized by topic)
- Ask in [Discord](https://discord.com/invite/clawd) or [GitHub Discussions](https://github.com/openclawfice/openclawfice/discussions)

**Found this helpful?** Star the repo and share with a friend! ⭐
