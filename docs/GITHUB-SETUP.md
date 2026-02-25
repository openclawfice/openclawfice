# 🚀 GitHub Repository Setup — 2 Minutes

**Complete checklist for launching the openclawfice/openclawfice repo.**

---

## Pre-Launch Checklist ✅

Before making the repo public, verify:

- [ ] **README.md** — Has demo GIF, install instructions, feature table
- [ ] **LICENSE** — AGPL-3.0 (already exists)
- [ ] **SECURITY.md** — Security policy (already exists)  
- [ ] **CONTRIBUTING.md** — Contribution guidelines (already exists)
- [ ] **.github/workflows/** — CI/CD pipelines (already exist)
- [ ] **No secrets in git history** — Run: `git log --all --pretty=format:"%H %s" | grep -iE '(key|token|password|secret)'`
- [ ] **package.json** — version = 0.1.0, correct URLs
- [ ] **Demo GIF** — < 1MB, shows key features (already at `public/openclawfice-demo.gif`)

---

## Step 1: Create GitHub Repo (30 seconds)

1. Go to: https://github.com/new
2. **Owner:** `openclawfice` (or your org)
3. **Repository name:** `openclawfice`
4. **Description:** "Your AI agents as pixel-art NPCs in a retro virtual office"
5. **Visibility:** Public ✅
6. **Initialize:** Leave UNCHECKED (we have an existing repo)
7. Click **Create repository**

---

## Step 2: Push Code (30 seconds)

```bash
cd ~/clawd-openclawfice/openclawfice

# Add GitHub remote
git remote add origin https://github.com/openclawfice/openclawfice.git

# Push main branch
git push -u origin main

# Push all tags (if any)
git push --tags
```

**Verify:** Refresh GitHub repo page → you should see all files

---

## Step 3: Configure Repo Settings (60 seconds)

### General Settings

Go to: **Settings → General**

- **Features:**
  - ✅ Issues
  - ✅ Wikis (optional — we use `/docs` instead)
  - ✅ Discussions (optional — for community)
  - ❌ Projects (not needed yet)

- **Pull Requests:**
  - ✅ Allow squash merging
  - ✅ Allow rebase merging  
  - ❌ Allow merge commits (keeps history clean)
  - ✅ Always suggest updating pull request branches
  - ✅ Automatically delete head branches

### Security Settings

Go to: **Settings → Security → Code security and analysis**

- ✅ Dependency graph (auto-enabled for public repos)
- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ CodeQL analysis (already configured via `.github/workflows/codeql.yml`)

### Branch Protection

Go to: **Settings → Branches → Add rule**

- **Branch name pattern:** `main`
- Rules:
  - ✅ Require a pull request before merging
  - ✅ Require status checks to pass before merging
    - Add: `build`, `test`, `security-scan` (when CI exists)
  - ❌ Require conversation resolution before merging (optional)
  - ✅ Do not allow bypassing the above settings

**Note:** You (repo owner) can still push directly to `main` in emergencies.

---

## Step 4: Add Topics (10 seconds)

Go to: **Repo homepage → About ⚙️ (top right) → Topics**

Add:
```
ai, agents, openclaw, dashboard, pixel-art, retro, sims, npc, typescript, nextjs
```

Click **Save changes**.

---

## Step 5: Configure GitHub Pages (20 seconds)

Go to: **Settings → Pages**

- **Source:** Deploy from a branch
- **Branch:** `main`
- **Folder:** `/docs`

Click **Save**.

**Why?** This makes `/docs` accessible at `https://openclawfice.github.io/openclawfice/` (fallback if openclawfice.com goes down).

---

## Step 6: Add Social Preview (10 seconds)

Go to: **Repo homepage → About ⚙️ (top right)**

- **Social preview image:** Upload `public/openclawfice-demo.gif` (or OG image if available)

This is what shows when someone shares the repo on Twitter/Discord.

---

## Post-Launch Checklist ✅

After repo is public:

- [ ] **Star your own repo** (shows social proof)
- [ ] **Tweet the launch** with repo link
- [ ] **Post in Discord** (#announcements)
- [ ] **Submit to Show HN** (see `docs/internal/HN-POST-TEMPLATE.md`)
- [ ] **Add to clawhub.com** (OpenClaw skill directory)
- [ ] **Monitor Issues tab** — respond within 24 hours
- [ ] **Monitor Stars** — thank early supporters

---

## Emergency Rollback

If something goes wrong:

```bash
# Make repo private again
# Go to: Settings → Danger Zone → Change repository visibility → Make private

# Or delete entirely
# Go to: Settings → Danger Zone → Delete this repository
```

---

## Maintenance Schedule

**Daily (first week):**
- Check Issues/PRs
- Respond to questions
- Fix critical bugs

**Weekly:**
- Review Dependabot PRs
- Update docs based on feedback
- Add new features to roadmap

**Monthly:**
- Security audit (review CodeQL alerts)
- Performance optimization
- Community metrics review (stars, forks, traffic)

---

## Success Metrics (Week 1)

Targets:
- **100+ stars** (viral threshold)
- **5-10 PRs** (community engagement)
- **20+ issues** (product-market fit signal)
- **1K+ unique visitors** (GitHub Insights → Traffic)

If you hit these, consider:
- npm publish (`npx openclawfice`)
- Product Hunt launch
- Conference talk submission

---

## Need Help?

- **GitHub Docs:** https://docs.github.com
- **OpenClaw Discord:** https://discord.gg/clawd
- **Security Issues:** See `SECURITY.md`

---

**Time to complete:** 2-3 minutes  
**Difficulty:** Easy  
**Impact:** CRITICAL (enables community growth)

🚀 Ready to launch!
