# Quest Approval Workflow Issue

## Problem

Tyler approved the husk.irl email quest, but the email was never sent.

**Timeline:**
- Scout creates quest: "Outreach email to husk.irl mgmt"
- Tyler responds: "approved" (Feb 24, 00:22 EST)
- Response saved to `responses.json`
- **Scout never checks responses and sends email** ❌

## Root Cause

**Current workflow:**
1. Agent creates quest → POST to `/api/office/actions`
2. Tyler responds in UI → saves to `responses.json`
3. **Agent must manually poll `responses.json`** ⚠️
4. Agent sees approval → takes action

**The gap:** Step 3 is manual. Agents don't automatically know Tyler responded.

## Example (What Happened)

```json
// responses.json
{
  "actionId": "husk-email-draft",
  "actionTitle": "Outreach email to husk.irl mgmt",
  "from": "Tyler",
  "response": "approved",
  "respondedAt": 1771910546268
}
```

Scout should:
1. Poll responses.json every 5-10 minutes
2. See "approved" response
3. Send the email
4. Mark as complete

**But Scout didn't poll.** The email sat unsent.

## Solutions

### Option A: Auto-Notification (Recommended)

**How it works:**
- When Tyler responds to a quest, send a message to the agent
- Use `sessions_send` to notify agent directly
- Agent receives: "Tyler approved your quest: [title]"

**Implementation:**
```typescript
// In /api/office/actions POST handler (respond_action)
if (body.type === 'respond_action') {
  // ... existing code to save response ...
  
  // NEW: Notify the agent who created the quest
  const agent = action?.from; // e.g., "Scout"
  if (agent) {
    const agentSessionKey = `agent:ocf-${agent.toLowerCase()}:main`;
    
    // Send notification via OpenClaw
    await fetch('http://localhost:8080/api/sessions/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionKey: agentSessionKey,
        message: `Tyler responded to your quest: "${action.title}"\nResponse: ${body.response}\n\nCheck responses.json and take action!`,
        timeoutSeconds: 0
      })
    });
  }
  
  return NextResponse.json({ success: true });
}
```

**Pros:**
- Immediate notification (no polling delay)
- Agents know exactly when Tyler responds
- Works across all quest types

**Cons:**
- Requires OpenClaw API call
- Slightly more complex

---

### Option B: Cron Job Automation

**How it works:**
- Background cron job runs every 5 minutes
- Checks `responses.json` for new responses
- Sends messages to agents with pending actions

**Implementation:**
```bash
# Add to OpenClaw gateway cron
{
  "name": "Quest Response Notifier",
  "schedule": { "kind": "every", "everyMs": 300000 },
  "payload": {
    "kind": "systemEvent",
    "text": "Check responses.json for quest approvals and notify agents"
  },
  "sessionTarget": "isolated"
}
```

**Pros:**
- Decoupled from API route
- Centralized notification logic
- Easy to debug

**Cons:**
- 5-minute delay (polling interval)
- Extra infrastructure

---

### Option C: Manual (Current)

**How it works:**
- Agents manually check `responses.json` periodically
- No automation, relies on agent discipline

**Implementation:**
Already implemented (current state)

**Pros:**
- Simple (no new code)
- Agents have full control

**Cons:**
- **DOESN'T WORK** (as evidenced by this issue)
- Relies on agents remembering to check
- Unpredictable delay

---

## Recommendation: Option A

**Why:**
- Immediate notification (no delay)
- Reliable (doesn't depend on agent memory)
- Simple to implement (10 lines of code)
- Works with existing infrastructure

**Implementation steps:**
1. Add notification code to `/api/office/actions` route
2. Test with a dummy quest
3. Verify agents receive messages
4. Document in STATUS-FILES.md

**Time estimate:** 30 minutes

---

## Temporary Workaround

Until this is fixed, use direct messages:

```bash
# When Tyler approves a quest, PM manually notifies the agent:
sessions_send(
  sessionKey="agent:ocf-scout:main",
  message="Tyler approved [quest name]. Take action!",
  timeoutSeconds=0
)
```

**This is what Nova just did** to unblock the husk.irl email.

---

## Related Issues

- Agents creating quests don't know when Tyler responds
- No audit trail of "who acted on which approval"
- Responses can pile up in `responses.json` unseen

**Future enhancement:** Quest dashboard showing:
- Pending quests (waiting for Tyler)
- Approved quests (waiting for agent action)
- Completed quests (action taken)

---

## Testing Checklist

After implementing Option A:

- [ ] Create test quest from Scout
- [ ] Tyler responds with approval
- [ ] Verify Scout receives notification
- [ ] Scout takes action (sends email)
- [ ] Check responses.json is processed
- [ ] Document new workflow in STATUS-FILES.md

---

**Status:** Identified and documented  
**Priority:** Medium (not blocking launch, but affects team coordination)  
**Owner:** Nova (PM) / Forge (implementation)

---

**Created:** Feb 24, 2026 00:50 EST  
**Reporter:** Tyler  
**Assignee:** TBD
