# Tyler's Launch Checklist - OpenClawfice

**Last updated:** Feb 27, 2026, 10:35 PM EST  
**Purpose:** Complete pre-launch tasks to unblock team execution

---

## Critical Path Items (MUST DO)

### 🔴 P0: Fresh Install Test (30 min)
**BLOCKING:** Entire launch sequence  
**Status:** ⏳ Pending  
**Why:** Water cooler consensus - validate before amplify before recruit

**What to do:**
1. Get a clean VM or fresh macOS install
2. Follow: `FRESH-INSTALL-VALIDATION-REPORT.md`
3. Test: Install OpenClaw → Install OpenClawfice → Verify it works
4. Note any friction points or errors
5. Report findings to Forge (if issues) or green-light launch (if smooth)

**Time:** 20-30 minutes  
**Unblocks:** Scout's travelswitheli validation (9am Saturday)

**If you can't do VM test:**
- Alternative: Test on a friend's machine
- Alternative: Run through install steps manually to check for obvious issues
- Minimum: Review `FRESH-INSTALL-VALIDATION-REPORT.md` and approve/reject based on judgment

---

## Quick Wins (30 seconds each)

### 🟡 Enable Vercel Analytics
**BLOCKING:** Retention analytics (Cipher shipped the code, needs dashboard toggle)

**What to do:**
1. Go to https://vercel.com
2. Navigate to openclawfice project
3. Click Settings → Analytics
4. Click "Enable"
5. Done

**Time:** 30 seconds  
**Impact:** Enables tracking of demo mode conversions, install funnel, template usage

---

### 🟡 Fix GitHub Repo Metadata
**BLOCKING:** GitHub discoverability (no description, wrong URL, no topics)

**Needs:** DaftMonk admin access (tylerbot-cipher only has push)

**What to do:**
1. Go to https://github.com/openclawfice/openclawfice/settings
2. Update description: `🏢 Virtual office for your AI agents — pixel art NPCs, water cooler chat, quest log, XP system. The Sims meets AI ops.`
3. Update website: `https://openclawfice.com`
4. Add topics: `openclaw`, `ai-agents`, `dashboard`, `pixel-art`, `virtual-office`, `retro`, `rpg`, `agent-management`, `typescript`, `nextjs`
5. Save

**Time:** 30 seconds (if you have access)  
**Impact:** GitHub search/discovery, professional appearance

**If you don't have access:**
- Ask DaftMonk to do it
- Or: Grant admin access to tylerbot-cipher

---

## High-Value Optional Tasks

### 🟢 Film YouTube Demo (2-3 hours)
**NOT BLOCKING** but high marketing value

**Files ready:**
- `YOUTUBE-DEMO-SCRIPT.md` - Full 3-5 min script with 30s/60s versions
- `YOUTUBE-SHOT-LIST.md` - 17 shots with timestamps and camera notes

**What to do:**
1. Review script and shot list
2. Record screen + voiceover
3. Edit (or hire editor)
4. Upload with SEO metadata from script

**Time:** 45-90 min recording, 2-3 hours editing  
**Impact:** Social proof for Scout's creator outreach, marketing asset for Cipher's launch

**Priority:** Lower than fresh install test, but valuable

---

### 🟢 Review & Approve Features Shipped Today
**Status:** Forge shipped 6 features, waiting for acknowledgment

**What to review:**
1. Agent Search & Filtering (🔍 above office grid)
   - Press `/` to search
   - Try status filters (All/Working/Idle)
   - Verify mobile responsive
2. Workflow Export (💾 in header)
   - Click button
   - Verify JSON downloads
   - Check it's git-friendly
3. Demo mode fix
   - Visit https://openclawfice.com/?demo=true
   - Verify 5 agents appear (not empty)

**Time:** 5-10 minutes  
**Impact:** Confirms features work before launch

---

## Creator Calls (CRITICAL - 14 hours left)

### 🔴 Call Reek G NOW
**Value:** $1,800/month recurring  
**Urgency:** 14 hours until 7-day mark  
**Phone:** 954-605-8368

**Script ready:** `~/clawd-outreach/CALL-NOW-ONE-PAGE-BRIEF.md`

### 🔴 Call Jack
**Value:** $3,000 (2 videos)  
**Urgency:** 23 hours left  
**Phone:** (310) 695-8588

### 🔴 Text Daniel K (Apology First)
**Value:** $1,400  
**Context:** Missed his scheduled call

**Total value:** $6.2K + $1.8K/month recurring  
**Total time:** 30 minutes for all 3

**Why this matters:** These are HOT leads who already said YES. Freshness window closing.

---

## Launch Sequence (After Validation)

Once you complete the fresh install test and give green light:

1. **Forge** validates fixes (<5 min)
2. **Scout** tests with travelswitheli (9am Saturday, 15 min)
3. **Pixel** documents working product (fresh screenshots, updated guides)
4. **Cipher** launches Twitter + HN (with proof, not speculation)
5. **Scout** contacts 9 remaining YouTube creators (within 24 hours)

**Your role in sequence:** Approve/reject validation results, then it auto-executes

---

## Decision Matrix

### If Fresh Install Test PASSES:
✅ Green-light launch sequence  
✅ Scout contacts travelswitheli 9am Saturday  
✅ Cipher tweets/HN same day  
✅ Product is validated and ready

### If Fresh Install Test FAILS:
❌ Halt launch  
❌ Forge fixes top 3 issues found  
❌ Re-test before launch  
❌ Delay Twitter/creator outreach

**Important:** Better to delay 1 day fixing blockers than explain bugs to 1000 users

---

## What Forge Shipped Today (FYI)

You don't need to build anything - Forge already shipped:

**Features (6 total):**
1. ✅ Agent Search & Filtering
2. ✅ Workflow Export
3. ✅ Demo Mode Fix (unblocked 168 marketing links)
4. ✅ Chat Bubble Fixes
5. ✅ Empty State (retro terminal theme)
6. ✅ Install UX (OpenClaw detection, port conflicts, feedback)

**Documentation (27 files, ~190KB):**
- WHATS-NEW-FEB-27.md (marketing summary)
- FORGE-DAY-COMPLETE-FEB27.md (full recap)
- YouTube demo kit (script + shot list)
- FAQ, Quick Start, Troubleshooting
- Launch infrastructure (runbook, checklist, metrics)

**Quality:**
- 26 commits to main
- 10/10 automated validation passing
- Production build clean
- Mobile responsive

**Status:** Development complete. Waiting on your validation.

---

## Time Budget

**Minimum to unblock launch:**
- Fresh install test: 30 minutes
- Approve validation: 2 minutes
- **Total: 32 minutes**

**Ideal scenario:**
- Fresh install test: 30 min
- Enable Vercel Analytics: 30 sec
- Fix GitHub metadata: 30 sec (if you have access)
- Review features shipped: 10 min
- **Total: ~42 minutes**

**Maximum value:**
- Above + call 3 creators: 30 min
- Above + film YouTube demo: 3 hours
- **Total: ~4.5 hours**

---

## Who's Waiting on You

### Forge
- Waiting for: Fresh install test results
- Blocked on: Validation (can't fix what you haven't tested)
- Ready to: Fix issues in 1-2 hours if you find any

### Scout
- Waiting for: Green light from fresh install test
- Blocked on: Product validation
- Ready to: Contact travelswitheli 9am Saturday

### Cipher
- Waiting for: Validation + Pixel's documentation
- Blocked on: Proof (won't launch without it)
- Ready to: Tweet + HN post same day

### Pixel
- Waiting for: Validation results
- Blocked on: Working product to document
- Ready to: Fresh screenshots + guides

**Bottom line:** You're the gate. Once you validate, the team executes.

---

## Communication Plan

**If validation passes:**
1. Post in water cooler: "Fresh install test passed. Green light for launch."
2. Tag Scout: "Go for travelswitheli 9am"
3. Tag Cipher: "Launch approved pending Pixel docs"

**If validation fails:**
1. Post in water cooler: "Found X issues in fresh install test"
2. List issues with priority
3. Tag Forge: "Fix top 3 before launch"
4. Set new timeline

**If you can't do test:**
1. Post in water cooler: "Can't do VM test today"
2. Suggest alternative (friend's machine, manual review, etc.)
3. Team adjusts plan

---

## Files You Need

**For Fresh Install Test:**
- `FRESH-INSTALL-VALIDATION-REPORT.md`

**For Creator Calls:**
- `~/clawd-outreach/CALL-NOW-ONE-PAGE-BRIEF.md`

**For Context:**
- `WHATS-NEW-FEB-27.md` (what Forge shipped today)
- `FORGE-DAY-COMPLETE-FEB27.md` (full day summary)

**All files are in the repo or your home directory.**

---

## Priority Order (Recommended)

1. **Fresh install test** (30 min) - CRITICAL PATH
2. **Creator calls** (30 min) - HIGH VALUE, TIME SENSITIVE
3. **Vercel Analytics** (30 sec) - QUICK WIN
4. **GitHub metadata** (30 sec) - QUICK WIN
5. **Review features** (10 min) - VALIDATION
6. **YouTube demo** (3 hours) - OPTIONAL, HIGH VALUE

**Total critical path:** 1 hour  
**Total with quick wins:** 1 hour 1 minute  
**Total with all high-value:** ~4.5 hours

---

## Success Metrics

**Minimum success:**
- Fresh install test completed
- Results reported to team
- Launch decision made (go/no-go)

**Good success:**
- Above + Vercel Analytics enabled
- Above + GitHub metadata fixed
- Above + features reviewed

**Great success:**
- Above + 3 creator calls completed
- Above + YouTube demo filmed

**Exceptional success:**
- All of the above done before midnight
- Launch sequence executes Saturday morning
- Team has clear proof and validation

---

## Need Help?

**Stuck on fresh install test?**
- Check `TROUBLESHOOTING.md` in repo
- Ask Forge via water cooler
- Run `FRESH-INSTALL-VALIDATION-REPORT.md` script

**Don't have VM access?**
- Use a friend's machine
- Manual walkthrough of install steps
- Worst case: approve based on Forge's validation (risky but possible)

**Short on time?**
- Minimum: Fresh install test (30 min)
- Skip: YouTube demo, feature review
- Delegate: Creator calls (to Scout if you prefer)

---

**Bottom line:** Fresh install test is THE blocker. Everything else is optimization.

Do that one thing, and the team can execute the launch sequence Saturday.

---

*Created by Forge*  
*Feb 27, 2026, 10:35 PM EST*
