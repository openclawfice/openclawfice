# 🎯 Good First Issues (Ready to Create)

**Purpose:** Pre-written GitHub issues to attract first-time contributors after launch  
**When to use:** Within 48 hours of launch, create 10-15 of these issues  
**Label:** `good first issue` + `help wanted`

Copy/paste these into GitHub Issues to lower barrier for new contributors.

---

## 🎨 UI/UX Improvements

### 1. Add keyboard shortcut for calling meetings
**Difficulty:** Easy (30 min)  
**Impact:** Quality of life improvement

**Description:**
Users want a keyboard shortcut to open the "Call Meeting" modal.

**Files to edit:**
- `app/page.tsx` (add useEffect with keydown listener)
- `components/Header.tsx` (show hint in tooltip)

**Acceptance criteria:**
- [ ] `Cmd+M` (Mac) / `Ctrl+M` (Linux/Win) opens meeting modal
- [ ] Only works when no other modal is open
- [ ] Tooltip on "Call Meeting" button shows: "Call Meeting (Cmd+M)"

**Getting started:**
```tsx
// In app/page.tsx, add useEffect:
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      e.preventDefault();
      // Open meeting modal
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**Mentor:** @Nova will review your PR!

---

### 2. Add "Copy Agent ID" button in agent detail panel
**Difficulty:** Easy (20 min)  
**Impact:** Developer experience

**Description:**
When users click an agent to see details, add a "Copy ID" button next to the agent name.

**Files to edit:**
- `app/page.tsx` (agent detail panel section)

**Acceptance criteria:**
- [ ] Button appears next to agent name in detail panel
- [ ] Clicking copies agent ID to clipboard
- [ ] Shows "Copied!" toast/feedback for 2 seconds
- [ ] Icon: 📋 or copy icon

**Getting started:**
```tsx
<button
  onClick={() => {
    navigator.clipboard.writeText(agent.id);
    // Show toast
  }}
  className="text-xs opacity-60 hover:opacity-100"
>
  📋 Copy ID
</button>
```

**Mentor:** @Forge can help with React patterns!

---

### 3. Add "Mark as Read" button for accomplishments
**Difficulty:** Medium (45 min)  
**Impact:** Reduces visual clutter

**Description:**
Allow users to mark accomplishments as "read" so they fade out or move to a collapsed section.

**Files to edit:**
- `app/page.tsx` (accomplishments section)
- `app/api/office/actions/route.ts` (add mark_read handler)

**Acceptance criteria:**
- [ ] Each accomplishment has a small "✓" button
- [ ] Clicking marks it as read (persists to `accomplishments.json`)
- [ ] Read accomplishments shown with reduced opacity or in collapsed "Earlier" section
- [ ] Can toggle "Show all" to see read accomplishments

**Getting started:**
1. Add `read: boolean` field to accomplishment type
2. POST to `/api/office/actions` with `{type: "mark_read", id: "..."}`
3. Update UI to filter/style read accomplishments

**Mentor:** @Forge can walk through the API structure!

---

### 4. Add color-coded priority badges to quests
**Difficulty:** Easy (15 min)  
**Impact:** Visual clarity

**Description:**
Show priority (high/medium/low) with colored badges in quest log.

**Files to edit:**
- `app/page.tsx` (quest rendering section)

**Acceptance criteria:**
- [ ] High priority: Red badge 🔴 "HIGH"
- [ ] Medium priority: Yellow badge 🟡 "MEDIUM"  
- [ ] Low priority: Blue badge 🔵 "LOW"
- [ ] Badge appears before quest title
- [ ] Styled with appropriate Tailwind colors

**Getting started:**
```tsx
{quest.priority === 'high' && (
  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
    HIGH
  </span>
)}
```

**Mentor:** @Cipher can help with Tailwind styling!

---

## 📝 Documentation

### 5. Add troubleshooting guide for common install issues
**Difficulty:** Easy (1 hour)  
**Impact:** Reduces support burden

**Description:**
Create `TROUBLESHOOTING.md` with solutions to common install/setup problems.

**Sections to include:**
1. **Demo mode won't load** (port conflict, server not running)
2. **Install script fails** (Node version, npm permissions)
3. **Agents not showing** (openclaw.json not found, invalid format)
4. **Chat/quests not working** (file permissions, status files)
5. **Port already in use** (how to change port)

**Acceptance criteria:**
- [ ] Clear problem → solution format
- [ ] Code examples for each fix
- [ ] Link from README "Troubleshooting" section
- [ ] Covers 5+ common issues

**Getting started:**
Look at existing install script and docs, anticipate failure points.

**Mentor:** @Nova can share common issues from user feedback!

---

### 6. Create video tutorial script
**Difficulty:** Medium (2 hours)  
**Impact:** Helps creators make content

**Description:**
Write a script for a 5-minute YouTube tutorial: "Build an AI Office in 5 Minutes"

**Sections:**
1. **Intro** (30 sec): What is OpenClawfice?
2. **Demo** (1 min): Show demo mode
3. **Install** (1 min): Run install script
4. **Setup** (1 min): Explain agent discovery
5. **Features** (1.5 min): Walkthrough (quests, chat, meetings)
6. **Outro** (30 sec): Call to action

**Acceptance criteria:**
- [ ] Clear narration script (word-for-word)
- [ ] Screen recording cues ("Show demo mode at 0:30")
- [ ] Timing estimates for each section
- [ ] Links/resources to mention

**Getting started:**
Watch existing product demos on YouTube for structure.

**Mentor:** @Nova can review for accuracy!

---

### 7. Write "How OpenClawfice Works" technical deep-dive
**Difficulty:** Medium (2 hours)  
**Impact:** Helps contributors understand architecture

**Description:**
Create `ARCHITECTURE.md` explaining how OpenClawfice discovers agents and displays status.

**Sections:**
1. **Agent Discovery** (reads `~/.openclaw/openclaw.json`)
2. **Status Detection** (checks `.status/accomplishments.json` timestamps)
3. **Cooldown System** (parses cron jobs for next run time)
4. **Real-time Updates** (polling vs WebSocket future)
5. **File Structure** (what each API route does)

**Acceptance criteria:**
- [ ] Clear diagrams (ASCII or Mermaid)
- [ ] Code snippets showing key logic
- [ ] Explains design decisions
- [ ] Helps new contributors orient

**Getting started:**
Read through `app/api/office/route.ts` to understand flow.

**Mentor:** @Forge knows the codebase deeply!

---

## 🛠️ Features

### 8. Add "Refresh" button to manually update agent status
**Difficulty:** Easy (20 min)  
**Impact:** User control

**Description:**
Add a button in header to manually trigger status refresh (without waiting for auto-refresh).

**Files to edit:**
- `app/page.tsx` (header section)
- (Uses existing `fetchAgentStatus()` function)

**Acceptance criteria:**
- [ ] Button in header: "↻ Refresh"
- [ ] Clicking re-fetches agent data immediately
- [ ] Shows loading state while fetching
- [ ] Keyboard shortcut: `Cmd+R` / `Ctrl+R` (optional)

**Getting started:**
```tsx
<button onClick={() => fetchAgentStatus()}>
  ↻ Refresh
</button>
```

**Mentor:** @Forge can help test!

---

### 9. Add filter/search to water cooler chat
**Difficulty:** Medium (1 hour)  
**Impact:** Usability for busy teams

**Description:**
Add search box above water cooler to filter messages by keyword or agent name.

**Files to edit:**
- `app/page.tsx` (water cooler section)

**Acceptance criteria:**
- [ ] Search input above chat feed
- [ ] Filters messages in real-time (case-insensitive)
- [ ] Searches message text and agent name
- [ ] Shows "X of Y messages" count
- [ ] Clear button to reset search

**Getting started:**
```tsx
const [searchTerm, setSearchTerm] = useState('');
const filteredMessages = messages.filter(m =>
  m.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
  m.who.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**Mentor:** @Cipher can review UX!

---

### 10. Add "Export" button to download quest log as JSON
**Difficulty:** Medium (45 min)  
**Impact:** Power user feature

**Description:**
Let users export their quest log as a JSON file (for backup or migration).

**Files to edit:**
- `app/page.tsx` (quest log section)

**Acceptance criteria:**
- [ ] "Export" button in quest log header
- [ ] Downloads `quests-YYYY-MM-DD.json`
- [ ] Includes all quest data (title, description, options, responses)
- [ ] Works in both real and demo mode

**Getting started:**
```tsx
const exportQuests = () => {
  const data = JSON.stringify(quests, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quests-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};
```

**Mentor:** @Nova can help prioritize!

---

## 🧪 Testing & Quality

### 11. Add error boundary for graceful failures
**Difficulty:** Medium (1 hour)  
**Impact:** Better user experience

**Description:**
Wrap the app in React Error Boundary to catch crashes and show friendly error message.

**Files to edit:**
- `app/layout.tsx` (wrap children in ErrorBoundary)
- `components/ErrorBoundary.tsx` (create new component)

**Acceptance criteria:**
- [ ] Catches React rendering errors
- [ ] Shows user-friendly error message (not blank page)
- [ ] Includes "Reload" button
- [ ] Optionally logs error to console
- [ ] Doesn't crash the entire app

**Getting started:**
Use React's `ErrorBoundary` component or library like `react-error-boundary`.

**Mentor:** @Forge knows React patterns!

---

### 12. Add automated screenshot tests
**Difficulty:** Hard (2-3 hours)  
**Impact:** Prevent UI regressions

**Description:**
Set up Playwright to take screenshots of demo mode and compare on each PR.

**Files to create:**
- `tests/screenshots.spec.ts`
- `.github/workflows/screenshot-test.yml`

**Acceptance criteria:**
- [ ] Test opens demo mode
- [ ] Takes screenshot of full dashboard
- [ ] Takes screenshot of agent detail panel
- [ ] Takes screenshot of expanded quest
- [ ] Compares against baseline (fails if different)

**Getting started:**
```bash
npm install --save-dev @playwright/test
npx playwright test
```

**Mentor:** @Cipher can help with CI/CD!

---

## 🎨 Design & Polish

### 13. Add dark/light mode toggle
**Difficulty:** Hard (3-4 hours)  
**Impact:** Accessibility & user preference

**Description:**
Let users switch between dark mode (current) and light mode.

**Files to edit:**
- `app/page.tsx` (theme toggle in header)
- `app/globals.css` (light mode color variables)
- Local storage to persist preference

**Acceptance criteria:**
- [ ] Toggle button in header (☀️/🌙)
- [ ] Light mode has readable colors (not just inverted)
- [ ] Preference saved to localStorage
- [ ] Respects system preference on first load
- [ ] Smooth transition (CSS transition)

**Getting started:**
Use Tailwind's `dark:` modifier and `localStorage.setItem('theme', 'dark')`.

**Mentor:** @Pixel can help with color palette!

---

### 14. Add sound effects for interactions
**Difficulty:** Medium (2 hours)  
**Impact:** Fun factor (quirky/cool)

**Description:**
Add retro sound effects when users interact (click agent, complete quest, etc.).

**Files to edit:**
- `app/page.tsx` (add Audio elements)
- `public/sounds/` (add .wav/.mp3 files)

**Acceptance criteria:**
- [ ] Click agent → blip sound
- [ ] Complete quest → success chime
- [ ] Meeting started → door open sound
- [ ] Agent levels up → fanfare
- [ ] Mute toggle in settings (localStorage)

**Getting started:**
Use free retro sounds from [freesound.org](https://freesound.org) or generate with [jsfxr.frozenfractal.com](https://sfxr.me/).

**Mentor:** @Nova can prioritize sounds by impact!

---

### 15. Add agent mood animations (plumbob bounce)
**Difficulty:** Medium (1-2 hours)  
**Impact:** Visual polish

**Description:**
Animate plumbobs to bounce/pulse based on agent mood.

**Files to edit:**
- `app/page.tsx` (plumbob rendering)
- Add CSS animations

**Acceptance criteria:**
- [ ] Great mood: Gentle bounce (0.5s loop)
- [ ] Okay mood: Slow pulse (1s loop)
- [ ] Stressed mood: Fast pulse (0.3s loop)
- [ ] Smooth CSS animations (no jank)

**Getting started:**
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
```

**Mentor:** @Pixel knows animation timing!

---

## 🚀 How to Use These Issues

### For Maintainers:
1. **After launch** (within 48 hours), create 10-15 of these as GitHub issues
2. **Label** with `good first issue` + `help wanted`
3. **Add mentor tag** in issue body ("@Nova will review!")
4. **Pin 2-3** to repository for visibility
5. **Monitor** and respond quickly to questions

### For Contributors:
1. **Pick an issue** that matches your skill level
2. **Comment** "I'd like to work on this!" to claim it
3. **Ask questions** if anything is unclear
4. **Open a PR** when ready (link to issue)
5. **Be patient** — maintainers will review within 48 hours

---

## 🎯 Why These Issues Work

### Good First Issues Should Be:
✅ **Self-contained** — Can be completed without understanding entire codebase  
✅ **Clearly scoped** — Specific files, acceptance criteria, time estimate  
✅ **Low risk** — Won't break critical functionality if wrong  
✅ **Mentored** — Maintainer commits to helping  
✅ **Impactful** — Contributor sees their change matter

### These issues achieve all 5! 🎉

---

## 📚 Additional Resources for Contributors

- [CONTRIBUTING.md](./CONTRIBUTING.md) — How to contribute
- [README.md](./README.md) — Project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) — How it works (create after launch)
- [Discord #contributors](https://discord.gg/clawd) — Ask questions

**Happy contributing! 🚀**
