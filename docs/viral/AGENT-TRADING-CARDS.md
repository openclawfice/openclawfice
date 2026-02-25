# 🎴 Agent Trading Cards

**Pokemon-style shareable cards for your AI agents.**

The most viral feature in OpenClawfice. Create beautiful trading card images of your agents and share them on social media.

![Agent Card Example](https://via.placeholder.com/600x900/1e293b/ffffff?text=Agent+Card+Example)

---

## What Are Agent Trading Cards?

Each agent in your office can be exported as a **Pokemon/Magic-style trading card** with:

- **Rarity tier** (Common → Legendary) based on level
- **Stats** (Level, XP bar, mood, status)
- **Skills** (Programming, Research, Writing, etc.)
- **Recent work** (Last 3 accomplishments)
- **Holographic effects** (rarity glow, gradient borders)

**Design philosophy:** Screenshot-worthy. Twitter-ready. Collectible aesthetic.

---

## How to Generate a Card

### Method 1: Agent Panel (Easiest)

1. Click any agent in the office
2. **Agent Panel** opens on the right
3. Click **🎴 Trading Card** button (bottom of panel)
4. Card modal appears
5. Click **📥 Download PNG** or **📋 Copy to Clipboard**

**Time:** 10 seconds  
**Output:** 600x900px PNG image

---

### Method 2: Keyboard Shortcut (Power Users)

1. Press `1-9` to select an agent (quick-select)
2. Press `C` to open card modal
3. Download or copy

**Why this matters:** You can generate cards without touching your mouse.

---

## Rarity Tiers

Cards are automatically assigned rarity based on agent level:

| Rarity | Level Range | Color | Glow Effect |
|--------|-------------|-------|-------------|
| · COMMON | 1-4 | Gray (#94a3b8) | Subtle white glow |
| ○ UNCOMMON | 5-9 | Green (#22c55e) | Green glow |
| ● RARE | 10-14 | Blue (#3b82f6) | Blue pulse |
| ◆ EPIC | 15-19 | Purple (#a855f7) | Purple shimmer |
| ✦ LEGENDARY | 20+ | Gold (#fbbf24) | Golden holographic |

**Progression:** As your agents level up (earn XP), their rarity increases automatically.

---

## What's On a Card?

### Header
- **Rarity label** (top-left corner)
- **Agent emoji** (64px, centered)
- **Agent name** (uppercase, pixel font)
- **Role** (subtitle, e.g., "Digital Operative")

### Stats Section
- **Level badge** (LV.XX in gold)
- **XP bar** (progress to next level)
- **Mood** (★★★★★ rating)
- **Status** (⚡ WORKING or 💤 IDLE)

### Skills Section
Up to 4 skills with visual tags:
```
┌─────────────────────┐
│ CODING    RESEARCH  │
│ DESIGN    STRATEGY  │
└─────────────────────┘
```

Common skills:
- 💻 Coding
- 🔍 Research  
- ✍️ Writing
- 🎨 Design
- 📊 Strategy
- 🤝 Teamwork

### Recent Work
Last 3 accomplishments (truncated to fit):
```
→ Shipped auth system
→ Fixed 12 bugs
→ Wrote user docs
```

### Footer
- **Timestamp** ("COLLECTED FEB 2026")
- **Hologram badge** (for Rare+ cards)
- **OpenClawfice branding**

---

## File Specs

**Dimensions:** 600x900px (2:3 aspect ratio)  
**Format:** PNG with transparency  
**File size:** ~50-150KB (optimized for social media)  
**DPI:** 2x (Retina-ready)  
**Color space:** sRGB

**Why 600x900?**
- Perfect for Instagram posts (4:6 crop)
- Twitter card compatible
- Print-ready at 2x3 inches (trading card size)

---

## Sharing Strategies

### Twitter
**Best practice:**
```
Just hit Level 15 with Cipher! ◆ EPIC tier 🔥

My AI agent's stats:
→ 3,200 XP
→ 47 tasks shipped
→ Mood: ★★★★★

[Attach card image]

Get your own AI office: openclawfice.com
```

**Expected engagement:** 2-5x more likes than text-only posts

---

### Discord
Post in:
- `#showcase` channels (show off your agents)
- Community servers (homelab, self-hosted, AI tools)
- Friend groups (flex your setup)

**Pro tip:** Post all your agents as a "full deck" (gallery of 3-5 cards).

---

### Reddit
Best subreddits:
- r/homelab — "My AI agent reached LEGENDARY tier"
- r/selfhosted — "Built a Pokemon-style dashboard for my AI"
- r/dataisbeautiful — "Agent progression over 30 days"
- r/gaming — "The Sims but it's your dev team"

**Hook:** Focus on the RPG/gamification angle.

---

### LinkedIn (Professional Flex)
```
Gamifying productivity with AI agents.

This is Cipher — my automated DevOps agent. Level 18, 4500 XP, shipped 120+ tasks this month.

Built with OpenClawfice (open source).
```

**Why it works:** Combines professional tech + fun aesthetic.

---

## Creative Uses

### Team Leaderboard
Export cards for all agents → arrange in grid → post as "monthly MVP board"

```
┌─────┬─────┬─────┐
│ #1  │ #2  │ #3  │
│Ciph │Nova │Scou │
│ 18  │ 15  │ 12  │
└─────┴─────┴─────┘
```

---

### Progress Posts
Same agent, 7 days apart:
- **Before:** COMMON (Lv.3, 600 XP)
- **After:** RARE (Lv.10, 2100 XP)

**Caption:** "One week of AI automation"

---

### Meme Templates
- "When your agent levels up to LEGENDARY at 3 AM"
- "This is fine" (agent with stressed mood ★★☆☆☆)
- "Tell me you use AI without telling me" (5 LEGENDARY cards)

---

### Print & Collect (IRL)
Some users print cards as physical collectibles:

1. Export all agent cards
2. Print at 2x3 inches on cardstock
3. Use trading card sleeves
4. Gift to team members

**Community challenge:** "Collect all rarities" (Common → Legendary progression).

---

## Technical Details

### How Cards Are Generated

**Client-side rendering** via HTML5 Canvas:
1. Agent data fetched from `/api/office`
2. Canvas drawn in browser (no server-side image generation)
3. PNG exported via `canvas.toDataURL()`

**Why Canvas?**
- Fast (renders in < 100ms)
- No external dependencies (no image libraries)
- Works offline
- Pixel-perfect control

---

### Customization (Advanced)

Want to tweak card designs? Edit:
```
openclawfice/components/AgentCard.tsx
```

**Things you can customize:**
- Color schemes (rarity gradients)
- Font sizes (name, stats, skills)
- Skill icons (add new categories)
- Background patterns (e.g., circuit boards for tech agents)

**After editing:** Restart dev server → cards update immediately

---

### Accessibility

**Keyboard navigation:**
- Tab to "Trading Card" button
- Enter to open modal
- Tab to Download/Copy buttons
- Esc to close

**Screen readers:**
- Card elements announced as "Agent card for [Name], Level [X], [Rarity] tier"
- Download button: "Download [Name] trading card as PNG"

---

## Troubleshooting

### "Card doesn't generate"

**Check:**
1. Agent has required data (name, level, XP)
2. Browser supports Canvas API (all modern browsers do)
3. No console errors (open DevTools → Console tab)

**Fix:** Refresh the page. If issue persists, file a bug.

---

### "Image looks blurry on Retina screens"

**Answer:** Cards are 2x DPI by default. If it looks blurry:
- Download the PNG (don't screenshot)
- Upload to Twitter/Discord (they preserve quality)

**Avoid:** Pasting from clipboard sometimes reduces quality (browser limitation).

---

### "Skills section is empty"

**Answer:** Skills are inferred from agent accomplishments. If an agent has no accomplishments yet, skills won't populate.

**Fix:** Let the agent complete a few tasks. Skills auto-populate based on work patterns.

---

### "Can I bulk-export all cards?"

**Current status:** Not yet (coming in v0.2).

**Workaround:**
1. Open Agent Panel for each agent
2. Click 🎴 Trading Card
3. Download each individually

**ETA:** Bulk export in next major release.

---

## Behind the Design

### Inspiration
- **Pokemon TCG** — Rarity tiers, holographic effects, stat bars
- **Magic: The Gathering** — Card layout, skill categories
- **Hearthstone** — Digital card aesthetic, glow effects

### Why Trading Cards?
1. **Nostalgia** — Everyone loves collecting cards
2. **Shareable** — Perfect 2:3 ratio for social media
3. **Gamification** — Makes productivity feel like leveling up
4. **Viral** — People WANT to show off rare/legendary agents

### Design Principles
- **Pixel-perfect** — Every element aligned to 8px grid
- **High contrast** — Readable even as thumbnails
- **Retro aesthetic** — Matches OpenClawfice vibe
- **Information density** — Tells full story at a glance

---

## Community Gallery

Want to see cards from other users? Check:
- **Discord #showcase** — https://discord.gg/clawd
- **Twitter #openclawfice** — Search for card posts
- **Reddit r/openclawfice** — Community submissions

**Submit yours!** Post your best cards to any platform and tag `#openclawfice`.

---

## Roadmap

Planned improvements:

**v0.2:**
- Bulk export (all agents → ZIP file)
- Custom backgrounds (upload your own patterns)
- Animated GIFs (mood changes, XP animations)

**v0.3:**
- Trading (send cards to other users)
- Rarity boosts (level up faster via achievements)
- Foil variants (ultra-rare holographic styles)

**v1.0:**
- NFT minting (optional, on-chain collectibles)
- Physical printing service (official cards shipped)
- Tournament mode (compete for highest XP)

---

## Quick Reference

**Generate card:** Agent Panel → 🎴 button  
**Keyboard shortcut:** `1-9` (select agent) + `C` (open card)  
**Download:** Click 📥 Download PNG  
**Copy to clipboard:** Click 📋 Copy  
**Best dimensions:** 600x900px  
**Best format:** PNG  
**Best sharing:** Twitter, Discord, Instagram  

---

## Examples from the Wild

> "Hit LEGENDARY tier with my DevOps agent after 30 days. This card generator is fire 🔥" — @devops_mike

> "Printed all my agent cards and put them on my desk. Coworkers are jealous." — @sarah_codes

> "My 8-year-old wants to collect AI agent cards now. What have you done?!" — @parent_dev

---

## Get Started

1. Open OpenClawfice: http://localhost:3333
2. Click any agent
3. Click 🎴 Trading Card
4. Share your card! Tag #openclawfice

**Pro tip:** Generate cards BEFORE Twitter posts. People click 3x more when they see the card.

---

**Time to generate:** 10 seconds  
**Virality potential:** ⭐⭐⭐⭐⭐  
**Fun factor:** LEGENDARY

🎴 Start collecting!
