# 🚨 Launch Emergency Kit

**One file. Everything you need in the first 60 minutes after launch.**

Keep this open in a tab. Bookmark it. Print it. When something breaks or goes viral, you'll know exactly what to do.

---

## ⏱️ First 60 Minutes Timeline

### Minutes 0-5: Launch
- [ ] Post to Discord (copy from LAUNCH-IN-5-MINUTES.md)
- [ ] Tweet (copy from SOCIAL-MEDIA-TEMPLATES.md)
- [ ] Verify demo mode works: https://openclawfice.com/?demo=true
- [ ] Set phone timer: Check in 30 minutes

### Minutes 5-30: Monitor
- [ ] Watch Discord for reactions
- [ ] Check Twitter notifications
- [ ] Test install: `curl -fsSL https://openclawfice.com/install.sh | bash`
- [ ] Monitor server: `curl http://localhost:3333/api/office`

### Minutes 30-60: Respond
- [ ] Reply to all Discord messages
- [ ] Reply to all tweets
- [ ] Fix P0 bugs (if any)
- [ ] Retweet positive feedback

---

## 🔥 Critical Issues (Fix in <5 minutes)

### Install Script Fails

**Symptom:** User reports "install.sh failed"

**Quick Diagnosis:**
```bash
# Test install yourself
curl -fsSL https://openclawfice.com/install.sh | bash

# If it fails, check:
cat public/install.sh  # Is the file there?
```

**Quick Fix:**
```bash
# Option 1: Hotfix the script
nano public/install.sh
# Fix the bug
git add public/install.sh
git commit -m "hotfix: install script"
git push

# Option 2: Tell users to clone manually
# Post in Discord:
"Install script issue - use this instead:
git clone https://github.com/openclawfice/openclawfice.git ~/openclawfice
cd ~/openclawfice && npm install && npm run dev"
```

**Response Template:**
```
Sorry! Install script hiccup. Try this:

git clone https://github.com/openclawfice/openclawfice.git ~/openclawfice
cd ~/openclawfice && npm install && npm run dev

Working on a fix now. Will update in 5 min!
```

---

### Demo Mode Broken

**Symptom:** https://openclawfice.com/?demo=true shows error or empty state

**Quick Diagnosis:**
```bash
# Test locally
open http://localhost:3333/?demo=true

# Check if demo API works
curl http://localhost:3333/api/demo
```

**Quick Fix:**
```bash
# If demo API is broken, temporarily redirect to install
# Edit app/page.tsx:
# if (isDemoMode) return <Navigate to="/install" />

# Or fix the actual bug in app/api/demo/route.ts
```

**Response Template:**
```
Demo mode down - fixing now. 

Try installing instead (takes 2 min):
curl -fsSL https://openclawfice.com/install.sh | bash

Demo will be back up in 10 minutes!
```

---

### Production Deploy Failed (Vercel)

**Symptom:** openclawfice.com is down or showing old version

**Quick Diagnosis:**
1. Go to https://vercel.com/[your-project]/deployments
2. Check latest deployment status

**Quick Fix:**
```bash
# If build failed:
# 1. Check error logs in Vercel dashboard
# 2. Fix the error locally
# 3. Push to main (auto-deploys)

# If Vercel is stuck:
# Go to Vercel dashboard → Redeploy
```

**Response Template:**
```
Deploy glitch - back up in 2 min.

Meanwhile try the local install:
curl -fsSL https://openclawfice.com/install.sh | bash

🚀
```

---

### "No Agents Detected"

**Symptom:** User installed but sees empty state

**Quick Diagnosis:**
```bash
# Check if OpenClaw is installed
ls ~/.openclaw/openclaw.json

# Check if agents are configured
cat ~/.openclaw/openclaw.json | jq '.agents.list'
```

**Quick Fix:** This is not a bug - user needs OpenClaw

**Response Template:**
```
OpenClawfice needs OpenClaw to detect agents.

Install OpenClaw first:
https://openclaw.ai

Or try the demo (no install):
https://openclawfice.com/?demo=true

Once OpenClaw is running, refresh OpenClawfice!
```

---

## 💬 Response Templates (Copy/Paste)

### "What is this?"
```
OpenClawfice = pixel art dashboard for your AI agents.

See who's working, who's idle, send tasks, watch them earn XP.

10-second demo: https://openclawfice.com/?demo=true
Visual guide: [link to WHAT-IS-THIS.md]
```

### "Install failed"
```
What error did you see? (paste it here)

Quick checks:
• Node.js 18+? Run: node -v  
• Git installed? Run: git --version

If stuck, try manual install:
git clone https://github.com/openclawfice/openclawfice.git ~/openclawfice
cd ~/openclawfice && npm install && npm run dev
```

### "How do I [X]?"
```
Good question! Check:
• Quick reference: [QUICK-REFERENCE.md]
• Keyboard shortcuts: Press ?
• Full docs: [DOCUMENTATION-INDEX.md]

Can't find it? Let me know and I'll add it to the docs!
```

### "This is awesome!"
```
🎉 Thanks! 

Got a screenshot of your office? Tag us @openclawfice - we'll feature it!

Want to contribute? Check CONTRIBUTING.md

⭐ the repo if you like it: https://github.com/openclawfice/openclawfice
```

### "Found a bug"
```
Thanks for reporting! 

To help me fix it:
1. What did you do? (steps to reproduce)
2. What happened? (error message / screenshot)
3. What did you expect?

File it here: https://github.com/openclawfice/openclawfice/issues

I'll fix P0 bugs in <1 hour!
```

---

## 🛠️ Emergency Fixes (Terminal Ready)

### Kill the dev server
```bash
pkill -f "next dev"
```

### Restart dev server
```bash
cd ~/clawd-openclawfice/openclawfice
npm run dev
```

### Clear build cache
```bash
cd ~/clawd-openclawfice/openclawfice
rm -rf .next
npm run dev
```

### Test production build
```bash
cd ~/clawd-openclawfice/openclawfice
npm run build
# If it succeeds, you're good
```

### Hotfix and deploy
```bash
cd ~/clawd-openclawfice/openclawfice

# 1. Fix the bug
nano [file]

# 2. Test it
npm run dev
# Verify the fix works

# 3. Commit
git add .
git commit -m "hotfix: [description]"
git push origin main

# 4. Vercel auto-deploys (wait 2 min)

# 5. Announce
# Post in Discord: "Fixed! Refresh your browser."
```

### Check if server is running
```bash
curl http://localhost:3333/api/office
# Should return JSON with agents
```

### See recent logs
```bash
tail -50 /tmp/openclawfice-dev.log
```

---

## 📊 Quick Metrics Check

### GitHub Stars
```bash
# Check manually:
open https://github.com/openclawfice/openclawfice

# Or via API:
curl -s https://api.github.com/repos/openclawfice/openclawfice | jq '.stargazers_count'
```

### Demo Mode Traffic (if deployed to Vercel)
```bash
# Check Vercel analytics:
open https://vercel.com/[project]/analytics
```

### Discord Reactions
Look for: 🔥 ❤️ 🚀 👍  
Goal: 10+ reactions in first hour

### Twitter Engagement  
Goal: 20+ likes, 5+ RTs in first hour

---

## 🎯 Success Criteria (First Hour)

**Minimum (everything is fine):**
- 0 critical bugs
- 5+ positive reactions
- 1+ successful install
- Demo mode working

**Strong (going well):**
- 0 critical bugs
- 20+ reactions
- 5+ successful installs
- 1+ GitHub star

**Viral (holy shit):**
- 0 critical bugs
- 50+ reactions
- 15+ successful installs
- 10+ GitHub stars
- Someone tweets "this is amazing"

---

## ⚠️ Red Flags (Fix Immediately)

### "Install doesn't work" (3+ people)
→ Install script is broken. Push hotfix or post manual install steps.

### "Demo mode is down"
→ Demo API failing. Check /api/demo routes. Redeploy if needed.

### "Page won't load"
→ Production build failed or Vercel is down. Check deployment status.

### "This is confusing"
→ Not a bug, but update README if 3+ people say this.

### No reactions after 30 minutes
→ Post might have flopped. Try posting again with better copy.

---

## 🚀 If It Goes Viral

### Hacker News Front Page
1. ✅ Stay calm
2. ✅ Monitor HN comments
3. ✅ Respond to technical questions
4. ✅ Fix bugs mentioned in comments
5. ✅ Post "Thanks HN!" when things calm down

### Twitter Thread Blows Up
1. ✅ Reply to everyone (first 50 people)
2. ✅ Retweet the best reactions
3. ✅ Quote tweet with more tips/features
4. ✅ Pin the thread

### GitHub Stars Explode
1. ✅ Thank contributors
2. ✅ Triage issues (use labels: bug, feature, good-first-issue)
3. ✅ Merge PRs quickly (if quality is good)
4. ✅ Update README with "Featured on [X]" badge

### Server Crashes (Too Much Traffic)
1. ✅ Vercel auto-scales (should be fine)
2. ✅ If demo mode is slow, add caching
3. ✅ Post: "Wow! Server is hot. Working on scaling. Thanks for the love!"

---

## 📱 Keep These Open

**Essential Tabs:**
- Discord: https://discord.com/channels/[openclaw-server]
- Twitter notifications: https://twitter.com/notifications
- GitHub issues: https://github.com/openclawfice/openclawfice/issues
- Vercel dashboard: https://vercel.com/[project]
- This file: LAUNCH-EMERGENCY-KIT.md

**Terminal Windows:**
- Window 1: Dev server running (`npm run dev`)
- Window 2: Ready for hotfixes (`cd ~/clawd-openclawfice/openclawfice`)
- Window 3: Tailing logs (`tail -f /tmp/openclawfice-dev.log`)

---

## 🆘 When to Ask for Help

### Ask Cipher:
- Production build broken
- TypeScript errors
- Performance issues
- API bugs

### Ask Scout:
- Community questions piling up
- Need help responding
- Outreach opportunities

### Ask Nova:
- Overwhelmed with feedback
- Need to prioritize issues
- Strategic decisions

### Ask Pixel:
- Demo GIF needs updating
- Visual bugs
- UX confusion

**How to ask:**
```bash
# Send message to agent
curl -X POST http://localhost:3333/api/office/message \
  -d '{"target":"cipher","message":"[your message]"}'

# Or just @ them in Discord
```

---

## ✅ Post-Launch Checklist (After 60 min)

- [ ] All critical bugs fixed
- [ ] Replied to everyone on Discord
- [ ] Replied to everyone on Twitter
- [ ] Triaged GitHub issues (if any)
- [ ] Updated metrics in spreadsheet
- [ ] Took a breath
- [ ] Celebrated 🎉

---

## 📚 If You Need More Detail

Full guides (read after the first hour):
- [POST-LAUNCH-MONITORING.md](./POST-LAUNCH-MONITORING.md) - First 48 hours
- [WEEK-ONE-AFTER-LAUNCH.md](./WEEK-ONE-AFTER-LAUNCH.md) - Days 2-7
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - All known issues
- [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - One-page answers

---

**Remember:** Bugs happen. Users are forgiving if you respond fast. Fix critical issues in <5 minutes, everything else can wait until tomorrow.

**You got this.** 🚀
