# 🧪 Testing Guide - OpenClawfice

**For:** Developers, contributors, or anyone verifying features work  
**When:** Before launch, after updates, or when debugging  
**Time:** 15-30 minutes for full test suite

---

## Quick Test (5 minutes)

Essential checks to verify OpenClawfice is working:

```bash
# 1. Start dev server
cd ~/clawd-openclawfice/openclawfice
npm run dev

# 2. Open in browser
open "http://localhost:3333"

# 3. Visual check
# ✅ Agents appear (if you have OpenClaw agents)
# ✅ Page loads without errors
# ✅ UI is responsive

# 4. Demo mode check
open "http://localhost:3333/?demo=true"

# ✅ 5 demo agents appear
# ✅ Quest log has quests
# ✅ Accomplishments feed populated
# ✅ Water cooler has chat messages
```

**If all checks pass → Good to go! ✅**

---

## Full Test Suite (30 minutes)

### 1. Demo Mode ✅

**What to test:**
- Demo mode loads correctly
- 5 agents appear (Nova, Forge, Lens, Pixel, Cipher)
- Agents have different statuses (working/idle)
- Quest log shows demo quests
- Accomplishments feed populated
- Water cooler chat visible

**How to test:**
```bash
# Visit demo mode
open "http://localhost:3333/?demo=true"

# Check API response
curl -s http://localhost:3333/api/demo | jq '.agents | length'
# Expected: 5

# Verify demo banner appears
# Look for: "🎮 Demo Mode — Try OpenClawfice!"
```

**Expected behavior:**
- Banner at top with "Install OpenClawfice" button
- 5 agents visible in Work Room and Lounge
- Quest Log has 1-3 quests
- Accomplishments feed has 4-6 items
- Water cooler has 6+ messages
- Messaging input disabled ("Demo mode: messaging disabled")

---

### 2. Agent Interactions ✅

**What to test:**
- Click agent opens detail panel
- Panel shows skills, needs, XP
- Panel closes with X button
- Hover shows mood tooltip on plumbob

**How to test:**
1. Click on any agent NPC
2. Detail panel slides in from right
3. Verify visible:
   - Agent name and role
   - Skills with levels
   - Needs meters (energy, output, etc.)
   - XP and level
   - Current task (if working)
4. Hover over plumbob
5. Tooltip appears: "Feeling great!" or similar
6. Click X to close panel

**Expected behavior:**
- Panel animates smoothly
- All data displays correctly
- Close button works
- No console errors

---

### 3. Quest Log ✅

**What to test:**
- Quests display in list
- Click quest expands details
- Quest Templates button appears (empty state)
- Template gallery opens

**How to test:**

**With Quests:**
1. Scroll to Quest Log section
2. Click on a quest card
3. Expands to show full details
4. Shows options (Approve, Request changes, etc.)

**Empty State:**
1. If no quests, see empty state message
2. "Browse Quest Templates" button visible
3. Click button
4. Template gallery modal opens
5. 8 templates shown in grid
6. Hover on template shows preview
7. "Use This" button on each template

**Expected behavior:**
- Smooth animations
- Template gallery responsive
- Templates have icons and descriptions
- Gallery closes with Close button

---

### 4. Accomplishments Feed ✅

**What to test:**
- Accomplishments display with date headers
- Grouped by Today, Yesterday, X days ago
- Click accomplishment shows detail
- Archive button works (if accomplishments exist)

**How to test:**
1. Scroll to Accomplishments section
2. Verify date headers visible ("Today", "Yesterday", etc.)
3. Accomplishments grouped under correct dates
4. Click an accomplishment
5. Detail panel or modal shows (if implemented)
6. Check for Loom video icon (🎬) on video accomplishments

**Expected behavior:**
- Clear date organization
- Newest at top
- Archive loads more if available
- No duplicate dates

---

### 5. Water Cooler Chat ✅

**What to test:**
- Chat messages display
- Scrollable if many messages
- Message input visible
- Broadcast button present

**How to test:**
1. Find Water Cooler section (right column)
2. See chat messages
3. Try typing in input field
4. In demo mode: input disabled
5. In real mode: can type and send

**Expected behavior:**
- Messages show agent name and text
- Timestamps visible
- Scrolls smoothly
- Input works (non-demo mode)

---

### 6. Meeting Room ✅

**What to test:**
- Meeting Room appears when active
- Shows participants
- NPCs face each other
- Shows topic and progress

**How to test:**

**Demo Mode:**
1. Meeting Room visible by default
2. Shows 2 agents (Pixel and Cipher)
3. Agents facing each other (one flipped)
4. Topic displayed
5. Round counter (e.g., "Round 2/4")
6. Elapsed time shown

**Real Mode:**
1. Only appears when meeting.json has active: true
2. Reads from ~/.openclaw/.status/meeting.json

**Expected behavior:**
- NPCs positioned correctly
- Topic readable
- Progress indicators clear
- No layout issues

---

### 7. Mobile Responsive ✅

**What to test:**
- Works on narrow screens (<768px)
- NPCs scale correctly
- Single column layout
- All features accessible

**How to test:**
```bash
# Resize browser to 375px width (iPhone size)
# OR use Chrome DevTools mobile emulation
```

**Check:**
- [ ] Single column layout on mobile
- [ ] NPCs smaller but visible
- [ ] Text readable
- [ ] Buttons touchable
- [ ] No horizontal scroll
- [ ] Quest log accessible
- [ ] Accomplishments readable

**Expected behavior:**
- Smooth responsive breakpoints
- No text overflow
- Touch-friendly buttons
- Maintains functionality

---

### 8. XP Celebration Animations ✅

**What to test:**
- Celebrations trigger on new accomplishments
- +XP popup floats up
- Sparkles burst outward
- Animation smooth and delightful

**How to test:**

**Manual trigger (if possible):**
```bash
# Add test accomplishment via API
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🎉","title":"Test Task","detail":"Testing XP animation","who":"Nova"}}'
```

**Expected behavior:**
- 0.5s after accomplishment: celebration starts
- "+10 XP ✨" floats up above agent
- Gold text with black outline
- 4 sparkles burst outward
- Entire animation ~1 second
- Fades out smoothly

**If you see celebration → Working! ✅**

---

### 9. Share Your Office ✅

**What to test:**
- Share button in header (📸)
- Modal opens with options
- Screenshot button works
- Copy share text works

**How to test:**
1. Look for 📸 button in header (next to ⚙️)
2. Click it
3. Share modal opens
4. Two options:
   - "Take Screenshot (Cmd+P)"
   - "Copy Share Text"
5. Click "Copy Share Text"
6. Verify clipboard has text
7. Click "Take Screenshot"
8. Print dialog opens

**Expected behavior:**
- Modal smooth animation
- Copy button shows "Copied!" feedback
- Screenshot triggers print dialog
- Share text includes demo link

---

### 10. Feature Showcase Page ✅

**What to test:**
- /showcase route works
- 8 feature cards display
- Hover effects work
- Screenshot section visible
- CTAs clickable

**How to test:**
```bash
open "http://localhost:3333/showcase"
```

**Check:**
- [ ] Page loads
- [ ] 8 feature cards in grid
- [ ] Hover scales card
- [ ] Each card has icon, title, description
- [ ] Screenshot image loads
- [ ] "Try Live Demo" button works
- [ ] "Star on GitHub" button works

**Expected behavior:**
- Professional marketing page
- Responsive grid
- Smooth hover effects
- All links work

---

## Performance Tests

### Build Size ✅

```bash
npm run build

# Check output
# Expected: ~102 KB (main) + 34 KB (middleware)
# Total First Load: ~136 KB
```

**Acceptable:** Under 200 KB total  
**Good:** Under 150 KB total  
**Excellent:** Under 100 KB total (our current state)

---

### Load Time ✅

**Manual test:**
1. Clear browser cache
2. Load http://localhost:3333
3. Open DevTools → Network tab
4. Hard refresh (Cmd+Shift+R)
5. Check "DOMContentLoaded" time

**Expected:**
- Localhost: <1 second
- Production: <2 seconds
- Good 3G: <5 seconds

---

### Agent Polling ✅

**Check API polling frequency:**
```bash
# Open DevTools → Network
# Filter: "api/office"
# Watch requests

# Expected: 3-5 seconds between polls
# Should NOT flood the network
```

**If polling too fast:** Adjust interval in code  
**If polling too slow:** Users won't see updates quickly

---

## Regression Tests

### After Code Changes

**Always test:**
1. Demo mode still works
2. Agent clicking still works
3. No console errors
4. Mobile layout intact
5. Build succeeds

**Quick regression:**
```bash
# 1. Build check
npm run build
# Expected: ✓ Compiled successfully

# 2. Demo check
curl -s http://localhost:3333/api/demo | jq '.agents | length'
# Expected: 5

# 3. Visual smoke test
open "http://localhost:3333/?demo=true"
# Click around, verify no obvious breaks
```

---

## Common Issues & Fixes

### Demo Mode Not Working

**Symptoms:**
- API returns empty or error
- No agents appear
- Demo banner missing

**Fixes:**
```bash
# 1. Check server running
curl http://localhost:3333/api/demo

# 2. Check demo data file exists
ls app/demo/data.ts

# 3. Restart server
npm run dev

# 4. Clear build cache
rm -rf .next && npm run build
```

---

### Build Errors

**Symptoms:**
- `npm run build` fails
- TypeScript errors
- Module not found

**Fixes:**
```bash
# 1. Clean install
rm -rf node_modules .next
npm install

# 2. Check Node version
node -v
# Expected: 18+ or 20+

# 3. Check TypeScript
npx tsc --noEmit
# Should show any type errors

# 4. Clear cache
rm -rf .next
```

---

### Agents Not Appearing

**Symptoms:**
- Blank rooms
- "No agents" message
- API returns empty array

**Fixes:**

**Demo Mode:**
```bash
# Should always work
# Check: http://localhost:3333/?demo=true
```

**Real Mode:**
```bash
# Check OpenClaw config
cat ~/.openclaw/openclaw.json
# Should have agents array

# Check sessions
ls ~/.openclaw/.status/
# Should have session files
```

---

## Automated Testing (Future)

### Unit Tests
```bash
# Coming soon
npm run test

# Expected: All tests pass
```

### E2E Tests
```bash
# Coming soon
npm run test:e2e

# Expected: Browser automation tests pass
```

### Visual Regression
```bash
# Coming soon
npm run test:visual

# Expected: No unexpected UI changes
```

---

## Testing Checklist

Before launch or after major changes:

- [ ] Demo mode works (5 agents appear)
- [ ] Build succeeds without errors
- [ ] No console errors in browser
- [ ] Agent clicking opens panel
- [ ] Quest log functional
- [ ] Accomplishments display with dates
- [ ] Water cooler shows messages
- [ ] Meeting room (if active) displays
- [ ] Mobile responsive (test 375px width)
- [ ] Share modal works
- [ ] Feature showcase page loads
- [ ] XP celebrations trigger
- [ ] All routes work (/, /demo, /showcase, /install)
- [ ] Template gallery opens
- [ ] Performance acceptable (<2s load)

**If all checked → Ready to ship! ✅**

---

## For Contributors

**Before submitting a PR:**
1. Run full test suite (30 min)
2. Check no new console errors
3. Test on mobile (Chrome DevTools)
4. Verify build succeeds
5. Test your new feature thoroughly
6. Update this guide if you added new features

**Test template for PR description:**
```markdown
## Testing Done
- [ ] Demo mode verified
- [ ] Build passes
- [ ] Mobile tested
- [ ] No console errors
- [ ] New feature works as expected
```

---

## Need Help?

**If tests fail:**
1. Check console for errors
2. Restart dev server
3. Clear cache and rebuild
4. Check docs/ for feature-specific guides
5. Ask in water cooler or create a quest

**Testing tips:**
- Use Chrome DevTools for debugging
- Check Network tab for API issues
- Use React DevTools to inspect state
- Mobile testing is essential
- Test in both demo and real mode

---

## Success Criteria

**OpenClawfice is working correctly when:**
- ✅ Demo mode shows 5 agents working
- ✅ UI is smooth and responsive
- ✅ All interactions work
- ✅ No errors in console
- ✅ Builds successfully
- ✅ Loads quickly (<2s)
- ✅ Works on mobile
- ✅ All features accessible

**If you can verify all of the above → Ship it! 🚀**

---

**Last updated:** 2026-02-24  
**Version:** 0.1.0 (Launch)  
**Maintained by:** OpenClawfice community
