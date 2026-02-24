# Migration: Fixing Accomplishment Recording

**What changed:** Accomplishment videos now showcase actual OpenClawfice features instead of random screen content.

## Quick Fix (1 minute)

The recording script has been updated. Just restart the OpenClawfice server:

```bash
cd ~/clawd-openclawfice/openclawfice
npm run dev
```

The server will automatically use the new feature-aware recording script.

## What's Different

### Old Behavior ❌
1. Recording triggered
2. Captured whatever was on screen (terminal, editor, random tabs)
3. Saved 6-second video of...nothing useful

### New Behavior ✅
1. Recording triggered with `featureType` (xp-celebration, quest-panel, chat, etc)
2. Focuses OpenClawfice browser tab
3. Enters fullscreen (removes browser chrome)
4. **Triggers demo action** (XP popup, chat message, etc)
5. Records 8 seconds of the feature in action
6. Exits fullscreen, crops, converts to MP4
7. Saved video actually shows the feature!

## For Agents

Update your accomplishment calls to include `featureType`:

```bash
# Old way (still works, but less targeted)
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{...}}'

# New way (better - shows actual feature)
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{
    "type":"add_accomplishment",
    "accomplishment":{
      "icon":"✨",
      "title":"Added XP celebrations",
      "detail":"Golden popups with particles",
      "who":"Cipher",
      "featureType":"xp-celebration"
    }
  }'
```

See `AGENT-RECORDING-GUIDE.md` for full details.

## Available Feature Types

- `xp-celebration` - Triggers XP popup animation
- `quest-panel` - Shows quest panel clearly
- `chat` - Sends demo chat message
- `meeting` - Shows meeting room
- `agents` - Shows agent status/animations
- `general` - Clean dashboard view (default)

## Testing

Test the new system:

```bash
./scripts/test-feature-recording.sh
```

This will record 4 test videos showing different feature types.

## Rollback (if needed)

If something breaks, you can temporarily revert:

```bash
# Restore old recording script
git checkout HEAD~1 -- ~/.openclaw/.status/record-accomplishment.sh
```

But you shouldn't need to - the new script is backward compatible.

## Files Changed

- `~/.openclaw/.status/record-accomplishment.sh` - Core recording script
- `app/api/office/actions/route.ts` - API handler (supports featureType param)
- `RECORDING-FEATURE-DEMOS.md` - Technical documentation
- `AGENT-RECORDING-GUIDE.md` - Agent usage guide
- `scripts/test-feature-recording.sh` - Test script

## Next Steps

1. ✅ Restart server (picks up new API handler)
2. ✅ Update agent accomplishment calls to include `featureType`
3. ✅ Test with `./scripts/test-feature-recording.sh`
4. ✅ Verify videos in `~/.openclaw/.status/screenshots/` look good
5. ✅ Ship shareable feature demos!

---

**The fix is automatic** - just restart the server. But adding `featureType` to your accomplishment calls will make the videos way better.
