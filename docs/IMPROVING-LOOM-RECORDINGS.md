# 🎥 Improving Loom-Style Recordings

**Problem:** Accomplishment recordings are capturing random parts of the screen (terminal, text editor) instead of showcasing the actual OpenClawfice feature.

**Goal:** Record videos that actually show the feature being demonstrated.

---

## Current Issue

When an agent logs an accomplishment:
```bash
curl -X POST /api/office/actions \
  -d '{"type":"add_accomplishment","accomplishment":{...}}'
```

The `record-loom.sh` script captures whatever is on screen at that moment:
- ❌ Agent's terminal window
- ❌ Code editor
- ❌ Random browser tab
- ❌ Not the OpenClawfice dashboard

**Why:** The script has no way to know what to record. It just runs `screencapture` blindly.

---

## Solutions (Pick One)

### Option 1: Auto-Focus OpenClawfice Window (Implemented)

**What:** Updated `record-loom.sh` to focus the OpenClawfice browser window before recording.

**How:**
- AppleScript finds browser window with "OpenClawfice" or "localhost:3333" in title
- Brings window to front
- Waits 1 second for rendering
- Then records

**Pros:**
- Automatic - no manual work
- Works with existing workflow
- Agents can keep working in terminal

**Cons:**
- Window switching might be jarring
- Fails if user closed the browser
- Timing issues (what if animation just finished?)

**Status:** ✅ Implemented in scripts/record-loom.sh

---

### Option 2: Client-Side Recording (Better Long-Term)

**What:** Record from the browser itself, not from the shell script.

**How:**

1. **Add recording API to OpenClawfice:**
```typescript
// app/api/office/record/route.ts
export async function POST(req: Request) {
  const { accomplishmentId, duration = 6 } = await req.json();
  
  // Trigger client-side recording
  return NextResponse.json({ 
    recordingId: accomplishmentId,
    duration,
  });
}
```

2. **Client captures using MediaRecorder:**
```typescript
// In app/page.tsx
async function captureScreen(duration: number) {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { 
        width: 1280, 
        height: 720,
        frameRate: 30,
      },
      audio: false,
    });
    
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
    });
    
    const chunks: Blob[] = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      // Upload to server
      const formData = new FormData();
      formData.append('video', blob, 'recording.webm');
      await fetch('/api/office/upload-recording', {
        method: 'POST',
        body: formData,
      });
      stream.getTracks().forEach(t => t.stop());
    };
    
    recorder.start();
    setTimeout(() => recorder.stop(), duration * 1000);
  } catch (err) {
    console.error('Recording failed:', err);
  }
}
```

**Pros:**
- Records exactly what the user sees
- No window switching
- Works cross-platform (not just macOS)
- Can add overlays, zoom effects

**Cons:**
- Requires browser permission
- More complex implementation
- Needs server upload endpoint

**Status:** ❌ Not implemented (v0.2.0 feature)

---

### Option 3: Screenshot + Annotations (Simpler Alternative)

**What:** Instead of video, take a screenshot of the OpenClawfice window with arrows/highlights.

**How:**

1. **Capture window screenshot:**
```bash
# Take screenshot of specific window (macOS)
screencapture -l$(osascript -e 'tell app "Safari" to id of window 1') screenshot.png
```

2. **Add annotations programmatically:**
```bash
# Use ImageMagick to add arrows, text, highlights
convert screenshot.png \
  -fill red -stroke red -draw "circle 640,360 660,380" \
  -pointsize 40 -fill white -annotate +500+500 "New Feature!" \
  annotated.png
```

**Pros:**
- Lightweight (1 image vs 6-second video)
- Easier to add highlights/arrows
- Loads faster in UI

**Cons:**
- Static (no motion/animation)
- Less engaging than video
- Manual annotation work

**Status:** ❌ Not implemented (alternative if video too complex)

---

## Quick Win: Improve Current Approach

**Immediate fixes to make recordings more useful:**

### 1. Add "Prepare to Record" Delay

Give agents a heads-up before recording starts:

```bash
# In record-loom.sh, before screencapture:
echo "🎥 Recording in 3 seconds... Focus OpenClawfice window!" >&2
sleep 3
```

**Result:** Agents can switch to browser manually.

### 2. Use Longer Duration for Complex Features

Some features need >6 seconds to demonstrate:

```typescript
// In app/api/office/actions/route.ts
const RECORD_DURATION = 6; // Change to 10 or 12
```

### 3. Add Visual Recording Indicator

Show "REC" badge in OpenClawfice UI during recording:

```typescript
// Detect if recording is active
const [isRecording, setIsRecording] = useState(false);

useEffect(() => {
  const checkRecording = setInterval(() => {
    fetch('/api/office/recording-status')
      .then(r => r.json())
      .then(data => setIsRecording(data.active));
  }, 1000);
  return () => clearInterval(checkRecording);
}, []);

// Show indicator
{isRecording && (
  <div style={{
    position: 'fixed',
    top: 16,
    right: 16,
    background: 'red',
    color: 'white',
    padding: '8px 12px',
    borderRadius: 4,
    fontWeight: 'bold',
  }}>
    🔴 REC
  </div>
)}
```

**Result:** Users know when to showcase features.

---

## Best Practice: Manual Recording for Key Features

For high-value accomplishments (launch, major features), record manually:

### Using macOS Screenshot Tool:
```bash
# 1. Open OpenClawfice in browser
open http://localhost:3333

# 2. Trigger the feature you want to record

# 3. Start screen recording (Cmd+Shift+5)
# Select "Record Selected Portion"
# Frame the OpenClawfice window
# Click "Record"

# 4. Demonstrate the feature (move mouse, click, etc.)

# 5. Stop recording (menu bar icon or Cmd+Control+Esc)

# 6. Save to ~/.openclaw/.status/screenshots/
mv ~/Desktop/Screen\ Recording*.mov ~/.openclaw/.status/screenshots/my-feature.mp4

# 7. Attach to accomplishment
curl -X POST /api/office/actions \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "title":"Shipped amazing feature",
      "screenshot":"my-feature.mp4",
      "who":"Forge"
    }
  }'
```

### Using Loom (actual Loom.com):
1. Install Loom browser extension
2. Start recording
3. Select "Current Tab"
4. Navigate to http://localhost:3333
5. Demonstrate feature
6. Stop recording
7. Download .mp4
8. Place in `~/.openclaw/.status/screenshots/`
9. Reference in accomplishment

---

## Recommendation for Tyler

**Short-term (ship with v0.1.0):**
- ✅ Use improved `record-loom.sh` (auto-focuses window)
- ✅ Document "recordings might be random" in README
- ✅ For important features, record manually

**Medium-term (v0.1.1 - based on feedback):**
- Add "Prepare to Record" countdown
- Show REC indicator in UI
- Increase duration to 10 seconds

**Long-term (v0.2.0 - if users request):**
- Client-side MediaRecorder implementation
- Upload endpoint for videos
- Optional: annotations, zoom, highlights

---

## Testing the Fix

Test if auto-focus works:

```bash
# 1. Open OpenClawfice in browser
open http://localhost:3333

# 2. Switch to terminal

# 3. Trigger an accomplishment (which starts recording)
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{
    "icon":"🧪",
    "title":"Test recording fix",
    "detail":"Verifying that recording now focuses OpenClawfice window",
    "who":"Forge"
  }}'

# 4. Wait 6 seconds

# 5. Check the video
open ~/.openclaw/.status/screenshots/$(ls -t ~/.openclaw/.status/screenshots/*.mp4 | head -1)
```

**Expected:** Video shows OpenClawfice dashboard, not terminal.

**If it fails:** Browser window title doesn't match, or AppleScript permission denied. Fall back to manual recording for now.

---

## Alternative: Disable Auto-Recording

If recordings are more trouble than they're worth:

```typescript
// In app/api/office/actions/route.ts
// Comment out the recording trigger:
/*
if (!a.screenshot) {
  triggerRecording(accId, a.title || 'Accomplishment', a.who || 'Agent');
}
*/
```

**Result:** Accomplishments save without videos. Faster, less intrusive.

**When to use:** If auto-recording keeps failing or users find it annoying.

---

## Documentation Updates Needed

If we keep auto-recording, update these docs:

1. **README.md:** Mention that videos auto-record but might be imperfect
2. **TROUBLESHOOTING.md:** Add "Recordings show wrong window" section
3. **COOL-FEATURES.md:** Explain how Loom-style videos work
4. **STATUS-FILES.md:** Document `screenshot` field in accomplishments

---

**Status:** Auto-focus fix implemented. Test it. If it doesn't work well, either:
- Add manual recording guide to docs
- Or disable auto-recording entirely

Tyler's call based on actual usage. 🎥
