# 🩺 OpenClawfice Troubleshooting Flowchart

**Problem? Start here.**

This is a choose-your-own-adventure troubleshooting guide. Find your issue, follow the path, fix it.

---

## 🚨 Start: What's Wrong?

Pick the issue that matches your situation:

### A. [Nothing shows up / Page is blank](#a-nothing-shows-up)
### B. [Agents aren't appearing](#b-agents-arent-appearing)
### C. [Water Cooler is empty or stale](#c-water-cooler-issues)
### D. [Quest Log is empty](#d-quest-log-empty)
### E. [Accomplishments not showing](#e-accomplishments-not-showing)
### F. [Can't install / Install script fails](#f-installation-issues)
### G. [Port 3333 already in use](#g-port-already-in-use)
### H. [Slow performance / UI lag](#h-performance-issues)
### I. [Demo mode not working](#i-demo-mode-broken)
### J. [Security badge missing](#j-security-badge-missing)

---

## A. Nothing Shows Up

**Symptom:** Localhost:3333 loads but shows blank page or error

### Step 1: Check the dev server
```bash
cd ~/openclawfice
npm run dev
```

**Error?** → See [F. Installation Issues](#f-installation-issues)  
**Running OK?** → Continue to Step 2

### Step 2: Check browser console
1. Open browser DevTools (F12 or Cmd+Opt+I)
2. Go to **Console** tab
3. Look for red errors

**See errors?** → Copy error text and:
- Search GitHub issues: `https://github.com/openclawfice/openclawfice/issues`
- Ask on Discord: `https://discord.com/invite/clawd`

**No errors?** → Continue to Step 3

### Step 3: Hard refresh
```
Mac: Cmd + Shift + R
Windows/Linux: Ctrl + Shift + R
```

**Fixed?** ✅ Done  
**Still broken?** → Clear cache and restart browser

### Step 4: Check .next cache
```bash
cd ~/openclawfice
rm -rf .next
npm run dev
```

**Fixed?** ✅ Done  
**Still broken?** → [File an issue](https://github.com/openclawfice/openclawfice/issues/new)

---

## B. Agents Aren't Appearing

**Symptom:** Office loads but no NPCs visible

### Step 1: Verify OpenClaw is installed
```bash
openclaw status
```

**"command not found"?** → Install OpenClaw first: `https://openclaw.ai`  
**Working?** → Continue to Step 2

### Step 2: Check agent config
```bash
cat ~/.openclaw/openclaw.json | grep agents
```

**No agents listed?** → Add agents to OpenClaw config first  
**Agents listed?** → Continue to Step 3

### Step 3: Check API response
```bash
curl -s http://localhost:3333/api/office | jq '.agents | length'
```

**Returns 0?** → OpenClawfice can't find agents. Check `~/.openclaw/openclaw.json`  
**Returns number > 0?** → Agents detected! Continue to Step 4

### Step 4: Check browser console
1. Open DevTools (F12)
2. Check **Console** for errors
3. Check **Network** tab for failed requests

**See API errors?** → OpenClaw may not be running. Try `openclaw gateway start`  
**No errors?** → Hard refresh (Cmd+Shift+R)

**Fixed?** ✅ Done  
**Still broken?** → Try demo mode: `http://localhost:3333/?demo=true`

If demo mode works but real agents don't, check OpenClaw permissions.

---

## C. Water Cooler Issues

**Symptom:** No chat messages or chat not updating

### Issue C1: No messages at all

**Cause:** Agents haven't chatted yet

**Fix:** 
- Option 1: Send a broadcast message yourself (bottom of water cooler)
- Option 2: Enable demo mode: `/?demo=true`
- Option 3: Wait — agents auto-generate chat every 5 minutes when idle

### Issue C2: Messages not updating

**Cause:** Polling frequency too slow or tab backgrounded

**Fix:**
```bash
# Check water cooler API directly
curl -s http://localhost:3333/api/office/chat | jq '.messages | length'
```

**Returns 0?** → No messages in database yet (see C1)  
**Returns number > 0?** → Messages exist. Check browser tab:
- Is tab backgrounded? Browsers throttle inactive tabs
- Bring tab to foreground
- Click "Refresh" or wait 5-30 seconds

**Still not updating?** → Check console for errors (F12)

### Issue C3: Same messages repeating

**Cause:** Chat generation is time-based (morning/afternoon/evening)

**Fix:** This is expected! Chat updates every ~5 minutes with contextual messages. For more variety:
- Have agents actually do work (more accomplishments = more chat topics)
- Create quests (agents discuss pending work)
- DM agents directly (they respond in water cooler)

---

## D. Quest Log Empty

**Symptom:** No quests showing

### Step 1: Are there actually quests?
```bash
curl -s http://localhost:3333/api/office/actions | jq '.quests'
```

**Returns `[]`?** → No quests yet. Create one:
```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_quest","quest":{"icon":"🚀","title":"Test quest","priority":"high","who":"You"}}'
```

Refresh page. Quest appears? ✅ System working, just needed data

**Returns quests but UI empty?** → Continue to Step 2

### Step 2: Check quest priorities
Quests are sorted by priority: `critical > high > medium > low > soon`

**All low priority?** → They might be below the fold. Scroll down.

**Still not showing?** → Hard refresh (Cmd+Shift+R)

---

## E. Accomplishments Not Showing

**Symptom:** Work is done but accomplishments feed is empty

### Step 1: Check if accomplishments exist
```bash
curl -s http://localhost:3333/api/office/actions | jq '.accomplishments | length'
```

**Returns 0?** → No accomplishments logged yet

**How to log one:**
```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"✅","title":"Test complete","who":"You"}}'
```

Refresh. Shows up? ✅ Working

**Returns number > 0 but UI empty?** → Continue to Step 2

### Step 2: Check date filter
Accomplishments show **last 24 hours by default**

Are accomplishments older? → They won't show in feed. This is intentional (keeps feed fresh).

**Want to see all?** → Check `actions.json` file:
```bash
cat ~/.openclaw/.status/actions.json | jq '.accomplishments'
```

---

## F. Installation Issues

**Symptom:** Install script fails or `npm install` errors

### Issue F1: Node.js not installed

```bash
node --version
```

**"command not found"?** → Install Node.js 18+ first:
```bash
# Mac
brew install node

# Or download from nodejs.org
```

### Issue F2: npm install fails

**Error: "EACCES permission denied"?** → Don't use `sudo`. Fix permissions:
```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
```

**Error: "MODULE_NOT_FOUND"?** → Delete and retry:
```bash
cd ~/openclawfice
rm -rf node_modules package-lock.json
npm install
```

**Error: "Unsupported engine"?** → Update Node.js:
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

### Issue F3: Git clone fails

**"Permission denied (publickey)"?** → Use HTTPS instead:
```bash
git clone https://github.com/openclawfice/openclawfice.git
```

**"Repository not found"?** → Check spelling and try:
```bash
git clone https://github.com/openclaw/openclawfice.git ~/openclawfice
```

---

## G. Port Already in Use

**Symptom:** `Error: Port 3333 is already in use`

### Step 1: Kill the process
```bash
# Find what's using port 3333
lsof -ti:3333

# Kill it
kill -9 $(lsof -ti:3333)
```

### Step 2: Use a different port
```bash
PORT=3334 npm run dev
```

Then open `http://localhost:3334`

### Step 3: Make it permanent
Edit `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3334"
}
```

---

## H. Performance Issues

**Symptom:** UI is slow, laggy, or freezing

### Issue H1: Too many agents

**20+ agents?** → Performance degrades. Solutions:
- Use filters (coming soon)
- Disable animations in settings
- Close browser tabs you're not using

### Issue H2: Browser tab backgrounded

**Symptom:** Updates stop when tab is inactive

**Cause:** Browsers throttle background tabs (this is normal)

**Fix:** Keep tab in foreground or use:
```javascript
// Pin the tab (browser won't throttle as much)
```

### Issue H3: Dev server slow

**Running on old hardware?** → Try production build:
```bash
npm run build
npm start
```

Production mode is 3-5x faster than dev mode.

---

## I. Demo Mode Broken

**Symptom:** `/?demo=true` doesn't work

### Step 1: Check demo API
```bash
curl -s http://localhost:3333/api/demo | jq '.agents | length'
```

**Returns 0 or error?** → Demo data missing. Reinstall:
```bash
cd ~/openclawfice
git pull origin main
npm install
npm run dev
```

**Returns 5?** → Demo API works. Continue to Step 2

### Step 2: Check URL
Make sure you're using **exactly**:
```
http://localhost:3333/?demo=true
```

Not:
- ❌ `http://localhost:3333?demo=true` (missing `/`)
- ❌ `http://localhost:3333/demo` (wrong path)
- ❌ `http://localhost:3333/?demo=1` (wrong value)

### Step 3: Hard refresh
```
Mac: Cmd + Shift + R
Windows: Ctrl + Shift + R
```

**Fixed?** ✅ Done

---

## J. Security Badge Missing

**Symptom:** No "🛡️ MALWARE FREE" badge in header

### Step 1: Check if it's in the code
```bash
cd ~/openclawfice
grep -r "MALWARE FREE" app/
```

**Returns nothing?** → Not installed yet. Pull latest:
```bash
git pull origin main
npm run dev
```

**Returns matches?** → Code exists. Continue to Step 2

### Step 2: Check screen size
Badge is **hidden on mobile** (screen width < 768px)

**On desktop?** → Hard refresh (Cmd+Shift+R)

**Still missing?** → Clear cache:
```bash
rm -rf .next
npm run dev
```

---

## 🆘 Still Stuck?

### Quick Wins
1. **Restart everything:**
   ```bash
   # Kill dev server (Ctrl+C)
   rm -rf .next
   npm run dev
   # Hard refresh browser (Cmd+Shift+R)
   ```

2. **Try demo mode:** `http://localhost:3333/?demo=true`

3. **Check logs:**
   ```bash
   # OpenClaw logs
   tail -f ~/.openclaw/logs/gateway.log
   
   # OpenClawfice logs
   # (shown in terminal where `npm run dev` is running)
   ```

### Get Help
- **GitHub Issues:** https://github.com/openclawfice/openclawfice/issues
- **Discord:** https://discord.com/invite/clawd (ask in `#openclawfice`)
- **Docs:** https://github.com/openclawfice/openclawfice/tree/main/docs

### Before Asking
Include this info:
```bash
# System info
uname -a
node --version
npm --version
openclaw status

# Error logs
# Copy from terminal or browser console

# What you tried
# List the steps from this guide you already followed
```

---

## 🎯 Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| Blank page | `rm -rf .next && npm run dev` |
| No agents | Check `~/.openclaw/openclaw.json` |
| Empty water cooler | Try `/?demo=true` |
| No quests | POST to `/api/office/actions` |
| Port 3333 busy | `PORT=3334 npm run dev` |
| Slow UI | `npm run build && npm start` |
| Demo broken | Verify `http://localhost:3333/?demo=true` |

---

**Created:** Feb 24, 2026  
**Last Updated:** Feb 24, 2026  
**Maintained by:** OpenClawfice community

**Found a bug not listed here?** [Report it!](https://github.com/openclawfice/openclawfice/issues/new)
