# Verify Redeploy Worked (1 minute)

**Run this AFTER clicking "Redeploy" in Vercel dashboard**

## Quick Visual Check (30 seconds)

### 1. Badge Should Be GONE ✅
Open: https://openclawfice.com

**Look at:** Top navigation bar (black header)  
**Should see:** Clean nav with just links  
**Should NOT see:** "🛡️ MALWARE FREE" badge in nav

**Why:** Badge was removed in commit 2b8bfc2 (9 commits ago)

---

### 2. Demo GIF Should Exist ✅
Open: https://openclawfice.com/landing

**Scroll to:** Top hero section with GIF  
**Should see:** Animated GIF showing office with agents  
**Should NOT see:** Broken image or missing asset

**Why:** New demo GIF added in commit 6ceaaa2

---

### 3. XP System Should Work ✅
Open: https://openclawfice.com/?demo=true

**Wait:** 30 seconds for agent to complete a task  
**Should see:** Level-up celebration with XP toast  
**Should hear:** (optional) 8-bit sound effect if enabled

**Why:** Real XP progression from commit 53f12db

---

### 4. Health Check Should Pass ✅
Run this locally:
```bash
cd ~/clawd-openclawfice/openclawfice
bash scripts/check.sh prod
```

**Should see:**
```
✅ Homepage (200)
✅ Demo mode (200)
✅ Install page (200)
✅ Security badge
✅ Demo GIF
✅ Create Your AI Team

ALL CLEAR 🚀
```

**If any ❌ failures:** Redeploy didn't complete or rolled back

---

## Deep Verification (30 seconds)

### Check Git Commit on Production
Open: https://openclawfice.com

**View source:** Right-click → View Page Source  
**Search for:** `<!-- Build: ` or check meta tags  
**Should find:** Recent commit hash (after 2b8bfc2)

### Check Build Timestamp
```bash
curl -s https://openclawfice.com | grep -i "build\|version\|commit"
```

Should return recent timestamp (within last hour)

---

## If Verification FAILS

### Badge Still Visible?
❌ **Problem:** Deploy rolled back or failed silently  
✅ **Fix:** Go back to Vercel dashboard, click "Redeploy" again

### Demo GIF Missing?
❌ **Problem:** Asset didn't upload or CDN cache stale  
✅ **Fix:** Wait 2 minutes (CDN propagation), then hard refresh (Cmd+Shift+R)

### XP System Not Working?
❌ **Problem:** JavaScript bundle is old version  
✅ **Fix:** Hard refresh page (Cmd+Shift+R), clear browser cache

### Health Check Fails?
❌ **Problem:** Multiple issues, need investigation  
✅ **Fix:** 
1. Check Vercel deployment logs: https://vercel.com/openclawfice/openclawfice/deployments
2. Look for build errors or warnings
3. If "Building..." status stuck → cancel and redeploy
4. If "Error" status → read error logs, might need code fix

---

## Success Criteria

**All 4 checks pass = READY TO LAUNCH** ✅

✅ Badge removed (clean nav)  
✅ Demo GIF visible  
✅ XP system working  
✅ Health check passes  

**If all pass:** Go to `docs/LAUNCH-NOW-SIMPLE.md` and launch! 🚀

**If any fail:** Fix that specific issue first, then re-verify

---

## Quick Reference

| Check | URL | Expected | Time |
|-------|-----|----------|------|
| Badge | openclawfice.com | No badge in nav | 5s |
| GIF | openclawfice.com/landing | Animated GIF visible | 5s |
| XP | openclawfice.com/?demo=true | Level-up toast | 30s |
| Health | `bash scripts/check.sh prod` | All ✅ pass | 10s |

**Total time:** ~1 minute

---

**Created by:** Forge  
**Date:** Feb 24, 2026  
**Purpose:** Verify Vercel redeploy actually fixed the stale content issue
