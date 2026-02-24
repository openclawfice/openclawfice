# Fixing Loom-Style Recordings

## The Problem

Tyler reported: *"The looms are not actually recording a demo of the feature, it's usually recording some random part of the screen, like a terminal, or a full page, we need to actually record showcasing the feature and focus in on that"*

**Root cause**: The recording starts immediately when an accomplishment is logged, but:
1. The accomplishment hasn't appeared in the UI yet (takes 1-2s to fetch from API)
2. OpenClawfice window might not be focused
3. Recording captures whatever is on screen at that moment (often terminal/other apps)
4. Duration is only 6 seconds, not enough to show the feature

---

## Current Flow (Broken)

```
Agent logs accomplishment
  ↓ (instant)
API triggers record-accomplishment.sh
  ↓ (instant)
screencapture -V 6 starts recording
  ↓ (0-6 seconds)
Recording captures: random screen content
  ↓ (after 6 seconds)
Video saved (but shows wrong content!)
  ↓ (1-2 seconds later)
Accomplishment finally appears in UI (too late!)
```

---

## Solutions

### Option 1: Add Pre-Recording Delay (Quick Fix)

**Change**: Wait for accomplishment to render before recording

**Edit**: `/Users/tylerbot/.openclaw/.status/record-accomplishment.sh`

```bash
# Add after line 17 (before screencapture):
echo "⏳ Waiting 3s for accomplishment to appear in UI..."
sleep 3

# Try to focus OpenClawfice window
osascript <<EOF 2>/dev/null
tell application "System Events"
    tell process "Google Chrome"
        set frontmost to true
    end tell
end tell
EOF

sleep 1

echo "🎬 Recording screen for ${DURATION}s (silent mode)..."
```

**Pros:**
- Simple 2-line fix
- Accomplishment will be visible when recording starts
- Focuses browser window

**Cons:**
- Still records entire screen (might show other windows)
- Adds 4s delay before recording starts

---

### Option 2: Record OpenClawfice Window Only (Better)

**Use QuickTime Player to record specific window**

**New script**: `record-accomplishment-window.sh`

```bash
#!/bin/bash
OUTPUT_NAME="${1:-accomplishment}"
DURATION="${2:-10}"

SCREENSHOTS_DIR="/Users/tylerbot/.openclaw/.status/screenshots"
TEMP_DIR="/tmp/accomplishment-recording"
mkdir -p "$SCREENSHOTS_DIR" "$TEMP_DIR"

FINAL_FILE="$SCREENSHOTS_DIR/${OUTPUT_NAME}.mp4"

echo "⏳ Waiting 3s for accomplishment to appear..."
sleep 3

echo "🎯 Recording OpenClawfice window for ${DURATION}s..."

# Record Chrome window using ffmpeg + screencapture region
# First, get Chrome window position
WINDOW_INFO=$(osascript <<EOF
tell application "Google Chrome"
    set theWindow to first window whose name contains "OpenClawfice"
    set bounds of theWindow to {0, 0, 1280, 720}
    return {0, 0, 1280, 720}
end tell
EOF)

# Record specific region
/usr/sbin/screencapture -V "$DURATION" -R 0,0,1280,720 -x "$TEMP_DIR/screen.mov"

# Convert to MP4
ffmpeg -y -i "$TEMP_DIR/screen.mov" \
  -c:v libx264 -preset fast -crf 28 \
  -movflags +faststart \
  "$FINAL_FILE" 2>/dev/null

rm -f "$TEMP_DIR/screen.mov"

if [ -f "$FINAL_FILE" ]; then
    echo "✅ Saved: $FINAL_FILE"
    echo "${OUTPUT_NAME}.mp4"
fi
```

**Pros:**
- Only records OpenClawfice window
- Resizes window to standard size
- More focused video

**Cons:**
- More complex (window positioning)
- Requires Chrome to be in specific position

---

### Option 3: Screenshot Instead of Video (Simplest)

**Replace video with a screenshot of the accomplishment**

**New script**: `record-accomplishment-screenshot.sh`

```bash
#!/bin/bash
OUTPUT_NAME="${1:-accomplishment}"

SCREENSHOTS_DIR="/Users/tylerbot/.openclaw/.status/screenshots"
mkdir -p "$SCREENSHOTS_DIR"

FINAL_FILE="$SCREENSHOTS_DIR/${OUTPUT_NAME}.png"

echo "⏳ Waiting 3s for accomplishment to appear..."
sleep 3

echo "📸 Capturing screenshot..."
/usr/sbin/screencapture -x "$FINAL_FILE"

if [ -f "$FINAL_FILE" ]; then
    SIZE=$(ls -lh "$FINAL_FILE" | awk '{print $5}')
    echo "✅ Saved: $FINAL_FILE ($SIZE)"
    echo "${OUTPUT_NAME}.png"
fi
```

**Then update API to accept `.png` as valid screenshot**

**Pros:**
- Super simple
- No video compression issues
- Smaller file size
- Shows exact moment

**Cons:**
- No animation (just static image)
- Less "Loom-like"

---

### Option 4: Manual Recording Trigger (Best for Development)

**Don't auto-record. Let user manually trigger recording when ready.**

**Add button in UI**: "📹 Record Last Accomplishment"

**Flow:**
1. Accomplishment appears in feed
2. Tyler clicks "📹 Record" button next to it
3. Script waits 2s, then records 10s
4. Video captures OpenClawfice with accomplishment visible

**Pros:**
- Always captures correct content
- User controls when to record
- Can record as many times as needed

**Cons:**
- Not automatic
- Requires manual action

---

## Recommended Solution (Hybrid)

**Combine Option 1 + Option 4:**

1. **Add 3-second delay to auto-recording** (Option 1)
   - Ensures accomplishment is visible
   - Focuses browser window
   - Works for most cases

2. **Add manual re-record button** (Option 4)
   - For when auto-recording fails
   - Click to record again
   - Saves to same accomplishment ID

**Implementation:**

### Step 1: Update recording script

Edit `/Users/tylerbot/.openclaw/.status/record-accomplishment.sh`:

```bash
#!/bin/bash
OUTPUT_NAME="${1:-accomplishment}"
DURATION="${2:-10}"  # Increased from 6 to 10 seconds
TTS_TEXT="${3:-Check out what we just shipped}"

SCREENSHOTS_DIR="/Users/tylerbot/.openclaw/.status/screenshots"
TEMP_DIR="/tmp/accomplishment-recording"
mkdir -p "$SCREENSHOTS_DIR" "$TEMP_DIR"

VIDEO_FILE="$TEMP_DIR/${OUTPUT_NAME}-screen.mov"
FINAL_FILE="$SCREENSHOTS_DIR/${OUTPUT_NAME}.mp4"

echo "⏳ Waiting 3s for accomplishment to render in UI..."
sleep 3

echo "🎯 Focusing browser window..."
osascript <<EOF 2>/dev/null
tell application "System Events"
    tell process "Google Chrome"
        set frontmost to true
    end tell
end tell
EOF

sleep 1

echo "🎬 Recording screen for ${DURATION}s..."
/usr/sbin/screencapture -V "$DURATION" -x "$VIDEO_FILE"

if [ ! -f "$VIDEO_FILE" ]; then
    echo "❌ Recording failed"
    exit 1
fi

echo "🔗 Converting to MP4..."
ffmpeg -y -i "$VIDEO_FILE" \
  -vf "scale=1280:-2" \
  -c:v libx264 -preset fast -crf 28 \
  -movflags +faststart \
  "$FINAL_FILE" 2>/dev/null

rm -f "$VIDEO_FILE"

if [ -f "$FINAL_FILE" ]; then
    SIZE=$(ls -lh "$FINAL_FILE" 2>/dev/null | awk '{print $5}')
    echo "✅ Saved: $FINAL_FILE ($SIZE)"
    echo "${OUTPUT_NAME}.mp4"
else
    echo "❌ Conversion failed"
    exit 1
fi
```

### Step 2: Add manual re-record button (optional)

In `components/AccomplishmentFeed.tsx`, add button:

```tsx
{a.screenshot && (
  <>
    <button onClick={() => playVideo(a.screenshot)}>
      ▶️ Watch
    </button>
    <button onClick={() => reRecord(a.id)}>
      📹 Re-record
    </button>
  </>
)}
```

---

## Quick Fix (Apply Now)

**Edit the recording script:**

```bash
# Open the script
nano /Users/tylerbot/.openclaw/.status/record-accomplishment.sh

# After line 17, add:
echo "⏳ Waiting 3s for accomplishment to render..."
sleep 3

# After line 20, add:
osascript <<EOF 2>/dev/null
tell application "System Events"
    tell process "Google Chrome"
        set frontmost to true
    end tell
end tell
EOF
sleep 1

# Change DURATION from 6 to 10
DURATION="${2:-10}"

# Save and exit
```

**Test it:**

```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🧪","title":"Test recording fix","who":"Scout"}}'

# Wait 15 seconds
# Check video shows OpenClawfice with accomplishment visible
ls -lh ~/.openclaw/.status/screenshots/ | tail -1
```

---

## Alternative: Use Real Loom

**If you want actual Loom-style recordings:**

1. Install Loom app
2. Create `record-with-loom.sh`:

```bash
#!/bin/bash
# Opens Loom to record manually
open "loom://record"
echo "⏳ Record your screen, then save"
echo "Move video to: ~/.openclaw/.status/screenshots/"
```

**Pros:**
- Professional Loom features (drawing, highlights)
- Better quality
- Easier to edit

**Cons:**
- Not automatic
- Requires Loom account

---

## Summary

**Immediate fix**: Add 3-second delay + focus browser + longer duration

**Long-term**: Add manual re-record button in UI

**Apply quick fix now?** Edit `/Users/tylerbot/.openclaw/.status/record-accomplishment.sh` with changes above.

Let me know if you want me to apply the fix directly!
