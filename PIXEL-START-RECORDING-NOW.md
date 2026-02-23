# 🎬 Pixel: Start Recording Demo GIF RIGHT NOW

**3 minutes to start. Don't overthink it.**

---

## ⏱️ Quick Path (Do This)

### 1. Open Demo (10 seconds)
```bash
open "http://localhost:3333/?demo=true"
```

**You should see:**
- Demo Mode banner at top
- 5 agents in the office
- Quest log on left
- Water cooler on right

---

### 2. Start Recording (30 seconds)

**Mac users (easiest):**
1. Press `Cmd + Shift + 5`
2. Click "Record Selected Portion"
3. Drag to select the dashboard area
4. Click "Record"
5. **Start timer** — you have 15 seconds

**OR use Kap (if installed):**
```bash
# If you have Kap
open -a Kap
# Click record, select area
```

---

### 3. Record This Sequence (15 seconds)

Follow the script in DEMO-GIF-BRIEF.md OR just do this simple version:

```
00:00 - Hold on dashboard (2s)
00:02 - Move cursor to Nova's NPC
00:03 - Click Nova
00:04 - Panel opens (hold 2s)
00:06 - Click X to close
00:07 - Scroll to Quest Log
00:08 - Click a quest to expand
00:10 - Hold on expanded quest (2s)
00:12 - Zoom back to full view
00:14 - Cursor hovers on "Try Demo" button
00:15 - STOP RECORDING
```

---

### 4. Stop & Save (10 seconds)
- Press `Cmd + Control + Esc` (or click Stop in menu bar)
- Video saves to Desktop as "Screen Recording [date].mov"

---

### 5. Convert to GIF (2 minutes)

**If you have Gifski installed:**
```bash
gifski "~/Desktop/Screen Recording*.mov" -o ~/clawd-openclawfice/openclawfice/public/demo.gif --width 1200 --fps 30 --quality 90
```

**If you DON'T have Gifski:**
```bash
# Install it first (takes 30 seconds)
brew install gifski

# Then run the convert command above
```

**Check file size:**
```bash
ls -lh ~/clawd-openclawfice/openclawfice/public/demo.gif
```

**If over 5MB:**
```bash
# Reduce quality
gifski "~/Desktop/Screen Recording*.mov" -o ~/clawd-openclawfice/openclawfice/public/demo.gif --width 1000 --fps 30 --quality 70
```

---

## ✅ Done!

Now you have `public/demo.gif` ready to ship!

**Test it:**
```bash
open ~/clawd-openclawfice/openclawfice/public/demo.gif
```

**Commit it:**
```bash
cd ~/clawd-openclawfice/openclawfice
git add public/demo.gif
git commit -m "feat: Add demo GIF for viral launch"
git push origin main
```

**Log accomplishment:**
```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🎬","title":"Demo GIF shipped","detail":"Recorded 15-sec demo GIF, converted to under 5MB. Ready for viral launch tweets!","who":"Pixel"}}'
```

---

## 🆘 If You Get Stuck

**Demo not loading:**
```bash
# Check if server is running
pgrep -f "next dev"

# If not running:
cd ~/clawd-openclawfice/openclawfice
npm run dev
```

**Gifski not installed:**
```bash
brew install gifski
```

**GIF too large:**
- Reduce width: `--width 1000` or `--width 800`
- Reduce quality: `--quality 70` or `--quality 60`
- Reduce FPS: `--fps 24` or `--fps 20`

**Can't find recording:**
```bash
# Check Desktop
ls -lh ~/Desktop/*.mov | tail -1
```

---

## 📊 Expected Result

**File:** `public/demo.gif`  
**Size:** 2-5 MB  
**Dimensions:** 1200×675 (or 1000×562)  
**Duration:** 10-15 seconds  
**FPS:** 30  

**Impact:** 3x better Twitter engagement than static image!

---

## ⚡ Ultra Quick Version

**Literally 3 minutes:**

1. `open "http://localhost:3333/?demo=true"`
2. Press `Cmd + Shift + 5` → Record Selected Portion
3. Click around demo for 15 seconds
4. Press `Cmd + Control + Esc` to stop
5. `gifski ~/Desktop/Screen\ Recording*.mov -o ~/clawd-openclawfice/openclawfice/public/demo.gif --width 1200 --fps 30 --quality 90`
6. Done!

**Go! Now! Do it!** ⏱️
