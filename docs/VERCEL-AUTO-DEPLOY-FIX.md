# 🚨 Vercel Auto-Deploy Not Working - Fix Guide

**Problem:** Last Vercel deploy was 16+ hours ago. 20+ commits pushed to GitHub but NOT deployed to production.

**Impact:** Demo link in launch tweet will show OLD version (no XP system, old demo GIF, malware badge still in nav, etc.)

---

## Quick Diagnosis (30 seconds)

### 1. Verify GitHub is up to date
```bash
cd ~/clawd-openclawfice/openclawfice
git log --oneline -5
```

**Expected:** See recent commits (malware badge removal, health check consolidation, etc.)

### 2. Check Vercel dashboard
1. Go to https://vercel.com/openclawfice/openclawfice
2. Click "Deployments"
3. Look at "Latest Deployment" timestamp

**Problem if:** Timestamp is 16+ hours old despite recent Git pushes

---

## Root Causes & Fixes

### Cause 1: GitHub Integration Disconnected

**Symptoms:** Vercel shows no new deployments, no build logs since disconnect

**Fix:**
1. Vercel dashboard → Settings → Git
2. Check "Connected Git Repository"
3. If shows "Not connected" or wrong repo:
   - Click "Disconnect" 
   - Click "Connect Git Repository"
   - Select GitHub → openclawfice/openclawfice
   - Authorize

**Verify:** Push a small commit, wait 1 min, check Deployments tab

---

### Cause 2: Wrong Production Branch

**Symptoms:** Commits to `main` but Vercel watches `master` or `production`

**Fix:**
1. Vercel dashboard → Settings → Git
2. Check "Production Branch" setting
3. Should be: `main`
4. If wrong, click Edit → Change to `main` → Save

**Verify:** Trigger redeploy, should use latest `main` commit

---

### Cause 3: Auto-Deploy Disabled

**Symptoms:** Manual deploys work, but auto-deploy doesn't trigger

**Fix:**
1. Vercel dashboard → Settings → Git
2. Scroll to "Deploy Hooks"
3. Check "Ignored Build Step" — should be OFF/empty
4. Check if any build filters are set (e.g., "only deploy on tag")
5. Remove any filters blocking auto-deploy

**Verify:** Push a trivial commit (add space to README), wait 1 min

---

### Cause 4: Rate Limit / Queue Backup

**Symptoms:** Vercel dashboard shows "Queued" or "Building" for 10+ minutes

**Fix:**
1. Cancel any stuck deployments
2. Wait 5 minutes
3. Trigger manual redeploy of latest commit

**Verify:** Deployment completes in 2-5 minutes

---

### Cause 5: Silent Build Failures (No Error Shown)

**Symptoms:** Deployments appear successful but don't update production

**Fix:**
1. Vercel dashboard → Deployments → Latest
2. Click "View Function Logs"
3. Look for errors even if build shows green
4. If logs show module errors, clear build cache:
   - Settings → General → Clear Build Cache
   - Redeploy

**Verify:** Check openclawfice.com for latest changes

---

## Quick Fix (2 minutes)

**If you don't have time to diagnose, just force a redeploy:**

### Option A: Manual Redeploy (1 minute)
1. Vercel dashboard → Deployments
2. Find latest commit (top of list)
3. Click "..." menu → "Redeploy"
4. Wait 2-5 minutes
5. Check openclawfice.com

### Option B: Dummy Commit (2 minutes)
```bash
cd ~/clawd-openclawfice/openclawfice
echo "" >> README.md  # Add blank line
git add README.md
git commit -m "chore: Trigger Vercel redeploy"
git push origin main
```

Wait 2-5 minutes, check Vercel dashboard for new deployment.

---

## Verification After Fix

### 1. Run consolidated check script
```bash
cd ~/clawd-openclawfice/openclawfice
bash scripts/check.sh prod
```

**Expected:** 8/8 checks pass

### 2. Visual spot check
Open these in browser:
- https://openclawfice.com → No malware badge in header ✅
- https://openclawfice.com/?demo=true → XP system working ✅
- View source → Look for recent commit hash in build ID

### 3. Check specific features
```bash
# XP system (from recent commits)
curl -s https://openclawfice.com/api/office/route | jq '.agents[0].xp'

# Should return actual XP numbers, not null
```

---

## Preventing Future Issues

### Enable Deployment Notifications
1. Vercel dashboard → Settings → Notifications
2. Enable "Deployment Started" and "Deployment Failed"
3. Add email or Slack webhook
4. Get alerted when auto-deploy breaks

### Monitor Deploy Frequency
If deploys suddenly stop:
1. Check GitHub → Actions tab (if using GitHub Actions)
2. Check Vercel dashboard → Deployments → Filter by date
3. Expected: 1-5 deploys per day during active dev

### Test Auto-Deploy Monthly
```bash
# Quick test commit
echo "# Last verified: $(date)" >> .vercel-test.md
git add .vercel-test.md
git commit -m "test: Verify auto-deploy working"
git push origin main
```

Wait 2 minutes, check Vercel deployed it.

---

## Emergency: Launch Can't Wait

**If Vercel won't deploy and you need to launch NOW:**

### Option 1: Deploy from local
```bash
cd ~/clawd-openclawfice/openclawfice
npm install -g vercel  # One-time
vercel --prod
```

Deploys directly from your machine, bypasses GitHub.

### Option 2: Use current production
If current production is "good enough":
1. Skip the badge/XP features in launch announcement
2. Tweet with current demo link
3. Fix auto-deploy post-launch
4. Tweet "Just shipped an update!" when deploy fixed

**Not ideal but gets you launched.**

---

## Commit History Reference

**Last 25 commits (not on production):**
1. b4be74d - Vercel troubleshooting guide
2. 5043248 - Move stray docs
3. 2b8bfc2 - Remove malware badge ⚠️ **Important for launch**
4. aeb4159 - Consolidate health checks
5. 1792923 - Link verification dashboard
6. fdc3ec1 - Troubleshooting flowchart
7. 5c4119c - Post-deploy verification
8. 96d5507 - Deployment verification dashboard
9. 53f12db - Real XP progression ⚠️ **Important for launch**
10. 4914b2f - Vercel fix guide
11. 25a31b5 - Production verification script
12. 3c16b16 - Accomplishment proof standards
13. 07f13fa - Cleanup stray docs
14. a5d2929 - Pre-tweet checklist
15. 4dceaf7 - Re-record demo GIF ⚠️ **Important for launch**
16. ... (and 10 more)

**Critical commits for launch:**
- Real XP system (makes RPG layer meaningful)
- New demo GIF (no meta-discussion)
- Malware badge removed (cleaner nav)

**If you launch on old production, you miss all of these.**

---

## Current Production State (if not fixed)

Based on 16-hour-old deploy, production likely shows:
- ❌ Malware badge still in nav
- ❌ Old demo GIF (possibly with meta-discussion)
- ❌ Old XP system (random numbers, not real)
- ❌ 6 separate health check scripts (not consolidated)
- ❌ Missing 20+ doc improvements

**This is NOT launch-ready.**

---

## TL;DR Fix Steps

1. **Vercel dashboard** → Settings → Git
2. **Verify** "Connected Git Repository" = openclawfice/openclawfice
3. **Verify** "Production Branch" = main
4. **Trigger** manual redeploy of latest commit
5. **Wait** 5 minutes
6. **Run** `bash scripts/check.sh prod`
7. **If passing** → Launch is go! ✅
8. **If failing** → See detailed fixes above

---

**Time to fix:** 2-5 minutes  
**Blocker severity:** Critical (blocks launch with latest features)  
**Next step:** Open Vercel dashboard and trigger redeploy

**After fix:** Run POST-DEPLOY-VERIFICATION.md checklist before launching.
