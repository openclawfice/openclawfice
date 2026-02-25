# 📁 Documentation Organization Plan

**Restructure 181 markdown files into logical folders.**

Current state: 35 root docs, 146 in internal/ (cluttered)  
Goal: Clean hierarchy, easy to find what you need

---

## Proposed Structure

```
docs/
├── README.md                      # Main index (keep in root)
│
├── getting-started/               # NEW: Onboarding
│   ├── YOUR-FIRST-5-MINUTES.md
│   ├── FIRST-5-MINUTES.md
│   ├── QUICK-WINS.md
│   ├── INSTALLATION.md
│   └── TROUBLESHOOTING.md
│
├── features/                      # NEW: Feature guides
│   ├── AGENT-TRADING-CARDS.md
│   ├── STATS-DASHBOARD.md
│   ├── WATER-COOLER.md
│   ├── MEETING-ROOM.md
│   └── COMMAND-PALETTE.md
│
├── guides/                        # KEEP: How-to guides
│   ├── WORKFLOWS.md
│   ├── USE-CASES.md
│   ├── GET-PRODUCTIVE.md
│   └── CONFIGURING-YOUR-OFFICE.md
│
├── viral/                         # NEW: Growth & sharing
│   ├── GO-VIRAL-PLAYBOOK.md
│   ├── VIRAL-TEMPLATES.md
│   ├── VIRAL-FEATURES-ROADMAP.md
│   └── SOCIAL-MEDIA-GUIDE.md
│
├── community/                     # NEW: Contributing
│   ├── COMMUNITY.md
│   ├── CONTRIBUTING.md
│   ├── GOOD-FIRST-ISSUES.md
│   ├── README-TEMPLATE.md
│   └── CODE-OF-CONDUCT.md
│
├── reference/                     # NEW: Technical docs
│   ├── API-REFERENCE.md
│   ├── KEYBOARD-SHORTCUTS.md
│   ├── FAQ.md
│   └── GLOSSARY.md
│
├── launch/                        # NEW: Launch materials
│   ├── LAUNCH-DAY-CHECKLIST.md
│   ├── VISUAL-QUALITY-CHECKLIST.md
│   ├── LAUNCH-NOW-SIMPLE.md
│   ├── GITHUB-SETUP.md
│   └── POST-LAUNCH-FIRST-HOUR-CHECKLIST.md
│
├── security/                      # NEW: Security docs
│   ├── SECURITY.md
│   ├── SECURITY-FAQ.md
│   └── SECURITY-AUDIT.md
│
├── internal/                      # CLEANUP: Reduce to essentials
│   ├── CHANGELOG.md
│   ├── ROADMAP-INTERNAL.md
│   └── TEAM-NOTES.md
│
└── archive/                       # NEW: Deprecated docs
    └── old-versions/
```

---

## Migration Plan

### Phase 1: Create New Folders (2 minutes)

```bash
cd openclawfice/docs
mkdir -p getting-started features viral community reference launch security
```

---

### Phase 2: Move Core Docs (5 minutes)

**Getting Started:**
```bash
mv YOUR-FIRST-5-MINUTES.md getting-started/
mv FIRST-5-MINUTES.md getting-started/
mv QUICK-WINS.md getting-started/
mv TROUBLESHOOTING-FLOWCHART.md getting-started/TROUBLESHOOTING.md
mv COMMON-ISSUES.md getting-started/
```

**Features:**
```bash
mv AGENT-TRADING-CARDS.md features/
mv STATS-DASHBOARD.md features/
mv COOL-FEATURES.md features/
mv UI-GUIDE.md features/
```

**Viral:**
```bash
mv GO-VIRAL-PLAYBOOK.md viral/
mv VIRAL-TEMPLATES.md viral/
mv VIRAL-FEATURES-ROADMAP.md viral/
```

**Community:**
```bash
mv COMMUNITY.md community/
mv README-TEMPLATE.md community/
mv GOOD-FIRST-ISSUES.md community/
mv TESTING-GUIDE.md community/
```

**Launch:**
```bash
mv LAUNCH-DAY-CHECKLIST.md launch/
mv VISUAL-QUALITY-CHECKLIST.md launch/
mv GITHUB-SETUP.md launch/
mv LAUNCH-NOW-SIMPLE.md launch/ 2>/dev/null || true
```

**Reference:**
```bash
mv API-REFERENCE.md reference/
mv KEYBOARD-SHORTCUTS.md reference/
mv FAQ.md reference/
```

**Security:**
```bash
mv SECURITY.md security/
mv SECURITY-FAQ.md security/
```

---

### Phase 3: Clean Internal Folder (10 minutes)

**Audit internal/ files:**
```bash
ls -lh internal/ | wc -l  # 146 files - way too many
```

**Categories to archive:**
- Old launch docs (5+ versions of same doc)
- Deprecated feature specs
- Meeting notes older than 30 days
- Duplicate files

**Keep in internal/:**
- Active roadmap
- Current changelog
- Team coordination docs

**Move to archive/:**
```bash
mkdir -p archive/launch-iterations
mkdir -p archive/deprecated-features
mkdir -p archive/old-specs

# Move old launch docs
mv internal/LAUNCH-*.md archive/launch-iterations/ 2>/dev/null || true
mv internal/*LAUNCH*.md archive/launch-iterations/ 2>/dev/null || true

# Move deprecated specs
mv internal/*-OLD.md archive/deprecated-features/ 2>/dev/null || true
mv internal/*-DEPRECATED.md archive/deprecated-features/ 2>/dev/null || true
```

---

### Phase 4: Update README.md Links (3 minutes)

**Update all links to new paths:**
```markdown
## Getting Started
- **[Your First 5 Minutes](getting-started/YOUR-FIRST-5-MINUTES.md)**
- **[Quick Wins](getting-started/QUICK-WINS.md)**

## Features
- **[Agent Trading Cards](features/AGENT-TRADING-CARDS.md)**
- **[Stats Dashboard](features/STATS-DASHBOARD.md)**

## Viral Growth
- **[Go Viral Playbook](viral/GO-VIRAL-PLAYBOOK.md)**
- **[Viral Features Roadmap](viral/VIRAL-FEATURES-ROADMAP.md)**

## Community
- **[Community Guide](community/COMMUNITY.md)**
- **[Contributing](community/CONTRIBUTING.md)**

## Launch
- **[Launch Day Checklist](launch/LAUNCH-DAY-CHECKLIST.md)**
- **[Visual Quality Checklist](launch/VISUAL-QUALITY-CHECKLIST.md)**
```

---

### Phase 5: Update Internal Links (5 minutes)

**Find all broken links:**
```bash
grep -r "\](.*\.md)" docs/*.md | grep -v "http" | cut -d: -f1 | sort -u
```

**Fix with sed (or manually):**
```bash
# Example: Update links in getting-started files
sed -i '' 's|\](TROUBLESHOOTING\.md)|\](../getting-started/TROUBLESHOOTING.md)|g' getting-started/*.md
```

---

## Benefits

### Before (Current)
- ❌ 35 files in root (cluttered)
- ❌ 146 files in internal/ (impossible to navigate)
- ❌ No clear hierarchy
- ❌ Hard to find related docs

### After (Proposed)
- ✅ 1-2 files in root (clean)
- ✅ 7 logical folders (clear categories)
- ✅ ~10-20 files in internal/ (manageable)
- ✅ Easy to navigate (grouped by purpose)

---

## Folder Descriptions

### getting-started/
**Purpose:** First-time user onboarding  
**Audience:** New users  
**Content:** Installation, tutorials, troubleshooting

### features/
**Purpose:** Feature-specific guides  
**Audience:** Active users  
**Content:** How to use trading cards, stats, etc.

### guides/
**Purpose:** Workflow & best practices  
**Audience:** Power users  
**Content:** Advanced tips, use cases, productivity

### viral/
**Purpose:** Growth & marketing  
**Audience:** Users who want to share  
**Content:** Social templates, playbooks, roadmap

### community/
**Purpose:** Contributing & forking  
**Audience:** Contributors  
**Content:** How to contribute, fork, code of conduct

### reference/
**Purpose:** Quick lookup  
**Audience:** All users  
**Content:** API docs, shortcuts, FAQ

### launch/
**Purpose:** Pre-launch verification  
**Audience:** Maintainers  
**Content:** Checklists, QA guides, GitHub setup

### security/
**Purpose:** Security info  
**Audience:** All users  
**Content:** Security model, reporting, audits

### internal/
**Purpose:** Team coordination  
**Audience:** Team only  
**Content:** Roadmap, changelog, notes

### archive/
**Purpose:** Historical reference  
**Audience:** Team (rarely accessed)  
**Content:** Old versions, deprecated features

---

## Implementation Steps

**Total time:** ~25 minutes

1. ✅ Create new folders (2 min)
2. ✅ Move core docs (5 min)
3. ✅ Clean internal/ (10 min)
4. ✅ Update README.md (3 min)
5. ✅ Fix broken links (5 min)

---

## Validation

**After migration, verify:**
- [ ] All links work (no 404s)
- [ ] README.md points to correct paths
- [ ] Each folder has 5-20 files (not 100+)
- [ ] internal/ reduced to < 20 files
- [ ] No duplicate files

---

## Long-Term Maintenance

### Rules for New Docs

**Before creating a doc, ask:**
1. **Who is it for?** → Determines folder
2. **Is it permanent?** → If temporary, put in internal/
3. **Does it replace old doc?** → If yes, archive old version

**Folder limits:**
- getting-started/: Max 10 files
- features/: Max 20 files
- guides/: Max 15 files
- viral/: Max 10 files
- community/: Max 10 files
- reference/: Max 15 files
- launch/: Max 10 files
- security/: Max 5 files
- internal/: Max 20 files

**If folder exceeds limit:** Create subfolders or archive old files.

---

## Quick Reference

**"Where should I put this doc?"**

| Doc Type | Folder |
|----------|--------|
| Installation guide | getting-started/ |
| Feature tutorial | features/ |
| Best practices | guides/ |
| Social media template | viral/ |
| Contribution guide | community/ |
| API reference | reference/ |
| Launch checklist | launch/ |
| Security policy | security/ |
| Team notes | internal/ |
| Old version | archive/ |

---

## Migration Script (Optional)

**Run this to auto-migrate:**

```bash
#!/bin/bash
cd openclawfice/docs

# Create folders
mkdir -p getting-started features viral community reference launch security archive

# Move files (silent errors = file doesn't exist)
mv YOUR-FIRST-5-MINUTES.md getting-started/ 2>/dev/null
mv QUICK-WINS.md getting-started/ 2>/dev/null
mv AGENT-TRADING-CARDS.md features/ 2>/dev/null
mv STATS-DASHBOARD.md features/ 2>/dev/null
mv GO-VIRAL-PLAYBOOK.md viral/ 2>/dev/null
mv VIRAL-FEATURES-ROADMAP.md viral/ 2>/dev/null
mv COMMUNITY.md community/ 2>/dev/null
mv LAUNCH-DAY-CHECKLIST.md launch/ 2>/dev/null
mv VISUAL-QUALITY-CHECKLIST.md launch/ 2>/dev/null
mv API-REFERENCE.md reference/ 2>/dev/null
mv SECURITY.md security/ 2>/dev/null

echo "Migration complete! Now update README.md links."
```

---

## Questions?

**Will this break existing links?** Yes (temporarily). That's why Phase 4 updates README and Phase 5 fixes internal links.

**Can we do this after launch?** Yes, but better to do it now while docs are fresh in mind.

**What about external links?** If anyone linked to specific docs, their links will break. Consider adding redirects or documenting migration in changelog.

---

**Status:** Plan ready for execution  
**Time required:** 25 minutes  
**Impact:** Cleaner repo, easier navigation, better DX

📁 Organize once, benefit forever.
