#!/bin/bash
set -e

INSTALL_DIR="$HOME/openclawfice"
REPO_URL="https://github.com/openclawfice/openclawfice.git"
LAUNCHER="$HOME/.local/bin/openclawfice"
MIN_NODE=18

# ── RPG Boot Sequence ───────────────────────────

clear 2>/dev/null || true
echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║                                          ║"
echo "  ║   🏢  O P E N C L A W F I C E  🏢      ║"
echo "  ║                                          ║"
echo "  ║   Your AI agents, but they're Sims       ║"
echo "  ║                                          ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""
sleep 0.3

echo "  ⚔️  QUEST: Install the Virtual Office"
echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
sleep 0.2

# ── Preflight Checks ─────────────────────────────

echo "  📋 Checking inventory..."
echo ""
sleep 0.2

# Check git
if ! command -v git &>/dev/null; then
  echo "  ❌ ITEM MISSING: git"
  echo "     macOS: xcode-select --install"
  echo "     Ubuntu: sudo apt install git"
  exit 1
fi
echo "  ✅ git ............ equipped"
sleep 0.1

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "  ❌ ITEM MISSING: Node.js $MIN_NODE+"
  echo "     Get it at https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_VER" -lt "$MIN_NODE" ] 2>/dev/null; then
  echo "  ❌ Node.js $MIN_NODE+ required (found v$NODE_VER)"
  echo "     Upgrade at https://nodejs.org"
  exit 1
fi
echo "  ✅ Node.js v$(node -v | tr -d 'v') . equipped"
sleep 0.1

# Check npm
if ! command -v npm &>/dev/null; then
  echo "  ❌ ITEM MISSING: npm"
  echo "     Comes with Node.js — reinstall from https://nodejs.org"
  exit 1
fi
echo "  ✅ npm ............ equipped"
sleep 0.1

# Check if OpenClaw is installed
if [ ! -f "$HOME/.openclaw/openclaw.json" ]; then
  echo ""
  echo "  ⚠️  OpenClaw not detected"
  echo ""
  echo "  OpenClawfice works best with OpenClaw agents."
  echo "  Without it, you can still explore the demo!"
  echo "  Install OpenClaw: https://openclaw.ai"
  echo ""
  read -p "  Continue without OpenClaw? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "  Quest abandoned. Return when ready, adventurer."
    exit 0
  fi
else
  echo "  ✅ OpenClaw ...... equipped"
fi

echo ""
echo "  🎒 Inventory check complete!"
echo ""
sleep 0.3

# ── Installation ────────────────────────────────

if [ -d "$INSTALL_DIR" ]; then
  echo "  ⚠️  Existing office found at $INSTALL_DIR"
  echo ""
  read -p "  Upgrade to latest version? (Y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "  Run 'openclawfice' to enter your office."
    exit 0
  fi
  echo ""
  echo "  📦 Upgrading office..."
  cd "$INSTALL_DIR"
  git pull --ff-only origin main 2>/dev/null || {
    echo "  ⚠️  Fast-forward failed. Rebuilding from scratch..."
    cd "$HOME"
    rm -rf "$INSTALL_DIR"
    git clone -q --depth 1 "$REPO_URL" "$INSTALL_DIR"
  }
else
  echo "  📦 Building your office..."
  sleep 0.3
  if ! git clone -q --depth 1 "$REPO_URL" "$INSTALL_DIR" 2>/dev/null; then
    echo "  ❌ Failed to clone. Check your internet connection."
    exit 1
  fi
fi
echo "  ✅ Office blueprints acquired"
echo ""
sleep 0.2

# Install dependencies
echo "  📚 Hiring contractors (installing dependencies)..."
echo ""
cd "$INSTALL_DIR"
if ! npm install --no-audit --no-fund 2>&1 | tail -3; then
  echo ""
  echo "  ❌ npm install failed. Try manually:"
  echo "     cd $INSTALL_DIR && npm install"
  exit 1
fi
echo ""
echo "  ✅ All contractors on site"
echo ""
sleep 0.2

# ── Launcher ────────────────────────────────────

echo "  🔑 Cutting office keys..."
mkdir -p "$(dirname "$LAUNCHER")"
cat > "$LAUNCHER" <<'LAUNCHER'
#!/bin/bash
# OpenClawfice launcher — uses CLI for proper first-run setup & auth
cd ~/openclawfice && node bin/openclawfice.js "$@"
LAUNCHER
chmod +x "$LAUNCHER"

# Add to PATH if needed
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  SHELL_RC=""
  [ -f "$HOME/.zshrc" ] && SHELL_RC="$HOME/.zshrc"
  [ -f "$HOME/.bashrc" ] && SHELL_RC="$HOME/.bashrc"
  if [ -n "$SHELL_RC" ]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
    export PATH="$HOME/.local/bin:$PATH"
    echo "     Added to PATH via $SHELL_RC"
  fi
fi

echo "  ✅ Keys ready"
echo ""
sleep 0.3

# ── Quest Complete ──────────────────────────────

echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🎉 QUEST COMPLETE: Office Built!"
echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║                                          ║"
echo "  ║   +100 XP  ⭐  Achievement Unlocked!     ║"
echo "  ║                                          ║"
echo "  ║   🏢 Your office is ready                ║"
echo "  ║   🎮 Your agents await                   ║"
echo "  ║                                          ║"
echo "  ║   Launch:  openclawfice                  ║"
echo "  ║   Demo:    localhost:3333/?demo=true      ║"
echo "  ║   Docs:    openclawfice.com/install       ║"
echo "  ║                                          ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# Ask to launch
read -p "  Enter the office now? (Y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
  echo ""
  echo "  🏢 Opening the doors..."
  echo ""

  # Open browser after short delay
  (sleep 3 && {
    if command -v open &>/dev/null; then
      open http://localhost:3333
    elif command -v xdg-open &>/dev/null; then
      xdg-open http://localhost:3333
    fi
  }) &

  exec "$LAUNCHER"
else
  echo "  Run 'openclawfice' when you're ready to enter."
fi
