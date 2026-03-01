# Your First Contribution - Step by Step

**Never contributed to open source before? Start here.**

This guide walks you through making your first contribution to OpenClawfice, from zero to merged PR.

---

## Before You Start

**You'll need:**
- Git installed
- Node.js 18+ installed
- A GitHub account
- 30-60 minutes

**You don't need:**
- Years of experience
- To know the entire codebase
- Permission (just fork and start!)

---

## Step 1: Find Something to Work On (5 min)

### Option A: Fix a Typo (Easiest)

1. Read through the docs
2. Find a typo, broken link, or unclear explanation
3. That's your first contribution!

### Option B: Pick a "Good First Issue"

1. Go to [Issues](https://github.com/openclawfice/openclawfice/issues)
2. Filter by `good first issue` label
3. Read the description
4. Comment "I'd like to work on this!"

### Option C: Improve Documentation

Ideas:
- Add missing screenshots
- Expand troubleshooting section
- Write a tutorial for your use case
- Translate docs to another language

---

## Step 2: Set Up Your Environment (10 min)

### Fork and Clone

```bash
# 1. Click "Fork" on GitHub (top right)
# 2. Clone YOUR fork (not the original repo)
git clone https://github.com/YOUR_USERNAME/openclawfice.git
cd openclawfice

# 3. Add original repo as "upstream" (for updates later)
git remote add upstream https://github.com/openclawfice/openclawfice.git
```

### Install and Test

```bash
# Install dependencies (takes 30-60 seconds)
npm install

# Start dev server
npm run dev

# Open http://localhost:3333
# You should see the dashboard!
```

**If it works, you're ready to code!** 🎉

**If it doesn't work:**
- Check Node version: `node --version` (must be 18+)
- Try: `rm -rf node_modules .next && npm install`
- Ask for help in the issue or discussion

---

## Step 3: Make Your Change (15-30 min)

### Create a Branch

```bash
# Always work on a branch (never directly on main)
git checkout -b fix/your-fix-name

# Examples:
# git checkout -b fix/readme-typo
# git checkout -b feat/add-dark-mode
# git checkout -b docs/improve-install-guide
```

### Make Your Edit

**For typo fixes:**
1. Open the file in your editor
2. Fix the typo
3. Save
4. Done!

**For code changes:**
1. Find the relevant file (use grep or VSCode search)
2. Make your change
3. Test it works: `npm run dev` and check in browser
4. Make sure it builds: `npm run build`

**For doc improvements:**
1. Edit the markdown file
2. Preview it (GitHub markdown preview in VSCode works)
3. Check all links work

### Common File Locations

- **README:** `README.md`
- **Install guide:** `INSTALL.md`
- **Main UI:** `app/page.tsx`
- **Components:** `components/*.tsx`
- **Docs:** `docs/*.md`
- **API routes:** `app/api/office/route.ts`

---

## Step 4: Commit Your Change (5 min)

### Good Commit Messages

Follow this format:
```
type: Brief description

Longer explanation if needed (optional)
```

**Types:**
- `fix:` Bug fixes
- `feat:` New features
- `docs:` Documentation changes
- `style:` Formatting (no logic change)
- `refactor:` Code refactoring
- `test:` Add tests
- `chore:` Build/tooling changes

**Examples:**

✅ **Good:**
```bash
git commit -m "docs: Fix typo in installation guide"
git commit -m "feat: Add dark mode toggle to settings"
git commit -m "fix: Quest log not updating in real-time"
```

❌ **Avoid:**
```bash
git commit -m "update"
git commit -m "fixed stuff"
git commit -m "asdfasdf"
```

### Stage and Commit

```bash
# See what changed
git status

# Add your changes
git add README.md  # Or whatever file you changed

# Commit with a good message
git commit -m "docs: Fix typo in README installation section"
```

---

## Step 5: Push and Open PR (10 min)

### Push to Your Fork

```bash
# Push your branch to YOUR fork
git push origin fix/your-fix-name
```

### Open Pull Request

1. Go to YOUR fork on GitHub
2. You'll see a yellow banner: "Compare & pull request"
3. Click it
4. Fill out the PR template:

```markdown
## What does this PR do?
Fixes a typo in the installation guide where "instal" should be "install"

## Why?
Improves documentation clarity for new users

## How to test?
Read the updated section in INSTALL.md

## Checklist
- [x] Builds successfully
- [x] Tested locally (for docs, just reviewed)
- [x] Updated docs (this IS a doc change)
```

5. Click "Create pull request"

**That's it! You just opened your first PR!** 🎉

---

## Step 6: Respond to Feedback (varies)

### What Happens Next?

1. **Maintainers review** (usually within 1-3 days)
2. **They might request changes** ("Can you also fix this typo?")
3. **Make the changes** in the same branch
4. **Push again:** `git push origin fix/your-fix-name`
5. **PR updates automatically!**
6. **Once approved, we merge!**

### How to Make Requested Changes

```bash
# 1. Make the changes in your editor
# 2. Commit them
git add .
git commit -m "docs: Address review feedback"

# 3. Push
git push origin fix/your-fix-name

# The PR updates automatically!
```

### Common Review Feedback

**"Can you squash your commits?"**
```bash
git rebase -i HEAD~3  # Replace 3 with number of commits
# Mark all but first as 'squash'
# Save and exit
git push -f origin fix/your-fix-name
```

**"Please update your branch with main"**
```bash
git fetch upstream
git rebase upstream/main
git push -f origin fix/your-fix-name
```

**"Builds are failing"**
```bash
npm run build  # Fix any errors
git add .
git commit -m "fix: Resolve build errors"
git push origin fix/your-fix-name
```

---

## Step 7: Celebrate! 🎉

### Your PR Got Merged!

**Congratulations!** You're now an open source contributor.

**You'll get:**
- Your name in the git history
- Credit in release notes
- Contributor badge on GitHub
- Respect from the community
- Experience for your resume

**Next Steps:**
- Find another issue to work on
- Help review other PRs
- Share your experience with others
- Consider becoming a regular contributor

---

## FAQ for First-Timers

### "I'm not good enough to contribute"

**Yes you are.** Everyone starts somewhere. Fixing typos counts. Improving docs counts. Every contribution helps.

### "What if I break something?"

**You can't.** You're working on YOUR fork. The original repo is safe. And we review everything before merging.

### "What if my code isn't perfect?"

**That's okay!** We'll help you improve it. PRs are collaborative. No one expects perfection.

### "What if I pick the wrong issue?"

**No problem.** Comment on the issue first. We'll let you know if it's a good fit or suggest something easier.

### "How long does review take?"

**1-3 days usually.** We're all volunteers with day jobs. Be patient!

### "Can I work on multiple issues at once?"

**Yes, but start with one.** Finish your first contribution, then take on more.

### "What if my PR gets rejected?"

**It happens!** We'll explain why and might suggest a different approach. Don't take it personally.

---

## Example: Fixing a Typo (Real Walkthrough)

Let's fix a typo in README.md:

### 1. Fork and Clone
```bash
# (Click Fork on GitHub)
git clone https://github.com/yourname/openclawfice.git
cd openclawfice
```

### 2. Create Branch
```bash
git checkout -b docs/fix-readme-typo
```

### 3. Make Change
```bash
# Open README.md in your editor
# Change "Mange AI agents" to "Manage AI agents"
# Save file
```

### 4. Commit
```bash
git add README.md
git commit -m "docs: Fix typo in README (Mange -> Manage)"
```

### 5. Push
```bash
git push origin docs/fix-readme-typo
```

### 6. Open PR
- Go to your fork on GitHub
- Click "Compare & pull request"
- Fill out template
- Submit!

**Time:** ~10 minutes  
**Impact:** Made the docs clearer for future readers  
**Result:** You're a contributor! 🎉

---

## Example: Adding a Screenshot (Real Walkthrough)

Let's add a screenshot to the troubleshooting guide:

### 1. Take Screenshot
```bash
# Open http://localhost:3333
# Show the error you're documenting
# Take screenshot (Cmd+Shift+4 on Mac)
# Save as screenshot-error.png
```

### 2. Add to Repo
```bash
git checkout -b docs/add-troubleshooting-screenshot

# Move screenshot to public folder
mv screenshot-error.png public/docs/

# Edit TROUBLESHOOTING.md
# Add: ![Error screenshot](../public/docs/screenshot-error.png)
```

### 3. Commit and Push
```bash
git add public/docs/screenshot-error.png TROUBLESHOOTING.md
git commit -m "docs: Add screenshot to troubleshooting guide"
git push origin docs/add-troubleshooting-screenshot
```

### 4. Open PR
- Describe what the screenshot shows
- Explain why it's helpful
- Submit!

**Time:** ~15 minutes  
**Impact:** Helps users debug issues visually  
**Result:** You improved the docs! 🎉

---

## Resources

### Learn Git
- [GitHub Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [Interactive Git Tutorial](https://learngitbranching.js.org/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

### Learn Markdown
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Markdown Syntax](https://guides.github.com/features/mastering-markdown/)

### Learn React/TypeScript (for code contributions)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Tutorial](https://nextjs.org/learn)

### Get Help
- [GitHub Discussions](https://github.com/openclawfice/openclawfice/discussions)
- [Issues tagged "help wanted"](https://github.com/openclawfice/openclawfice/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
- Comment on the issue you're working on

---

## You Got This! 💪

**Remember:**
- Start small (typos, docs, screenshots)
- Ask questions (no question is dumb)
- Read existing code (learn by example)
- Be patient (learning takes time)
- Have fun! (this should be enjoyable)

**Your first contribution is the hardest. After that, it gets easier.**

Welcome to the OpenClawfice community! 🏢✨

---

**Ready to start? Pick an issue and let's go!**

[Browse Issues](https://github.com/openclawfice/openclawfice/issues) • [Ask Questions](https://github.com/openclawfice/openclawfice/discussions) • [Read Main Contributing Guide](../CONTRIBUTING.md)
