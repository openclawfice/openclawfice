# GitHub Issues to Create

Create these on github.com/openclawfice/openclawfice/issues/new — use labels `good first issue` + `enhancement`.

---

### Issue 1: Custom NPC Avatars
**Title:** feat: let users upload custom pixel art avatars for their agents
**Labels:** `good first issue`, `enhancement`, `v0.2`
**Body:**
Right now agents get auto-generated pixel art sprites. It'd be great to let users upload their own pixel art avatars (16x16 or 32x32 PNG).

**What needs to happen:**
- Add an avatar upload field in the agent detail panel
- Store avatar images in `~/.openclaw/.status/avatars/`
- Fall back to generated sprites when no custom avatar exists
- Maintain pixel-art rendering (`image-rendering: pixelated`)

**Context:** The NPC rendering is in `components/NPC.tsx`. Current sprites are procedurally generated from agent name hashes.

---

### Issue 2: Theme Editor
**Title:** feat: theme editor — customize office colors and style
**Labels:** `good first issue`, `enhancement`, `v0.2`
**Body:**
Add a simple theme editor so users can customize:
- Room border colors
- NPC color palette
- Background gradient
- Accent color

Should persist to `openclawfice.config.json` under a `theme` key.

**Context:** Theme tokens are in `app/page.tsx` (search for `const theme = `). Config is read/written via `/api/office/config`.

---

### Issue 3: Skill Trees
**Title:** feat: visual skill trees for agent specializations
**Labels:** `enhancement`, `v0.2`
**Body:**
Add RPG-style skill trees that visualize agent specializations. Each agent could have a tree showing their progression through different skill branches (coding, research, communication, etc.).

**Inspiration:** Classic RPG skill trees (Diablo, Path of Exile) but simplified for AI agent capabilities.

---

### Issue 4: Sound Pack System
**Title:** feat: swappable sound packs for different vibes
**Labels:** `good first issue`, `enhancement`
**Body:**
The current chiptune/SFX engine uses Web Audio API procedural generation. Add support for sound packs so users can swap between:
- Classic chiptune (current)
- Lo-fi chill
- Synthwave
- Silent mode

**Context:** Sound engine is in `hooks/useSoundEffects.ts`. All sounds are procedurally generated, no audio files.

---

### Issue 5: Mobile Responsive
**Title:** fix: improve mobile layout and touch interactions
**Labels:** `good first issue`, `bug`
**Body:**
The office works on desktop but the mobile experience needs improvement:
- [ ] Rooms should stack vertically on small screens
- [ ] NPC click targets are too small on touch
- [ ] Command palette should be accessible via a button (no keyboard on mobile)
- [ ] Water cooler chat input needs better mobile keyboard handling

---

### Issue 6: Multi-language Support
**Title:** feat: i18n — support for non-English interfaces
**Labels:** `enhancement`, `help wanted`
**Body:**
Add internationalization support so the UI can be displayed in different languages. Key areas:
- Room titles (Work Room, Lounge, Meeting Room)
- Status labels (Working, Idle)
- Quest log UI
- Settings panel
- Landing page

Would love community contributions for translations!
