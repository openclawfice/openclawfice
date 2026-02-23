#!/bin/bash
set -e

INSTALL_DIR="$HOME/openclawfice"
REPO_URL="https://github.com/openclaw/openclawfice.git"
LAUNCHER="$HOME/.local/bin/openclawfice"

echo ""
echo "🏢 OpenClawfice Installer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if OpenClaw is installed
if [ ! -f "$HOME/.openclaw/openclaw.json" ]; then
  echo "❌ OpenClaw not found!"
  echo ""
  echo "OpenClawfice requires OpenClaw to be installed and configured."
  echo "Expected config at: $HOME/.openclaw/openclaw.json"
  echo ""
  echo "Visit https://openclaw.ai to get started."
  echo ""
  exit 1
fi

echo "✅ OpenClaw detected"
echo ""

# Check if already installed
if [ -d "$INSTALL_DIR" ]; then
  echo "⚠️  OpenClawfice is already installed at $INSTALL_DIR"
  echo ""
  read -p "Reinstall? This will delete the existing installation. (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled. To launch your existing installation, run: openclawfice"
    exit 0
  fi
  echo ""
  echo "🗑️  Removing old installation..."
  rm -rf "$INSTALL_DIR"
fi

# Clone repo
echo "📦 Cloning repository..."
if ! git clone -q "$REPO_URL" "$INSTALL_DIR" 2>/dev/null; then
  echo "❌ Failed to clone repository"
  echo "Make sure you have git installed and internet access."
  exit 1
fi
echo "✅ Repository cloned"
echo ""

# Install dependencies
echo "📚 Installing dependencies..."
cd "$INSTALL_DIR"
if ! npm install --silent 2>&1 | grep -q "added"; then
  echo "❌ Failed to install dependencies"
  echo "Make sure you have Node.js and npm installed."
  exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Create launcher
echo "🚀 Creating launcher..."
mkdir -p "$(dirname "$LAUNCHER")"
cat > "$LAUNCHER" <<'EOF'
#!/bin/bash
# OpenClawfice launcher
cd ~/openclawfice && npm run dev
EOF
chmod +x "$LAUNCHER"

# Add to PATH if needed
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  echo ""
  echo "⚠️  Adding $HOME/.local/bin to your PATH..."
  if [ -f "$HOME/.bashrc" ]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    echo "Added to ~/.bashrc (restart terminal or run: source ~/.bashrc)"
  elif [ -f "$HOME/.zshrc" ]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
    echo "Added to ~/.zshrc (restart terminal or run: source ~/.zshrc)"
  fi
fi

echo "✅ Launcher created"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 OpenClawfice installed successfully!"
echo ""
echo "To launch:"
echo "  openclawfice"
echo ""
echo "Or visit: http://localhost:3333"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask if they want to launch now
read -p "Launch now? (Y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
  echo ""
  echo "🏢 Starting OpenClawfice..."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Opening http://localhost:3333 in your browser..."
  echo ""
  
  # Open browser
  sleep 2
  if command -v open &> /dev/null; then
    open http://localhost:3333
  elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3333
  fi
  
  # Launch server
  exec "$LAUNCHER"
else
  echo ""
  echo "Run 'openclawfice' when you're ready to start."
  echo ""
fi
