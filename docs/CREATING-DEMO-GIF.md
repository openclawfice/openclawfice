# Creating the Demo GIF

**Priority:** HIGH (#2 viral asset after demo mode itself)  
**Impact:** 3-5x more Twitter engagement than static images  
**Time:** 30-45 minutes  
**Goal:** 10-15 second GIF showing OpenClawfice in action, under 5MB

---

## Two Approaches

### Option 1: Manual Recording (Recommended)
**Best for:** Natural cursor movements, full control  
**Time:** 30-45 minutes  
**Quality:** Highest (if done well)

### Option 2: Automated Generation
**Best for:** Quick iteration, consistent output  
**Time:** 10-15 minutes (after setup)  
**Quality:** Good (but less natural)

---

## Option 1: Manual Recording

### Quick Start
```bash
cd ~/clawd-openclawfice/openclawfice
./scripts/record-demo-gif.sh
```

This script will:
1. Check if demo is running
2. Detect recording tools
3. Provide exact recording timeline
4. Open demo in browser

### Recording Tools (Pick One)

#### A. Kap (Easiest)
```bash
# Install
brew install --cask kap

# Use
1. Open Kap
2. Click record
3. Select 1200×675 area
4. Follow script
5. Export as GIF (30 FPS, quality 90)
```

**Pros:** Dead simple, exports GIF directly  
**Cons:** Requires install

---

#### B. QuickTime + Gifski (Best Quality)
```bash
# Install Gifski
brew install gifski

# Use
1. QuickTime → New Screen Recording
2. Record the demo (follow script)
3. Save as video.mov
4. Convert: gifski --fps 30 --width 1200 --quality 90 video.mov -o demo.gif
```

**Pros:** Best compression, highest quality  
**Cons:** Two-step process

---

#### C. ScreenFlow (Professional)
If you have ScreenFlow:
1. Record demo
2. Edit/trim in ScreenFlow
3. Export as video
4. Convert with Gifski

**Pros:** Full editing control  
**Cons:** Requires paid app

---

### Recording Script (Follow Exactly)

```
Duration: 10-15 seconds
Resolution: 1200×675 (or larger, crop later)
Frame Rate: 30 FPS

TIMELINE:

00:00-00:02  Full dashboard view
             • 5 agents visible
             • Quest log + accomplishments showing
             • HOLD (let viewer see layout)

00:02-00:03  Move cursor to Nova (PM agent)
             • Smooth movement
             • Hover over NPC

00:03-00:05  Click Nova
             • Detail panel slides in
             • HOLD (show skills, needs, XP)

00:05-00:07  Close panel
             • Click X button
             • Panel slides out

00:07-00:09  Scroll to Quest Log
             • Smooth scroll down
             • Quest becomes visible

00:09-00:11  Click quest to expand
             • Quest expands
             • Show decision options

00:11-00:13  HOLD on expanded quest
             • Let viewer read

00:13-00:15  Scroll back to full view
             • Smooth scroll up
             • Show full office
             • END
```

### Pro Tips
- **Practice 2-3 times** before recording
- **Smooth cursor movements** — no jerky motions
- **Record multiple takes** — pick the best one
- **Test on Twitter** before finalizing

---

## Option 2: Automated Generation

### Quick Start
```bash
cd ~/clawd-openclawfice/openclawfice

# One-time setup
npm install -D playwright
npx playwright install chromium

# Generate GIF
node scripts/auto-generate-demo-gif.js
```

### What It Does
- Launches browser automatically (headless or visible)
- Executes predefined actions:
  - Hover agent
  - Click agent
  - Open panel
  - Click quest
  - Scroll
- Captures frames at 30 FPS
- Converts to GIF with ffmpeg
- Outputs to `/public/openclawfice-demo.gif`

### Customization
Edit `scripts/auto-generate-demo-gif.js`:

```javascript
const SCENES = [
  { name: 'full-dashboard', duration: 2000, action: 'hold' },
  { name: 'hover-agent', duration: 1000, action: 'hover', selector: '[data-agent-id="nova"]' },
  // ... add/edit scenes
];
```

### Troubleshooting

**"Playwright not installed"**
```bash
npm install -D playwright
npx playwright install chromium
```

**"Selector not found"**
- Check if demo mode has `data-agent-id` attributes
- Update selectors in script
- Or use manual recording instead

**GIF over 5MB**
```bash
# Reduce quality
gifski --fps 30 --width 1200 --quality 70 frames/*.png -o demo.gif

# Or reduce frame rate
gifski --fps 20 --width 1200 --quality 90 frames/*.png -o demo.gif
```

---

## After Creating GIF

### 1. Verify File Size
```bash
ls -lh ~/clawd-openclawfice/openclawfice/public/openclawfice-demo.gif
```

**Must be under 5MB** (Twitter limit)

### 2. Test Upload to Twitter
- Create draft tweet
- Attach GIF
- Verify it uploads successfully
- Check loop quality

### 3. Save to Correct Location
```bash
# Main GIF
~/clawd-openclawfice/openclawfice/public/openclawfice-demo.gif

# Optional: Mobile version (smaller)
~/clawd-openclawfice/openclawfice/public/openclawfice-demo-mobile.gif
```

### 4. Update README (Optional)
Replace screenshot with GIF for more engaging visual:

```markdown
![OpenClawfice Demo](./public/openclawfice-demo.gif)
```

### 5. Record Accomplishment
```bash
curl -s -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🎬","title":"Demo GIF created","detail":"10-15 sec viral-ready GIF (<5MB) showing OpenClawfice in action","who":"Pixel"}}'
```

---

## Compression Tips

### If GIF is Over 5MB

#### Method 1: Reduce Quality
```bash
gifski --fps 30 --width 1200 --quality 70 video.mov -o demo.gif
# Quality: 90 → 70 (still looks great)
```

#### Method 2: Reduce Resolution
```bash
gifski --fps 30 --width 1000 --quality 90 video.mov -o demo.gif
# Width: 1200 → 1000 (still readable)
```

#### Method 3: Reduce Frame Rate
```bash
gifski --fps 20 --width 1200 --quality 90 video.mov -o demo.gif
# FPS: 30 → 20 (slightly less smooth)
```

#### Method 4: Shorten Duration
Trim video to 10 seconds instead of 15:
```bash
ffmpeg -i video.mov -t 10 video-short.mov
gifski --fps 30 --width 1200 --quality 90 video-short.mov -o demo.gif
```

### Best Compression Tool
**Gifski** beats Photoshop, GIMP, and online converters for quality-to-size ratio.

---

## Success Criteria

### Must Have ✅
- [ ] Shows 5 agents in office
- [ ] Demonstrates agent interaction (click NPC → panel opens)
- [ ] Shows quest log
- [ ] Under 5MB file size
- [ ] 30 FPS (smooth animation)
- [ ] 10-15 seconds duration
- [ ] Loops seamlessly (or fades to black at end)

### Nice to Have
- [ ] Agent moving between rooms
- [ ] Water cooler message appearing
- [ ] Plumbob mood indicator visible
- [ ] Cursor movements smooth and natural

### Avoid ❌
- ❌ Text overlays (let visuals speak)
- ❌ Long pauses (keep it moving)
- ❌ Jerky cursor movements
- ❌ Over 15 seconds (attention span)
- ❌ Over 5MB (Twitter won't accept it)

---

## Why This Matters

### Impact on Virality

**Static Image Tweet:**
- 1-2% engagement rate
- Hard to understand product
- Requires imagination

**GIF Tweet:**
- 3-5% engagement rate (3x better!)
- Product in action = instant understanding
- Looping = multiple views per person
- Shows interactivity = builds desire

### Conversion

**Before GIF:**
User → static image → "what does this do?" → maybe click → maybe install

**After GIF:**
User → GIF → "oh that's cool!" → definitely click → definitely try demo → higher install rate

### ROI
- **Time investment:** 30-45 minutes
- **Engagement improvement:** 3x
- **Reusable:** Twitter, Discord, README, landing page
- **Essential:** Can't launch without it

---

## Examples of Good Demo GIFs

### Loom
- 10 seconds
- Shows recording → sharing → viewing
- Smooth cursor movements
- Under 3MB

### Tailwind UI
- 12 seconds
- Shows component library → customization
- Fast-paced but clear
- Under 4MB

### Discord
- 15 seconds
- Shows chat → voice → screen share
- Energetic but not chaotic
- Under 5MB

**Key pattern:** Show the core workflow in one smooth take. No narration needed.

---

## Checklist

- [ ] Read this guide fully
- [ ] Choose recording method (manual or automated)
- [ ] Practice cursor movements (if manual)
- [ ] Record demo (follow timeline)
- [ ] Export/convert to GIF
- [ ] Compress to under 5MB
- [ ] Test upload to Twitter
- [ ] Save to /public/openclawfice-demo.gif
- [ ] Update README (optional)
- [ ] Record accomplishment

---

## Questions?

- **Manual vs automated?** → Manual for first version (better quality)
- **Which tool?** → Kap if you want easy, QuickTime+Gifski for best quality
- **How long?** → 10-12 seconds is ideal (15 max)
- **File size?** → Must be under 5MB. Aim for 3-4MB to be safe.
- **When to ship?** → Today! It's the #2 viral asset (after demo mode)

---

**Next:** Record the GIF, test it on Twitter, ship it with the launch! 🚀
