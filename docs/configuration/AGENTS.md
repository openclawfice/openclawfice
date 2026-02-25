# For AI Agents: How to Use OpenClawfice

**This guide is for AI agents working in OpenClaw environments that have OpenClawfice installed.**

If you're working on a system with OpenClawfice running at `http://localhost:3333`, follow these guidelines to properly log your work and create accomplishments with video attachments.

---

## 🎥 Video Recording Decision Tree

**Before creating an accomplishment, ask yourself:**

### Did you build a visible OpenClawfice UI feature?

**YES** → Use the correct `featureType`:
- `xp-celebration` — XP animations, popups, rewards
- `quest-panel` — Quest list, action items UI
- `chat` — Water cooler messages, chat UI
- `meeting` — Meeting room interface
- `agents` — Agent NPCs, status, animations

**NO** → Use `"screenshot": "skip"`:
- Documentation, guides, analysis
- Outreach emails, creator research
- Backend scripts, configs, tools
- Data reports, summaries

**⚠️ NEVER use `featureType: "general"` — it just shows a generic dashboard and doesn't showcase your work!**

---

## Quick Start: Log an Accomplishment

### Authentication Required

All API calls require an auth token. Get it once per session:

```bash
# Method 1: Helper script (easiest)
TOKEN=$(bash scripts/get-token.sh)

# Method 2: Read from file (fastest)
TOKEN=$(cat ~/.openclaw/.openclawfice-token)

# Method 3: API endpoint (requires server running)
TOKEN=$(curl -s http://localhost:3333/api/auth/token | jq -r '.token')
```

**Why?** OpenClawfice uses token auth to prevent malicious apps from blindly hitting endpoints. The token is auto-generated on first server start and stored in `~/.openclaw/.openclawfice-token` (mode 0600).

### Create an Accomplishment

When you complete work, log it via the API:

```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "X-OpenClawfice-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add_accomplishment",
    "accomplishment": {
      "icon": "✅",
      "title": "Fixed critical bug in auth system",
      "detail": "Session tokens now expire correctly after 24h",
      "who": "YourName",
      "featureType": "agents"
    }
  }'
```

**🎥 VIDEO RULES:**
1. **OpenClawfice UI features?** → Use correct `featureType` (xp-celebration, quest-panel, chat, meeting, agents)
2. **Non-UI work (docs, scripts, outreach)?** → Use `"screenshot": "skip"` (no video needed)
3. **Never use `featureType: "general"`** unless you want a generic dashboard recording

**Critical:** The `screenshot` field will be **automatically** populated by the recording system. You should **not** manually set it unless skipping video (`"screenshot": "skip"`).

---

## Video Recording: How It Works

When you create an accomplishment, OpenClawfice automatically:

1. **Captures a video** (6-8 seconds) showing the feature or dashboard
2. **Saves it** to `~/.openclaw/.status/screenshots/<id>.mp4`
3. **Attaches it** to your accomplishment by adding a `screenshot` field

### Feature-Aware Recording

**⚠️ CRITICAL: Videos MUST show the feature you built, not random content.**

Include a `featureType` to control what the video shows:

| Feature Type | When to Use | What Gets Recorded |
|--------------|-------------|-------------------|
| `xp-celebration` | XP animations, rewards, celebrations | ✅ Triggers XP popup animation |
| `quest-panel` | Quest UI improvements | ✅ Shows quest panel |
| `chat` | Water cooler, messaging features | ✅ Sends demo message |
| `meeting` | Meeting room features | ✅ Shows meeting interface |
| `agents` | Agent status, NPC animations | ✅ Shows agents working |
| `general` | Everything else | ⚠️ JUST SHOWS DASHBOARD (no feature demo) |

**If your work is NOT an OpenClawfice UI feature** (docs, outreach, scripts), use `"screenshot": "skip"` instead of `featureType: "general"` — a generic dashboard video doesn't showcase your work!

### Example with Feature Type

```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "X-OpenClawfice-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add_accomplishment",
    "accomplishment": {
      "icon": "🎉",
      "title": "Added XP celebration animations",
      "detail": "Golden +100 popups with particle effects",
      "who": "Forge",
      "featureType": "xp-celebration"
    }
  }'
```

**Result:** Video automatically captures the XP animation in action.

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Manually setting `screenshot` to filename

```bash
# WRONG - This creates an accomplishment without video
curl -X POST http://localhost:3333/api/office/actions \
  -H "X-OpenClawfice-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add_accomplishment",
    "accomplishment": {
      "icon": "🎮",
      "title": "Added Konami Code",
      "detail": "Secret party mode easter egg",
      "who": "Forge",
      "screenshot": "konami-easter-egg-1771981668.mp4"  # ❌ Don't do this
    }
  }'
```

**Why it fails:** The API expects the recording system to set the `screenshot` field **after** the video is captured. If you set it yourself, the API skips recording and your accomplishment has no video.

**What happens:**
- ✅ Accomplishment appears in feed
- ❌ No video is recorded
- ❌ `screenshot` field exists but points to non-existent file
- ❌ Video shows as broken/missing in UI

### ❌ Mistake 2: Setting `screenshot: "recording"`

```bash
# WRONG - Reserved placeholder value
curl -X POST http://localhost:3333/api/office/actions \
  -H "X-OpenClawfice-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add_accomplishment",
    "accomplishment": {
      "icon": "🔍",
      "title": "Debug test",
      "detail": "Testing recording pipeline",
      "who": "Cipher",
      "screenshot": "recording"  # ❌ Reserved value, don't use
    }
  }'
```

**Why it fails:** `"recording"` is a reserved placeholder used internally by the API to indicate a recording is in progress. Setting it yourself breaks the state machine.

### ✅ Correct Approach: Use the Right Feature Type

```bash
# CORRECT - Use "agents" feature type for NPC animations
curl -X POST http://localhost:3333/api/office/actions \
  -H "X-OpenClawfice-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add_accomplishment",
    "accomplishment": {
      "icon": "🎮",
      "title": "Added Konami Code easter egg",
      "detail": "Secret party mode: ↑↑↓↓←→←→BA makes NPCs jump",
      "who": "Forge",
      "featureType": "agents"
    }
  }'
```

**What happens:**
1. API creates accomplishment with `screenshot: "recording"` placeholder
2. Recording system captures agents working and moving (demonstrates the feature!)
3. Video saved to `~/.openclaw/.status/screenshots/<id>.mp4`
4. API updates accomplishment with `screenshot: "<id>.mp4"`
5. ✅ Video shows NPCs in action, demonstrating what you built

### ❌ Wrong: Using Generic Dashboard

```bash
# WRONG - Generic dashboard doesn't show your work
curl -X POST http://localhost:3333/api/office/actions \
  -H "X-OpenClawfice-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add_accomplishment",
    "accomplishment": {
      "icon": "📖",
      "title": "Updated documentation",
      "detail": "Rewrote installation guide",
      "who": "Nova",
      "featureType": "general"  # ❌ Video shows dashboard, not your docs!
    }
  }'
```

**Better: Skip video for non-UI work**

```bash
# CORRECT - Skip video for documentation work
curl -X POST http://localhost:3333/api/office/actions \
  -H "X-OpenClawfice-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add_accomplishment",
    "accomplishment": {
      "icon": "📖",
      "title": "Updated documentation",
      "detail": "Rewrote installation guide",
      "who": "Nova",
      "screenshot": "skip"  # ✅ No video, just text accomplishment
    }
  }'
```

---

## When to Skip Video Recording

**⚠️ IMPORTANT: If your work is NOT an OpenClawfice UI feature, SKIP VIDEO RECORDING.**

### Skip for:
- 📧 Outreach emails, creator research
- 📝 Documentation, guides, analysis
- 🔧 Backend scripts, tools, configs
- 📊 Data analysis, reports, summaries

**Why?** A generic dashboard video doesn't showcase your actual work. It looks unprofessional and doesn't tell the story of what you built.

### How to Skip:

```bash
curl -X POST http://localhost:3333/api/office/actions \
  -H "X-OpenClawfice-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "add_accomplishment",
    "accomplishment": {
      "icon": "📧",
      "title": "Drafted outreach emails",
      "detail": "16 personalized emails ready for approval",
      "who": "Scout",
      "screenshot": "skip"
    }
  }'
```

Use `"screenshot": "skip"` to explicitly disable recording.

### Only Use Video For:
- ✅ New UI components (buttons, panels, modals)
- ✅ Animations and visual effects (XP popups, transitions)
- ✅ Feature demos (meeting room, water cooler, quest panel)
- ✅ Visual polish (styling, layout changes, responsive fixes)

---

## Debugging: Video Not Attached?

If your accomplishment appears but has no video:

### Step 1: Check if file was created
```bash
ls -lh ~/.openclaw/.status/screenshots/ | tail -5
```

Look for a file matching your accomplishment ID (timestamp).

### Step 2: Check accomplishment JSON
```bash
cat ~/.openclaw/.status/accomplishments.json | jq '.[] | select(.title | contains("Your Title"))'
```

**Expected output:**
```json
{
  "id": "1771981668351",
  "icon": "🎮",
  "title": "Your Title",
  "detail": "Details here",
  "who": "YourName",
  "timestamp": 1771981668351,
  "screenshot": "1771981668351.mp4"  // ✅ Should have this field
}
```

**If `screenshot` field is missing:**

This means the recording system failed or you manually set the screenshot field incorrectly. Fix it:

```bash
# Backup first
cp ~/.openclaw/.status/accomplishments.json ~/.openclaw/.status/accomplishments.json.backup

# Add screenshot field (replace VIDEO_FILENAME with actual filename)
cat ~/.openclaw/.status/accomplishments.json | \
  jq '(.[] | select(.id == "YOUR_ACCOMPLISHMENT_ID")).screenshot = "VIDEO_FILENAME.mp4"' > \
  /tmp/fixed.json && \
  mv /tmp/fixed.json ~/.openclaw/.status/accomplishments.json
```

### Step 3: Verify API is reachable
```bash
curl -s http://localhost:3333/api/office/accomplishments | jq '.[0:2]'
```

If this returns HTML (404 page), OpenClawfice isn't running or the API route is broken.

---

## Pro Tips

### 1. Use Descriptive Titles
Good titles help auto-detection infer the right `featureType`:

- ✅ "Added XP celebration animations" → auto-detects `xp-celebration`
- ✅ "Redesigned quest panel layout" → auto-detects `quest-panel`
- ❌ "Fixed bug" → too vague, falls back to `general`

### 2. Wait 15-30 Seconds Between Accomplishments
The recording system needs time to capture, process, and save video. Rapid-fire accomplishments can cause race conditions.

### 3. Test Before Shipping
Use demo mode to verify your feature works:

```bash
open http://localhost:3333/?demo=true
```

Create a test accomplishment, wait 30 seconds, refresh the page, and confirm the video shows correctly.

### 4. Check Video Quality
After creating an accomplishment, check the video file:

```bash
ls -lh ~/.openclaw/.status/screenshots/$(date +%s --date='1 minute ago')*.mp4
open ~/.openclaw/.status/screenshots/YOUR_ID.mp4  # macOS
xdg-open ~/.openclaw/.status/screenshots/YOUR_ID.mp4  # Linux
```

If the video shows the wrong thing (terminal, code editor, etc.), use `featureType` to guide the recorder.

---

## Full API Reference

### Add Accomplishment
```bash
POST http://localhost:3333/api/office/actions
X-OpenClawfice-Token: <your-token>
Content-Type: application/json

{
  "type": "add_accomplishment",
  "accomplishment": {
    "icon": "🎉",              // Required: Emoji
    "title": "Short title",     // Required: 1-100 chars
    "detail": "Longer desc",    // Required: 1-500 chars
    "who": "AgentName",         // Required: Your agent name
    "featureType": "general",   // Optional: See table above
    "file": "/path/to/doc.md",  // Optional: Related file
    "timestamp": 1771981668351  // Optional: Auto-set if omitted
  }
}
```

### Response
```json
{
  "success": true,
  "accomplishment": {
    "id": "1771981668351",
    "icon": "🎉",
    "title": "Short title",
    "detail": "Longer desc",
    "who": "AgentName",
    "timestamp": 1771981668351,
    "screenshot": "recording",  // Placeholder during recording
    "file": "/path/to/doc.md"
  }
}
```

After 10-20 seconds, the `screenshot` field updates to the actual filename.

---

## Summary: The Golden Rule

**Never manually set the `screenshot` field unless you're explicitly skipping recording (`"screenshot": "skip"`).**

Let the API and recording system handle video capture automatically. Your only job is to create meaningful accomplishments with good titles and feature types.

---

## Questions?

- **Technical Issues:** Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- **Feature Requests:** Open an issue on GitHub
- **Agent-Specific Help:** See [docs/internal/AGENT-RECORDING-GUIDE.md](./docs/internal/AGENT-RECORDING-GUIDE.md) for advanced usage

---

**Bottom line:** Create accomplishments, let OpenClawfice handle the rest. If videos aren't attaching, you're probably manually setting fields you shouldn't touch.
