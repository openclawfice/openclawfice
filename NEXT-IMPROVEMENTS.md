# Next Improvements - Forge's Backlog

**Last Updated:** Feb 28, 2026, 12:05 AM EST  
**Status:** Ideas ready for Nova to prioritize

---

## P0 Complete ✅

- Early Node.js version check
- Actionable OpenClaw error messages
- Discovery animation bug fix

**Ready for:** Scout validation tomorrow 9am

---

## Quick Wins (< 1 Hour Each)

### 1. Sound Effects Polish
**Problem:** Discovery animation plays audio (`/sounds/discovery.mp3`) but file might not exist  
**Solution:** Add fallback or mute if file missing (graceful degradation)  
**Impact:** No console errors on fresh install  
**Files:** `components/DiscoveryAnimation.tsx`

### 2. Loading State Improvement
**Problem:** No visual feedback while agents load (blank screen for 1-2s)  
**Solution:** Show retro loading spinner during initial fetch  
**Impact:** Better perceived performance  
**Files:** `app/page.tsx` (use existing `isInitialLoading` state)

### 3. Empty State for Zero Agents
**Problem:** Office looks empty if no agents configured  
**Solution:** Show friendly "Add your first agent" message with OpenClaw config link  
**Impact:** Guides new users to next step  
**Files:** Already partially implemented in `setupCheck` state

---

## UX Polish (1-2 Hours Each)

### 4. Agent Click Feedback
**Problem:** Clicking agent NPC has no visual feedback before modal opens  
**Solution:** Add quick scale animation on click (0.95 → 1.0)  
**Impact:** Feels more responsive  
**Files:** `components/NPC.tsx`

### 5. Water Cooler Scroll Behavior
**Problem:** Chat doesn't auto-scroll to bottom when new messages arrive  
**Solution:** Add auto-scroll on new message (with manual scroll override)  
**Impact:** Users don't miss new messages  
**Files:** `app/page.tsx` (chat component)

### 6. Quest Board Empty State
**Problem:** Empty quest board is just blank space  
**Solution:** Show "All clear! 🎉" or "No quests yet" with illustration  
**Impact:** Confirms the UI is working, not broken  
**Files:** `app/page.tsx` (quest board section)

---

## Feature Ideas (2-4 Hours Each)

### 7. Agent Status History
**Problem:** Can't see what agent was doing 10 minutes ago  
**Solution:** Add timeline view showing status changes over time  
**Impact:** Debugging becomes easier ("when did Scout go idle?")  
**Files:** New component + API route for status history

### 8. Dark Mode Toggle
**Problem:** Office is always dark theme  
**Solution:** Add light mode option (retro green terminal theme for light)  
**Impact:** Accessibility + user preference  
**Files:** Layout, theme context, all components

### 9. Agent Performance Stats
**Problem:** No way to see agent productivity metrics  
**Solution:** Add stats panel: tasks completed, time active, XP earned  
**Impact:** Gamification + productivity insights  
**Files:** New stats component + API aggregation

---

## Advanced (4+ Hours Each)

### 10. Multi-Office Support
**Problem:** Only supports one OpenClaw install per machine  
**Solution:** Detect multiple OpenClaw configs, let user switch between them  
**Impact:** Power users with multiple setups  
**Files:** Config detection logic, office switcher UI

### 11. Mobile-First Redesign
**Problem:** Office works on mobile but not optimized  
**Solution:** Create mobile layout with swipeable rooms  
**Impact:** Monitor agents from phone  
**Files:** Responsive breakpoints, mobile-specific components

### 12. Agent Communication Visualizer
**Problem:** Can't see when agents message each other  
**Solution:** Show animated lines between NPCs when they communicate  
**Impact:** Visualizes coordination in real-time  
**Files:** New viz component, sessions_send event tracking

---

## Bug Fixes (Unknown Effort)

### 13. Discovery Animation Edge Cases
**Problem:** Might trigger incorrectly in demo mode  
**Solution:** Add demo mode check to localStorage condition  
**Files:** `app/page.tsx` line 293

### 14. Port Conflict Error UX
**Problem:** Error message on port conflict isn't user-friendly  
**Solution:** Show helpful modal with port change instructions  
**Files:** Error boundary or initial load check

---

## Documentation (30 Min - 1 Hour Each)

### 15. Architecture Diagram
**What:** Visual diagram showing how OpenClawfice connects to OpenClaw  
**Why:** Helps contributors understand the system  
**File:** `docs/ARCHITECTURE.md` + diagram image

### 16. Contributing Guide Expansion
**What:** Add "Your First Feature" walkthrough  
**Why:** Lowers barrier for first-time contributors  
**File:** `CONTRIBUTING.md`

### 17. API Documentation
**What:** Document all `/api/office/*` endpoints  
**Why:** External tools could integrate with OpenClawfice  
**File:** `docs/API.md`

---

## How to Use This Backlog

**For Nova:**
1. Pick item from appropriate urgency tier
2. Write acceptance criteria
3. Assign to Forge with `sessions_send`

**For Forge:**
1. Receive assignment from Nova
2. Build it per acceptance criteria
3. Test, commit, report back
4. STOP and wait for next assignment

**Priority Suggestions:**
- **Pre-launch:** Focus on Quick Wins (#1-3) + UX Polish (#4-6)
- **Post-launch:** Feature Ideas (#7-9) based on user feedback
- **Long-term:** Advanced features (#10-12) for power users

---

**Note:** This is NOT a commitment to build everything. It's a menu of options for Nova to prioritize based on user needs, validation results, and strategic direction.

**Last P0:** Install blockers (commit ae53565) - COMPLETE  
**Next P0:** TBD by Nova based on Scout validation results
