# 🎬 Demo GIF Quick Start

**For:** Whoever is recording the demo GIF (Pixel, Tyler, or anyone with screen recording access)  
**Time:** 30-45 minutes  
**Output:** openclawfice-demo.gif (under 5MB)

---

## ✅ Super Simple Steps

### 1. Setup (5 minutes)

```bash
# 1. Make sure OpenClawfice is running
cd ~/clawd-openclawfice/openclawfice
npm run dev

# 2. Open demo in browser
open "http://localhost:3333/?demo=true"

# 3. Wait for 5 agents to appear
# 4. Clear any browser notifications/popups
```

### 2. Practice (5 minutes)

**Follow this exact sequence:**
1. Show full dashboard (hold 2 seconds)
2. Click on Nova or Forge NPC
3. Wait for detail panel to open
4. Close panel (click X)
5. Scroll to Quest Log
6. Click a quest to expand it
7. Hold on expanded quest (2 seconds)
8. Scroll back to top
9. Mouse to "Try Demo" button in header
10. Stop

**Practice 2-3 times until smooth!**

### 3. Record (10 minutes)

**Mac (built-in):**
```bash
# Open QuickTime Player
# File → New Screen Recording
# Click record button
# Select region or full screen
# Follow the practice sequence
# Stop recording when done
# Save as: demo-recording.mov
```

**Or use ScreenFlow/Kap if you have it installed**

### 4. Convert to GIF (10 minutes)

```bash
# Use the helper script
cd ~/clawd-openclawfice/openclawfice
./scripts/create-demo-gif.sh demo-recording.mov

# This will create:
# - public/openclawfice-demo.gif (desktop, 1200x675)
# - public/openclawfice-demo-mobile.gif (mobile, 800x450)
```

### 5. Verify (5 minutes)

```bash
# Check file size (must be under 5MB for Twitter)
ls -lh public/openclawfice-demo.gif

# Test in browser
open public/openclawfice-demo.gif

# Test upload to Twitter (create draft tweet)
```

---

## 📋 Exact Recording Script

**Follow these steps while recording:**

| Time | Action | What Viewer Sees |
|------|--------|------------------|
| 0:00 | Hold on full dashboard | 5 agents, quest log, accomplishments |
| 0:02 | Move cursor to Nova | Hover effect on NPC |
| 0:03 | Click Nova | Detail panel slides in |
| 0:05 | Hold | Skills, needs, XP visible |
| 0:07 | Click X | Panel closes |
| 0:08 | Scroll to Quest Log | Quest cards visible |
| 0:09 | Click quest | Expands to show details |
| 0:11 | Hold | Quest description + options |
| 0:13 | Scroll back up | Full dashboard again |
| 0:14 | Cursor to header | Hover on CTA button |
| 0:15 | STOP | End recording |

**Total:** 15 seconds

---

## 🚨 Common Issues & Fixes

### GIF is over 5MB
```bash
# Option 1: Reduce quality
gifski --fps 30 --width 1200 --quality 70 demo-recording.mov -o public/openclawfice-demo.gif

# Option 2: Reduce resolution
gifski --fps 30 --width 1000 --quality 90 demo-recording.mov -o public/openclawfice-demo.gif

# Option 3: Reduce framerate
gifski --fps 20 --width 1200 --quality 90 demo-recording.mov -o public/openclawfice-demo.gif
```

### Demo mode not showing agents
```bash
# Restart dev server
cd ~/clawd-openclawfice/openclawfice
rm -rf .next
npm run build
npm run dev

# Wait 30 seconds for build
open "http://localhost:3333/?demo=true"
```

### Recording looks jerky
- Use 60 FPS when recording (export at 30 FPS)
- Move cursor slowly and deliberately
- Practice the sequence 3-4 times first
- Hold still for 1-2 seconds on key moments

### GIF doesn't loop smoothly
- Make sure end frame matches start frame
- OR fade to black at the end
- Use looping preview tool to test

---

## 🎯 Quality Checklist

Before finalizing, verify:

- [ ] File size under 5MB (desktop version)
- [ ] File size under 3MB (mobile version)
- [ ] Duration 10-15 seconds
- [ ] All 5 agents visible
- [ ] Agent click interaction shown
- [ ] Quest log interaction shown
- [ ] Smooth cursor movements
- [ ] No browser UI visible (clean)
- [ ] Loops seamlessly (or fades out)
- [ ] Readable on mobile (test on phone)

---

## 📁 Where Files Go

After creation:
```
public/
├── openclawfice-demo.gif         ← Desktop version (use everywhere)
└── openclawfice-demo-mobile.gif  ← Mobile version (optional)
```

Then commit:
```bash
git add public/openclawfice-demo.gif public/openclawfice-demo-mobile.gif
git commit -m "feat: Add demo GIF for viral launch"
git push
```

---

## 🚀 What Happens After

Once GIF is ready:

1. **Add to README**
   ```markdown
   ![Demo](./public/openclawfice-demo.gif)
   ```

2. **Use in launch tweet**
   ```
   Built a retro office for AI agents 🎮
   
   Your OpenClaw agents → Sims-style NPCs
   
   Try it: openclawfice.com/?demo=true
   
   [Attach: openclawfice-demo.gif]
   ```

3. **Post to Discord**
   Attach GIF to launch post (3x more engaging)

4. **Update landing page**
   Replace static screenshot with GIF

---

## ⏱️ Time Budget

- Setup: 5 min
- Practice: 5 min
- Record: 10 min
- Convert: 10 min
- Verify: 5 min
- **Total: 35 min**

---

## 💡 Pro Tips

1. **Use demo mode** - More action than real office
2. **Practice first** - Makes recording smooth
3. **Keep cursor slow** - Easier to follow
4. **Hold key moments** - Agent panel, quest details
5. **Test on Twitter** - Ensure it uploads and loops

---

## ✅ When Done

```bash
# Record accomplishment
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🎬","title":"Demo GIF Created","detail":"10-15 sec viral asset, under 5MB, ready for launch","who":"<your name>"}}'

# Notify team
# Post in water cooler: "🎬 Demo GIF ready! Viral asset #2 complete."
```

---

**Questions?** Check DEMO-GIF-BRIEF.md for full details or ask in water cooler.

**Let's ship this! 🚀**
