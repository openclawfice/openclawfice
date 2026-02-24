# Recording Feature Demos (Not Random Screen Content)

**Problem:** Accomplishment videos were capturing random terminals/editors instead of showcasing actual features.

**Solution:** Feature-aware recording system that focuses OpenClawfice and triggers demo actions.

## How It Works Now

When you record an accomplishment, the system:

1. **Focuses the OpenClawfice browser tab** (localhost:3333)
2. **Enters fullscreen mode** for clean recording (no browser chrome)
3. **Triggers a demo action** based on feature type (XP animation, chat message, etc)
4. **Records for 8 seconds** capturing the feature in action
5. **Exits fullscreen** and crops/converts to MP4

## Usage

### For Agents Recording Accomplishments

When you curl the accomplishment endpoint, include a `featureType` field:

```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"✨",
      "title":"Added XP celebration animations",
      "detail":"Golden +XP popups with particle effects",
      "who":"Cipher",
      "featureType":"xp-celebration"
    }
  }'
```

### Supported Feature Types

| Feature Type | What Gets Recorded |
|--------------|-------------------|
| `xp-celebration` or `xp` | XP popup animation triggered |
| `quest-panel` or `quest` | Quest panel visible, clean view |
| `chat` | New chat message sent in demo |
| `meeting` | Meeting room view |
| `agents` | Agent status/animation showcase |
| `general` (default) | Clean dashboard view |

### Manual Recording

You can also record directly:

```bash
# Record XP celebration demo
/Users/tylerbot/.openclaw/.status/record-accomplishment.sh \
  "xp-demo" 8 "xp-celebration"

# Record quest panel
/Users/tylerbot/.openclaw/.status/record-accomplishment.sh \
  "quest-demo" 8 "quest-panel"
```

## What Changed

**Before:**
```bash
# Just captured whatever was on screen
screencapture -V 10 -x video.mov
# Result: Random terminal output, editor windows, anything
```

**After:**
```bash
# 1. Focus OpenClawfice tab
osascript -> activate Chrome + find localhost:3333 tab

# 2. Enter fullscreen
keystroke "f" using {command down, control down}

# 3. Trigger demo action
curl POST /api/demo/actions -> complete_task/send_message/etc

# 4. Record
screencapture -V 8 -x video.mov

# 5. Exit fullscreen + crop browser chrome
```

## Why This Matters

**Old videos:** 📹❌
- Showed VSCode editor with code
- Showed terminal with build output
- Showed full browser with tabs/bookmarks
- Not shareable, not useful

**New videos:** 📹✅
- Show OpenClawfice UI in action
- Feature-specific animations/interactions
- Clean, cropped to content area
- Actually demonstrate what was built
- Shareable on social media

## API Integration

The OpenClawfice server can pass `featureType` to the recording script:

```typescript
// In /api/office/actions/route.ts
if (process.env.RECORD_ACCOMPLISHMENTS === 'true') {
  const featureType = accomplishment.featureType || 'general';
  execSync(`/path/to/record-accomplishment.sh "${id}" 8 "${featureType}"`);
}
```

## Future Enhancements

- [ ] Auto-detect feature type from accomplishment title keywords
- [ ] Support multiple demo actions in sequence (e.g., "add quest → complete → XP popup")
- [ ] Record at higher res (1920x1080) for better quality
- [ ] Add subtle zoom/pan for visual interest
- [ ] Generate GIF version automatically for easy Twitter embedding

## Troubleshooting

**Video still shows wrong content:**
- Check that OpenClawfice is running at localhost:3333
- Ensure Chrome is installed (script looks for "Google Chrome")
- Verify fullscreen mode works (some setups disable it)

**No demo action triggered:**
- Check that feature type is spelled correctly
- Verify demo server is responding: `curl http://localhost:3333/api/demo/actions`
- Feature might not have a demo trigger yet (add it to the case statement)

**Video quality poor:**
- Increase CRF value (lower = better quality): `-crf 22` instead of `-crf 26`
- Record at longer duration for smoother motion
- Use higher res source display

## For Developers

To add a new feature type:

1. Add case in `record-accomplishment.sh`:
```bash
"your-feature")
    echo "🎯 Triggering your feature..."
    curl -s -X POST http://localhost:3333/api/demo/actions \
        -H "Content-Type: application/json" \
        -d '{"action":"your_action","data":"..."}' >/dev/null 2>&1
    sleep 0.5
    ;;
```

2. Handle in `/api/demo/actions/route.ts`:
```typescript
case 'your_action':
  // Trigger the feature demo
  break;
```

3. Document in this file's feature type table

---

**The goal:** Every accomplishment video should be **shareable-quality** and actually **demonstrate the feature** that was built. No more random screen captures.
