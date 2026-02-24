# Recording Modes - Isolated Window Options

## Current System (Isolated & Invisible)

OpenClawfice uses **headless Chrome** for recordings:
- ✅ Completely isolated from your browser
- ✅ Doesn't interfere with your work
- ✅ No windows popping up
- ✅ Runs in background silently
- ❌ Can't see what's being recorded (debugging harder)

**Script:** `scripts/record-isolated.mjs`

## Three Recording Modes

### 1. Headless (Default) ⭐ RECOMMENDED

```bash
# Already configured - no changes needed
node scripts/record-isolated.mjs <id> 6 xp
```

**Pros:**
- Silent, invisible
- No disruption to your workflow
- Faster (no window rendering)
- Production-ready

**Cons:**
- Can't see what's recording (blind debugging)

**Use when:** Running in production, want zero disruption

---

### 2. Visible Window (Debugging)

```bash
# Use the visible variant
node scripts/record-isolated-visible.mjs <id> 6 xp
```

**Pros:**
- See exactly what's being recorded
- Isolated window (won't interfere with main browser)
- Great for debugging triggers/animations
- Window title: "🔴 OpenClawfice Recording"

**Cons:**
- Window pops up during recording
- Slightly slower (extra rendering)
- Visible distraction

**Use when:** 
- Debugging why recordings look wrong
- Testing new feature triggers
- Verifying animations work

---

### 3. User's Browser (Legacy - Not Recommended)

```bash
# Old screencapture approach
bash scripts/record-loom.sh <id> 6 "voiceover text"
```

**Pros:**
- Records your actual browser window
- No Chrome/Puppeteer dependency

**Cons:**
- **Captures whatever is visible on screen** (terminals, editors, etc.)
- Requires OpenClawfice to be focused
- Disrupts your workflow
- Can't trigger feature demos

**Use when:** Chrome not available (very rare)

---

## How to Switch Modes

### Option A: Environment Variable (Quick Toggle)

```bash
# In your shell or .env file:
export OPENCLAWFICE_RECORDING_MODE=visible

# Modes: headless (default), visible, legacy
```

### Option B: Config File (Persistent)

Edit `openclawfice.config.json`:

```json
{
  "recording": {
    "mode": "visible",
    "duration": 6,
    "fps": 10
  }
}
```

### Option C: Per-Accomplishment (Advanced)

```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add_accomplishment",
    "accomplishment": {
      "title": "Testing feature",
      "who": "Nova",
      "recordingMode": "visible"
    }
  }'
```

---

## Implementation Status

### ✅ Already Implemented

- [x] Headless mode (`record-isolated.mjs`)
- [x] Feature detection (xp, meeting, quest, etc.)
- [x] Frontend demo triggers
- [x] Legacy screencapture fallback

### 🚧 New (Just Created)

- [x] Visible mode script (`record-isolated-visible.mjs`)
- [ ] Environment variable toggle (needs API route update)
- [ ] Config file support (needs config parser)
- [ ] Per-accomplishment mode (needs API route update)

### 📋 To Do (If You Want These)

- [ ] Mode toggle in UI (Settings panel checkbox)
- [ ] Recording preview (show last frame in accomplishment)
- [ ] Recording logs (debug panel showing what triggered)

---

## Testing the Visible Mode

```bash
# Manual test (see the window!):
cd ~/clawd-openclawfice/openclawfice
node scripts/record-isolated-visible.mjs test-visible 6 xp

# Watch:
# 1. Chrome window opens with "🔴 OpenClawfice Recording" title
# 2. Loads http://localhost:3333
# 3. Triggers XP celebration (golden +150 popup)
# 4. Records for 6 seconds
# 5. Window closes automatically

# Check output:
open ~/.openclaw/.status/screenshots/test-visible.mp4
```

---

## Architecture: How Isolation Works

### Headless Mode (Current Default)

```
[Your Browser]          [Isolated Headless Chrome]
     |                           |
     |                           | puppeteer.launch({headless: true})
     |                           |
     | Continue working    Opens localhost:3333
     | uninterrupted       Triggers demo
     |                     Records 6 seconds
     |                     Closes automatically
     |                           |
     v                           v
  Keep coding                Video saved
```

**Key:** The headless Chrome instance is a **completely separate process** with its own:
- Browser state (no cookies/history from your browser)
- Window/tab (doesn't affect your tabs)
- JavaScript context (isolated execution)

### Visible Mode (New)

Same as headless, but:
- Window is visible (you can watch)
- Positioned at (100, 100) to avoid covering your browser
- Title: "🔴 OpenClawfice Recording" (easy to identify)

---

## Why This is Better Than Screencapture

### Old Approach (screencapture)
```
1. Find OpenClawfice browser tab
2. Focus it (brings to front, disrupts you)
3. Record screen region where window is
4. Hope nothing else covers it
5. Hope user didn't switch tabs
```

**Problem:** Depends on user's environment!

### New Approach (Isolated Chrome)
```
1. Launch fresh Chrome instance (headless or visible)
2. Navigate to localhost:3333
3. Trigger feature demo
4. Record exactly what we want
5. Close Chrome (no trace left)
```

**Benefit:** Completely deterministic and isolated!

---

## FAQ

**Q: Why does recording take 15-20 seconds?**  
A: Chrome startup (3s) + page load (2s) + recording (6s) + encoding (8s) = ~19s

**Q: Can I make recordings faster?**  
A: Yes! Reduce duration or use lower FPS:
```json
{"recording": {"duration": 3, "fps": 5}}
```

**Q: Will this work on Linux/Windows?**  
A: Yes! Puppeteer works cross-platform. Just need Chrome installed.

**Q: Can I record longer videos?**  
A: Yes, but file size grows fast:
- 6s @ 10fps = ~120KB
- 30s @ 10fps = ~600KB
- 60s @ 10fps = ~1.2MB

**Q: Why not record in real-time (like screen share)?**  
A: Frame-by-frame gives perfect frame rate and deterministic results. Real-time recording is harder to get right.

**Q: Can I disable recordings entirely?**  
A: Yes! Remove `scripts/record-isolated.mjs` and it falls back to no recording.

---

## Summary

**Current:** Headless isolated Chrome (best for production)  
**New Option:** Visible isolated Chrome (best for debugging)  
**Legacy:** Screencapture (not recommended, kept for compatibility)

**Recommendation:** Keep headless mode for normal use. Use visible mode only when debugging recording issues.

**To enable visible mode:** Create the environment variable or config option (needs API route update).

---

**Want me to implement the env variable / config file switching?** Let me know and I'll add it!
