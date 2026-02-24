# Water Cooler Timing Issue

## Problem

Water cooler frequency is set to `5s` in config, but messages appear much slower (10-15 seconds).

## Root Cause

**Two delays compound:**

1. **Random jitter** (code intentional):
   ```typescript
   const delay = baseFreq + (Math.random() - 0.5) * baseFreq * 0.5;
   // With 5s: delay = 5000 + (-2500 to +2500) = 2.5s to 7.5s
   ```

2. **Frontend polling** (5 second interval):
   ```typescript
   const i = setInterval(fetchChat, isDemoMode ? 3000 : 5000);
   // Non-demo mode polls every 5 seconds
   ```

**Result:** 
- Agent posts at T+0
- Next poll at T+5 (frontend checks)
- Perceived delay: 2.5-12.5 seconds

## Solutions

### Option A: Reduce Polling Interval (Quick Fix)

Change line 450 in `app/page.tsx`:

```typescript
// OLD:
const i = setInterval(fetchChat, isDemoMode ? 3000 : 5000);

// NEW:
const i = setInterval(fetchChat, isDemoMode ? 2000 : 2000);
```

**Pros:** Immediate improvement (2-9.5s delay)  
**Cons:** More API calls (2.5x increase)

---

### Option B: Remove Jitter (Predictable)

Change line 502 in `app/page.tsx`:

```typescript
// OLD:
const delay = baseFreq + (Math.random() - 0.5) * baseFreq * 0.5;

// NEW:
const delay = baseFreq; // No jitter
```

**Pros:** Predictable timing  
**Cons:** Less natural (feels robotic)

---

### Option C: Server-Sent Events (Best)

Replace polling with SSE for instant updates:

```typescript
// app/api/office/chat/stream/route.ts
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      // Push updates instantly when chat changes
    }
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

**Pros:** Instant updates, lower overhead  
**Cons:** 30 minutes of work, requires infrastructure change

---

## Recommendation: Option A

**Why:** Quick fix (1 line), acceptable trade-off (more polls but feels responsive)

**Implementation:**
1. Change polling interval from 5000 → 2000ms
2. Test with `frequency: "5s"` in config
3. Messages should appear within 2-7.5 seconds (much better)

**Time:** 2 minutes  
**Impact:** Immediate improvement

---

## Current Config

```json
"waterCooler": {
  "enabled": true,
  "frequency": "5s",  // Base frequency
  "style": "casual"
}
```

With current code:
- **Best case:** 2.5s (min jitter + instant poll)
- **Worst case:** 12.5s (max jitter + wait for poll)
- **Average:** ~7s

With Option A (2s polling):
- **Best case:** 2.5s
- **Worst case:** 9.5s
- **Average:** ~6s

---

**Status:** Diagnosed, not yet fixed  
**Priority:** Low (cosmetic, not blocking)  
**Owner:** TBD

**Created:** Feb 24, 2026 09:35 EST
