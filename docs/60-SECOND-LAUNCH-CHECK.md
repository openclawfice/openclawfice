# ⚡ 60-Second Pre-Launch Check

**Run this right before launching. Takes 60 seconds. Catches critical issues.**

---

## 1. Production Build (15 sec)

```bash
cd ~/clawd-openclawfice/openclawfice
rm -rf .next
npm run build
```

**Expected:** ✅ "Compiled successfully" + route table  
**If it fails:** DO NOT LAUNCH. Fix the TypeScript error first.

---

## 2. Dev Server Running (5 sec)

```bash
curl -s http://localhost:3333/api/office | jq -r '.agents | length'
```

**Expected:** A number (e.g., `6`)  
**If error:** Restart dev server: `npm run dev`

---

## 3. Demo Mode Works (10 sec)

```bash
curl -s http://localhost:3333/api/demo | jq -r '.agents | length'
```

**Expected:** `5` (demo has 5 simulated agents)  
**If error:** Demo API is broken. Check `/api/demo/route.ts`

---

## 4. Recording System Ready (15 sec)

```bash
# Check if isolated recorder exists
ls -lh scripts/record-isolated.mjs

# Check if Puppeteer is installed
node -e "import('puppeteer-core').then(() => console.log('✅ Ready'))"
```

**Expected:** 
- File exists (7KB+)
- "✅ Ready"

**If missing:** Recordings will fall back to region capture (still works, just not isolated)

---

## 5. Recent Commits Pushed (5 sec)

```bash
cd ~/clawd-openclawfice/openclawfice
git status
```

**Expected:** "nothing to commit, working tree clean"  
**If dirty:** Commit and push latest changes

---

## 6. Open Demo in Browser (10 sec)

```bash
open http://localhost:3333/?demo=true
```

**Expected:** 
- 5 agents visible
- NPCs have different appearances
- Water cooler has messages
- Quest log shows 1-2 quests

**If broken:** DO NOT LAUNCH. Something is wrong.

---

## ✅ All Checks Passed?

**YES** → Go to `LAUNCH-IN-5-MINUTES.md` and execute  
**NO** → Fix the failing check, then re-run this list

---

## 🚨 Red Flags (DO NOT LAUNCH if you see these)

- ❌ Production build fails
- ❌ Demo mode shows empty state
- ❌ `npm run build` shows TypeScript errors
- ❌ Server won't start
- ❌ Browser shows blank page

---

## ⚠️ Yellow Flags (Launch anyway, but note for fixes)

- ⚠️ Isolated recorder missing (recordings still work via fallback)
- ⚠️ 1-2 warnings in build (as long as it compiles)
- ⚠️ Accomplishment recording fails (not critical, can fix post-launch)

---

**Time:** ~60 seconds  
**Purpose:** Catch showstopper bugs before they go live  
**Next:** LAUNCH-IN-5-MINUTES.md
