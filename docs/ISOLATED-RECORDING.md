# 🎬 Isolated Window Recording

**Problem:** Recording the user's current browser window means we capture whatever they're doing - terminal, code editor, other tabs. Not ideal for showcasing features.

**Solution:** Open a separate, isolated browser window JUST for recording, independent of user activity.

---

## Approaches

### Option 1: Chrome App Window (Implemented ✅)

**What:** Opens Chrome in `--app` mode with a clean, isolated profile.

**How it works:**
1. Spawns Chrome with `--app=http://localhost:3333 --user-data-dir=/tmp/...`
2. Creates borderless window (no tabs, no toolbar)
3. Records that specific window
4. Closes the window after recording
5. Cleans up temp profile

**Pros:**
- Fast (uses existing Chrome)
- No dependencies
- Works on macOS immediately

**Cons:**
- Requires Chrome to be installed
- Brief window flash (user sees it open/close)
- Uses screencapture (macOS only)

**Script:** `scripts/record-app-window.sh`

**Usage:**
```bash
bash scripts/record-app-window.sh my-feature 6
# Opens isolated Chrome window
# Records for 6 seconds
# Closes window
# Saves to ~/.openclaw/.status/screenshots/my-feature.mp4
```

---

### Option 2: Puppeteer Headless (Better Long-Term)

**What:** Runs a completely invisible browser using Puppeteer, captures frames via Chrome DevTools Protocol.

**How it works:**
1. Launches headless Chromium (completely invisible)
2. Navigates to http://localhost:3333
3. Captures screencast frames via CDP
4. Assembles frames into MP4 with ffmpeg
5. No window flash, user sees nothing

**Pros:**
- Completely invisible (true headless)
- Works cross-platform (macOS, Linux, Windows)
- Can programmatically trigger interactions (click features, scroll, etc.)
- More reliable (no AppleScript dependencies)

**Cons:**
- Requires `npm install puppeteer` (300MB+ download)
- Slower first-time setup
- More complex

**Script:** `scripts/record-isolated.sh`

**Setup:**
```bash
cd ~/clawd-openclawfice/openclawfice
npm install puppeteer
```

**Usage:**
```bash
bash scripts/record-isolated.sh my-feature 6 http://localhost:3333
# Launches headless browser
# Records for 6 seconds
# Saves video
# User sees nothing
```

---

## Comparison

| Feature | Current (User Window) | Chrome App Window | Puppeteer Headless |
|---------|----------------------|-------------------|-------------------|
| User disruption | ❌ Depends on what's open | ⚠️ Brief window flash | ✅ None (invisible) |
| Reliability | ❌ Shows wrong content | ✅ Always shows OpenClawfice | ✅ Always shows OpenClawfice |
| Dependencies | ✅ None | ✅ Just Chrome | ❌ Requires Puppeteer |
| Cross-platform | ❌ macOS only | ❌ macOS only | ✅ Works everywhere |
| Speed | ✅ Fast | ✅ Fast | ⚠️ Slower (headless startup) |
| Feature targeting | ❌ Can't control | ⚠️ Shows default page | ✅ Can navigate to specific features |

---

## Recommendation

**For v0.1.0 Launch:**
Use **Chrome App Window** (`record-app-window.sh`)
- Fast implementation
- Works immediately on macOS
- Good enough for launch

**For v0.2.0:**
Upgrade to **Puppeteer Headless** (`record-isolated.sh`)
- Better user experience (invisible)
- More reliable
- Can showcase specific features programmatically

---

## Integration with Accomplishments API

Update `app/api/office/actions/route.ts` to use isolated recording:

```typescript
const RECORD_SCRIPT = join(process.cwd(), 'scripts', 'record-app-window.sh');

function triggerRecording(accomplishmentId: string, title: string, who: string) {
  if (!existsSync(RECORD_SCRIPT)) return;

  const now = Date.now();
  if (now - lastRecordingStarted < MIN_RECORDING_GAP_MS) {
    console.log(`[recording] Skipped (rate limited)`);
    return;
  }
  lastRecordingStarted = now;

  // Mark as recording immediately
  try {
    const accs = readJson(ACCOMPLISHMENTS_FILE);
    const target = accs.find((a: any) => a.id === accomplishmentId && !a.screenshot);
    if (target) {
      target.screenshot = 'recording';
      writeJson(ACCOMPLISHMENTS_FILE, accs);
    }
  } catch {}

  // Use isolated window recording
  const cmd = `bash "${RECORD_SCRIPT}" "${accomplishmentId}" ${RECORD_DURATION}`;

  exec(cmd, { timeout: (RECORD_DURATION + 15) * 1000 }, (err, stdout) => {
    // ... (same update logic as before)
  });
}
```

---

## Feature-Specific Recording

Want to showcase a specific feature? Pass a URL fragment:

```bash
# Record demo mode
bash scripts/record-app-window.sh demo-mode-showcase 10 "/?demo=true"

# Record a specific quest
bash scripts/record-app-window.sh quest-modal 8 "/#quest-12345"

# Record XP celebration in action
# (Puppeteer version can programmatically trigger it)
```

With Puppeteer, you can even script interactions:

```javascript
// In record-isolated.sh
await page.goto('http://localhost:3333');
await page.click('[data-agent-id="cipher"]'); // Click Cipher NPC
await page.waitForTimeout(2000); // Wait for XP animation
// Record captures the XP celebration automatically!
```

---

## Testing

### Test Chrome App Window:
```bash
cd ~/clawd-openclawfice/openclawfice
bash scripts/record-app-window.sh test-app-window 5

# Expected:
# - Chrome window opens briefly
# - Shows OpenClawfice dashboard
# - Window closes automatically
# - Video saved to ~/.openclaw/.status/screenshots/test-app-window.mp4
```

### Test Puppeteer Headless:
```bash
cd ~/clawd-openclawfice/openclawfice
npm install puppeteer  # One-time setup
bash scripts/record-isolated.sh test-headless 5

# Expected:
# - No visible window (completely headless)
# - Video saved automatically
# - Shows OpenClawfice dashboard
```

---

## Fallback Strategy

If isolated recording fails (Chrome not installed, Puppeteer missing), fall back to current user-window recording:

```bash
#!/bin/bash
# Try isolated recording first
if bash scripts/record-app-window.sh "$@" 2>/dev/null; then
  exit 0
fi

# Fall back to user window recording
bash scripts/record-loom.sh "$@"
```

---

## Future Enhancements

### V0.2.0+:
- [ ] Programmatically trigger specific features before recording
- [ ] Record multiple angles (wide shot + close-up of feature)
- [ ] Add annotations/arrows pointing to features
- [ ] Generate GIF versions for social media
- [ ] Record with different themes (dark/light mode)

### Advanced:
- [ ] Record agent "working" animation (show typing in terminal)
- [ ] Capture before/after comparisons
- [ ] Multi-window recording (show OpenClawfice + agent terminal side-by-side)

---

**Status:** Chrome App Window implementation ready for testing.  
**Next Step:** Test it, then update accomplishments API to use it by default.
