# 📝 README Template for OpenClawfice Forks

**Use this when forking OpenClawfice for your own project or adaptation.**

This template helps you customize the README while maintaining credit and links back to the original project.

---

## Template (Copy Everything Below)

```markdown
# [Your Project Name]

**[One-line description of your fork/adaptation]**

Built on [OpenClawfice](https://github.com/openclawfice/openclawfice) — the pixel art dashboard for AI agents.

![Demo Screenshot](./path/to/your/screenshot.png)

**[Live Demo](https://your-demo-url.com)** (if you have one)

---

## What's Different?

This fork adds:
- [Feature 1: Description]
- [Feature 2: Description]
- [Feature 3: Description]

**Why fork?** [Explain your use case — e.g., "Tailored for marketing teams" or "Optimized for ML workflows"]

---

## Quick Start

### Prerequisites
- [OpenClaw](https://openclaw.ai) installed (or [Your Framework])
- Node.js 18+
- [Any additional requirements]

### Install

\`\`\`bash
git clone https://github.com/[your-username]/[your-repo].git
cd [your-repo]
npm install
npm run dev
\`\`\`

Open http://localhost:3333

---

## What's Included

[Keep what's relevant from OpenClawfice, remove what you changed]

- 🎮 Live office with agent NPCs
- 💬 Water cooler chat
- 📋 Quest log
- 🏆 Accomplishments feed
- 🤝 Meeting room
- ⭐ XP & levels
- 🎴 Trading cards
- 📊 Stats dashboard
- [Your new features]

---

## Key Changes from OpenClawfice

### 1. [Change Category - e.g., "Agent Types"]

**Original:** Generic agents with default roles  
**This fork:** [Description of your change]

**Why:** [Your reasoning]

---

### 2. [Another Change]

**Original:** [What OpenClawfice did]  
**This fork:** [What you changed]

**Why:** [Your reasoning]

---

## Configuration

[Document your fork-specific config]

\`\`\`json
{
  "yourSetting": "value",
  "anotherSetting": true
}
\`\`\`

---

## Use Cases

[Examples specific to your fork]

1. **[Use Case 1]** — [Description]
2. **[Use Case 2]** — [Description]
3. **[Use Case 3]** — [Description]

---

## Roadmap

- [ ] [Your planned feature 1]
- [ ] [Your planned feature 2]
- [ ] [Your planned feature 3]

**Want to contribute?** Open an issue or PR!

---

## Differences from Upstream

| Feature | OpenClawfice | This Fork |
|---------|--------------|-----------|
| Agent types | Generic | [Your custom types] |
| Theme | Retro pixel | [Your theme] |
| Data source | OpenClaw | [Your source] |
| [Other] | [Original] | [Your change] |

**Sync status:** Based on OpenClawfice v[version] ([commit hash])

---

## Merging Upstream Changes

To pull updates from OpenClawfice:

\`\`\`bash
git remote add upstream https://github.com/openclawfice/openclawfice.git
git fetch upstream
git merge upstream/main
# Resolve conflicts if any
\`\`\`

**Recommended:** Check [OpenClawfice releases](https://github.com/openclawfice/openclawfice/releases) before merging.

---

## Credits

**Based on:** [OpenClawfice](https://github.com/openclawfice/openclawfice) by [Tyler Henkel](https://openclaw.ai)

**This fork by:** [Your Name/Organization]

**License:** [Your license — must be compatible with OpenClawfice's AGPL-3.0]

---

## Support

- **This fork:** [Your Discord/email/GitHub issues]
- **OpenClawfice (upstream):** https://discord.gg/clawd

---

## License

[AGPL-3.0](./LICENSE) (same as upstream)

**AGPL requirements:** If you distribute this fork, you must:
1. Keep this open source
2. Include the full license
3. Credit the original (link back to OpenClawfice)

[Your additional license notes]

---

Made with 🎨 by [Your Name]  
Built on OpenClawfice
```

---

## Template Customization Guide

### Section-by-Section

#### 1. Project Name & Description
**Replace:**
- `[Your Project Name]` → Your fork's name (e.g., "MarketingClawfice")
- `[One-line description]` → What makes your fork unique

**Example:**
> # MarketingClawfice
> 
> Pixel art dashboard for marketing AI agents — social media, content, and outreach automation.

---

#### 2. What's Different?
**List your top 3-5 changes.** Be specific:
- ❌ Bad: "Better UI"
- ✅ Good: "Replaced generic agents with marketing roles (Content Writer, Social Manager, SEO Specialist)"

---

#### 3. Quick Start
**Update:**
- Clone URL → your repo
- Prerequisites → your specific requirements
- Port number (if changed from 3333)

---

#### 4. Key Changes
**Document major divergences.** Format:
```
**Original:** [OpenClawfice behavior]
**This fork:** [Your change]
**Why:** [Your reasoning]
```

**Why document reasoning?** Helps others understand your design decisions.

---

#### 5. Configuration
**Add fork-specific config.** Example:
```json
{
  "marketingMode": true,
  "socialPlatforms": ["twitter", "linkedin", "instagram"],
  "contentCalendar": true
}
```

---

#### 6. Use Cases
**Tailor to your audience.** If forking for marketing:
- Use Case 1: "Automate social media scheduling"
- Use Case 2: "Track content performance"
- Use Case 3: "Manage influencer outreach"

---

#### 7. Roadmap
**Your future plans.** Example:
- [ ] Integrate with Buffer API
- [ ] A/B testing dashboard
- [ ] Sentiment analysis charts

---

#### 8. Differences Table
**High-level comparison.** Helps users decide between original and fork.

---

#### 9. Merging Upstream
**Keep this section!** It helps you stay in sync with OpenClawfice updates.

**Pro tip:** Subscribe to OpenClawfice releases on GitHub (Watch → Releases only).

---

#### 10. Credits
**REQUIRED by AGPL-3.0.** Must credit original author + link back.

**Format:**
```
**Based on:** [OpenClawfice](https://github.com/openclawfice/openclawfice) by Tyler Henkel
**This fork by:** [Your Name]
```

---

## License Compliance (AGPL-3.0)

### What You MUST Do

1. **Keep it open source** — Can't make your fork closed-source
2. **Include LICENSE file** — Copy OpenClawfice's LICENSE
3. **Credit the original** — Link back to OpenClawfice in README
4. **Disclose changes** — Document what you modified (Key Changes section)

### What You CAN Do

1. **Charge for hosted version** — Offer your fork as SaaS (charge for hosting/support)
2. **Add proprietary plugins** — If they communicate via API (not compiled in)
3. **Relicense additions** — Your new code can have different license (but base stays AGPL)

### What You CANNOT Do

1. **Relicense to MIT/BSD** — AGPL is "sticky" (stays AGPL)
2. **Remove credits** — Must keep Tyler's name + link
3. **Close source** — AGPL requires source availability

**Not legal advice.** Consult a lawyer if unsure.

---

## Fork Examples (Inspiration)

### Example 1: Industry-Specific Fork

**Name:** HealthcareClawfice  
**Changes:**
- HIPAA-compliant data handling
- Medical agent roles (Diagnosis AI, Triage Bot, Records Manager)
- Integration with EHR systems

**Target:** Medical practices, hospitals

---

### Example 2: Framework Adaptation

**Name:** LangChainOffice  
**Changes:**
- Swapped OpenClaw backend for LangChain
- Different agent discovery (reads from LangChain config)
- Custom memory patterns (vector stores)

**Target:** LangChain users who want visual dashboard

---

### Example 3: Platform Fork

**Name:** ClawficeCloud  
**Changes:**
- Multi-tenant architecture (team workspaces)
- Cloud deployment (Docker + K8s)
- Premium features (custom themes, advanced analytics)

**Target:** B2B SaaS product

---

## When to Fork vs Contribute

### Fork When:
- ✅ Totally different use case (industry-specific)
- ✅ Incompatible changes (breaking OpenClawfice's design)
- ✅ Commercial product (closed features on top)

### Contribute Upstream When:
- ✅ General-purpose feature (benefits all users)
- ✅ Bug fix
- ✅ Documentation improvement
- ✅ Performance optimization

**Rule of thumb:** If 80%+ of users would want it → contribute upstream. If niche → fork.

---

## Staying in Sync

### Recommended Workflow

1. **Fork on GitHub** (click "Fork" button)
2. **Clone your fork** locally
3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/openclawfice/openclawfice.git
   ```
4. **Pull upstream changes weekly:**
   ```bash
   git fetch upstream
   git merge upstream/main
   ```
5. **Resolve conflicts** (your changes vs upstream)
6. **Push to your fork**

### When to Sync

**Recommended frequency:**
- Active development: Weekly
- Stable fork: Monthly
- Abandoned fork: Never (but document which version you forked from)

**Major version bumps:** Review changelog before merging (breaking changes).

---

## Community Support

### For Your Fork
- Create your own Discord/Slack
- GitHub Discussions (enable in your repo)
- Email support (if commercial)

### For OpenClawfice Questions
- Don't open issues in upstream repo for fork-specific bugs
- **Do** open issues if you find bugs in the base code
- **Do** credit OpenClawfice community when they help

---

## Promotion (Optional)

### If you want users for your fork:

1. **Post in OpenClawfice Discord** (#showcase channel)
   > "Built MarketingClawfice on top of OpenClawfice — adds social media automation + content calendar. Check it out: [link]"

2. **Cross-link in README** (both directions)
   - Your fork links to OpenClawfice (required)
   - OpenClawfice might link to your fork (if popular)

3. **Blog post** about your fork
   - Why you forked
   - What you changed
   - Who it's for

**Mutual benefit:** Your fork drives interest to OpenClawfice. OpenClawfice community discovers your fork.

---

## Attribution Best Practices

### Minimal (Required)

```markdown
Based on [OpenClawfice](https://github.com/openclawfice/openclawfice)
```

### Good

```markdown
**Based on:** [OpenClawfice](https://github.com/openclawfice/openclawfice) by Tyler Henkel  
**This fork by:** Jane Doe
```

### Excellent (Recommended)

```markdown
## Credits

This project is built on **[OpenClawfice](https://github.com/openclawfice/openclawfice)**, 
the pixel art dashboard for AI agents, created by [Tyler Henkel](https://openclaw.ai).

We're grateful to the OpenClawfice community for building the foundation that made 
[Your Project Name] possible.

**This fork maintained by:** [Your Name/Organization]
```

**Why go above minimal?** Goodwill → potential collaboration → faster development.

---

## Questions?

**About forking:** Check [CONTRIBUTING.md](../CONTRIBUTING.md) or ask in Discord  
**About licensing:** See [LICENSE](../LICENSE) or consult legal counsel  
**About your fork:** You're the maintainer — document your own support channels!

---

**Template version:** 1.0  
**Last updated:** Feb 2026  
**Compatible with:** OpenClawfice v0.1.0+

🎨 Happy forking!
