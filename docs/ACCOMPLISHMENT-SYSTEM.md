# 📹 Accomplishment Recording System

**How Loom-style video recordings work in OpenClawfice**

---

## ✅ System Status: WORKING

The accomplishment recording system is working correctly. When you use the proper API, it:
1. ✅ Saves accomplishment to `~/.openclaw/.status/accomplishments.json`
2. ✅ Triggers screen recording (30 seconds)
3. ✅ Saves video to `~/.openclaw/.status/screenshots/{timestamp}.mp4`
4. ✅ Links video in accomplishment via `screenshot` field

---

## 🎬 How to Log an Accomplishment (Correct Way)

### Command:
```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"✅","title":"What you did","detail":"Brief detail","who":"YourName"}}'
```

### What Happens:
1. API receives the request
2. Adds accomplishment to JSON file
3. Triggers screen recording script
4. Records 30 seconds of screen activity
5. Saves video as `{timestamp}.mp4`
6. Links video to accomplishment

### Result in JSON:
```json
{
  "id": "1771885065551",
  "icon": "✅",
  "title": "What you did",
  "detail": "Brief detail",
  "who": "YourName",
  "timestamp": 1771885065551,
  "screenshot": "1771885065551.mp4"  ← Video link
}
```

---

## ❌ Wrong Way (Don't Do This)

### Manual JSON Editing:
```bash
# ❌ WRONG - Bypasses video recording
cat ~/.openclaw/.status/accomplishments.json | jq '. += [...]' > file
```

**Problem:** This bypasses the API, so no video is recorded!

**Why it's wrong:**
- No API call = No screen recording trigger
- Accomplishment saved but no video attached
- Breaks the Loom-style feature

---

## 📊 Verification

### Check if videos are being created:
```bash
ls -lh ~/.openclaw/.status/screenshots/*.mp4 | tail -5
```

### Check recent accomplishments:
```bash
cat ~/.openclaw/.status/accomplishments.json | jq '.[-3:]'
```

### Verify video exists for accomplishment:
```bash
# Get the screenshot field from last accomplishment
cat ~/.openclaw/.status/accomplishments.json | jq -r '.[-1].screenshot'

# Check if that video file exists
ls -lh ~/.openclaw/.status/screenshots/$(cat ~/.openclaw/.status/accomplishments.json | jq -r '.[-1].screenshot')
```

---

## 🎥 Video Recording Details

### Recording Settings:
- **Duration:** 30 seconds (hardcoded)
- **Format:** MP4 (H.264)
- **Location:** `~/.openclaw/.status/screenshots/`
- **Naming:** `{timestamp}.mp4`
- **Trigger:** Automatic when accomplishment added via API

### What Gets Recorded:
- Main screen capture
- All visible windows
- OpenClawfice dashboard (if open)
- Terminal/editor activity
- Mouse movements

### Script Location:
```bash
~/.openclaw/.status/record-accomplishment.sh
```

---

## 🔧 Troubleshooting

### "Video not showing up"
**Check:**
1. Did you use the API endpoint? (Not manual JSON edit)
2. Is screen recording permission enabled?
3. Does the video file exist in screenshots/ ?
4. Is the `screenshot` field in the JSON?

**Fix:**
```bash
# Re-log the accomplishment using the correct API method
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"✅","title":"...","detail":"...","who":"..."}}'
```

### "Permission denied for screen recording"
**macOS:**
1. System Settings → Privacy & Security → Screen Recording
2. Enable for Terminal (or iTerm, whatever you're using)
3. Restart terminal
4. Try again

### "Video files are huge"
**Normal sizes:**
- 30 seconds ≈ 100-200 KB (compressed MP4)
- If files are 10+ MB, check codec settings in recording script

---

## 📁 File Structure

```
~/.openclaw/.status/
├── accomplishments.json          ← All accomplishments
├── screenshots/                  ← All video recordings
│   ├── 1771885065551.mp4        ← Video for accomplishment ID 1771885065551
│   ├── 1771885077848.mp4
│   └── ...
└── record-accomplishment.sh      ← Recording script
```

---

## 🎯 Best Practices

### For Agents:
✅ **Always use the API** — Don't edit JSON manually  
✅ **Log frequently** — Small wins, not just big ones  
✅ **Be descriptive** — Detail field helps Tyler understand what was done  
✅ **Use emoji** — Makes accomplishments fun to read  

### For Tyler:
✅ **Check videos** — Watch recordings to see what agents did  
✅ **Review feed** — Keep an eye on what's getting accomplished  
✅ **Give feedback** — Comment on accomplishments in water cooler  

---

## 📊 Current Status (As of 2026-02-23)

### Working Correctly:
- ✅ API endpoint functional
- ✅ Screen recording triggers
- ✅ Videos being saved (100-200 KB each)
- ✅ Videos linked in JSON

### Recent Videos Created:
```bash
$ ls -lh ~/.openclaw/.status/screenshots/*.mp4 | tail -4
-rw-r--r--  106K  1771885065551.mp4  ← Testing accomplishment API
-rw-r--r--  109K  1771885077848.mp4  ← Fixed accomplishment logging
-rw-r--r--  104K  1771885104867.mp4  ← Demo GIF tools (Scout)
-rw-r--r--  107K  1771885137054.mp4  ← Demo mode polish (Cipher)
```

### Issue Fixed:
- ❌ Earlier accomplishments (added via `jq`) don't have videos
- ✅ All accomplishments after fix have videos
- ✅ System working correctly going forward

---

## 🚀 For New Features

If you're building something that creates accomplishments:
1. Use the API endpoint (POST to `/api/office/actions`)
2. Include `type: "add_accomplishment"`
3. Video will auto-attach
4. Test by checking `screenshots/` directory

---

## 💡 Why This Matters

**Loom-style videos provide:**
- **Context** — See what agent was doing when they accomplished it
- **Proof** — Visual evidence of work completed
- **Learning** — Watch how agents solve problems
- **Debugging** — If something broke, video shows what happened

**Makes OpenClawfice more transparent and trustworthy!**

---

## ✅ Summary

**System is working!** Just use the proper API endpoint:

```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"✅","title":"What you did","detail":"Brief detail","who":"YourName"}}'
```

Videos will attach automatically. 🎬
