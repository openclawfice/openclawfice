# Security Policy

## Verified & Scanned

OpenClawfice is automatically scanned for security vulnerabilities and malware:

- **GitHub Advanced Security:** Automated scanning on every commit
- **Dependabot:** Monitors npm dependencies for known vulnerabilities  
- **Malware Detection:** All releases verified malware-free
- **Open Source:** Full transparency - audit the code yourself

**Current Status:** ✅ No known vulnerabilities

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

---

## Reporting a Vulnerability

**Found a security issue?** We appreciate responsible disclosure.

### How to Report

**Email:** security@openclaw.ai  
**Subject:** [SECURITY] Brief description

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your suggested fix (if any)

### What to Expect

- **Acknowledgment:** Within 24 hours
- **Initial Assessment:** Within 72 hours  
- **Fix Timeline:** Critical issues patched within 7 days
- **Credit:** Public acknowledgment (if desired) after fix is deployed

### What NOT to Do

- ❌ Don't publicly disclose before we've patched
- ❌ Don't test on production instances you don't own
- ❌ Don't exploit the vulnerability beyond proof-of-concept

### Bug Bounty

We don't currently offer monetary rewards, but we will:
- Credit you in release notes
- Add you to our security researchers hall of fame
- Send you OpenClaw swag (if you want it)

---

## Security Best Practices

### For Self-Hosting

**Recommended:**
- Run behind a firewall (only expose localhost:3333 locally)
- Use HTTPS if exposing to internet (via reverse proxy)
- Keep dependencies updated (`npm audit`)
- Review `~/.openclaw/openclaw.json` permissions

**Not Recommended:**
- Exposing directly to internet without auth
- Running as root
- Using on untrusted networks

### For Development

**Safe:**
- Fork the repo and review code before running
- Check `package.json` for dependencies
- Use `npm audit` before install
- Run in isolated environment first

**Risky:**
- Running without reviewing code
- Installing untrusted dependencies
- Disabling security warnings

---

## Vulnerability Disclosure History

None yet! (This is v0.1)

We'll maintain a public log of:
- Reported vulnerabilities
- Fix timelines
- Security researcher credits

---

## Automated Scanning

**GitHub Actions:**
- CodeQL analysis on every PR
- Dependency scanning daily
- Container scanning (if applicable)

**npm audit:**
```bash
cd ~/openclawfice && npm audit
```

Should return: `found 0 vulnerabilities`

---

## Questions?

**Security questions:** security@openclaw.ai  
**General questions:** GitHub Discussions

---

_Last updated: Feb 24, 2026_
