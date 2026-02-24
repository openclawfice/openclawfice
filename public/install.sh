#!/bin/bash
set -e

INSTALL_DIR="$HOME/openclawfice"
REPO_URL="https://github.com/openclawfice/openclawfice.git"
LAUNCHER="$HOME/.local/bin/openclawfice"
MIN_NODE=18

echo ""
echo "🏢 OpenClawfice Installer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Preflight Checks ─────────────────────────────

# Check git
if ! command -v git &>/dev/null; then
  echo "❌ git not found. Install git first:"
  echo "   macOS: xcode-select --install"
  echo "   Ubuntu: sudo apt install git"
  exit 1
fi

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "❌ Node.js not found. Install Node.js $MIN_NODE+:"
  echo "   https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_VER" -lt "$MIN_NODE" ] 2>/dev/null; then
  echo "❌ Node.js $MIN_NODE+ required (found v$NODE_VER)"
  echo "   Update at https://nodejs.org"
  exit 1
fi
echo "✅ Node.js v$(node -v | tr -d 'v') detected"

# Check npm
if ! command -v npm &>/dev/null; then
  echo "❌ npm not found. Comes with Node.js — reinstall from https://nodejs.org"
  exit 1
fi

# Check if OpenClaw is installed
if [ ! -f "$HOME/.openclaw/openclaw.json" ]; then
  echo ""
  echo "⚠️  OpenClaw config not found at ~/.openclaw/openclaw.json"
  echo ""
  echo "OpenClawfice works best with OpenClaw, but you can still try the demo!"
  echo "Visit https://openclaw.ai to install OpenClaw."
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
else
  echo "✅ OpenClaw detected"
fi
echo ""

# ── Installation ────────────────────────────────

# Check if already installed
if [ -d "$INSTALL_DIR" ]; then
  echo "⚠️  OpenClawfice already installed at $INSTALL_DIR"
  echo ""
  read -p "Update to latest version? (Y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "Cancelled. Run 'openclawfice' to launch."
    exit 0
  fi
  echo ""
  echo "📦 Updating..."
  cd "$INSTALL_DIR"
  git pull --ff-only origin main 2>/dev/null || {
    echo "⚠️  Could not fast-forward. Doing clean reinstall..."
    cd "$HOME"
    rm -rf "$INSTALL_DIR"
    git clone -q --depth 1 "$REPO_URL" "$INSTALL_DIR"
  }
else
  # Fresh clone (shallow for speed)
  echo "📦 Cloning repository..."
  if ! git clone -q --depth 1 "$REPO_URL" "$INSTALL_DIR" 2>/dev/null; then
    echo "❌ Failed to clone repository"
    echo "   Check your internet connection and try again."
    exit 1
  fi
fi
echo "✅ Repository ready"
echo ""

# Install dependencies
echo "📚 Installing dependencies (this may take a minute)..."
cd "$INSTALL_DIR"
if ! npm install --no-audit --no-fund 2>&1 | tail -3; then
  echo ""
  echo "❌ npm install failed. Try manually:"
  echo "   cd $INSTALL_DIR && npm install"
  exit 1
fi
echo "✅ Dependencies installed"
echo ""

# ── Launcher ────────────────────────────────────

echo "🚀 Creating launcher..."
mkdir -p "$(dirname "$LAUNCHER")"
cat > "$LAUNCHER" <<'LAUNCHER'
#!/bin/bash
PORT=${PORT:-3333}
cd ~/openclawfice && npx next dev -p $PORT --turbopack 2>/dev/null || npx next dev -p $PORT
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
    echo "   Added to PATH via $SHELL_RC"
  fi
fi

echo "✅ Launcher created"
echo ""

# ── Done ────────────────────────────────────────

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 OpenClawfice installed!"
echo ""
echo "  Launch:  openclawfice"
echo "  Demo:    http://localhost:3333/?demo=true"
echo "  Docs:    http://localhost:3333/install"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask to launch
read -p "Launch now? (Y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
  echo ""
  echo "🏢 Starting OpenClawfice on http://localhost:3333 ..."
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
  echo "Run 'openclawfice' when ready."
fi
