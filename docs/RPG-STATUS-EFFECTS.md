# RPG Status Effects - Make It Fun & Quirky!

**Goal:** Add RPG-style status effects to agents based on their activity patterns. Makes the office feel more like a game!

**Priority:** Nice-to-have (post-launch polish)  
**Time estimate:** 2-3 hours  
**Fun factor:** HIGH ⭐⭐⭐⭐⭐

---

## Status Effects

### 🔥 On Fire (Hot Streak)
**Trigger:** 3+ accomplishments in last hour  
**Visual:** Fire particle effect around NPC  
**Tooltip:** "Crushing it! 3 tasks completed in the last hour"  
**Bonus:** +10% XP for next accomplishment

### ☕ Caffeinated (High Energy)
**Trigger:** Active for 4+ hours straight  
**Visual:** Jittery movement animation, double speed  
**Tooltip:** "Powered by coffee! Working non-stop"  
**Bonus:** Movement speed +50%

### 😴 Sleepy (Low Energy)
**Trigger:** No activity for 2+ hours (but session still active)  
**Visual:** Slower movement, zzz particles above head  
**Tooltip:** "Taking a break. Last activity 2h ago"  
**Effect:** Movement speed -30%

### 🎯 Focused (In The Zone)
**Trigger:** Working on same task for 30+ minutes  
**Visual:** Glowing aura around NPC  
**Tooltip:** "Deep work mode. In the zone!"  
**Bonus:** Next accomplishment worth +25% XP

### 🤝 Team Player (Collaborative)
**Trigger:** Participated in meeting or group chat in last 30min  
**Visual:** Hearts floating above head  
**Tooltip:** "Just collaborated with the team"  
**Bonus:** +5 XP for everyone in the meeting

### 💎 XP Boost (Lucky)
**Trigger:** Random 10% chance when completing task  
**Visual:** Rainbow particle trail  
**Tooltip:** "Lucky! Next accomplishment worth 2x XP"  
**Bonus:** Next task gives double XP  
**Duration:** Until next accomplishment

### 🏆 Legendary (Top Performer)
**Trigger:** #1 on leaderboard for 24+ hours  
**Visual:** Crown above head, golden glow  
**Tooltip:** "Top agent! Held #1 rank for 24 hours"  
**Bonus:** All accomplishments worth +20% XP

### 🐌 Slowpoke (Idle)
**Trigger:** No activity for 6+ hours (session still active)  
**Visual:** Snail shell on back, super slow movement  
**Tooltip:** "AFK? No activity in 6 hours"  
**Effect:** Movement speed -50%, plumbob turns gray

---

## Implementation

### Data Structure

```typescript
interface StatusEffect {
  id: string;           // 'on-fire', 'caffeinated', etc.
  name: string;         // Display name
  icon: string;         // Emoji
  duration: number;     // Milliseconds (0 = permanent until condition changes)
  appliedAt: number;    // Timestamp
  xpBonus?: number;     // % bonus to XP
  speedMultiplier?: number; // Movement speed multiplier
}

// Add to Agent type:
interface Agent {
  // ... existing fields
  statusEffects?: StatusEffect[];
}
```

### Where to Calculate

**Option A: Frontend (client-side)**
```typescript
// In app/page.tsx useEffect
function calculateStatusEffects(agent: Agent): StatusEffect[] {
  const effects: StatusEffect[] = [];
  const now = Date.now();
  
  // Check accomplishments for hot streak
  const recentAccomplishments = accomplishments
    .filter(a => a.who === agent.name && now - a.timestamp < 3600000);
  
  if (recentAccomplishments.length >= 3) {
    effects.push({
      id: 'on-fire',
      name: 'On Fire',
      icon: '🔥',
      duration: 0,
      appliedAt: now,
      xpBonus: 10
    });
  }
  
  // Check idle time
  const idleMs = now - (agent.lastActive || now);
  if (idleMs > 21600000) { // 6 hours
    effects.push({
      id: 'slowpoke',
      name: 'Slowpoke',
      icon: '🐌',
      duration: 0,
      appliedAt: now,
      speedMultiplier: 0.5
    });
  } else if (idleMs > 7200000) { // 2 hours
    effects.push({
      id: 'sleepy',
      name: 'Sleepy',
      icon: '😴',
      duration: 0,
      appliedAt: now,
      speedMultiplier: 0.7
    });
  }
  
  // Check leaderboard position
  if (agent.xp && agent.xp === Math.max(...agents.map(a => a.xp || 0))) {
    effects.push({
      id: 'legendary',
      name: 'Legendary',
      icon: '🏆',
      duration: 0,
      appliedAt: now,
      xpBonus: 20
    });
  }
  
  return effects;
}
```

**Option B: Backend (API route)**
- Add `/api/office/status-effects` endpoint
- Calculate effects server-side
- Frontend polls and displays

**Recommendation:** Frontend for simplicity (no new API needed)

### Visual Display

```tsx
// In NPC.tsx component
{agent.statusEffects?.map(effect => (
  <div
    key={effect.id}
    className="absolute -top-8 left-1/2 -translate-x-1/2"
    title={`${effect.name}: ${effect.description}`}
  >
    <span className="text-2xl animate-bounce">{effect.icon}</span>
  </div>
))}

// Particle effects
{agent.statusEffects?.some(e => e.id === 'on-fire') && (
  <FireParticles />
)}
```

### XP Bonus Application

```typescript
// When creating accomplishment:
function calculateXP(baseXP: number, agent: Agent): number {
  let xp = baseXP;
  
  agent.statusEffects?.forEach(effect => {
    if (effect.xpBonus) {
      xp *= (1 + effect.xpBonus / 100);
    }
  });
  
  return Math.round(xp);
}
```

---

## Example Scenarios

**Scenario 1: Hot Streak**
- Cipher completes 3 tasks in 1 hour
- 🔥 appears above their head
- Next task: 50 XP → 55 XP (+10% bonus)
- Effect disappears when streak breaks (1hr no tasks)

**Scenario 2: Team Meeting**
- Nova and Forge have a meeting
- Both get 🤝 effect
- Both earn +5 XP immediately
- Effect lasts 30 minutes

**Scenario 3: Legendary**
- Scout holds #1 leaderboard for 24h
- Gets 🏆 crown and golden glow
- All tasks worth +20% XP
- Effect stays until someone else takes #1

---

## Configuration

Add to `openclawfice.config.json`:

```json
{
  "statusEffects": {
    "enabled": true,
    "effects": {
      "onFire": {
        "threshold": 3,
        "windowHours": 1,
        "xpBonus": 10
      },
      "sleepy": {
        "idleHours": 2,
        "speedMultiplier": 0.7
      },
      "legendary": {
        "requiredHours": 24,
        "xpBonus": 20
      }
    }
  }
}
```

---

## Testing

```bash
# Trigger hot streak:
curl -X POST http://localhost:3333/api/office/actions \
  -H "Content-Type: application/json" \
  -d '{"type":"add_accomplishment","accomplishment":{"icon":"🔥","title":"Task 1","who":"Cipher"}}'

# Wait 5 seconds, repeat 2 more times
# Then check: Cipher should have 🔥 effect

# Trigger sleepy:
# Manually set agent.lastActive to 3 hours ago
# Agent should show 😴 effect

# Trigger legendary:
# Make agent have highest XP for 24h
# Should show 🏆 effect
```

---

## Why This Is Cool

1. **Gamification:** Makes work feel like playing an RPG
2. **Visual feedback:** Instantly see who's crushing it
3. **Team morale:** Celebrate hot streaks and top performers
4. **Fun quirks:** Slowpoke and sleepy effects add humor
5. **Shareable:** Screenshots with effects look cool on Twitter

**This makes OpenClawfice feel less like a dashboard and more like a game!** 🎮

---

## Future Ideas (v0.2+)

- 🌟 **Combo Multiplier:** Chain tasks for increasing XP
- 🎲 **Random Events:** Lucky XP boosts, double XP hours
- 🏅 **Badges:** Permanent achievements (First 1000 XP, etc.)
- ⚔️ **Challenges:** "Complete 5 tasks in 2 hours for bonus"
- 🎪 **Seasonal Events:** Holiday-themed effects
- 🤖 **Custom Effects:** Let users create their own

---

**Time to ship:** Post-launch polish (not blocking)  
**Impact:** High fun factor, medium virality (cool screenshots)  
**Effort:** 2-3 hours dev time

Let me know if you want me to implement this! 🚀
