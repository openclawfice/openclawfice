# Demo GIF Storyboard - 15 Second Shot List

**Target:** `public/openclawfice-demo.gif`  
**Duration:** 15 seconds  
**FPS:** 15 (smooth but not huge filesize)  
**Quality:** 90 (Gifski)

---

## Shot Breakdown

### 0:00-0:04 (4 seconds) - The Office
**What to show:**
- Wide view of the office
- 3-5 NPCs walking around
- Plumbobs floating above heads (green/yellow)
- Room labels visible (Work Room, Lounge)

**Camera position:** Zoomed out to show full office layout

**Action:** Let NPCs walk naturally, maybe one transitions between rooms

---

### 0:04-0:10 (6 seconds) - XP Celebration
**What to show:**
- Trigger XP celebration (manually via dev tools or wait for one)
- Golden +XP popup appears above NPC
- Particle burst animation
- XP number shows (e.g., +150)

**Camera position:** Zoom in slightly on the celebrating NPC

**How to trigger manually:**
```javascript
// Open browser console on localhost:3333
window.postMessage({
  type: 'demo_trigger',
  action: 'xp',
  agent: 'Cipher',
  amount: 150
}, '*');
```

**Action:** Capture the full celebration animation cycle

---

### 0:10-0:15 (5 seconds) - Meeting Room
**What to show:**
- Meeting room view with 2+ agents
- Speech bubbles or meeting UI
- Round counter or topic visible
- Agents facing each other

**Camera position:** Focus on meeting room area

**How to trigger manually:**
```javascript
// Browser console
window.postMessage({
  type: 'demo_trigger',
  action: 'meeting',
  agents: ['Cipher', 'Nova'],
  topic: 'Launch Strategy'
}, '*');
```

**Action:** Show agents in meeting, maybe one saying something

---

## Recording Steps

### 1. Prepare the Scene (30 seconds)
```bash
# Make sure dev server is running
cd ~/clawd-openclawfice/openclawfice
npm run dev -- --port 3333

# Open in browser
open http://localhost:3333

# Wait for agents to load and start moving
```

### 2. Record (15 seconds)
```bash
# macOS built-in recorder:
1. Press Cmd+Shift+5
2. Select "Record Selected Portion"
3. Draw rectangle around OpenClawfice window
4. Click "Record"
5. Execute shot list above (trigger XP, then meeting)
6. After 15 seconds, click Stop in menu bar
7. Save as ~/Desktop/openclawfice-demo.mov
```

### 3. Convert to GIF
```bash
# Install Gifski if needed:
brew install gifski

# Convert:
gifski ~/Desktop/openclawfice-demo.mov \
  -o ~/clawd-openclawfice/openclawfice/public/openclawfice-demo.gif \
  --quality 90 \
  --fps 15 \
  --width 1280

# Check filesize (target: <5MB):
ls -lh ~/clawd-openclawfice/openclawfice/public/openclawfice-demo.gif
```

### 4. Optimize if Needed
```bash
# If >5MB, reduce quality or FPS:
gifski ~/Desktop/openclawfice-demo.mov \
  -o ~/clawd-openclawfice/openclawfice/public/openclawfice-demo.gif \
  --quality 80 \
  --fps 12 \
  --width 1024
```

---

## Alternative: Use Existing Recording System

**Even easier:** Trigger an accomplishment with "xp" and "meeting" in the title, then use that video:

```bash
# Post accomplishment that triggers multiple demos:
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{
    "icon":"🎬",
    "title":"Demo: XP celebration and meeting room",
    "detail":"Showcasing XP animations and collaborative meetings",
    "who":"Demo"
  }}'

# Wait 20 seconds for recording to complete
sleep 20

# Find the video:
ls -lt ~/.openclaw/.status/screenshots/*.mp4 | head -1

# Convert to GIF:
gifski <video_file>.mp4 \
  -o ~/clawd-openclawfice/openclawfice/public/openclawfice-demo.gif \
  --quality 90 \
  --fps 15
```

---

## Quality Checklist

Before saving, verify:
- [ ] All 3 scenes visible (office, XP, meeting)
- [ ] NPCs are moving (not static screenshot)
- [ ] Animations smooth (no stuttering)
- [ ] Text readable (agent names, XP numbers)
- [ ] Filesize <5MB (ideal: 2-3MB)
- [ ] No personal data visible (terminal, notifications)
- [ ] Colors pop (pixel art style visible)

---

## What Makes a Great Demo GIF

**DO:**
- Show movement and life (NPCs walking)
- Highlight cool animations (XP particles)
- Show collaboration (meeting room)
- Keep it short (<20 seconds)
- Focus on the fun/quirky elements

**DON'T:**
- Show static screens
- Include terminal/code
- Make it too long (people scroll past)
- Use low quality (pixelated is bad, pixel-art is good!)
- Show boring stuff (just menus or settings)

---

## Example Tweet Copy (When Posted)

> I turned my AI agents into Sims 🎮
> 
> Watch them walk around a pixel-art office, earn XP, and hold meetings. It's like The Office meets retro RPG.
> 
> Try it: https://openclawfice.com/?demo=true
> 
> [GIF shows: NPCs walking → XP celebration → meeting room]

The GIF is the HOOK. Make it pop! 🎬

---

**Time estimate:** 5 minutes to record, 2 minutes to convert = 7 minutes total

**Blocker status:** NONE - everything you need is in this file

**Just do it!** Open terminal, follow steps 1-4, done. 🚀
