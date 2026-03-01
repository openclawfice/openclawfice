# 30-Second Walkthrough Video - Production Guide

**Purpose:** Record visual proof of OpenClawfice in action for README and creator outreach  
**Target Length:** 30 seconds  
**Output:** GIF or MP4 for README hero section  
**Created:** March 1, 2026

---

## Why This Matters

**Team Insight (Forge → Nova → Cipher):**
> "Adding the screenshot to the README proved documentation doesn't just explain—it sells. People need to see the retro pixel aesthetic working before they commit to installing. Visual proof upfront kills decision friction."

**The Ask:**
30-second walkthrough showing:
- Trading cards
- Agents moving between rooms
- Water cooler chat
- Quest log activity
- XP system / leveling

**Impact:**
- README converts better (visual proof > promises)
- Scout uses in creator outreach emails
- Social media shareable
- Demo alternative for those who won't install

---

## Shot List (30 Seconds)

### Shot 1: Office Overview (0-5s)
**What to show:**
- Full office view with multiple agents
- Work Room + Lounge visible
- Agents with green plumbobs (working state)
- Retro aesthetic immediately obvious

**How to capture:**
1. Start OpenClawfice in demo mode: `?demo=true`
2. Wait for agents to load
3. Full window capture (not zoomed)
4. Hold for 3-5 seconds (let viewer absorb)

**Voiceover/Caption:**
"Your AI agents, visualized as pixel art NPCs"

---

### Shot 2: Agent Movement (5-10s)
**What to show:**
- Agent walking from Work Room → Lounge
- Status change (working → idle)
- Plumbob color change (green → blue)
- Smooth animation

**How to capture:**
1. Wait for agent to change status
2. Capture the walk animation
3. Show destination (lounge)
4. Hold briefly on idle agent

**Voiceover/Caption:**
"Watch them move between rooms based on real status"

---

### Shot 3: Agent Click → Details Modal (10-15s)
**What to show:**
- Click on agent NPC
- Modal opens with agent card
- Shows: name, emoji, status, current task
- Stats visible (XP, level)
- Tool calls section (if available)

**How to capture:**
1. Click agent with interesting task
2. Let modal animate in
3. Scroll slightly to show all content
4. Hold on trading card aesthetic

**Voiceover/Caption:**
"Click any agent to see what they're doing"

---

### Shot 4: Water Cooler Chat (15-20s)
**What to show:**
- Water cooler panel on right
- Live messages appearing
- Agent names + timestamps
- Conversation flow visible
- Retro chat bubble style

**How to capture:**
1. Show water cooler with recent messages
2. If possible, trigger new message (demo mode should auto-generate)
3. Show message fade-in animation
4. Scroll to show message history

**Voiceover/Caption:**
"Agents chat at the water cooler in real-time"

---

### Shot 5: Quest Board (20-25s)
**What to show:**
- Quest log panel
- Pending action card
- Priority badge (medium/high/critical)
- Quest description
- Who requested it

**How to capture:**
1. Scroll to quest board section
2. Show at least 1-2 quest cards
3. Highlight priority indicator
4. Show quest detail on hover/expand

**Voiceover/Caption:**
"Tasks and decisions appear on the quest board"

---

### Shot 6: Accomplishments Feed (25-30s)
**What to show:**
- Recent accomplishment cards
- Agent who completed it
- Timestamp
- Video thumbnail (if available)
- XP/level up indicator

**How to capture:**
1. Scroll to accomplishments section
2. Show 2-3 recent items
3. Hover to show video preview (if exists)
4. End on latest accomplishment

**Voiceover/Caption:**
"Track what gets done with auto-captured recordings"

---

## Technical Requirements

### Recording Setup

**Option 1: QuickTime (macOS)**
```bash
# Screen recording
1. Open QuickTime Player
2. File → New Screen Recording
3. Select region (OpenClawfice window)
4. Click record
5. Perform walkthrough
6. Stop recording (menubar icon)
```

**Option 2: OBS Studio (Any OS)**
```bash
# Better quality, more control
1. Install OBS: https://obsproject.com
2. Add source → Window Capture → OpenClawfice
3. Settings → Output → Recording Quality: High
4. Start Recording
5. Perform walkthrough
6. Stop Recording
```

**Option 3: ffmpeg (CLI)**
```bash
# For automation
ffmpeg -f avfoundation -i "1:0" \
  -framerate 30 -video_size 1920x1080 \
  -t 30 \
  -c:v libx264 -crf 18 \
  walkthrough.mp4
```

### Window Setup

**Browser:**
- Chrome or Firefox (best rendering)
- Full screen (F11) or large window (1920x1080+)
- Hide browser chrome (URL bar, bookmarks)
- Zoom 100% (Cmd+0)

**OpenClawfice:**
- Demo mode: `http://localhost:3333/?demo=true`
- Wait for agents to load completely
- Close any dev tools (F12)
- Clear console warnings

**Display:**
- Resolution: 1920x1080 minimum
- Retina/HiDPI if available (sharper pixels)
- No desktop clutter visible
- Hide dock/taskbar if possible

---

## Post-Production

### Convert to GIF (For GitHub README)

**Using ffmpeg:**
```bash
# Generate palette for better quality
ffmpeg -i walkthrough.mp4 -vf "fps=15,scale=800:-1:flags=lanczos,palettegen" palette.png

# Create GIF
ffmpeg -i walkthrough.mp4 -i palette.png \
  -filter_complex "fps=15,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse" \
  walkthrough.gif
```

**Settings:**
- FPS: 15 (smooth enough, smaller file)
- Width: 800px (README optimal)
- Quality: High palette (256 colors)
- File size target: < 10MB (GitHub limit)

### OR Keep as MP4 (Better Quality)

**Using ffmpeg:**
```bash
# Compress for web
ffmpeg -i walkthrough.mp4 \
  -vf "scale=1280:-1" \
  -c:v libx264 -crf 23 \
  -preset slow \
  -c:a aac -b:a 128k \
  walkthrough-compressed.mp4
```

**Host on:**
- GitHub releases (attach to latest release)
- Vercel public folder (`/public/walkthrough.mp4`)
- CDN (Cloudflare, Bunny.net)

---

## README Integration

### Current README Structure
```markdown
# OpenClawfice

[Description]

![Screenshot](screenshot.png)  ← Replace with GIF/video

## Features
...
```

### Updated Structure (With Video)
```markdown
# OpenClawfice

🏢 Virtual office for your AI agents — pixel art NPCs, water cooler chat, quest log, XP system.

<div align="center">
  <img src="walkthrough.gif" alt="OpenClawfice in action" width="800">
  <p><em>30-second walkthrough: agents working, moving, chatting, completing quests</em></p>
</div>

> **Try it live:** [Demo Mode](https://openclawfice.com/?demo=true) • **Install:** `npx openclawfice`

## The Sims meets AI ops

Watch your OpenClaw agents work in real-time:
- 🎮 **Pixel art NPCs** that move between rooms based on status
- 💬 **Water cooler chat** where agents coordinate
- 📋 **Quest board** surfacing tasks that need your input
- 📊 **XP system** tracking productivity with levels
- 🎥 **Auto-captured videos** of completed work

[Rest of README...]
```

### Video Embed (If Using MP4)
```markdown
<div align="center">
  <video width="800" controls>
    <source src="https://github.com/openclawfice/openclawfice/releases/download/v0.1.0/walkthrough.mp4" type="video/mp4">
    Your browser doesn't support video.
  </video>
</div>
```

**Note:** GitHub doesn't support `<video>` in README markdown. Use GIF or link to YouTube/Vimeo.

---

## Quality Checklist

Before finalizing video:

### Visual
- [ ] Retro aesthetic clearly visible (terminal green, pixel fonts)
- [ ] Agents are animated (not static)
- [ ] Plumbobs visible and colored correctly
- [ ] Room transitions smooth
- [ ] No console errors visible
- [ ] No personal data visible (agent names generic)

### Technical
- [ ] 30 seconds or less
- [ ] 720p minimum resolution
- [ ] Smooth framerate (15fps+ for GIF, 30fps+ for video)
- [ ] File size < 10MB for GIF, < 20MB for MP4
- [ ] No audio issues (if including voiceover)

### Content
- [ ] All 6 key features shown (overview, movement, details, chat, quests, accomplishments)
- [ ] Each shot 3-5 seconds (enough to comprehend)
- [ ] Logical flow (overview → detail → features)
- [ ] Ending is clear (not abrupt cut)

### Marketing
- [ ] Demonstrates value immediately
- [ ] Shows "fun" factor (retro aesthetic, animations)
- [ ] Proves "productivity" (quests, accomplishments)
- [ ] Highlights unique features (NPCs, water cooler, XP)

---

## Scout Usage (Creator Outreach)

### Email Template (With Video)
```
Subject: OpenClawfice walkthrough (30 seconds)

Hey [Creator],

Quick 30-second video showing OpenClawfice in action:
[Embed or link to video]

Key moments:
- 0:05 - Agents as pixel art NPCs
- 0:10 - Live status updates (working → idle)
- 0:15 - Water cooler chat between agents
- 0:20 - Quest board surfacing decisions
- 0:25 - Accomplishments with auto-captured video

This is what your audience would install. Thoughts on featuring it?

[Rest of pitch]
```

### Why Video > Screenshot
- **Shows movement:** Static screenshot can't convey animations
- **Proves it works:** Seeing agents actually move = not vaporware
- **Shareable:** Easier for creators to repost video than screenshot
- **Conversion:** Video reduces "is this worth installing?" friction

---

## Alternative: Loom Recording

**If you want voiceover:**

1. Install Loom: https://loom.com
2. Start recording (select window)
3. Narrate as you walk through features
4. Stop recording
5. Download MP4
6. Compress if needed

**Script:**
```
(0-5s) "This is OpenClawfice - a virtual office for AI agents."
(5-10s) "Your agents appear as pixel art NPCs that move between rooms."
(10-15s) "Click any agent to see what they're doing in real-time."
(15-20s) "They chat at the water cooler to coordinate work."
(20-25s) "Important decisions surface on the quest board."
(25-30s) "Everything they accomplish gets logged with video proof."
```

---

## Next Steps

**For Tyler/Cipher (Video Creator):**
1. Review this guide
2. Set up recording environment
3. Open demo mode: `http://localhost:3333/?demo=true`
4. Record 30-second walkthrough following shot list
5. Post-process (GIF or compressed MP4)
6. Upload to repo or CDN
7. Update README with video
8. Notify Scout video is ready for outreach

**For Scout (Email Outreach):**
1. Wait for video from Tyler/Cipher
2. Test video in email template
3. Use in creator outreach: "Here's 30 seconds showing it working"
4. Track conversion improvement (video vs screenshot)

**For Pixel (Documentation):**
1. Update README with video embed
2. Create social media posts with video
3. Post to Twitter/Reddit with video
4. Submit to Product Hunt with video

---

## Success Metrics

**README Conversion:**
- Clicks on demo link (before/after video)
- GitHub stars (rate increase)
- Install attempts (npm download stats)

**Creator Outreach:**
- Email open rate (video in subject?)
- Response rate (video vs no video)
- "Yes" conversion (video convinced them)

**Social Media:**
- Video views (Twitter, Reddit, Product Hunt)
- Shares/retweets
- Demo traffic from video posts

---

**Status:** Guide ready for video production  
**Owner:** Tyler/Cipher to record, Pixel to ship  
**Impact:** Visual proof = reduced install friction = higher conversion

**Created by:** Forge  
**For:** Cipher (video creator) + Pixel (publisher) + Scout (outreach)
