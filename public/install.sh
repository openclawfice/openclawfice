#!/bin/bash
set -e

INSTALL_DIR="$HOME/openclawfice"
REPO_URL="https://github.com/openclawfice/openclawfice.git"
LAUNCHER="$HOME/.local/bin/openclawfice"
MIN_NODE=18
VERSION="0.1.0"

# ── RPG Boot Sequence ───────────────────────────

clear 2>/dev/null || true
echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║                                          ║"
echo "  ║   🏢  O P E N C L A W F I C E  🏢      ║"
echo "  ║                                          ║"
echo "  ║   Your AI agents, but they're Sims       ║"
echo "  ║         v$VERSION                           ║"
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

MISSING=0

# Check git
if ! command -v git &>/dev/null; then
  echo "  ❌ ITEM MISSING: git"
  echo "     macOS: xcode-select --install"
  echo "     Ubuntu: sudo apt install git"
  echo "     Fedora: sudo dnf install git"
  MISSING=1
else
  echo "  ✅ git ............ equipped"
fi
sleep 0.1

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "  ❌ ITEM MISSING: Node.js $MIN_NODE+"
  echo "     Get it at https://nodejs.org"
  echo "     Or: curl -fsSL https://fnm.vercel.app/install | bash"
  MISSING=1
else
  NODE_VER=$(node -e "console.log(process.versions.node.split('.')[0])")
  if [ "$NODE_VER" -lt "$MIN_NODE" ] 2>/dev/null; then
    echo "  ❌ Node.js $MIN_NODE+ required (found v$NODE_VER)"
    echo "     Upgrade at https://nodejs.org"
    MISSING=1
  else
    echo "  ✅ Node.js v$(node -v | tr -d 'v') . equipped"
  fi
fi
sleep 0.1

# Check npm
if ! command -v npm &>/dev/null; then
  echo "  ❌ ITEM MISSING: npm"
  echo "     Comes with Node.js — reinstall from https://nodejs.org"
  MISSING=1
else
  echo "  ✅ npm ............ equipped"
fi
sleep 0.1

# Bail if anything's missing
if [ "$MISSING" -eq 1 ]; then
  echo ""
  echo "  ❌ Missing required items. Install them and try again."
  exit 1
fi

# Check disk space (need ~200MB for node_modules + build)
AVAIL_MB=$(df -m "$HOME" 2>/dev/null | awk 'NR==2 {print $4}')
if [ -n "$AVAIL_MB" ] && [ "$AVAIL_MB" -lt 300 ] 2>/dev/null; then
  echo ""
  echo "  ⚠️  Low disk space: ${AVAIL_MB}MB free (need ~300MB)"
  read -p "  Continue anyway? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "  Free up some space and try again."
    exit 0
  fi
fi

# Check if OpenClaw is installed
HAS_OPENCLAW=0
if [ -f "$HOME/.openclaw/openclaw.json" ]; then
  echo "  ✅ OpenClaw ...... equipped"
  HAS_OPENCLAW=1
else
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
fi

echo ""
echo "  🎒 Inventory check complete!"
echo ""
sleep 0.3

# ── Installation ────────────────────────────────

UPGRADING=0
if [ -d "$INSTALL_DIR" ]; then
  UPGRADING=1
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
    echo "     Try: git clone $REPO_URL $INSTALL_DIR"
    exit 1
  fi
fi
echo "  ✅ Office blueprints acquired"
echo ""
sleep 0.2

# ── Progress spinner helper ─────────────────────
spin() {
  local pid=$1
  local label=$2
  local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
  local i=0
  local elapsed=0
  while kill -0 "$pid" 2>/dev/null; do
    printf "\r  %s %s (%ds)" "${frames[$((i % ${#frames[@]}))]}" "$label" "$elapsed"
    sleep 0.5
    elapsed=$(( (elapsed * 2 + 1) / 2 ))  # increment every other frame
    i=$((i + 1))
    if [ $((i % 2)) -eq 0 ]; then
      elapsed=$((elapsed + 1))
    fi
  done
  printf "\r                                                           \r"
}

# Install dependencies
echo "  📚 Hiring contractors (npm install)..."
echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  This takes 30-90s depending on your    │"
echo "  │  internet speed. Grab a coffee! ☕       │"
echo "  └─────────────────────────────────────────┘"
echo ""
cd "$INSTALL_DIR"
npm install --no-audit --no-fund > /tmp/ocf-npm-install.log 2>&1 &
NPM_PID=$!
spin $NPM_PID "Installing packages"
wait $NPM_PID
NPM_EXIT=$?
if [ $NPM_EXIT -ne 0 ]; then
  echo "  ❌ npm install failed. Check the log:"
  echo "     cat /tmp/ocf-npm-install.log"
  echo "     Or try manually: cd $INSTALL_DIR && npm install"
  exit 1
fi
PKG_COUNT=$(ls node_modules 2>/dev/null | wc -l | tr -d ' ')
echo "  ✅ $PKG_COUNT packages installed"
echo ""
sleep 0.2

# Pre-build for instant first launch
echo "  🔨 Constructing office (pre-building for instant launch)..."
echo ""
cd "$INSTALL_DIR"
npm run build > /tmp/ocf-build.log 2>&1 &
BUILD_PID=$!
spin $BUILD_PID "Building office"
wait $BUILD_PID
BUILD_EXIT=$?
if [ $BUILD_EXIT -eq 0 ]; then
  echo "  ✅ Office constructed — first launch will be instant!"
else
  echo "  ⚠️  Build skipped (dev mode will compile on the fly)"
fi
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
PATH_ADDED=0
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  SHELL_RC=""
  [ -f "$HOME/.zshrc" ] && SHELL_RC="$HOME/.zshrc"
  [ -f "$HOME/.bashrc" ] && SHELL_RC="$HOME/.bashrc"
  if [ -n "$SHELL_RC" ]; then
    # Only add if not already in the file
    if ! grep -q '$HOME/.local/bin' "$SHELL_RC" 2>/dev/null; then
      echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
      PATH_ADDED=1
    fi
    export PATH="$HOME/.local/bin:$PATH"
    echo "     Added to PATH via $SHELL_RC"
  fi
fi

echo "  ✅ Keys ready"
echo ""
sleep 0.3

# ── Quest Complete ──────────────────────────────

ELAPSED=$SECONDS
MINS=$((ELAPSED / 60))
SECS=$((ELAPSED % 60))

echo "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ "$UPGRADING" -eq 1 ]; then
  echo "  🎉 QUEST COMPLETE: Office Upgraded!"
else
  echo "  🎉 QUEST COMPLETE: Office Built!"
fi
echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║                                          ║"
echo "  ║   +100 XP  ⭐  Achievement Unlocked!     ║"
echo "  ║                                          ║"
echo "  ║   🏢 Your office is ready                ║"
echo "  ║   🎮 Your agents await                   ║"
echo "  ║                                          ║"
echo "  ║   Launch:  openclawfice                  ║"
echo "  ║   Demo:    openclawfice --demo            ║"
echo "  ║   Help:    openclawfice --help            ║"
echo "  ║                                          ║"
echo "  ║   ⏱️  Installed in ${MINS}m ${SECS}s              ║"
echo "  ║                                          ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

if [ "$PATH_ADDED" -eq 1 ]; then
  echo "  💡 TIP: Restart your terminal or run:"
  echo "     source ~/${SHELL_RC##*/}"
  echo ""
fi

if [ "$HAS_OPENCLAW" -eq 0 ]; then
  echo "  💡 TIP: Install OpenClaw to connect real agents:"
  echo "     https://openclaw.ai"
  echo ""
fi

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
