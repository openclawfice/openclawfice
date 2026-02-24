# Accomplishment Recording Fix

## The Problem

Tyler reported: "the looms are not actually recording a demo of the feature, its usually recording some random part of the screen, like a terminal, or a full page"

## Root Cause

The old recording script (`record-loom.sh`) had a critical flaw:

1. ✅ It correctly **focused** the OpenClawfice browser window using AppleScript
2. ❌ But it used `screencapture -V` which records the **ENTIRE screen**
3. ❌ Result: Even though OpenClawfice was focused, any terminals/editors/windows visible on screen would be captured instead

**Why it happened**: macOS `screencapture -V` (video mode) captures the full screen by default, not just the focused window.

## The Fix

Updated `scripts/record-loom.sh` to:

1. **Find** the OpenClawfice browser window (Chrome/Safari/Firefox/Arc/Brave)
2. **Get window bounds**: Use AppleScript to extract exact `x,y,width,height` coordinates
3. **Focus the window**: Raise it to front and give it 0.5s to fully render
4. **Record only that region**: Use `screencapture -V -R x,y,w,h` to capture JUST the window
5. **Add voiceover**: TTS narration still works as before

## What Changed

```bash
# OLD (wrong):
screencapture -V 6 output.mov  # Records entire screen

# NEW (correct):
screencapture -V 6 -R "100,200,1400,800" output.mov  # Records only OpenClawfice window
```

The script now:
- Returns error if OpenClawfice window not found (instead of recording random screen)
- Captures exactly what's in the browser tab showing localhost:3333
- Still includes TTS voiceover ("Agent just completed: Feature name")
- Still rate-limited to prevent spam (max 1 recording per 15 seconds)

## Testing

```bash
# Test the new script manually:
cd ~/clawd-openclawfice/openclawfice
bash scripts/record-loom.sh test-fix 6 "Testing window capture"

# Check the output:
ls -lh ~/.openclaw/.status/screenshots/test-fix.mp4
open ~/.openclaw/.status/screenshots/test-fix.mp4
```

**Expected result**: Video shows ONLY the OpenClawfice dashboard (NPCs, XP bars, accomplishments) — no terminals, editors, or other windows.

## Automatic Recording

This script is called automatically by `/api/office/actions` when:
- An accomplishment is added via POST (no screenshot provided)
- A quest is responded to (auto-creates accomplishment + recording)

**Flow**:
1. Agent calls `curl POST /api/office/actions` with accomplishment
2. API marks it as `screenshot: "recording"` immediately (UI shows 🔴 REC badge)
3. Spawns background `record-loom.sh` process
4. After 6-15 seconds, updates `screenshot: "accomplishment-123.mp4"`
5. UI polls and shows video player

## Known Limitations

- **Requires OpenClawfice to be open**: Script will fail if localhost:3333 isn't running in a browser
- **macOS only**: Uses AppleScript + screencapture (macOS-specific tools)
- **Rate limited**: Maximum 1 recording per 15 seconds to prevent pile-up
- **Window must be visible**: If the window is minimized/hidden, recording will fail

## Future Improvements (Post-Launch)

- [ ] Fallback to full-screen capture if window detection fails (current behavior: error)
- [ ] Pre-check if dev server is running before attempting to record
- [ ] Support for Linux (use `xdotool` + `ffmpeg` instead of AppleScript + screencapture)
- [ ] Support for Windows (use PowerShell + OBS Studio or similar)
- [ ] Option to disable recording per-agent (some agents spam accomplishments)

## Quick Test

Want to see if it works? Run this:

```bash
# 1. Make sure OpenClawfice is running in a browser (localhost:3333)
# 2. Run a test recording:
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🧪","title":"Test recording fix","detail":"Verifying window capture works","who":"Nova"}}'

# 3. Wait 10-15 seconds
# 4. Check accomplishments feed — should see video of OpenClawfice dashboard
```

---

**Status**: ✅ Fixed in commit [pending]  
**Tested**: Yes, test-recording-fix.mp4 successfully captured OpenClawfice window  
**Ready to ship**: Yes
