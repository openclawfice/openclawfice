# ✅ Pre-Launch Checklist

**Use this 5-minute checklist RIGHT BEFORE you post to Discord/Twitter/HN**

---

## 🚦 Critical Checks (Must Pass)

### 1. Demo Mode Works
```bash
# Open in browser
open "http://localhost:3333/?demo=true"

# OR if server isn't running:
cd ~/clawd-openclawfice/openclawfice
npm run dev
sleep 5
open "http://localhost:3333/?demo=true"
```

**✅ Success criteria:**
- [ ] Purple "Demo Mode" banner appears at top
- [ ] 5 agents visible (Nova, Forge, Lens, Pixel, Cipher)
- [ ] Agents are in Work Room and/or Meeting Room
- [ ] Quest log shows pending quests
- [ ] Accomplishments feed has recent items
- [ ] Water cooler shows chat messages
- [ ] Click an agent → Detail panel opens
- [ ] "Install OpenClawfice" button works

**❌ If broken:** Fix before launching (this is the first thing people see!)

---

### 2. Install Script Works
```bash
# Test install script (dry run, won't actually install)
curl -fsSL https://openclawfice.com/install.sh | head -20

# OR if not deployed yet, test local:
cat ~/clawd-openclawfice/openclawfice/scripts/install.sh | head -20
```

**✅ Success criteria:**
- [ ] Script exists and is readable
- [ ] No syntax errors
- [ ] Has clear instructions

**❌ If broken:** People won't be able to install. Must fix.

---

### 3. README Looks Good
```bash
# Open README in browser (GitHub will render it)
open https://github.com/openclawfice/openclawfice/blob/main/README.md

# OR locally:
open ~/clawd-openclawfice/openclawfice/README.md
```

**✅ Success criteria:**
- [ ] Screenshot shows at top
- [ ] "Try the Demo" link is prominent
- [ ] Quick Start section is clear
- [ ] Features list is complete
- [ ] No broken links
- [ ] No placeholder text (no "TODO", "COMING SOON", etc.)

**❌ If broken:** First impression on GitHub. Fix typos/broken links.

---

### 4. Social Preview Images
```bash
# Check if OG image exists
ls -lh ~/clawd-openclawfice/openclawfice/public/og-image.png

# Check if favicon exists
ls -lh ~/clawd-openclawfice/openclawfice/public/icon.svg
```

**✅ Success criteria:**
- [ ] `og-image.png` exists (1200×630px, <500KB)
- [ ] `icon.svg` or `favicon.ico` exists
- [ ] Images look good (not corrupted)

**⚠️ If missing:** Not critical but social shares won't look as good. Can launch anyway.

---

### 5. Package.json is Correct
```bash
cd ~/clawd-openclawfice/openclawfice
cat package.json | jq '.name, .version, .description, .keywords' 2>/dev/null
```

**✅ Success criteria:**
- [ ] Name is "openclawfice" (lowercase, one word)
- [ ] Version is "1.0.0" or similar (not "0.0.1")
- [ ] Description is compelling
- [ ] Keywords include: openclaw, ai, agents, dashboard, pixel-art

**⚠️ If wrong:** Update before npm publish (but can launch GitHub first)

---

### 6. No Obvious Bugs
```bash
# Check for common issues
cd ~/clawd-openclawfice/openclawfice
npm run build

# Look for TypeScript errors
```

**✅ Success criteria:**
- [ ] Build succeeds with no errors
- [ ] Only warnings allowed (no red "ERROR" messages)
- [ ] Dev server runs without crashes

**❌ If build fails:** Fix before launching. Broken build = bad first impression.

---

## 📝 Marketing Copy Ready

### 7. Discord Post Ready
```bash
# Read the pre-written post
cat ~/clawd-openclawfice/openclawfice/LAUNCH-IN-5-MINUTES.md | grep -A 30 "Discord Post"
```

**✅ Success criteria:**
- [ ] Post is copy/paste ready
- [ ] Demo link is correct
- [ ] GitHub link is correct
- [ ] Tone is humble/friendly (not sales-y)

**✅ Good to go:** Just copy and paste!

---

### 8. Twitter Thread Ready
```bash
# Read the pre-written thread
cat ~/clawd-openclawfice/openclawfice/TWITTER-THREAD.md | head -50
```

**✅ Success criteria:**
- [ ] Thread has 8-10 tweets
- [ ] First tweet has hook + demo link
- [ ] Last tweet has GitHub link
- [ ] Screenshots/GIF attached (if ready)

**✅ Good to go:** Copy thread, paste into Twitter, add images, send!

---

## 🎯 Optional (Nice to Have)

### 9. Demo GIF Ready
```bash
# Check if demo GIF exists
ls -lh ~/clawd-openclawfice/openclawfice/public/openclawfice-demo.gif
```

**✅ If exists:**
- [ ] Under 5MB (critical for Twitter)
- [ ] Shows 10-15 seconds of demo
- [ ] Loops smoothly

**⚠️ If missing:** Can launch without it, but Twitter engagement will be 3x lower. Consider waiting if Pixel is close to done.

---

### 10. Hacker News Post Ready
```bash
# Check if HN title is prepared
grep "Show HN" ~/clawd-openclawfice/openclawfice/LAUNCH.md
```

**✅ If ready:**
- [ ] Title: "Show HN: OpenClawfice – Pixel art office for AI agents"
- [ ] Demo link in first comment
- [ ] Humble tone ("I built this", not "We're launching")

**⚠️ Optional:** HN can wait until day 2-3. Launch Discord + Twitter first.

---

## 🚀 Final Pre-Flight Check (30 seconds)

**Right before you click "Send":**

1. ✅ Demo mode loads in browser
2. ✅ README looks good on GitHub
3. ✅ Discord post is copied to clipboard
4. ✅ Twitter thread is drafted (ready to send)
5. ✅ You're mentally prepared for feedback (positive + negative)

**If all 5 are ✅ → LAUNCH! 🚀**

---

## 🎉 Launch Sequence (5 Minutes)

### Step 1: Discord (1 minute)
1. Open Discord → #projects channel
2. Paste Discord post from LAUNCH-IN-5-MINUTES.md
3. Click Send
4. Pin the post (optional)

### Step 2: Twitter (2 minutes)
1. Open Twitter
2. Create thread (paste from TWITTER-THREAD.md)
3. Attach demo GIF (if ready) to first tweet
4. Attach screenshot to tweet 3-4
5. Review quickly
6. **Click Send All**

### Step 3: Monitor (2 minutes)
1. Open Discord in one tab
2. Open Twitter notifications in another
3. Set timer for 30 minutes
4. Respond to EVERY comment/question within 30 min

---

## ⏰ Post-Launch (First Hour)

**What to watch:**
- Discord replies (respond within 15 min)
- Twitter engagement (like + reply to everyone)
- GitHub stars (refresh every 10 min)
- Demo mode traffic (check if it's slow)

**Quick wins:**
- Thank everyone who replies
- Fix any obvious bugs immediately
- Screenshot positive reactions → share them

---

## 🆘 Emergency Rollback

**If something goes catastrophically wrong:**

### Option 1: Take Demo Offline
```bash
# Edit demo API to return maintenance message
echo '{"error":"Demo temporarily offline, check back in 30 min"}' > /tmp/demo-maintenance.json
```

### Option 2: Delete Posts
- Discord: Right-click → Delete Message
- Twitter: Tweet menu → Delete
- Add comment: "Found a critical bug, fixing now, back in 1 hour!"

### Option 3: Fix + Re-launch
- Fix the bug locally
- Test thoroughly
- Git commit + push
- Re-launch with: "Fixed! OpenClawfice is live 🚀 (sorry for the false start)"

**Remember:** Honesty > perfection. People forgive bugs if you're transparent.

---

## 🎯 Success Metrics (First 24 Hours)

**Check these tomorrow:**
- [ ] 50+ GitHub stars (great: 100+)
- [ ] 25+ npm installs (great: 50+)
- [ ] 10+ Discord replies (great: 25+)
- [ ] 5+ positive testimonials (great: 10+)
- [ ] 0 breaking bugs (great: 0 bugs at all)

**If below targets:** Don't panic. Review FIRST-48-HOURS.md for recovery tactics.

---

## 📚 Reference Docs

**Before launch:**
- [LAUNCH-IN-5-MINUTES.md](./LAUNCH-IN-5-MINUTES.md) — Copy/paste marketing
- [PRE-LAUNCH-CHECKLIST.md](./PRE-LAUNCH-CHECKLIST.md) — This file!

**During launch:**
- [FIRST-48-HOURS.md](./FIRST-48-HOURS.md) — Response playbook

**After launch:**
- [COMMUNITY-GROWTH.md](./COMMUNITY-GROWTH.md) — Long-term strategy
- [GOOD-FIRST-ISSUES.md](./GOOD-FIRST-ISSUES.md) — Attract contributors

---

## ✅ You're Ready!

If you've checked everything above and all critical items pass:

**→ You're 100% ready to launch.**

No more prep. No more planning. Just copy the Discord post and click send.

**Good luck! 🚀**

---

_P.S. After you launch, come back and check the box:_

- [ ] **LAUNCHED!** (Date: ___________ Time: _________)
