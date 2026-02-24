# Agent Guide: Recording Feature Demos (Not Random Screens)

**For:** Cipher, Nova, Forge, Pixel, Scout, and all future agents

**Problem Fixed:** Accomplishment videos were showing random terminal windows, code editors, and browser tabs instead of the actual OpenClawfice features you built.

**Solution:** Feature-aware recording system that focuses OpenClawfice and demonstrates the specific feature.

## Quick Reference

When you complete work and want to record it, include `featureType` in your accomplishment:

```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"✨",
      "title":"Added keyboard shortcuts",
      "detail":"F1-F6 now switch between panels",
      "who":"Cipher",
      "featureType":"general"
    }
  }'
```

## Feature Types

| Type | When to Use | What Gets Recorded |
|------|-------------|-------------------|
| `xp-celebration` | Built XP animations, popups, particle effects | Triggers XP +100 animation automatically |
| `quest-panel` | Quest UI, action items, panel layouts | Shows quest panel in clean view |
| `chat` | Chat features, messages, conversation UI | Sends demo message and records response |
| `meeting` | Meeting room features, video calls | Shows meeting room interface |
| `agents` | Agent status, NPC animations, task rotation | Shows agents working with status updates |
| `general` | Everything else | Clean dashboard view |

## Examples

### Example 1: Cipher ships XP celebrations
```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"🎉",
      "title":"XP celebration animations shipped",
      "detail":"Golden +XP popups with particle bursts",
      "who":"Cipher",
      "featureType":"xp-celebration"
    }
  }'
```

**Result:** Video shows the actual XP popup animating on screen, not Cipher's code editor.

### Example 2: Nova improves quest panel
```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"📋",
      "title":"Redesigned quest priority badges",
      "detail":"High/medium/low now use color-coded icons",
      "who":"Nova",
      "featureType":"quest-panel"
    }
  }'
```

**Result:** Video focuses on the quest panel showing the new badges clearly.

### Example 3: Forge fixes agent animations
```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"🤖",
      "title":"Fixed NPC entrance animations",
      "detail":"Agents now slide in smoothly on page load",
      "who":"Forge",
      "featureType":"agents"
    }
  }'
```

**Result:** Video shows the office with agents moving around, status updating.

### Example 4: Pixel creates social assets
```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"🎨",
      "title":"Built social card generator",
      "detail":"Interactive HTML template for viral launch cards",
      "who":"Pixel",
      "featureType":"general"
    }
  }'
```

**Result:** Clean dashboard view (since social card generator isn't an OpenClawfice feature).

## Auto-Inference

If you forget to include `featureType`, the system will try to guess from your title:

| Title Keywords | Auto-Detected Type |
|----------------|-------------------|
| "XP", "celebration", "animation" | `xp-celebration` |
| "quest", "action", "panel" | `quest-panel` |
| "chat", "message", "conversation" | `chat` |
| "meeting", "room" | `meeting` |
| "agent", "NPC", "status" | `agents` |

**Example:**
```bash
# Title includes "XP celebration" → auto-detects as xp-celebration
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"✨",
      "title":"Added XP celebration effects",
      "detail":"Particle bursts on task completion",
      "who":"Cipher"
    }
  }'
```

## What Happens During Recording

1. **Focus browser** → Finds Chrome tab with `localhost:3333`
2. **Enter fullscreen** → Removes browser chrome for clean video
3. **Trigger demo action** → Sends API call to trigger XP popup, chat message, etc
4. **Record 8 seconds** → Captures the feature in action
5. **Exit fullscreen** → Returns to normal view
6. **Crop & convert** → Removes any remaining browser UI, saves as MP4

## Why This Matters

**Before (bad):** 📹❌
- Random terminal output
- VSCode with code
- Full browser with tabs
- Not shareable
- Not useful

**After (good):** 📹✅
- Actual feature demonstrated
- Clean, focused view
- Shareable on social media
- Shows what you built
- Viral potential

## Testing

To test the new system:

```bash
cd /Users/tylerbot/clawd-openclawfice/openclawfice
./scripts/test-feature-recording.sh
```

This will:
- Send 4 test accomplishments (XP, quest, chat, auto-inference)
- Trigger recordings for each
- Show you the results in `~/.openclaw/.status/screenshots/`

## Troubleshooting

**Video still shows wrong content:**
- Make sure OpenClawfice is running: `curl http://localhost:3333`
- Check that Chrome is open with the demo tab
- Try manually: `bash ~/.openclaw/.status/record-accomplishment.sh test-id 8 xp-celebration`

**No video generated:**
- Check recording script exists: `ls -l ~/.openclaw/.status/record-accomplishment.sh`
- Verify ffmpeg installed: `which ffmpeg`
- Look for errors in server logs

**Demo action didn't trigger:**
- Verify feature type is spelled correctly
- Check API endpoint: `curl -X POST http://localhost:3333/api/demo/actions -H "Content-Type: application/json" -d '{"action":"complete_task"}'`

## Pro Tips

1. **Always include featureType** for best results (don't rely on auto-inference)
2. **Wait 15 seconds** between accomplishments to avoid rate limiting
3. **Test locally first** before shipping to production
4. **Use descriptive titles** that explain what the video will show
5. **Check the video** after recording to make sure it captured correctly

## For Non-OpenClawfice Work

If you're working on something outside OpenClawfice (outreach emails, documentation, etc), you have two options:

**Option 1:** Skip video recording entirely
```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"📧",
      "title":"Drafted outreach email",
      "detail":"Email to tonightsconversation ready for approval",
      "who":"Scout",
      "screenshot":"skip"
    }
  }'
```

**Option 2:** Use `general` type for dashboard view
```bash
# Will show OpenClawfice dashboard in background
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"📧",
      "title":"Drafted outreach email",
      "detail":"Email to tonightsconversation ready for approval",
      "who":"Scout",
      "featureType":"general"
    }
  }'
```

---

**Bottom line:** Every accomplishment video should showcase the actual feature you built, not random screen content. Use `featureType` to control what gets recorded.
