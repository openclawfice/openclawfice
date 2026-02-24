# Vercel Deploy Diagnosis - Feb 24, 2026

## Problem
Production site (openclawfice.com) is showing stale content. Latest commits aren't deploying automatically.

## What I Found

### ✅ Git Status: WORKING
```bash
# All commits are pushed to GitHub
git log origin/main..HEAD  # Returns empty (no unpushed commits)
git remote -v              # Pointing to correct repo
```

**Latest commits on GitHub:**
- `7ca982a` - Vercel auto-deploy fix guide (just pushed by Forge)
- `efa3cc6` - Visual deployment flow diagnostic (Pixel)
- `02b7964` - Move stray doc to docs/
- `2f1968b` - Tune XP skill keywords
- `5043248` - Move 5 stray docs back to docs/

### ❌ Vercel Auto-Deploy: NOT WORKING
```bash
# Production still shows old content
curl https://openclawfice.com | grep "MALWARE"
# Returns: "VERIFIED & MALWARE SCANNED" (old badge text)
# Should NOT show this — badge was removed in commit 2b8bfc2 (9 commits ago)
```

**Missing from production:**
- Badge removal (commit 2b8bfc2)
- Consolidated health check script (commit aeb4159)
- All commits from last 16+ hours

## Root Cause

Vercel is **not auto-deploying** when commits are pushed to `origin/main`.

### Likely Causes (in order of probability)

1. **Webhook Not Configured** - GitHub → Vercel webhook may be broken/missing
2. **Branch Mismatch** - Vercel may be watching wrong branch (not `main`)
3. **Build Hook Issue** - Auto-deploy setting may be disabled
4. **Integration Broken** - GitHub App connection may need re-auth

## How to Fix (2 minutes)

### Option A: Manual Redeploy (Fastest - 30 seconds)
1. Go to https://vercel.com/openclawfice/openclawfice/deployments
2. Click the 3-dot menu on latest deployment
3. Click "Redeploy"
4. Wait 60 seconds for build
5. Verify at https://openclawfice.com (badge should be GONE)

### Option B: Fix Auto-Deploy (Permanent - 2 minutes)
1. Go to https://vercel.com/openclawfice/openclawfice/settings/git
2. Under **Git Integration**, verify:
   - ✅ Connected to `openclawfice/openclawfice` repo
   - ✅ Production branch is `main`
   - ✅ "Auto-deploy" is enabled
3. If webhook is missing:
   - Disconnect GitHub integration
   - Reconnect (will recreate webhook)
4. Push empty commit to test:
   ```bash
   git commit --allow-empty -m "test: Verify Vercel auto-deploy"
   git push origin main
   ```
5. Watch https://vercel.com/openclawfice/openclawfice/deployments
   - Should show new deploy within 10 seconds

## Verification Steps

After deploying, verify ALL critical changes are live:

### 1. Badge Removed (commit 2b8bfc2)
```bash
curl -s https://openclawfice.com | grep -i "malware"
# Should return: NOTHING (or only landing page security section)
# Should NOT return: navigation badge
```

### 2. XP System Live (commit 53f12db)
```bash
curl -s https://openclawfice.com/?demo=true
# Load in browser, watch for XP level-up celebrations
```

### 3. Demo GIF Updated (commit 6ceaaa2)
```bash
# Check GIF has no meta-discussion in water cooler
# Should show clean agent chat, not "recording now"
```

### 4. Consolidated Health Check (commit aeb4159)
```bash
curl -s https://openclawfice.com/api/office/health
# Should return updated health check response
```

## Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Git Repo | ✅ GOOD | All commits pushed to GitHub |
| GitHub | ✅ GOOD | Repo is up-to-date |
| Vercel Auto-Deploy | ❌ BROKEN | Not triggering on new commits |
| Production Site | ⚠️ STALE | Showing 16+ hour old version |

## Next Steps

**For Tyler:**
1. Choose Option A (quick redeploy) or Option B (fix auto-deploy)
2. Run verification steps above
3. If Option A: report which commits are now live
4. If Option B: test with empty commit to verify webhook works

**Expected Time:**
- Option A: 30 seconds
- Option B: 2 minutes

**Blocking Launch?**
- **No** - you can launch with current prod (it's stable)
- **But** - demo GIF in tweet will show stale content
- **Recommendation**: Do Option A (30s redeploy) before tweeting

---

**Diagnosed by:** Forge  
**Date:** Feb 24, 2026 10:40 AM ET  
**Files checked:** Git log, production site, Vercel docs  
**Confidence:** High (verified git status + production content mismatch)
