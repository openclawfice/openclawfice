# Getting Help

**Stuck? Can't figure something out? We've got you covered.**

---

## Quick Fixes (Try These First)

### 90% of issues are solved by:

```bash
cd ~/openclawfice
rm -rf .next node_modules
npm install
npm run dev
```

**What this does:**
- Clears all build caches (`.next/`)
- Reinstalls dependencies fresh
- Rebuilds the project
- Starts clean dev server

**Takes 1-2 minutes.** Try this before anything else.

---

## Common Issues & Solutions

### "No agents showing in my office"

**Check 1:** Does OpenClaw config exist?
```bash
cat ~/.openclaw/openclaw.json
```

**If not found:** Create it:
```bash
mkdir -p ~/.openclaw
cat > ~/.openclaw/openclaw.json << 'EOF'
{
  "agents": {
    "list": [
      {
        "id": "main",
        "name": "Assistant",
        "role": "AI Agent",
        "emoji": "🤖",
        "color": "#8b5cf6"
      }
    ]
  }
}
EOF
```

**Check 2:** Is OpenClaw actually installed?
```bash
which openclaw
```

**If not found:** Install OpenClaw first: https://openclaw.ai

**Check 3:** Wake your agents:
```bash
openclaw send --agent main "Hello, are you there?"
```

Then refresh OpenClawfice.

---

### "Port 3333 already in use"

**Find what's using it:**
```bash
lsof -ti:3333
```

**Kill it:**
```bash
lsof -ti:3333 | xargs kill -9
```

**Or use a different port:**
```bash
PORT=3334 npm run dev
```

Then open http://localhost:3334

---

### "Accomplishments not saving"

**Check 1:** Is the server running?
```bash
ps aux | grep "next dev"
```

**If not:** Start it:
```bash
cd ~/openclawfice && npm run dev
```

**Check 2:** Can you reach the API?
```bash
curl http://localhost:3333/api/office/actions
```

**Should return:** `{"actions":[],"accomplishments":[],...}`

**If error:** Server isn't running properly. Try the [Quick Fix](#quick-fixes-try-these-first) above.

---

### "Videos not attaching to accomplishments"

**This is expected!** Videos only attach when:
1. OpenClawfice server is running (`npm run dev`)
2. Accomplishment is logged via the API (not directly to JSON)
3. Rate limit allows it (15-second gap between recordings)

**See full explanation:**
- [ACCOMPLISHMENT-RECORDING-STATUS.md](./ACCOMPLISHMENT-RECORDING-STATUS.md)

**Quick test:**
```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🧪","title":"Test video","who":"Me"}}'
```

Wait 8 seconds, then check:
```bash
ls -lh ~/.openclaw/.status/screenshots/ | tail -1
```

You should see a new `.mp4` file.

---

### "Build failing with weird errors"

**Try the nuclear option:**
```bash
cd ~/openclawfice
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**If still failing:**
- Check Node version: `node --version` (needs v18+)
- Update Node: https://nodejs.org
- Check for TypeScript errors in terminal output
- Open an issue with the full error log

---

### "Agents showing as idle but they're working"

**This is normal!** OpenClawfice detects "working" based on:
- Recent activity in session files (last 5 minutes)
- Tool calls logged in JSONL transcripts
- Task updates from agents

**If an agent worked 6+ minutes ago**, it shows as idle. This is correct.

**To see them "working" again:**
- Send them a new task
- Wait for them to use a tool
- They'll automatically move to Work Room

---

### "Demo mode not working"

**Check URL:** Must include `?demo=true`

**Correct:** `http://localhost:3333/?demo=true`  
**Wrong:** `http://localhost:3333/demo`

**If it still shows real data:**
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Clear cache and reload
- Try incognito/private window

---

### "Keyboard shortcuts not working"

**Make sure:**
- You're not typing in an input field
- No modal is open blocking shortcuts
- You're using the correct keys (case-sensitive)

**View all shortcuts:** Press `?` or click ⚙️ Settings

---

### "Mobile layout looks broken"

**Try:**
- Rotate device (portrait/landscape)
- Zoom out if you zoomed in
- Clear mobile browser cache
- Update browser (needs modern CSS Grid support)

**Known issue:** Very old Android browsers (pre-2020) may not render correctly.

---

## Self-Service Resources

### 📚 Documentation

| Doc | When to Read It |
|-----|-----------------|
| [WHAT-IS-THIS.md](./WHAT-IS-THIS.md) | "What even is OpenClawfice?" |
| [INSTALL.md](./INSTALL.md) | Installation problems |
| [UI-CHEAT-SHEET.md](./UI-CHEAT-SHEET.md) | "What does this button do?" |
| [FIRST-5-MINUTES.md](./docs/FIRST-5-MINUTES.md) | Just installed, now what? |
| [USE-CASES.md](./docs/USE-CASES.md) | "How do I actually use this?" |
| [FAQ.md](./docs/FAQ.md) | General questions |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Deep debugging |

### 🎥 Video Tutorials (Coming Soon)

We're working on:
- 2-minute "What is OpenClawfice?" explainer
- 5-minute setup walkthrough
- 10-minute power user guide

**Want to create one?** We'd love to feature it! See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Community Support

### 💬 Discord

**Best for:**
- Quick questions
- Real-time help
- Sharing screenshots
- Chatting with other users

**Join:** https://discord.com/invite/clawd  
**Channel:** `#general` (or `#openclawfice` if available)

**Typical response time:** Minutes to hours

---

### 🐛 GitHub Issues

**Best for:**
- Bug reports
- Feature requests
- Installation problems that aren't in docs

**Create issue:** https://github.com/openclawfice/openclawfice/issues/new

**Before posting:**
1. Search existing issues (might already be solved)
2. Include:
   - OS and Node version (`node --version`)
   - OpenClawfice version (check `package.json`)
   - Full error logs (terminal output)
   - Steps to reproduce
   - What you expected vs. what happened

**Typical response time:** Hours to days

---

### 💡 GitHub Discussions

**Best for:**
- "How do I...?" questions
- Sharing workflows
- Feature brainstorming
- Show-and-tell (cool setups)

**Start discussion:** https://github.com/openclawfice/openclawfice/discussions

**Typical response time:** Days

---

### 🐦 Twitter/X

**Best for:**
- Quick tips
- Announcements
- Sharing screenshots
- Viral moments

**Tag:** `#OpenClawfice`

**Follow:** [@openclaw](https://twitter.com/openclaw)

**We'll reshare cool setups!**

---

## Reporting Bugs

### What Makes a Great Bug Report

**Bad:**
> "It doesn't work"

**Good:**
> "When I click an agent NPC, the detail panel opens but is blank. Console shows 'Cannot read property name of undefined'. Using Chrome 120, macOS 14, OpenClawfice v0.1.0."

**Include:**
1. **What you did** (step-by-step)
2. **What you expected** (intended behavior)
3. **What happened instead** (actual behavior)
4. **Environment:**
   - OS: macOS / Windows / Linux
   - Browser: Chrome / Firefox / Safari + version
   - Node version: `node --version`
   - OpenClawfice version: Check `package.json`
5. **Error logs:**
   - Browser console (F12 → Console tab)
   - Terminal output (where `npm run dev` is running)
6. **Screenshots** (if UI issue)

**Bonus points:**
- Minimal reproduction (simplest way to trigger bug)
- "This started happening after..." (recent changes)

---

## Feature Requests

### How to Suggest New Features

**We love ideas!** But we prioritize based on:
1. **Viral potential** - Will this make people go "wow" and share it?
2. **Ease of use** - Does it reduce friction for new users?
3. **Productivity** - Does it save time or reveal insights?
4. **Fun factor** - Does it make the experience more delightful?

**Great feature request includes:**
- **Problem:** What frustration does this solve?
- **Solution:** Specific idea (mockups/examples welcome!)
- **Use case:** Real-world scenario
- **Alternatives considered:** Why not just do X instead?

**Example:**
> **Problem:** I have 10 agents and it's hard to find the one I need.
>
> **Solution:** Add a search box at the top that filters agents by name/role as you type.
>
> **Use case:** When an agent pings me on Slack, I want to quickly find them in OpenClawfice to see their status.
>
> **Alternatives:** Could use Cmd+F browser search, but that's clunky.

---

## Contributing (Help Make It Better!)

**You don't need to code to contribute!**

### Non-Code Contributions

- **📝 Improve docs** - Fix typos, add examples, clarify confusing parts
- **🎨 Create tutorials** - Videos, blog posts, guides
- **🐛 Test new features** - Try beta builds, report issues
- **💬 Help others** - Answer questions in Discord/GitHub
- **🎁 Share cool setups** - Screenshots, workflows, tips

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full guide.

### Code Contributions

**Good first issues:** https://github.com/openclawfice/openclawfice/labels/good-first-issue

**Dev setup:**
```bash
git clone https://github.com/openclawfice/openclawfice.git
cd openclawfice
npm install
npm run dev
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code style guide
- How to submit PRs
- Testing checklist
- Review process

---

## Still Stuck?

**If none of the above helped:**

1. **Try the [Quick Fix](#quick-fixes-try-these-first) again** (seriously, it fixes most things)
2. **Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for deep debugging
3. **Ask in Discord** - someone probably hit the same issue
4. **Open a GitHub issue** with all details

**We want you to succeed!** OpenClawfice is useless if you can't get it working. We'll help.

---

## Emergency Contacts

**Critical security issue?** Report via [GitHub Security tab](https://github.com/openclaw/openclawfice/security) or email: security@openclaw.ai  
**Maintainer:** OpenClawfice community

**Business inquiries:** partnerships@openclaw.ai

---

**Remember:** The OpenClawfice community is friendly and helpful. Don't hesitate to ask questions — we were all beginners once! 🚀
