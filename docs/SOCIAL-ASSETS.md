# 🎨 Social Media Assets Specs

Quick reference for creating social media assets for OpenClawfice launches.

---

## 📱 Required Sizes

### Twitter/X Card
- **Size:** 1200×675px (1.91:1 ratio)
- **Format:** PNG or JPG
- **File:** `public/twitter-card.png`
- **Meta tag:** `<meta name="twitter:image" content="..." />`

### Open Graph (Facebook, LinkedIn, Discord)
- **Size:** 1200×630px (1.91:1 ratio)
- **Format:** PNG or JPG
- **File:** `public/og-image.png`
- **Meta tag:** `<meta property="og:image" content="..." />`

### GitHub Social Preview
- **Size:** 1280×640px (2:1 ratio)
- **Format:** PNG
- **Upload:** GitHub repo → Settings → Social Preview

### Product Hunt
- **Thumbnail:** 240×240px (square)
- **Gallery:** 1270×760px (landscape)
- **Video:** 16:9 ratio, max 60 seconds

---

## 🎨 Design Guidelines

### Brand Colors
- **Primary:** `#8b5cf6` (purple) — Plumbobs, highlights
- **Secondary:** `#ec4899` (pink) — Accents, gradients
- **Background:** `#0f172a` (dark blue) — Canvas
- **Text:** `#e2e8f0` (light gray) — Body text
- **Work Room:** `#1e293b` (slate) — Room background
- **Lounge:** `#0c4a6e` (blue-900) — Lounge background

### Typography
- **Headings:** "Press Start 2P" (retro pixel font)
- **Body:** System UI / Inter / SF Pro
- **Accent:** Monospace for code/tech terms

### Key Visuals
- **NPCs:** Pixel art characters with colored plumbobs
- **Rooms:** Work Room (slate) + Lounge (blue)
- **UI Elements:** Retro-styled panels, pixelated borders
- **Icons:** Emojis + pixel art

---

## 📐 Layout Ideas

### Option 1: Dashboard Screenshot
**Best for:** Showing actual product in action

- Full dashboard screenshot (1200×630)
- Overlay: "OpenClawfice" title (top-left)
- Tagline: "Turn your AI agents into Sims-style office workers"
- Add subtle gradient overlay for text readability

### Option 2: Hero Banner
**Best for:** Social shares, landing page

- Split layout: Left = 3-4 NPCs, Right = Text
- Left side: Pixel art agents with plumbobs
- Right side:
  - "OpenClawfice" (Press Start 2P)
  - "A charming retro dashboard for AI agents"
  - "Zero config • Real-time status • Quest log"
  - "Try the demo →"

### Option 3: Feature Grid
**Best for:** Highlighting key features

- 4-quadrant grid (2×2)
- Each quadrant: Icon + Feature name + 1-line description
  - 🎮 Demo Mode | Try in 10 seconds
  - 🤖 Zero Config | Auto-discovers agents
  - 📋 Quest Log | Pending decisions
  - 💬 Water Cooler | Agent chat
- Center overlay: "OpenClawfice" logo

### Option 4: Before/After
**Best for:** Showing the problem + solution

- Left: "Before" — Terminal logs, JSON files (boring)
- Right: "After" — Colorful dashboard with NPCs (fun!)
- Arrow between them
- Text: "From logs to a living office"

---

## 🎥 Video/GIF Specs

### Demo GIF (Twitter, Discord)
- **Duration:** 10-15 seconds
- **Size:** 1200×675px or 800×450px
- **Format:** GIF or MP4
- **Framerate:** 15-30 fps
- **Show:**
  1. Dashboard overview (2s)
  2. Click an agent → panel opens (3s)
  3. Quest log → expand item (3s)
  4. Water cooler chat scroll (2s)
  5. End on full dashboard with logo

### YouTube Walkthrough
- **Duration:** 5 minutes
- **Size:** 1920×1080px (1080p)
- **Format:** MP4, H.264
- **Structure:**
  - 0:00-0:30 — Intro: What is OpenClawfice?
  - 0:30-1:30 — Demo mode tour (try before install)
  - 1:30-2:30 — Installation walkthrough
  - 2:30-4:00 — Feature deep-dive (agents, quests, chat)
  - 4:00-5:00 — Customization + roadmap

### TikTok/Shorts (Viral Format)
- **Duration:** 30-60 seconds
- **Size:** 1080×1920px (9:16 vertical)
- **Format:** MP4
- **Hook (first 3s):** "I turned my AI agents into Sims"
- **Show:** Quick cuts, energetic music, before/after
- **CTA:** "Link in bio to try the demo"

---

## 📝 Copy Templates

### Short (Twitter, Discord)
```
Built a retro office for AI agents 🎮

Your OpenClaw agents → pixel art NPCs in a Sims-style dashboard

✨ Zero config
⚡ Real-time status
📋 Quest log
💬 Water cooler chat

Try the demo: [link]
```

### Medium (Reddit, HN)
```
I built OpenClawfice — a charming retro dashboard for OpenClaw agents.

Your agents become pixel art NPCs in a virtual office. See who's working, who's idle, and what decisions need human input — all with zero configuration.

Demo (no install): [link]
Install (one command): [link]

Open source • AGPL-3.0 • Built with love
```

### Long (Blog, Product Hunt)
```
OpenClawfice turns your AI agents into pixel art NPCs in a Sims-style virtual office.

Instead of tailing logs or checking JSON files, you get a delightful retro dashboard where agents move between rooms, chat at the water cooler, and signal when they need your input.

Key features:
• Zero config — auto-discovers agents from openclaw.json
• Real-time status — Work Room vs Lounge based on activity
• Quest log — Pending decisions that need human input
• Water cooler — Agents chat with each other
• Meeting Room — See agents discussing decisions
• Quest Templates — 8 pre-built workflows to get started
• Demo Mode — Try it in 10 seconds (no install)

Perfect for anyone running multiple OpenClaw agents who wants a fun, visual way to stay on top of their work.

Demo: [link]
Install: [link]
Docs: [link]

Open source (AGPL-3.0), contributions welcome!
```

---

## 🖼️ Asset Checklist

### Pre-Launch
- [ ] Twitter card (1200×675)
- [ ] Open Graph image (1200×630)
- [ ] GitHub social preview (1280×640)
- [ ] Favicon (32×32, 16×16)
- [ ] App icon (512×512)

### Launch Day
- [ ] Demo GIF (10-15s)
- [ ] Feature screenshot grid (3-4 images)
- [ ] "Before/After" comparison image

### Post-Launch
- [ ] YouTube walkthrough video (5 min)
- [ ] TikTok/Shorts vertical video (60s)
- [ ] Blog post hero image
- [ ] Press kit ZIP (all assets + logos)

---

## 🛠️ Tools for Creating Assets

### Screenshot/Recording
- **macOS:** Cmd+Shift+4 (screenshot), Cmd+Shift+5 (screen record)
- **Browser:** Chrome DevTools → Device toolbar for responsive
- **Gifski:** Convert screen recordings to high-quality GIFs

### Image Editing
- **Figma:** Best for layout, text overlays, graphics
- **Canva:** Quick social media templates
- **Photoshop/GIMP:** Advanced editing

### Video Editing
- **iMovie:** Simple, built-in (Mac)
- **DaVinci Resolve:** Pro-level, free
- **ScreenFlow:** Screen recording + editing (Mac)
- **OBS Studio:** Free, cross-platform recording

### Compression
- **TinyPNG:** Compress PNGs
- **Squoosh:** Compress images (Google)
- **HandBrake:** Compress videos

---

## 📊 Asset Performance Tips

### What Works
- **Bright colors** — Purple/pink gradient catches the eye
- **Pixel art aesthetic** — Memorable, unique, retro charm
- **Action shots** — Agents moving, chat scrolling, live updates
- **Before/After** — Shows the transformation clearly
- **Emojis** — Adds personality, breaks up text

### What to Avoid
- **Too much text** — Keep copy minimal on images
- **Dark screenshots** — Lighten them or add borders
- **Generic stock photos** — Use actual product screenshots
- **Slow-loading GIFs** — Keep under 5MB
- **Vertical video on desktop platforms** — Use 16:9 for YouTube/Twitter

---

## 🎯 Asset Priority Order

1. **GitHub social preview** — First impression for GitHub visitors
2. **Demo GIF** — Most viral, shareable asset
3. **Twitter card** — Improves click-through on tweets
4. **Open Graph image** — Better Discord/Slack/Facebook previews
5. **Feature screenshots** — For README, blog posts
6. **YouTube video** — Longer-term SEO, tutorials
7. **Press kit** — For journalists, influencers

---

## ✅ Next Steps

1. Take a clean dashboard screenshot (full office view)
2. Create Twitter card + OG image in Figma
3. Record 10-second demo GIF (dashboard interaction)
4. Upload GitHub social preview
5. Update HTML meta tags in `app/layout.tsx`

All assets should live in `/public/` directory for Next.js serving.
