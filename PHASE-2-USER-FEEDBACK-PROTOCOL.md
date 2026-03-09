# Phase 2: User Feedback Protocol

**Created:** 2026-03-01  
**Status:** Ready for activation when first users install  
**Owner:** Nova (PM)

---

## Purpose

Phase 1 shipped launch week polish based on assumptions. Phase 2 adapts based on **real user feedback**.

This protocol defines how to:
1. Collect feedback systematically
2. Prioritize fixes based on impact
3. Assign tasks to Forge quickly
4. Measure improvement

---

## When to Activate Phase 2

**Trigger:** Any of these events:
- First 10 users install OpenClawfice
- Tyler completes fresh install validation (first real user test)
- Scout's travelswitheli creator launches (first external validation)
- GitHub issues opened (community feedback)
- Direct messages from users (Discord, Twitter, etc.)

**Don't wait for "enough" feedback.** One real user issue > 10 theoretical improvements.

---

## Feedback Collection Channels

### Primary Sources (Monitor Daily)
1. **GitHub Issues** — github.com/openclawfice/openclawfice/issues
2. **Tyler's Validation Test** — TYLER-FRESH-INSTALL-TEST.md results
3. **Scout's Creator Feedback** — Direct reports from travelswitheli or other creators
4. **Discord #openclawfice** — Community discussion (if exists)

### Secondary Sources (Check Weekly)
5. **Twitter mentions** — @openclawfice or openclawfice.com mentions
6. **Reddit r/openclaw** — Organic discussions
7. **Email** — Support requests

### Monitoring Protocol
- **Daily check** (9am EST): GitHub issues + Discord
- **After creator launch**: Monitor Scout's reports closely
- **After Tyler validation**: Prioritize his findings immediately

---

## Feedback Classification

**Tag each piece of feedback:**

### Severity
- **Critical:** Product doesn't work, blocks usage
- **High:** Major friction, users likely to quit
- **Medium:** Annoying but workaround exists
- **Low:** Nice-to-have, polish

### Category
- **Installation:** Setup, dependencies, first run
- **Discovery:** Finding features, understanding UI
- **Performance:** Speed, lag, resource usage
- **Bug:** Something broken that should work
- **Feature Request:** New capability
- **Polish:** UI/UX improvement

### User Type
- **New user:** First 5 minutes of usage
- **Active user:** Daily usage, knows the product
- **Power user:** Advanced features, customization
- **Creator:** Making content about it

---

## Prioritization Framework

**Work through in this order:**

### P0: Ship Blockers (Fix Immediately)
Issues that prevent product from working at all:
- Install fails completely
- App crashes on load
- No agents appear (when they should)
- Critical error breaks main workflow

**Action:** Assign to Forge within 1 hour, fix same day

### P1: High Friction (Fix This Week)
Issues that make product hard to use but don't block completely:
- Confusing error messages
- Missing onboarding steps
- Performance lag
- Feature discovery issues

**Action:** Create spec, assign to Forge within 24 hours

### P2: Annoyances (Fix When Batch Ready)
Issues that are annoying but have workarounds:
- UI polish
- Minor bugs
- Feature requests (if aligned with roadmap)
- Documentation gaps

**Action:** Batch 3-5 similar issues, assign as group

### P3: Backlog (Consider for Later)
Issues that are interesting but not current priorities:
- Advanced features
- Edge cases
- Nice-to-have polish
- Speculative improvements

**Action:** Document in POST-LAUNCH-PRIORITIES.md, revisit monthly

---

## Task Creation Template

When converting feedback → task for Forge:

```markdown
[TASK] <Short Title>

## User Report
**From:** <username/Tyler/Creator name>
**When:** <date>
**Context:** <what they were trying to do>

**Exact feedback:**
> <quote their message verbatim>

## Problem Analysis
<What's actually broken and why>

## Solution
<How to fix it>

## Acceptance Criteria
- [ ] User's issue resolved
- [ ] No regression in related features
- [ ] Tested on their use case
- [ ] <specific verification steps>

## Testing
**Reproduce:**
<steps to reproduce the issue>

**Verify fix:**
<steps to confirm it's fixed>

**Priority:** P0/P1/P2
**Estimated time:** <estimate>
**Source:** User feedback, Phase 2
```

---

## Feedback Response Protocol

### When User Reports Issue

**1. Acknowledge quickly (within 1 hour if possible):**
```
Thanks for reporting! Looking into this now.
```

**2. Ask clarifying questions if needed:**
```
Can you share:
- Your OS (Mac/Linux/Windows)
- Node version (node --version)
- Full error message if any
```

**3. Create GitHub issue (for tracking):**
- Title: Clear, specific
- Body: Reproduced steps, expected vs actual
- Labels: bug/enhancement, priority

**4. Assign to Forge or fix yourself (if trivial)**

**5. Report back when fixed:**
```
Fixed in commit <SHA>. Try updating (git pull) and let me know if it works!
```

### When User Requests Feature

**1. Acknowledge:**
```
Interesting idea! Let me understand the use case better.
```

**2. Ask context questions:**
```
- What problem does this solve for you?
- How often would you use it?
- Any workarounds you're using now?
```

**3. Evaluate against roadmap:**
- Does it fit product vision?
- How many users would benefit?
- Complexity vs impact?

**4. Respond with decision:**
```
✅ Adding to roadmap: <why and when>
❌ Not planning this: <why and alternatives>
🤔 Considering: <needs more validation>
```

---

## Success Metrics (Phase 2)

Track these to know if we're improving:

### Install Success Rate
- **Target:** >80% of install attempts succeed
- **Measure:** Tyler validation + creator reports
- **Track:** Count failed vs successful installs

### Time to First Value
- **Target:** <5 minutes from install to seeing agents
- **Measure:** Tyler validation timing
- **Track:** User reports of "how long it took"

### Issue Resolution Time
- **Target:** P0 <24 hours, P1 <1 week, P2 <1 month
- **Measure:** GitHub issue close time
- **Track:** Issue created → commit → closed

### User Retention Signals
- **Target:** >40% return next day
- **Measure:** Qualitative feedback ("I use this daily")
- **Track:** Repeat GitHub activity, Discord presence

### Feature Discovery
- **Target:** >50% of users find main features naturally
- **Measure:** User feedback mentions ("I didn't know X existed")
- **Track:** Documentation views, support questions

---

## Common Feedback Patterns

**Based on Phase 1 assumptions, watch for:**

### "I didn't know OpenClaw was required"
**Fix:** Improve INSTALL.md, add OpenClaw explainer
**Priority:** P1

### "Discovery animation didn't show"
**Fix:** Debug localStorage check, browser compatibility
**Priority:** P1

### "Too many agents, UI cluttered"
**Fix:** Add filtering, grouping, or room expansion
**Priority:** P2

### "Water cooler is empty"
**Fix:** Ensure config examples work, improve docs
**Priority:** P2

### "What does 'COMMON' vs 'LEGENDARY' mean?"
**Fix:** Add tooltip, improve XP explanation
**Priority:** P2

---

## Feedback Loop Cadence

### Daily (Mon-Fri)
- Check GitHub issues (9am EST)
- Review Discord (if active)
- Monitor Tyler's validation status

### After Creator Launch
- Scout reports back → immediate review
- Prioritize their feedback (they're our first real external users)
- Fast iteration on blockers they hit

### Weekly
- Review all open issues
- Update POST-LAUNCH-PRIORITIES.md with patterns
- Batch similar P2 issues for efficiency

### Monthly
- Review success metrics
- Adjust roadmap based on learnings
- Archive resolved patterns

---

## Emergency Protocol

**If critical issue hits production:**

1. **Assess severity:**
   - Blocks all users? → Emergency fix
   - Blocks some users? → High priority
   - Workaround exists? → Fast fix, not emergency

2. **Create hotfix branch:**
   ```bash
   cd ~/openclawfice/openclawfice
   git checkout -b hotfix/<issue>
   ```

3. **Assign to Forge immediately:**
   ```
   [URGENT TASK] <issue>
   Priority: CRITICAL
   Blocking: All users / Creator launch / Tyler validation
   ```

4. **Test thoroughly:**
   - Don't rush deploy without verification
   - Check related features
   - Document what broke and why

5. **Deploy:**
   ```bash
   git commit -m "hotfix: <issue>"
   git push origin hotfix/<issue>
   # Tyler merges or auto-deploy
   ```

6. **Post-mortem:**
   - What broke?
   - Why didn't we catch it?
   - How to prevent next time?

---

## Templates for Common Scenarios

### Template: Reproduced Bug

```markdown
## Bug Confirmed

**Issue:** <description>
**Affects:** <who>
**Severity:** <P0/P1/P2>

**Reproduced:**
1. <steps>
2. <expected>
3. <actual>

**Root cause:** <technical explanation>

**Fix plan:**
<solution>

**ETA:** <when>
```

### Template: Feature Request Evaluation

```markdown
## Feature Request: <name>

**Requested by:** <user>
**Use case:** <problem they're solving>

**Analysis:**
- Impact: <how many users benefit>
- Effort: <hours to build>
- Alignment: <fits roadmap? yes/no>
- Alternatives: <workarounds?>

**Decision:**
✅ **Adding to roadmap** — <phase>
❌ **Not building** — <why>
🤔 **Needs validation** — <what info needed>
```

### Template: Tyler Validation Results

```markdown
## Tyler Validation Results — <date>

**Install:**
- ✅/❌ Completes in <5 min
- ✅/❌ Error messages clear
- ✅/❌ Dependencies checked early

**Discovery:**
- ✅/❌ Animation triggers
- ✅/❌ Agents appear
- ✅/❌ Screenshot moment works

**Issues found:**
1. <issue> — Priority: <P0/P1/P2>
2. <issue> — Priority: <P0/P1/P2>

**Overall:** PASS / FAIL / PASS WITH NOTES

**Next steps:**
<what to fix before launch>
```

---

## Phase 2 → Phase 3 Transition

**Move to Phase 3 when:**
- Install success rate >80%
- No P0 issues open >48 hours
- User feedback shifts from "it's broken" to "I wish it had..."
- 10+ successful installs with positive feedback

**Phase 3 focus:** Retention features (auto-scroll, status history, etc.)

---

## Related Documents

- **POST-LAUNCH-PRIORITIES.md** — Full 5-phase roadmap
- **TYLER-FRESH-INSTALL-TEST.md** — Validation test procedure
- **BORING-BUT-CRITICAL.md** — UX blocker framework
- **SKILL.md** — API docs for users

---

**Last updated:** 2026-03-01  
**Owner:** Nova (PM)  
**Status:** Ready for activation
