# Task: Sound Effects Fallback

**Assigned by:** Nova (PM)  
**Assigned to:** Forge (Dev)  
**Priority:** P1 (Launch week polish)  
**Estimated time:** 1 hour  
**Status:** READY (awaiting Tyler's validation to assign)

---

## Problem

Discovery animation plays `/sounds/discovery.mp3` on first load, but file might not exist or fail to load. This causes:
- Console errors visible in dev tools
- Broken first impression
- Confusion if sound doesn't play

**Impact:** New users see errors immediately, damages polish perception

---

## Solution

Add graceful degradation to discovery audio:
1. Check if file exists before playing
2. Catch load errors silently
3. Don't block animation if audio fails
4. No console errors or warnings

**Goal:** Animation works perfectly whether audio loads or not

---

## Implementation

**File to edit:** `components/DiscoveryAnimation.tsx`

**Current code (lines ~XX-XX):**
```typescript
// Simplified - current implementation plays without checking
useEffect(() => {
  const audio = new Audio('/sounds/discovery.mp3');
  audio.play();
}, []);
```

**New code (proposed):**
```typescript
useEffect(() => {
  const audio = new Audio('/sounds/discovery.mp3');
  
  // Handle load errors silently
  audio.addEventListener('error', () => {
    // Silent fallback - animation continues without sound
  });
  
  // Only play if it loads successfully
  audio.play().catch(() => {
    // Catch play() promise rejection silently
  });
  
  return () => {
    audio.pause();
    audio.src = '';
  };
}, []);
```

**Key changes:**
- Add error event listener (silent, no console.error)
- Catch play() promise rejection
- Clean up audio on unmount
- Animation unaffected if audio fails

---

## Acceptance Criteria

**Must pass ALL before marking complete:**

### Functional
- [ ] Discovery animation plays correctly when audio file exists
- [ ] Discovery animation plays correctly when audio file missing
- [ ] No console errors if audio fails to load
- [ ] No console warnings about promises
- [ ] Animation timing unaffected by audio state

### Testing
- [ ] Test with audio file present
- [ ] Test with audio file deleted
- [ ] Test with audio file corrupted (invalid format)
- [ ] Test in dev mode (strict error checking)
- [ ] Test in production build

### Code Quality
- [ ] TypeScript types correct
- [ ] No ESLint warnings
- [ ] Code follows existing patterns
- [ ] Comments explain silent fallback rationale

---

## Testing Instructions

**Test 1: Normal case (audio exists)**
```bash
cd ~/openclawfice/openclawfice
# Verify file exists
ls -la public/sounds/discovery.mp3
npm run dev
# Open localhost:3333, trigger discovery
# ✅ Should play sound + show animation
```

**Test 2: Missing audio file**
```bash
# Temporarily rename file
mv public/sounds/discovery.mp3 public/sounds/discovery.mp3.bak
npm run dev
# Open localhost:3333, trigger discovery
# ✅ Should show animation silently (no sound, no errors)
# Restore file after test
mv public/sounds/discovery.mp3.bak public/sounds/discovery.mp3
```

**Test 3: Dev tools check**
```bash
npm run dev
# Open localhost:3333
# Open browser dev tools → Console
# Trigger discovery
# ✅ Should see NO errors or warnings
```

**Test 4: Production build**
```bash
npm run build && npm start
# Open localhost:3333
# ✅ Should work same as dev mode
```

---

## Files to Touch

**Edit:**
- `components/DiscoveryAnimation.tsx` (main change)

**Review (don't edit unless necessary):**
- `public/sounds/discovery.mp3` (verify exists)
- `components/__tests__/DiscoveryAnimation.test.tsx` (if tests exist)

**Create (if needed):**
- None

---

## Success Metrics

**User-facing:**
- Zero console errors on first load
- Animation plays smoothly regardless of audio state
- No confusion if sound missing

**Technical:**
- No promise rejections logged
- Clean error handling
- No memory leaks (audio cleaned up)

---

## Edge Cases

**Consider these scenarios:**

1. **Audio file deleted mid-session** → Should not crash
2. **Browser blocks autoplay** → Should not show error
3. **User has sound muted** → Should animate silently
4. **Slow network** → Should not wait for audio to start animation
5. **Multiple rapid triggers** → Should not stack audio instances

**Solution approach:**
- Graceful degradation for all cases
- Animation independent of audio success
- Clean up prevents memory leaks

---

## Context

**Why this matters:**

First 5 minutes determine if users stay or bounce. Console errors create perception of "broken software" even if animation works. This is about polish, not functionality.

**Water cooler insight (Feb 27):**
> "Install friction prevents users from reaching screenshot moment. Fix boring-but-critical UX gaps first." — Nova

**Source:** 
- Identified in Forge's NEXT-IMPROVEMENTS.md (Quick Win #1)
- Prioritized in POST-LAUNCH-PRIORITIES.md (Phase 1)

---

## Questions for Forge

**Before starting:**
- Is `discovery.mp3` currently in the repo? (check public/sounds/)
- Are there other sound effects with same issue?
- Should we apply same pattern to all audio?

**If blocked:**
- Audio file format issues? → Ask Nova
- Browser autoplay policy? → Document limitation
- TypeScript errors? → Ping for help

---

## Definition of Done

**Forge reports back with:**
1. "✅ All acceptance criteria passed"
2. Link to commit SHA
3. Screenshot of dev tools (no errors)
4. Tested both cases (audio exists + missing)

**Nova verifies:**
- Code review (clean implementation)
- Test on own machine
- Approve or request changes

---

## After Completion

**Nova's checklist:**
- [ ] Review commit
- [ ] Test locally
- [ ] Mark task complete
- [ ] Assign next Phase 1 task
- [ ] Update POST-LAUNCH-PRIORITIES.md

**Forge's checklist:**
- [ ] Commit with clear message
- [ ] Report back to Nova
- [ ] STOP and wait for next assignment

---

**Created:** 2026-03-01 00:50 EST  
**Assigned:** TBD (after Tyler validation)  
**Owner:** Nova (PM)  
**Executor:** Forge (Dev)
