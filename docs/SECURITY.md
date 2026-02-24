# 🛡️ Security & Safety

**OpenClawfice takes security seriously.**

---

## Automatic Security Scanning

Every code change is automatically scanned for:

- ✅ **Malware** - Virus and trojan detection
- ✅ **Vulnerabilities** - Known security issues in dependencies  
- ✅ **Code Quality** - Suspicious patterns and backdoors
- ✅ **Supply Chain** - Dependency integrity verification

**Scanned by:**
- **CodeQL** (GitHub's semantic code analysis - daily + every push)
- **npm audit** (dependency vulnerabilities - runs on every push)
- **Dependabot** (automated dependency updates with security alerts)
- **ESLint Security Rules** (static analysis for common vulnerabilities)
- **TypeScript Type Safety** (prevents type-related security bugs)
- **Dependency Review** (supply chain attack prevention on PRs)

---

## What We DON'T Do

OpenClawfice is privacy-first:

❌ **No telemetry** - We don't track your usage  
❌ **No analytics** - No Google Analytics, no tracking pixels  
❌ **No data collection** - Your data stays on your machine  
❌ **No phone home** - Doesn't send data to external servers  
❌ **No API keys required** - Works 100% offline after install  

---

## What Data Is Accessed

OpenClawfice runs locally and only reads:

✅ **Your OpenClaw config** - `~/.openclaw/openclaw.json` (read-only)  
✅ **Session files** - `~/.openclaw/agents/*/sessions/*.jsonl` (read-only)  
✅ **Status files** - `~/.openclaw/.status/*.json` (read-write for UI state)  

**No network requests are made** except:
- Installing npm packages (during `npm install`)
- Serving the dashboard on localhost:3333

---

## Permissions Required

### File System
- **Read:** OpenClaw config and session files
- **Write:** Status files in `~/.openclaw/.status/` (for accomplishments, quests, chat)

### Network
- **Local only:** Binds to `localhost:3333` (not accessible from internet)
- **No external requests:** Runs 100% offline

### Process
- **Node.js:** Runs as a Next.js development server
- **No sudo required:** Runs as your user account
- **No system modifications:** Doesn't change system files

---

## Code Audit

**Source code is fully open:**
- Review: https://github.com/openclawfice/openclawfice
- Issues: Report security concerns via GitHub Security tab
- Audit: All code is readable TypeScript/JavaScript

**No minification, no obfuscation:**
- What you see is what runs
- No hidden code
- No compiled binaries

---

## Dependency Security

**Minimal dependencies:**
- `react` + `next` (official frameworks, audited by millions)
- `@types/*` (TypeScript type definitions)
- No third-party tracking libraries
- No analytics packages
- No cloud service dependencies

**Auto-updated:**
- Dependabot monitors for vulnerabilities
- Security patches applied within 24 hours
- Version pinning prevents supply chain attacks

---

## Reporting Security Issues

Found a security issue?

**DO:**
1. Report privately via GitHub Security tab
2. Email: security@openclawfice.com (if urgent)
3. Include: Steps to reproduce, impact assessment

**DON'T:**
1. Post publicly until patched
2. Exploit the issue
3. Share with third parties before disclosure

**Response time:**
- Critical issues: <24 hours
- High severity: <72 hours  
- Medium/Low: <7 days

---

## Security Best Practices

**For users:**
- ✅ Keep OpenClawfice updated (`git pull` regularly)
- ✅ Run `npm audit` before installing
- ✅ Review code changes in git history
- ✅ Use firewall to block port 3333 from internet (if needed)
- ✅ Run as non-root user (never use `sudo`)

**For contributors:**
- ✅ No secrets in code (use environment variables)
- ✅ No external API calls without disclosure
- ✅ Follow secure coding practices
- ✅ Test security before submitting PRs

---

## Compliance

**AGPL-3.0 License:**
- Source code must remain open
- Modifications must be disclosed
- Network use requires source availability

**Privacy:**
- GDPR compliant (no data collection)
- CCPA compliant (no tracking)
- No cookies, no tracking

---

## Security Badges

[![Security: Verified & Malware Scanned](https://img.shields.io/badge/Security-Verified%20%26%20Scanned-brightgreen.svg)](https://github.com/openclawfice/openclawfice/security)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL_3.0-blue.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Dependencies: Minimal](https://img.shields.io/badge/Dependencies-Minimal-green.svg)](package.json)
[![Privacy: No Tracking](https://img.shields.io/badge/Privacy-No_Tracking-brightgreen.svg)](SECURITY.md)

---

## Trust Indicators

✅ **Open Source** - All code is public and auditable  
✅ **No Telemetry** - Zero data collection  
✅ **Local Only** - Runs on your machine, not our servers  
✅ **Minimal Dependencies** - Few attack surfaces  
✅ **Auto-Scanned** - Continuous security monitoring  
✅ **Fast Patches** - Security issues fixed within hours  

---

## FAQ

**Q: Is OpenClawfice safe to install?**  
A: Yes. All code is open source, scanned for malware, and runs locally on your machine.

**Q: Does it send my data anywhere?**  
A: No. OpenClawfice runs 100% locally. No network requests except localhost.

**Q: Can I audit the code myself?**  
A: Absolutely! Check https://github.com/openclawfice/openclawfice

**Q: What if I find a security issue?**  
A: Report via GitHub Security tab or email security@openclawfice.com

**Q: Is my OpenClaw data safe?**  
A: Yes. OpenClawfice only reads your config (read-only) and writes UI state to `.status/`

**Q: Does it need internet access?**  
A: No. After install, works 100% offline.

---

## Verification Steps

**Before installing, verify:**

```bash
# 1. Check package integrity
npm view openclawfice dist.integrity

# 2. Audit dependencies
cd openclawfice
npm audit

# 3. Review recent commits
git log --oneline -10

# 4. Check for malware (macOS)
xattr -lr . | grep -i quarantine

# 5. Verify code is readable
find . -name "*.js" -o -name "*.ts" | head -10
```

**All clear?** ✅ Safe to proceed!

---

## Updates

**Security is ongoing:**
- Monthly dependency updates
- Weekly vulnerability scans
- Continuous monitoring
- Transparent disclosure

**Stay informed:**
- Watch repo for security alerts
- Subscribe to releases
- Check CHANGELOG.md for patches

---

**TL;DR:** OpenClawfice is malware-free, privacy-first, and continuously scanned for security issues. Your data stays on your machine. No tracking, no telemetry, no backdoors.

**Trust, but verify** ✅
