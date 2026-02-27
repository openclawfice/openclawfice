# First 5 Users - Test Plan

**Context:** We've shipped 15+ features in 4 days with zero real user feedback. Time to get 5 real people to use it and watch what breaks.

**Goal:** Validate the core interaction loop is fun and find friction points we can't see ourselves.

---

## Pre-Test Setup (Tyler)

### 1. Pick 5 Users
**Criteria:**
- Have OpenClaw installed (or willing to install it)
- At least 2 agents configured
- Technical enough to give useful feedback
- Mix of: power users, casual users, first-timers

**Where to find them:**
- OpenClaw Discord
- r/openclaw
- Twitter followers who've engaged with our posts
- Your network (developers you know)

### 2. Schedule 20-Minute Calls
**Timing:** Tomorrow morning, back-to-back
**Format:** Screen share + voice
**Tools:** Zoom, Discord, or Google Meet

### 3. Prepare Installation Links
Have these ready to send:
```
Quick install: https://openclawfice.com/install
Demo mode: https://openclawfice.com/?demo=true
```

---

## Test Script (What to Say)

### Opening (2 min)
> "Hey! Thanks for testing OpenClawfice. This is a virtual office for your AI agents - think The Sims meets AI ops. I'm going to watch you use it and see where you get confused. There are no wrong answers - if something breaks or you don't understand it, that's valuable feedback for me."

**Key point:** Make them comfortable being honest. You want them to point out what sucks.

### Installation Test (5 min)
**For users who haven't installed yet:**
1. Send them the install link
2. Watch them follow the instructions
3. **Note:** Where do they get stuck?
4. **Note:** Do they understand what to do first?
5. **Note:** Does the retro terminal theme make sense?

**Questions to ask:**
- "What do you expect to see when you open localhost:3333?"
- "Does the empty state make sense?"
- "What would you do next?"

### First Impression (2 min)
Once they have the office open:
1. Let them explore without guidance for 30 seconds
2. Watch their cursor - what do they click first?

**Questions:**
- "What's the first thing that catches your eye?"
- "Does this feel like what you expected?"
- "What do you think this app does?"

### Core Interaction Test (5 min)
**Tasks to give them:**
1. "Find which agent is working right now"
2. "Send a message to your agents"
3. "Look at recent accomplishments"
4. "Try demo mode"

**Watch for:**
- Do they understand the rooms?
- Do they know what the plumbobs mean?
- Do they click on NPCs?
- Do they find the water cooler chat?
- Do they see the quest log?

**Note:** What do they try to do that doesn't work?

### Fun Factor Test (3 min)
**Questions:**
- "On a scale of 1-10, how fun is this to use?"
- "What would make you want to check this every day?"
- "Would you show this to a friend? Why or why not?"
- "Does the retro/RPG vibe work for you?"

### Friction Points (3 min)
**Questions:**
- "What's the most confusing part?"
- "What would you change if you could?"
- "Is there anything you expected to be there but wasn't?"
- "Did anything feel slow or janky?"

---

## What to Watch For

### Critical Blockers (Fix immediately)
- [ ] Can't install at all
- [ ] Empty state is confusing
- [ ] Don't understand what the app is for
- [ ] Can't figure out how to see their agents
- [ ] Nothing happens / looks broken

### High Priority (Fix before launch)
- [ ] Don't know what rooms mean
- [ ] Can't find key features (chat, quests, accomplishments)
- [ ] Retro theme feels off-brand or confusing
- [ ] Performance issues (lag, janky animations)
- [ ] Don't understand agent status indicators

### Nice to Have (Fix post-launch)
- [ ] Want features we haven't built yet
- [ ] Minor UX polish
- [ ] Aesthetic preferences
- [ ] Edge cases

---

## Questions to Ask Every User

### Understanding
1. "In one sentence, what does OpenClawfice do?"
2. "Who is this for?"
3. "When would you use this?"

### Emotion
4. "How does it make you feel?" (fun, productive, confused, etc.)
5. "What's the most delightful part?"
6. "What's the most frustrating part?"

### Action
7. "Would you install this on your main machine?"
8. "Would you recommend it to someone? Who?"
9. "What would make you check this daily?"

### Specific
10. "Does the retro RPG aesthetic work?"
11. "Are the NPCs/rooms/plumbobs clear?"
12. "Is the empty state helpful or confusing?"

---

## Data to Collect

### Quantitative
- Time to install: ___ minutes
- Time to first "aha" moment: ___ seconds
- Number of clicks before understanding: ___
- Features discovered without prompting: ___/5
- Fun rating: ___/10

### Qualitative
- What words do they use to describe it?
- What features do they ask for?
- What analogies do they make? ("It's like ___ but for ___")
- What do they misunderstand?

---

## After Each Call

### Immediate Notes (2 min)
Write down:
1. Biggest surprise
2. Biggest frustration
3. One thing to fix ASAP

### Patterns (After all 5)
Look for:
- Issues 3+ users mentioned → **Fix these first**
- Features 3+ users loved → **Double down on these**
- Confusion 3+ users had → **Simplify this**

---

## Post-Test Actions

### Must Fix (Do Today)
Anything that:
- Blocked a user completely
- Made 3+ users confused
- Killed the "fun" factor

### Should Fix (This Week)
- UX polish that came up 2+ times
- Performance issues
- Missing obvious features

### Document Learning
Create: `USER-FEEDBACK-SUMMARY.md`
Include:
- Top 3 learnings
- Top 3 fixes needed
- Quotes from users
- Next testing round plan

---

## Success Metrics

**You'll know it's working if:**
- 4/5 users understand what it does in < 30 seconds
- 3/5 users say they'd check it daily
- 4/5 users successfully complete core tasks
- 3/5 users use words like "fun", "cool", "cute"
- 2/5 users spontaneously share it with someone

**Red flags:**
- Any user can't install it
- Any user says "I don't get it"
- Any user rates fun < 5/10
- 3+ users mention same frustration
- Nobody wants to use it daily

---

## Tips for Tyler

### Do:
- ✅ Let them struggle a bit - that's where you learn
- ✅ Ask "what are you thinking?" when they pause
- ✅ Take notes on what they click vs what you expected
- ✅ Record the session if they're okay with it
- ✅ Thank them genuinely - this is valuable

### Don't:
- ❌ Defend or explain features
- ❌ Say "that's a bug, it normally works"
- ❌ Guide them too much
- ❌ Take negative feedback personally
- ❌ Promise features you're not sure about

### Remember:
**Every "I don't get it" is a gift.** That's a fix you can make before thousands of people hit the same wall.

---

## Next Steps After Testing

1. **Triage issues** - Critical vs Nice-to-have
2. **Update this doc** - What worked? What didn't?
3. **Fix top 3 blockers** - Before any marketing push
4. **Run test again** - 5 different users, validate fixes
5. **Then launch** - You'll know it's ready when users "get it" immediately

---

## Appendix: Quick Reference

### Install Command
```bash
git clone https://github.com/openclawfice/openclawfice.git ~/openclawfice
cd ~/openclawfice
npm install
npm run dev
```

### Demo Mode
```
http://localhost:3333/?demo=true
```

### Fresh Install Test
If you want to test the new user experience:
```bash
# Backup your config
mv ~/.openclaw ~/.openclaw.backup

# Test fresh install
# (Instructions appear in empty state)

# Restore
mv ~/.openclaw.backup ~/.openclaw
```

### Common Issues & Fixes
- **Port 3333 busy:** `npm run dev -- --port 3334`
- **OpenClaw not detected:** Check empty state diagnostic
- **No agents showing:** Check `~/.openclaw/openclaw.json`
- **Build cache issues:** `rm -rf .next && npm run dev`

---

**Bottom line:** We've been polishing in a vacuum. 5 real users will tell us more in 2 hours than we learned in 4 days of internal testing.

Get feedback → Fix blockers → Test again → Launch with confidence.
