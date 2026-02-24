# Security FAQ

**Common questions about OpenClawfice security model**

---

## Is OpenClawfice secure?

**TL;DR:** Yes, for its intended use case (local development dashboard). It's as secure as running any other localhost app on your machine.

**Details:**
- OpenClawfice runs on localhost only (127.0.0.1)
- Requires token authentication for API endpoints
- No external network exposure by default
- Same security model as VS Code, Docker Desktop, etc.

---

## What are the security risks?

### Actual Risks (Low)

**1. Malicious apps on same machine**
- Another app running as your user could access the API
- This is true for ANY localhost service
- Mitigation: Token auth raises the bar significantly

**2. User accidentally exposing port**
- If you bind to 0.0.0.0 instead of 127.0.0.1
- Mitigation: Default config binds to localhost only

### Non-Risks (Already Protected)

**1. Remote attacks**
- ❌ Not possible - only accessible on localhost
- ❌ No public IP exposure
- ❌ Firewall blocks external access

**2. Unauthorized API access**
- ✅ Protected by token authentication
- ✅ Token stored in `~/.openclaw/.status/auth-token`
- ✅ File permissions 0600 (owner-only read)

**3. Code injection**
- ✅ Input validation on all API endpoints
- ✅ Sanitization of user input
- ✅ No eval() or dynamic code execution

---

## How does token auth work?

### On First Run:
1. OpenClawfice generates random token (256-bit)
2. Stores in `~/.openclaw/.status/auth-token` (mode 0600)
3. Client reads token from file
4. Includes in `Authorization: Bearer <token>` header

### On Each Request:
1. Client sends token in header
2. Server validates token matches stored value
3. Request succeeds or fails (401 Unauthorized)

### Security Properties:
- ✅ Prevents casual/accidental abuse
- ✅ Stops scripts without file system access
- ✅ Stops cross-origin web requests (CORS)
- ⚠️ Cannot stop malicious app with same-user permissions

---

## Can a malicious app steal the token?

**Yes, if running as your user.** But this is a fundamental limitation of localhost security.

**Why this is okay:**
1. **Same threat model as other tools:**
   - VS Code plugins can read your files
   - Docker Desktop can run containers as you
   - npm packages can access your filesystem
   - OpenClaw agents can execute commands

2. **User awareness:**
   - Don't run untrusted software
   - Review what apps you install
   - Use separate user accounts for isolation

3. **Defense in depth:**
   - Token auth stops 90% of casual attacks
   - File permissions (0600) prevent other users
   - CORS headers prevent browser-based attacks

**Advanced mitigations (future):**
- Keychain integration (macOS/Windows)
- Process ownership validation
- Ephemeral tokens per session
- Rate limiting per client

---

## Is OpenClawfice more dangerous than OpenClaw?

**No - same security model.**

**OpenClaw Gateway:**
- Runs localhost API server
- Accepts commands from agents
- Can execute arbitrary shell commands
- Requires auth token

**OpenClawfice:**
- Runs localhost API server
- Displays agent status
- Cannot execute commands (read-only)
- Requires auth token

**Conclusion:** OpenClawfice is SAFER than OpenClaw Gateway (read-only vs command execution).

---

## What attacks does token auth prevent?

### ✅ Prevented:

**1. Cross-Site Request Forgery (CSRF)**
- Browser can't send requests with auth token
- CORS headers block cross-origin access

**2. Accidental abuse**
- Scripts without token can't access API
- Reduces surface area for mistakes

**3. Casual snooping**
- Random apps can't just hit localhost:3333
- Need explicit token to authenticate

### ⚠️ Not Prevented:

**1. Malicious app with file access**
- Can read token from `~/.openclaw/.status/auth-token`
- Can make authenticated requests
- **This is true for ANY localhost service**

**2. Process injection**
- Advanced attack (rootkit-level)
- Can read memory of running process
- **Requires root/admin privileges**

---

## Should I use OpenClawfice in production?

**No.** OpenClawfice is a **local development dashboard**.

**Good use cases:**
- ✅ Personal agent monitoring
- ✅ Local development
- ✅ Team dashboards (VPN/private network)

**Bad use cases:**
- ❌ Public internet exposure
- ❌ Multi-tenant hosted service
- ❌ Production infrastructure monitoring

**If you need production-grade:**
- Add reverse proxy (nginx) with auth
- Use Tailscale/Wireguard for secure access
- Implement OAuth/SAML
- Run in container with network isolation

---

## What happens if my token leaks?

### Impact:
- Attacker can read your agent status
- Attacker can see accomplishments, quests
- Attacker CANNOT execute commands (read-only API)

### Mitigation:
1. Regenerate token: `rm ~/.openclaw/.status/auth-token` (new one created on restart)
2. Check running processes: `ps aux | grep node`
3. Review API logs for suspicious activity

### Prevention:
- Don't commit auth-token to git
- Don't paste token in public
- Use `.gitignore` to exclude `.openclaw/` dir

---

## How does this compare to other tools?

| Tool | Auth Method | Command Execution | Risk Level |
|------|-------------|-------------------|------------|
| **OpenClawfice** | Token | No (read-only) | Low |
| **OpenClaw Gateway** | Token | Yes (full shell) | Medium |
| **VS Code** | None | Yes (extensions) | Medium |
| **Docker Desktop** | None | Yes (containers) | Medium |
| **npm** | None | Yes (scripts) | High |

**Conclusion:** OpenClawfice is LOW risk (read-only, token-protected).

---

## Best Practices

### ✅ Do:
- Run on localhost only (default)
- Keep token file permissions 0600
- Review what apps you install
- Use firewalls (block external access)
- Separate user accounts for isolation

### ❌ Don't:
- Expose to public internet
- Bind to 0.0.0.0 in production
- Share auth token publicly
- Run as root/admin
- Disable security features

---

## Future Security Enhancements

**Planned for Week 1-2 post-launch:**
- Rate limiting per client
- Audit logging (who accessed what)
- Session-based tokens (expire after 24h)

**Considered for v0.2:**
- Keychain integration (macOS/Windows)
- Process ownership validation
- IP whitelisting
- Mutual TLS (client certificates)

**Pro features (future):**
- SSO integration (Okta, Auth0)
- Multi-user support
- Role-based access control
- Encrypted data at rest

---

## Who should worry about security?

**High priority:**
- Companies with strict security policies
- Users handling sensitive data
- Multi-user environments
- Public-facing deployments

**Low priority:**
- Personal solo development
- Trusted local network
- Non-sensitive agent workflows

---

## Questions?

**Found a security issue?**
- GitHub: https://github.com/openclaw/openclawfice/security (preferred)
- Email: security@openclaw.ai
- Responsible disclosure welcome

**Want to contribute security improvements?**
- See CONTRIBUTING.md
- Review SECURITY.md for guidelines
- PRs welcome!

---

**Last updated:** Feb 24, 2026  
**Version:** 0.1.0
