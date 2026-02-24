# Post-Launch First Hour Checklist

**You just launched OpenClawfice! Here's what to do in the next 60 minutes.**

---

## Minute 0-5: Monitor Initial Reactions

### Discord
✅ Watch #announcements for:
- Reactions (❤️, 🔥, 👀, ✅)
- Comments/questions
- Bug reports

**Action:** Reply to EVERY comment within 5 minutes
- "Thanks for trying it!"
- "Let me know if you hit any issues"
- "What features would you want to see?"

### Twitter
✅ Watch for:
- Likes (refresh every 30 seconds)
- Retweets
- Replies
- Quote tweets

**Action:** Like + reply to every interaction

---

## Minute 5-15: Quick Triage

### If Someone Reports a Bug

**Priority triage:**
1. **Critical** (app won't start, crashes immediately) → Fix NOW
2. **High** (feature broken, bad UX) → Note for today
3. **Low** (polish, edge cases) → Note for week 1

**Response template:**
```
Thanks for reporting! Can you share:
- OS (Mac/Linux/Windows)
- Node version (node --version)
- Error message or screenshot

I'll fix ASAP.
```

### If Someone Asks "What's OpenClaw?"

**Copy-paste response:**
```
OpenClaw is a local AI agent framework (like AutoGPT but better).

OpenClawfice is a visual dashboard that shows what your agents are doing in real-time - think The Sims, but for AI agents.

Try the demo (no install): https://openclawfice.com/?demo=true
```

---

## Minute 15-30: Cross-Post to Reddit

### If Getting Good Traction (10+ reactions)

**Post to r/LocalLLaMA:**

**Title:** "I built a pixel art dashboard for my AI agents (like The Sims meets AI ops)"

**Body:**
```
I've been using OpenClaw for AI agents but had zero visibility into what they were doing.

Built OpenClawfice to solve this:
- Agents as pixel art NPCs in an office
- See who's working vs idle in real-time
- Quest log for pending decisions
- Water cooler chat between agents
- Accomplishment feed (what shipped today)
- Meeting rooms when agents collaborate

[Screenshot of your office]

Demo (no install): https://openclawfice.com/?demo=true
GitHub: https://github.com/openclawfice/openclawfice

Open source, MIT licensed. Would love feedback!
```

**Also post to:**
- r/SideProject (same post, different audience)
- r/ProductHuntDev (if you want ProductHunt prep feedback)

---

## Minute 30-45: Approve Outreach Batch & Highlight Viral Features

### Decision Point: 16 Email Batch

**Recommendation:** Reply "Send all 16" to Scout's quest

**Why now:**
- Post-launch momentum = perfect timing
- "Just launched" narrative in emails
- Time-sensitive (7 follow-ups at 6-7 days)
- 16.1M reach, 2-4 expected responses

**Scout executes in 20 minutes**, you monitor responses over next week.

**See:** `POST-LAUNCH-OUTREACH-PRIORITY.md` for full analysis

### NEW: Call Out Viral Features in Replies

When people engage, mention these hooks:

**Leaderboard (🏆):**
- "Check out /leaderboard to see agent rankings!"
- "My top agent has 4500 XP - what's yours?"
- "The leaderboard updates live every 10 seconds"

**GitHub Stars (⭐):**
- Live counter in header creates FOMO
- "Already at X stars in first hour!"
- Encourage starring: "Hit that ⭐ if you like it"

These features drive engagement + sharing = viral growth

---

## Minute 45-60: GitHub Housekeeping

### Add Repo Description + Topics (30 seconds)

**Quick guide:** See `docs/GITHUB-REPO-SETUP-30-SECONDS.md` for step-by-step

**Or do it manually:**

Go to: https://github.com/openclawfice/openclawfice → Settings

**Description:**
```
Your AI agents, but they're Sims 🏢 Pixel art virtual office for OpenClaw agents
```

**Website:**
```
https://openclawfice.com
```

**Topics (add 13 tags):**
`openclaw`, `ai-agents`, `pixel-art`, `dashboard`, `office`, `retro`, `sims`, `agent-management`, `automation`, `developer-tools`, `nextjs`, `typescript`, `open-source`

**Bonus:** Approve Vercel GitHub App (pending in org settings)

**Why:** 10x improvement in GitHub discoverability

**Pro tip:** The live GitHub star counter in the header (⭐) will start growing immediately. Screenshot it throughout the day as social proof: "10 stars → 50 stars → 100 stars!"

### Pin the Repo

Go to: Your GitHub profile → Pinned repositories → Pin openclawfice

**Why:** Shows up at top of your profile, increases visibility

---

## Hour 1 Summary

**If you did everything above:**
✅ Responded to all early reactions  
✅ Triaged any bugs  
✅ Cross-posted to Reddit (if getting traction)  
✅ Approved 16 email outreach batch  
✅ Fixed GitHub repo metadata  

**You're now set up for the next 24 hours.**

---

## What NOT to Do

❌ **Don't stress about low initial numbers** - tech launches are slow
❌ **Don't delete/edit your posts** - let them breathe for 24h
❌ **Don't spam multiple subreddits at once** - space them 2-4 hours apart
❌ **Don't argue with critics** - thank constructive feedback, ignore trolls
❌ **Don't make big product changes** - collect feedback first, ship later

---

## Next Steps

**Hour 2-6:** Monitor + respond (see `FIRST-24-HOURS-PLAYBOOK.md`)

**Day 2-7:** Growth + iteration (see `WEEK-1-GROWTH-PLAYBOOK.md`)

**Week 2+:** Scale (see `POST-LAUNCH-ROADMAP.md`)

---

## Emergency Contacts

**Demo site down?**
```bash
# Check Vercel dashboard
# Or redeploy from main branch
```

**Install broken?**
```bash
# Send users to:
git clone https://github.com/openclawfice/openclawfice.git
cd openclawfice
npm install
npm run dev
```

**Major bug?**
```bash
cd ~/clawd-openclawfice/openclawfice
# Fix it
git commit -m "hotfix: [bug]"
git push
# Redeploy if needed
```

---

**You got this! 🚀**

Now go monitor those channels and respond to everyone who tries it.
