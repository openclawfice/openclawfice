# Contributing to OpenClawfice

Thanks for your interest in contributing to OpenClawfice! 🎉

We're building the most fun way to manage AI agent teams, and we'd love your help making it even better.

---

## Quick Start

1. **Fork the repo** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/openclawfice.git
   cd openclawfice
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Run dev server:**
   ```bash
   npm run dev
   ```
5. **Open http://localhost:3333** — You should see the office!

---

## Ways to Contribute

### 🐛 Bug Reports

Found a bug? [Open an issue](https://github.com/openclawfice/openclawfice/issues/new) with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Screenshots (if relevant)
- Your OS and Node version

### ✨ Feature Requests

Have an idea? [Open an issue](https://github.com/openclawfice/openclawfice/issues/new) with:
- The problem you're trying to solve
- Your proposed solution
- Why this would make OpenClawfice better
- Examples (mockups, similar features elsewhere)

### 💻 Code Contributions

**High-Impact Areas:**
- Demo mode implementation (see `docs/DEMO-MODE-SPEC.md`)
- Mobile UX improvements
- Custom themes and skins
- Agent personality packs
- Performance optimizations
- Documentation and tutorials

**Before You Start:**
1. Check [existing issues](https://github.com/openclawfice/openclawfice/issues) to avoid duplicates
2. For big features, open an issue first to discuss the approach
3. For small fixes, just submit a PR!

**Development Flow:**
1. Create a branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test locally: `npm run build` (must succeed)
4. Commit: `git commit -m "feat: Add your feature"`
5. Push: `git push origin feature/your-feature-name`
6. Open a PR on GitHub

### 📝 Documentation

Help others get started:
- Fix typos or unclear docs
- Add examples to existing docs
- Write tutorials or guides
- Translate docs to other languages

### 🎨 Design Contributions

- UI/UX improvements
- New NPC skins or themes
- Icon sets
- Animation ideas
- Mockups for new features

---

## Coding Guidelines

### Code Style

We use TypeScript + Next.js. Follow the existing code style:

**Good:**
```typescript
// Clear names, proper typing
interface Agent {
  id: string;
  name: string;
  status: 'working' | 'idle';
}

function updateAgent(agent: Agent) {
  // Simple, readable logic
}
```

**Avoid:**
```typescript
// Vague names, no types
function doStuff(x: any) {
  // Complex, hard-to-follow logic
}
```

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code (no logic change)
refactor: Refactor code (no behavior change)
test: Add tests
chore: Update build tools
```

**Examples:**
```
feat: Add demo mode with 5 sample agents
fix: Quest log not updating in real-time
docs: Add screenshot to README
```

### Testing

Before submitting:
1. **Build succeeds:** `npm run build`
2. **No TypeScript errors:** `npm run type-check` (if available)
3. **Manual testing:** Open the dashboard and verify your changes work

We don't have automated tests yet (contributions welcome!), so manual testing is critical.

---

## Pull Request Process

### Before Submitting

- [ ] Code builds successfully (`npm run build`)
- [ ] No console errors in dev mode
- [ ] Feature works as expected
- [ ] No breaking changes (or clearly documented)
- [ ] Updated relevant docs (if needed)

### PR Template

```markdown
## What does this PR do?
Brief description of the change.

## Why?
Problem this solves or value it adds.

## How to test?
Steps to verify the change works.

## Screenshots (if UI change)
Before/after screenshots.

## Checklist
- [ ] Builds successfully
- [ ] Tested locally
- [ ] Updated docs (if needed)
```

### Review Process

1. Maintainers will review within 1-3 days
2. We may request changes or ask questions
3. Once approved, we'll merge and deploy!

---

## Project Structure

```
openclawfice/
├── app/                  # Next.js app router
│   ├── page.tsx         # Main dashboard
│   ├── install/         # Install guide page
│   ├── demo/            # Demo mode (future)
│   └── api/             # API routes
│       └── office/      # Agent data endpoints
├── components/          # Reusable React components
├── public/              # Static assets (images, etc.)
├── docs/                # Documentation and specs
│   ├── DEMO-MODE-SPEC.md
│   ├── QUEST-TEMPLATES-SPEC.md
│   └── ROADMAP.md
├── app/quest-templates/ # Quest template definitions
└── README.md
```

**Key Files:**
- `app/page.tsx` — Main dashboard UI
- `app/api/office/route.ts` — Agent discovery and status
- `app/quest-templates/data.ts` — Quest template library
- `components/TemplateGallery.tsx` — Template gallery modal

---

## Community

- **GitHub Discussions:** Ask questions, share ideas
- **Issues:** Bug reports and feature requests
- **Pull Requests:** Code contributions

**Be Kind:**
- We're all here to make something cool together
- Respect different perspectives and skill levels
- Help newcomers get started
- Celebrate wins (big and small!)

---

## License

By contributing, you agree your code will be licensed under the [AGPL-3.0 License](./LICENSE).

**What this means:**
- Your code will be open source (anyone can use it)
- If someone modifies and deploys it, they must share their changes
- You'll be credited for your contributions

---

## Getting Help

**Stuck? Need guidance?**
- Open a [GitHub Discussion](https://github.com/openclawfice/openclawfice/discussions)
- Tag your issue with `help wanted` or `good first issue`
- Reach out to maintainers in your PR

**Good First Issues:**
We tag beginner-friendly issues with `good first issue`. These are great starting points if you're new to the project!

---

## Recognition

All contributors are automatically added to:
- GitHub contributors list
- `CONTRIBUTORS.md` (if we create one)
- Release notes for their contributions

**Top contributors** may be invited to become maintainers!

---

## Code of Conduct

**TL;DR:** Be nice. No harassment, discrimination, or toxic behavior.

We follow the [Contributor Covenant](https://www.contributor-covenant.org/). In short:
- Be respectful and inclusive
- Welcome diverse perspectives
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy toward others

Violations will result in warnings or bans.

---

## Development Tips

### Running in Demo Mode

```bash
# Start dev server
npm run dev

# Open demo mode
open http://localhost:3333?demo=true
```

### Debugging Agent Discovery

Check if agents are discovered:
```bash
# View OpenClaw config
cat ~/.openclaw/openclaw.json

# Check agent sessions
ls -la ~/.openclaw/agents/*/sessions/
```

### Testing Status Files

Create fake data:
```bash
mkdir -p ~/.openclaw/.status

# Add a fake quest
echo '[{"id":"test","icon":"👀","title":"Test Quest","from":"Nova","priority":"high"}]' > ~/.openclaw/.status/actions.json

# Add a fake accomplishment
echo '[{"icon":"🎉","title":"Test Win","who":"Nova","timestamp":1708644000000}]' > ~/.openclaw/.status/accomplishments.json
```

Refresh the dashboard to see them appear!

### Hot Reloading

Next.js hot-reloads automatically. Just save your changes and the browser updates!

---

## Contributor License Agreement (CLA)

By submitting a pull request, you agree to our [Contributor License Agreement](./CLA.md). This allows us to keep OpenClawfice open source under AGPL-3.0 while also offering commercial licenses to sustain the project.

**TL;DR:** You keep ownership of your contributions. You grant us a license to use them in the project (including commercially licensed versions). Opening a PR = agreeing to the CLA.

---

## Thank You! 🙏

Every contribution—no matter how small—makes OpenClawfice better. Whether you're fixing a typo, adding a feature, or suggesting an idea, **you're helping build something cool.**

Let's make AI agent management fun! 🎮✨
