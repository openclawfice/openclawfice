# Quick Actions Feature Spec

**Priority #2: Make users productive**

## Problem
Users need to perform common tasks (send message, create quest, check logs) but have to click through multiple UI elements. This adds friction.

## Solution
Add a "Quick Actions" menu - floating action button (FAB) with common shortcuts.

---

## Design

### Button Position
- Bottom-right corner (mobile: bottom-center)
- Floats above all content
- ⚡ lightning bolt icon
- Purple glow on hover
- Pixel-art styled

### Menu Items (5-7 actions max)

**Tier 1 (Most common):**
1. 💬 **Broadcast Message** - Opens water cooler with focus on input
2. ⚔️ **Create Quest** - Opens quest creation modal
3. 📋 **Check Logs** - Opens most recent agent's logs panel
4. 🎯 **Assign Task** - Quick task assignment to idle agent
5. 📸 **Share Office** - Opens share modal

**Tier 2 (Nice to have):**
6. 🔍 **Find Agent** - Search/filter agents
7. ⏱️ **Set Reminder** - Quick reminder creation
8. 📊 **View Stats** - Opens analytics overlay

### UX Flow
1. Click ⚡ button
2. Radial menu expands (8 directions)
3. Click action → executes immediately
4. Menu closes
5. Optional: keyboard shortcuts (1-9)

### Visual Style
- Retro game menu aesthetic
- Pixel borders
- Press Start 2P font for labels
- Hover = glow + scale
- Click = bounce animation
- Sound effects: open (whoosh), select (beep)

---

## Implementation

### Files to Create
- `components/QuickActions.tsx` - Main FAB + menu
- `components/QuickActionsMenu.tsx` - Radial menu items

### Files to Modify
- `app/page.tsx` - Add QuickActions component
- `hooks/useRetroSFX.ts` - Add quickActionOpen/select sounds

### State Management
```typescript
const [showQuickActions, setShowQuickActions] = useState(false);
const [selectedAction, setSelectedAction] = useState<string | null>(null);
```

### Keyboard Shortcuts
- `Q` - Toggle quick actions
- `1-9` - Select action by number
- `Esc` - Close menu

---

## Success Metrics

**Before (friction):**
- Send broadcast: 2 clicks + scroll + type
- Create quest: 3 clicks + form fill
- Check logs: 2 clicks + find agent

**After (one-click):**
- All actions: 2 clicks (open menu + select)
- With keyboard: 1 keystroke (`Q` + number)

**Goal:** Reduce time-to-action by 50%

---

## Mobile Considerations
- FAB centered at bottom (not corner)
- Menu expands upward (not radial)
- Touch-friendly hit targets (48x48px min)
- No keyboard shortcuts on mobile

---

## Launch Timing
**Post-launch Week 1** - Not critical for launch, but high impact for retention

---

## Alternative: Command Palette
Instead of FAB, use Cmd+K style command palette:
- Press `K` or `/` to open
- Type to search actions
- Arrow keys + Enter to select
- More "pro" feel, less game-like

**Trade-off:** Command palette is faster for power users but less discoverable for new users. FAB is more beginner-friendly.

**Recommendation:** Start with FAB (Priority #1: easy to use), add command palette later for power users.
