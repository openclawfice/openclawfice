# ✅ Final Launch Verification Checklist

**Run this 5-minute checklist before posting to social media.**

---

## 1. Production Health (2 min)

### Demo Site
- [ ] Visit https://openclawfice.com/?demo=true
- [ ] Verify 5 demo agents appear
- [ ] Click through all 4 rooms (Work Room, Lounge, Quest Log, Accomplishments)
- [ ] Verify particles are animating (60fps smooth)
- [ ] Verify day/night gradient shows correct time-of-day colors
- [ ] Click an NPC → verify mood expression shows (^_^, o_o, O_O, or -_-)

### Landing Page
- [ ] Visit https://openclawfice.com/
- [ ] Verify hero section loads
- [ ] Click "Try Demo" button → should go to `/?demo=true`

### Share Card
- [ ] On demo page, click 📸 button
- [ ] Verify modal opens with share card preview
- [ ] Click "Download" → verify PNG downloads
- [ ] Share card should show: office name, agent count, stats, XP leaderboard

---

## 2. Social Media Previews (1 min)

### Twitter Card
- [ ] Paste https://github.com/openclawfice/openclawfice into https://cards-dev.twitter.com/validator
- [ ] Verify preview shows og-image.png (1200×630)
- [ ] Verify title: "OpenClawfice — Your AI Agents, Pixel Art Style 🏢"
- [ ] Verify description mentions "pixel art NPCs" and "retro virtual office"

### Discord Embed
- [ ] Paste https://openclawfice.com into a Discord DM to yourself
- [ ] Verify rich embed appears with image
- [ ] Verify title and description render correctly

---

## 3. GitHub Presentation (1 min)

### Repository
- [ ] Visit https://github.com/openclawfice/openclawfice
- [ ] Verify README shows demo GIF (openclawfice-demo.gif, ~1MB)
- [ ] Verify all badges are green (License, Version, Security, CodeQL, Next.js, TypeScript)
- [ ] Verify install command is copy-pasteable
- [ ] Verify "Try the live demo →" link works

### Issues & Templates
- [ ] Click "Issues" tab
- [ ] Verify issue templates exist (Bug Report, Feature Request)
- [ ] Templates should have proper formatting and debug info requests

---

## 4. Documentation (30 sec)

### Quick Access
- [ ] docs/FIRST-5-MINUTES.md exists and has no broken links
- [ ] docs/COOL-FEATURES.md exists (new users discover fun stuff)
- [ ] docs/GET-PRODUCTIVE.md exists (shows ROI in 10 minutes)
- [ ] docs/TROUBLESHOOTING-FLOWCHART.md exists (visual debugging)

### Tools
- [ ] http://localhost:3333/viral-templates.html loads (if local server running)
- [ ] http://localhost:3333/verify-deploy.html loads (6 production checks)
- [ ] scripts/quick-fix.sh is executable (`chmod +x` already applied)

---

## 5. Launch Materials (30 sec)

### Discord Post
- [ ] Open docs/internal/LAUNCH-NOW-SIMPLE.md
- [ ] Verify Discord post template is copy-pasteable
- [ ] Should mention: pixel art, mood expressions, daily challenges, meetings, leaderboard, RPG-themed install

### Tweet
- [ ] Same file has tweet template
- [ ] Should include demo link: https://openclawfice.com/?demo=true
- [ ] Should include GitHub link
- [ ] Should be under 280 characters

### Demo GIF
- [ ] public/openclawfice-demo.gif is 954KB-1.1MB (Twitter optimized)
- [ ] Shows Work Room, Lounge, NPCs, particles, expressions

---

## 6. Functionality Spot Checks (1 min)

### On Demo Page
- [ ] Press `?` key → keyboard shortcuts modal appears
- [ ] Press `Esc` → modal closes
- [ ] Click "📝" button → viral templates page opens in new tab
- [ ] Click "🏆" button → leaderboard page loads
- [ ] Click "📞" button (if visible) → call meeting modal opens

### Interactive Elements
- [ ] Click a quest item → expands with details
- [ ] Click an accomplishment → detail modal with screenshot/video
- [ ] Hover over working NPC → thought bubble visible
- [ ] Hover over idle NPC → "On break" / "Reading docs" message visible

---

## Red Flags (Stop Launch If Found)

### Critical Issues
- ❌ Demo page shows "Your virtual office is empty" (should show 5 agents)
- ❌ JavaScript errors in browser console (open DevTools → Console tab)
- ❌ Demo GIF missing from README
- ❌ og-image.png doesn't load (social shares will be ugly)
- ❌ Twitter card validator shows broken image
- ❌ Landing page doesn't load

### Minor Issues (OK to Launch, Fix Later)
- ⚠️ One or two broken internal doc links (already mostly fixed)
- ⚠️ Keyboard shortcut hint not appearing (non-blocking)
- ⚠️ Mobile layout slightly off on very small screens (375px)

---

## Launch Readiness Score

**Check all boxes above. If you get:**

- ✅ **28-30 checks:** READY TO LAUNCH — Ship it!
- ⚠️ **25-27 checks:** Minor issues — Fix in 5 minutes, then launch
- ❌ **<25 checks:** Critical gaps — Investigate before launching

---

## Post-Launch Monitoring (First Hour)

After posting, watch:

1. **GitHub stars** — Expect 5-20 in first hour (viral posts get 50+)
2. **Demo visits** — Check Vercel analytics at https://vercel.com/dashboard
3. **Twitter engagement** — Likes, retweets, replies
4. **Discord reactions** — Pin the post if it gets 5+ 🔥 reactions
5. **Bug reports** — Monitor GitHub Issues and Discord

**Tools:**
- Real-time dashboard: http://localhost:3333/launch-dashboard.html
- Production health: http://localhost:3333/verify-deploy.html
- Deployment flow: http://localhost:3333/deployment-flow-diagram.html

---

## If Something Breaks

### Demo Site Down
```bash
# Check Vercel deployment status
curl -I https://openclawfice.com/?demo=true
# Should return HTTP 200
```

### Install Script Fails
```bash
# Test install script locally
bash scripts/pre-launch-check.sh
# Should show all green ✓
```

### Users Report Bugs
1. Ask for `npx openclawfice doctor` output
2. Direct to docs/TROUBLESHOOTING-FLOWCHART.md
3. Create GitHub issue if new bug
4. Push hotfix if critical (affects >10% of users)

---

## Success Metrics (Week 1)

**Conservative:**
- 100 GitHub stars
- 50 demo visits
- 10 installs
- 2-3 contributors

**Optimistic:**
- 500 GitHub stars
- 500 demo visits
- 50 installs
- 10 contributors
- 1 blog post or tweet from influencer

**Viral:**
- 2,000+ GitHub stars
- 5,000+ demo visits
- 200+ installs
- 50+ contributors
- Front page of Hacker News

---

## Quick Command Reference

```bash
# Start local server
cd ~/clawd-openclawfice/openclawfice && npm run dev

# Verify build
npm run build

# Run diagnostics
bash scripts/quick-fix.sh

# Check TypeScript
npx tsc --noEmit

# Test production demo
curl -I https://openclawfice.com/?demo=true

# View logs (if self-hosted)
pm2 logs openclawfice
```

---

**Time to complete:** 5 minutes  
**Blocker tolerance:** Zero critical issues  
**Confidence threshold:** 28/30 checks passing  

**When ready:** Execute docs/internal/LAUNCH-NOW-SIMPLE.md (2-minute launch)

🚀 **Let's go viral.**
