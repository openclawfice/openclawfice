# ✅ Launch Day Checklist

**Simple go/no-go checklist. Complete this in 10 minutes before launching.**

---

## Pre-Launch Verification (5 minutes)

### Product
- [ ] Demo works: https://openclawfice.com/?demo=true
- [ ] Trading cards generate: Click agent → 🎴 button → Download
- [ ] Stats dashboard loads: https://openclawfice.com/stats
- [ ] Landing page loads: https://openclawfice.com
- [ ] Demo GIF exists: `public/openclawfice-demo.gif` (< 1MB)

### Documentation
- [ ] README has demo GIF
- [ ] Install instructions work: `curl -fsSL https://openclawfice.com/install.sh | bash`
- [ ] Docs index accessible: https://openclawfice.com/docs (or GitHub)
- [ ] No internal refs leaked: Search docs for "Wing AI", "~/clawd", sensitive paths

### Social Assets
- [ ] Discord post ready: See `docs/LAUNCH-NOW-SIMPLE.md`
- [ ] Tweet ready: See `docs/LAUNCH-NOW-SIMPLE.md`
- [ ] Demo GIF uploaded somewhere (ready to attach to tweet)

---

## Launch Actions (2 minutes)

### 1. Discord Post
**Go to:** OpenClaw Discord → #announcements

**Copy-paste from:** `docs/LAUNCH-NOW-SIMPLE.md` (Discord section)

**Verify:** Post includes demo link + install command

---

### 2. Tweet
**Go to:** Twitter.com

**Attach:** `public/openclawfice-demo.gif`

**Copy-paste from:** `docs/LAUNCH-NOW-SIMPLE.md` (Twitter section)

**Verify:** Includes demo link + GitHub link

---

## First Hour Actions (as they happen)

**Follow:** `docs/POST-LAUNCH-FIRST-HOUR-CHECKLIST.md`

**Key tasks:**
- [ ] Monitor Discord replies (respond within 5 min)
- [ ] Monitor Twitter mentions (like + reply to all)
- [ ] Watch GitHub stars (if setup)
- [ ] Fix critical bugs immediately

---

## Optional (If Time)

- [ ] Post to Reddit: r/selfhosted, r/homelab
- [ ] Post to Hacker News: See `docs/internal/HACKER-NEWS-SHOW-HN-POST.md`
- [ ] Create GitHub repo: See `docs/GITHUB-SETUP.md`
- [ ] Email friends/colleagues

---

## If Something Breaks

### Demo not loading
**Check:**
```bash
curl -I https://openclawfice.com/?demo=true
```

**If 500 error:** Check Vercel logs, redeploy if needed

---

### Install script fails
**Fallback instructions:**
```bash
git clone https://github.com/openclawfice/openclawfice.git
cd openclawfice
npm install
npm run dev
```

**Post this in replies if anyone reports install issues.**

---

### GitHub repo not ready
**Skip GitHub for now.** Launch on Discord + Twitter first.

**Set up GitHub later:** See `docs/GITHUB-SETUP.md` (3 minutes)

---

## Go/No-Go Decision

**GO if:**
- ✅ Demo works
- ✅ You have Discord + Twitter posts ready
- ✅ You can monitor for 1 hour after launch

**NO-GO if:**
- ❌ Demo is broken
- ❌ Install script doesn't work
- ❌ You can't monitor replies (reschedule launch)

---

## Time Estimate

**Pre-launch verification:** 5 minutes  
**Launch actions:** 2 minutes  
**First hour monitoring:** 60 minutes  

**Total:** ~70 minutes

---

## Success Metrics (First 24 Hours)

**Minimum success:**
- 10+ Discord reactions
- 5+ Twitter likes
- 2+ demo visitors

**Good launch:**
- 50+ Discord reactions
- 20+ Twitter likes
- 50+ demo visitors
- 1-2 GitHub issues/questions

**Viral launch:**
- 100+ Discord reactions
- 100+ Twitter likes/retweets
- 500+ demo visitors
- 10+ GitHub stars (if repo live)

---

## Post-Launch

**Within 24 hours:**
- [ ] Respond to all comments/questions
- [ ] Fix any reported bugs
- [ ] Thank early supporters

**Within 1 week:**
- [ ] Post weekly recap (see `docs/GO-VIRAL-PLAYBOOK.md`)
- [ ] Generate trading card of top agent
- [ ] Share stats dashboard screenshot

---

**Questions?** See `docs/LAUNCH-NOW-SIMPLE.md` or `docs/POST-LAUNCH-FIRST-HOUR-CHECKLIST.md`

**Ready?** Let's launch! 🚀
