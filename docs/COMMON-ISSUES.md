# Common Issues & Quick Fixes

**Quick troubleshooting for the most common first-time-user problems.**

---

## "No agents detected" / Empty office

### Symptoms
- Office loads but shows "Waiting for agents..."
- No NPCs visible in Work Room or Lounge
- Quest log and accomplishments are empty

### Causes & Fixes

**1. OpenClaw Not Running**
```bash
# Check if OpenClaw gateway is running
openclaw status

# If not running, start it
openclaw gateway start
```

**2. Config File Path Wrong**
OpenClawfice looks for `~/.openclaw/openclaw.json`

```bash
# Check if file exists
ls -la ~/.openclaw/openclaw.json

# If missing, OpenClaw isn't installed properly
# Reinstall: https://openclaw.ai
```

**3. Sessions File Empty/Missing**
```bash
# Check sessions file
cat ~/.openclaw/.status/sessions.json

# If empty or shows "[]", no agents are active
# Start an agent or wait for heartbeat
```

**4. Wrong Port**
If OpenClaw gateway is running on a different port:

```bash
# Check openclaw.json for gateway.url
cat ~/.openclaw/openclaw.json | grep "url"

# OpenClawfice connects to http://127.0.0.1:18789 by default
# If your gateway uses different port, it won't connect
```

---

## Port Already in Use (can't start on 3333)

### Symptoms
```
Error: listen EADDRINUSE: address already in use :::3333
```

### Fixes

**Option A: Use Different Port**
```bash
PORT=3334 openclawfice
# Then visit http://localhost:3334
```

**Option B: Kill Process on 3333**
```bash
# Find what's using port 3333
lsof -ti:3333

# Kill it
kill -9 $(lsof -ti:3333)

# Now start openclawfice normally
openclawfice
```

---

## Demo Mode Not Working

### Symptoms
- Demo page loads but shows empty office
- No simulated agents appear
- Console shows API errors

### Fixes

**1. Clear Browser Cache**
```
Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

**2. Check Demo API**
```bash
# Test demo endpoint
curl http://localhost:3333/api/demo

# Should return JSON with 5 agents
# If it returns error, Next.js isn't running properly
```

**3. Restart Dev Server**
```bash
# Kill openclawfice
# (Ctrl+C in terminal)

# Start again
openclawfice
```

---

## NPCs Not Moving / Frozen UI

### Symptoms
- NPCs stuck in one position
- Status doesn't update
- Accomplishments don't appear

### Fixes

**1. Check Browser Console**
```
Open DevTools (F12)
Look for errors in Console tab
Common: "Failed to fetch" or CORS errors
```

**2. Verify API is Responding**
```bash
# Test office API
curl http://localhost:3333/api/office

# Should return JSON with agents
# If timeout or error, server is crashed
```

**3. Restart Server**
```bash
# Stop (Ctrl+C)
openclawfice

# If it crashes immediately, check for:
# - Node.js version (needs 18+)
# - Corrupted node_modules (delete and reinstall)
```

---

## "Command not found: openclawfice"

### Symptoms
```bash
$ openclawfice
zsh: command not found: openclawfice
```

### Fixes

**1. Check Launcher Exists**
```bash
ls -la ~/.local/bin/openclawfice

# If missing, reinstall:
curl -fsSL https://openclawfice.com/install.sh | bash
```

**2. Add to PATH**
If file exists but command not found:

```bash
# For zsh (macOS default)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**3. Run Directly**
```bash
# Skip launcher, run directly
cd ~/openclawfice && npx next dev -p 3333
```

---

## XP System Not Working

### Symptoms
- Agents complete tasks but no XP toast
- Level stays at 1
- No celebration animations

### Fixes

**1. Check Accomplishments File**
```bash
# View accomplishments
cat ~/.openclaw/.status/accomplishments.json

# Should contain array of completed tasks
# If empty, agents aren't logging accomplishments
```

**2. Enable Accomplishment Recording**
Agents need to call the accomplishment API:

```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{
    "icon":"✅",
    "title":"Test Task",
    "detail":"Testing XP system",
    "who":"TestAgent"
  }}'
```

After this, refresh page and you should see XP toast.

**3. Check Browser Console**
```
F12 → Console
Look for XP calculation errors
Common issue: invalid accomplishment format
```

---

## Water Cooler Chat Too Frequent / Too Quiet

### Symptoms
- Agents chatting every 5 seconds (annoying)
- OR agents never chat (boring)

### Fixes

**1. Configure Frequency**
Create `~/openclawfice/openclawfice.config.json`:

```json
{
  "waterCooler": {
    "intervalSeconds": 30,
    "style": "casual",
    "quietHours": {
      "start": 23,
      "end": 8
    }
  }
}
```

**Options:**
- `intervalSeconds`: 15-300 (default: 30)
- `style`: "casual" | "professional" | "minimal"
- `quietHours`: Suppress chat during off-hours

**2. Disable Temporarily**
Set `intervalSeconds: 9999` for effectively silent mode.

---

## Quest Log Always Empty

### Symptoms
- Quest log shows "No pending quests"
- Agents are clearly working but nothing appears

### Fixes

**1. Check Actions File**
```bash
cat ~/.openclaw/.status/actions.json

# Should contain array of pending actions
# If file missing, create it:
echo "[]" > ~/.openclaw/.status/actions.json
```

**2. Add Test Quest**
```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_action","action":{
    "text":"Test quest - approve this",
    "from":"TestAgent",
    "priority":"medium"
  }}'
```

Refresh page - quest should appear.

**3. Check Permissions**
```bash
# Status directory needs write permissions
ls -la ~/.openclaw/.status/

# If permission denied:
chmod 755 ~/.openclaw/.status/
```

---

## Slow Performance / Laggy UI

### Symptoms
- NPCs move in slow motion
- Page feels unresponsive
- High CPU usage

### Fixes

**1. Disable Animations**
In browser DevTools Console:
```javascript
// Turn off CSS animations temporarily
document.body.style.setProperty('--animation-duration', '0s');
```

**2. Reduce Polling Frequency**
Edit `app/page.tsx` (for developers):
```typescript
// Change polling interval from 2000ms to 5000ms
const POLL_INTERVAL = 5000;
```

**3. Close Other Tabs**
OpenClawfice is GPU-intensive (pixel art + animations).
Close other browser tabs to free resources.

---

## Getting Help

**Still stuck?**

1. **Check logs**: `~/.openclaw/gateway.log`
2. **GitHub Issues**: https://github.com/openclawfice/openclawfice/issues
3. **Discord**: https://openclaw.ai/discord
4. **Docs**: https://docs.openclaw.ai

**Include in your issue:**
- Operating system (macOS / Linux / Windows)
- Node.js version (`node -v`)
- Error message (full text)
- Steps to reproduce

---

## Prevention Checklist

**Avoid 90% of issues by:**

✅ Install OpenClaw FIRST (`openclaw.ai`)  
✅ Use Node.js 18+ (`node -v`)  
✅ Start OpenClaw gateway before OpenClawfice  
✅ Use default port 3333 (or configure consistently)  
✅ Keep both updated (`git pull` in ~/openclawfice)  

**Health check:**
```bash
# Run this to verify everything works
cd ~/openclawfice && bash scripts/check.sh local
```

Should return "ALL CLEAR 🚀"

---

**Last updated:** Feb 24, 2026  
**For version:** 1.0.0+  
**Maintainer:** OpenClawfice community
