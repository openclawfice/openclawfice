# Demo Mode Integration Guide

**For:** Forge (Dev)  
**Context:** Demo mode data structure exists (`app/demo/data.ts`, `app/demo/page.tsx`) but needs integration with recent codebase changes  
**Recent changes that affect integration:**
- Work verification (commit 2ff623e) — distinguishes real work from chat
- Thought bubbles fix (commit 1015bf9) — shows autowork cooldown timers
- Activity log viewer (commit 9c71b58)

---

## Current State

✅ **What exists:**
- `app/demo/data.ts` — 5 demo agents with pre-configured data
- `app/demo/page.tsx` — Demo route (redirects to `/?demo=true`)
- Demo data structure matches DEMO-MODE-SPEC.md

❌ **What's missing:**
- Integration with main page.tsx (demo mode detection)
- Live simulation loop
- Demo mode banner
- Handling of recent codebase changes

---

## Integration Approach (Recommended)

### Option 1: Query Param Detection (Simplest)

**In `app/page.tsx`:**

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { DEMO_DATA } from './demo/data';

export default function HomePage() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams?.get('demo') === 'true';
  
  // Use demo data if in demo mode
  const [agents, setAgents] = useState<Agent[]>(
    isDemoMode ? DEMO_DATA.agents : []
  );
  const [pendingActions, setPendingActions] = useState<PendingAction[]>(
    isDemoMode ? DEMO_DATA.quests : []
  );
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>(
    isDemoMode ? DEMO_DATA.accomplishments : []
  );
  const [chatLog, setChatLog] = useState<ChatMessage[]>(
    isDemoMode ? DEMO_DATA.chat : []
  );
  
  // Skip API polling if in demo mode
  useEffect(() => {
    if (isDemoMode) return; // Don't poll API in demo mode
    
    // Normal API polling logic here
    const fetchStatus = async () => { /* ... */ };
    fetchStatus();
    const i = setInterval(fetchStatus, 3000);
    return () => clearInterval(i);
  }, [isDemoMode]);
```

**Pros:**
- Minimal code changes
- Clean separation (demo vs real)
- Easy to test

**Cons:**
- Doesn't show live simulation (agents don't move)

---

### Option 2: Query Param + Live Simulation (Recommended for Virality)

Same as Option 1, but add a simulation loop:

```typescript
// Demo mode simulation loop
useEffect(() => {
  if (!isDemoMode) return;
  
  const simulate = () => {
    // Randomly update agent status
    setAgents(prev => prev.map(a => {
      if (Math.random() > 0.9) {
        return {
          ...a,
          status: a.status === 'working' ? 'idle' : 'working',
          task: a.status === 'idle' ? getRandomTask() : undefined,
        };
      }
      return a;
    }));
    
    // Add new chat message occasionally
    if (Math.random() > 0.7) {
      const newMessage = getRandomChatMessage();
      setChatLog(prev => [...prev.slice(-5), newMessage]);
    }
    
    // Update meeting round
    // Add new accomplishment occasionally
  };
  
  const interval = setInterval(simulate, 5000); // every 5 seconds
  return () => clearInterval(interval);
}, [isDemoMode]);
```

**Pros:**
- Shows OpenClawfice "in action"
- More engaging for demo viewers
- Still clean separation

**Cons:**
- Slightly more complex

---

### Option 3: Separate Demo Route (Most Isolated)

Create a completely separate demo page:

```typescript
// app/demo/page.tsx
'use client';

// Copy entire page.tsx logic but hardcode demo data
// No API calls, just static + simulation
```

**Pros:**
- Zero risk of breaking production
- Can customize demo experience separately

**Cons:**
- Code duplication
- Hard to keep in sync with main page

---

## Recommended Approach: Option 2

**Why:**
- Clean separation via query param
- Shows live simulation (viral appeal)
- Minimal code duplication
- Easy to test both modes

---

## Step-by-Step Implementation

### Step 1: Add Demo Mode Detection

```typescript
// app/page.tsx (top of component)
import { useSearchParams } from 'next/navigation';
import { DEMO_DATA } from './demo/data';

export default function HomePage() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams?.get('demo') === 'true';
```

### Step 2: Conditional Data Loading

```typescript
// Replace all useState initial values
const [agents, setAgents] = useState<Agent[]>(
  isDemoMode ? DEMO_DATA.agents : []
);

// Do this for:
// - agents
// - pendingActions (quests)
// - accomplishments
// - chatLog
// - meeting (if active)
```

### Step 3: Skip API Polling in Demo Mode

```typescript
// In every useEffect that polls /api/office:
useEffect(() => {
  if (isDemoMode) return; // Skip API calls
  
  // Normal API logic here
}, [isDemoMode]);
```

### Step 4: Add Demo Mode Banner

```typescript
// In the render, before main content:
{isDemoMode && (
  <div style={{
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    color: '#fff',
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 12,
  }}>
    <span>🎮 Demo Mode — See OpenClawfice in action!</span>
    <div style={{ display: 'flex', gap: 8 }}>
      <a href="/" style={{ color: '#fff', textDecoration: 'underline' }}>
        Exit Demo
      </a>
      <a href="/install" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 700 }}>
        Install OpenClawfice
      </a>
    </div>
  </div>
)}
```

### Step 5: Add Live Simulation (Optional but Recommended)

```typescript
// Demo mode simulation loop
useEffect(() => {
  if (!isDemoMode) return;
  
  let messageIndex = 0;
  const chatPool = DEMO_DATA.chatPool; // from demo/data.ts
  
  const simulate = () => {
    // Add new chat message every 15-20 seconds
    if (Math.random() > 0.5) {
      const nextMsg = chatPool[messageIndex % chatPool.length];
      setChatLog(prev => [...prev.slice(-5), {
        ...nextMsg,
        ts: Date.now(),
      }]);
      messageIndex++;
    }
    
    // Randomly update agent task
    setAgents(prev => prev.map((a, i) => {
      if (Math.random() > 0.8 && a.status === 'working') {
        const taskPool = DEMO_DATA.taskPool; // from demo/data.ts
        return {
          ...a,
          task: taskPool[Math.floor(Math.random() * taskPool.length)],
        };
      }
      return a;
    }));
  };
  
  const interval = setInterval(simulate, 10000); // every 10 seconds
  return () => clearInterval(interval);
}, [isDemoMode]);
```

---

## Handling Recent Codebase Changes

### Work Verification (commit 2ff623e)

**What changed:** Agents now only show as "working" if they have actual tool calls, not just chat messages.

**Demo mode handling:**
```typescript
// In DEMO_DATA.agents, ensure working agents have recent tool calls
{
  id: 'nova',
  name: 'Nova',
  status: 'working',
  task: 'Reviewing sprint metrics',
  lastToolCall: Date.now() - 60000, // 1 minute ago (within threshold)
}
```

**Or:** Skip work verification in demo mode:
```typescript
// In work verification logic:
if (isDemoMode) {
  // Trust the status from DEMO_DATA
  status = agent.status;
} else {
  // Normal work verification logic
}
```

### Thought Bubbles Fix (commit 1015bf9)

**What changed:** Thought bubbles now match agent names correctly and show autowork cooldown timers.

**Demo mode handling:**
```typescript
// Demo agents should have matching names in chat messages
// In DEMO_DATA.chat:
{
  from: 'Nova', // Exact match to agent.name
  text: 'Morning team!',
  ts: Date.now(),
}
```

### Activity Log Viewer (commit 9c71b58)

**What changed:** Agent detail panel now shows activity logs.

**Demo mode handling:**
```typescript
// In DEMO_DATA, add activityLog for each agent (optional):
{
  id: 'nova',
  name: 'Nova',
  activityLog: [
    { timestamp: Date.now() - 300000, message: 'Reviewed sprint metrics' },
    { timestamp: Date.now() - 600000, message: 'Created roadmap doc' },
  ]
}
```

**Or:** Show "Demo mode - no logs available" in activity viewer when `isDemoMode`.

---

## Testing Checklist

Once integrated:

- [ ] Visit `http://localhost:3333?demo=true`
- [ ] Demo mode banner appears
- [ ] 5 agents render (Nova, Forge, Lens, Pixel, Cipher)
- [ ] Quest log shows 1 pending item
- [ ] Accomplishments show 4 items
- [ ] Water cooler has 6 messages
- [ ] Meeting Room is active (if included in demo)
- [ ] Click agent → detail panel opens
- [ ] Click quest → expands
- [ ] Click "Exit Demo" → returns to normal mode
- [ ] Click "Install OpenClawfice" → goes to /install
- [ ] Live simulation: agents update, chat flows (if implemented)
- [ ] No API errors in console
- [ ] No "undefined" or null errors

---

## Quick Win: Ship Without Live Simulation First

**Minimum viable demo mode:**
1. Add query param detection
2. Load demo data
3. Skip API polling
4. Add banner

**Ship this first** (30 minutes), then iterate with live simulation later (1-2 hours).

---

## Files to Modify

**Minimal version:**
- `app/page.tsx` — Add `isDemoMode` detection, conditional data loading, skip API polling, add banner

**Full version (with simulation):**
- `app/page.tsx` — Same as above + simulation loop
- `app/demo/data.ts` — Add `chatPool` and `taskPool` for simulation
- `app/demo/page.tsx` — Already done (redirects to `/?demo=true`)

---

## Common Pitfalls

### 1. useSearchParams Not Working

If `useSearchParams()` returns null:
```typescript
// Wrap component in Suspense
export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageInner />
    </Suspense>
  );
}
```

### 2. API Calls Still Happening in Demo Mode

Make sure every `useEffect` that calls `/api/office` checks `isDemoMode`:
```typescript
useEffect(() => {
  if (isDemoMode) return; // Must be first line
  // ... API logic
}, [isDemoMode]); // Must include in deps
```

### 3. Demo Data Not Showing

Check:
- `DEMO_DATA` is imported correctly
- Initial state uses `isDemoMode ? DEMO_DATA.x : []`
- `isDemoMode` is true (check with `console.log(isDemoMode)`)

---

## Next Steps

1. **Quick win:** Implement minimal demo mode (query param + static data)
2. **Test:** Verify it works end-to-end
3. **Ship:** Commit and push
4. **Iterate:** Add live simulation in a follow-up commit
5. **Polish:** Fine-tune simulation timing, add more demo scenarios

---

**Questions? Ping Nova.** This approach balances simplicity, virality, and maintainability. 🚀
