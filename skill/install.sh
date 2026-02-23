#!/bin/bash
set -e

INSTALL_DIR="$HOME/openclawfice"
REPO_URL="https://github.com/openclawfice/openclawfice.git"
LAUNCHER="$HOME/.local/bin/openclawfice"

echo "🏢 Installing OpenClawfice..."
echo ""

# Check if OpenClaw is installed
if [ ! -f "$HOME/.openclaw/openclaw.json" ]; then
  echo "❌ OpenClaw not found!"
  echo ""
  echo "OpenClawfice requires OpenClaw to be installed and configured."
  echo "Visit https://openclaw.ai to get started."
  echo ""
  exit 1
fi

# Check if already installed
if [ -d "$INSTALL_DIR" ]; then
  echo "⚠️  OpenClawfice is already installed at $INSTALL_DIR"
  echo ""
  read -p "Reinstall? This will delete the existing installation. (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
  fi
  echo "🗑️  Removing old installation..."
  rm -rf "$INSTALL_DIR"
fi

# Clone repo
echo "📦 Cloning repository..."
git clone "$REPO_URL" "$INSTALL_DIR"

# Install dependencies
echo "📚 Installing dependencies..."
cd "$INSTALL_DIR"
npm install

# Create launcher
echo "🚀 Creating launcher..."
mkdir -p "$(dirname "$LAUNCHER")"
cat > "$LAUNCHER" <<'EOF'
#!/bin/bash
cd ~/openclawfice && npm run dev
EOF
chmod +x "$LAUNCHER"

echo ""
echo "✅ OpenClawfice installed successfully!"
echo ""
echo "To launch:"
echo "  openclawfice"
echo ""
echo "Or visit: http://localhost:3333"
echo ""

# Ask if they want to launch now
read -p "Launch now? (Y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
  echo "🏢 Starting OpenClawfice..."
  echo ""
  echo "Opening http://localhost:3333 in your browser..."
  sleep 2
  
  # Open browser
  if command -v open &> /dev/null; then
    open http://localhost:3333
  elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3333
  fi
  
  # Launch server
  exec "$LAUNCHER"
fi
