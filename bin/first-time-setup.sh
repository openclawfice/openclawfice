#!/bin/bash
# First-time setup wizard for OpenClawfice
# Makes initial configuration easy and guides users through setup

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🏢 OpenClawfice First-Time Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if OpenClaw is installed
OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"

if [ ! -f "$OPENCLAW_CONFIG" ]; then
  echo -e "${YELLOW}⚠️  OpenClaw not detected${NC}"
  echo ""
  echo "OpenClawfice works best with OpenClaw installed."
  echo "Visit: https://openclaw.ai"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
  echo ""
fi

# Check if config already exists
CONFIG_FILE="$PWD/openclawfice.config.json"

if [ -f "$CONFIG_FILE" ]; then
  echo -e "${GREEN}✓${NC} Config already exists at $CONFIG_FILE"
  echo ""
  read -p "Overwrite with fresh config? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Keeping existing config."
    exit 0
  fi
fi

# Gather user preferences
echo -e "${BLUE}Let's configure your office:${NC}"
echo ""

# Owner name
echo "1. What's your name? (shown in office)"
read -p "   Name: " OWNER_NAME
OWNER_NAME=${OWNER_NAME:-Owner}

# Water cooler style
echo ""
echo "2. Water cooler chat style:"
echo "   a) Casual (friendly, emojis)"
echo "   b) Professional (formal, no emojis)"
echo "   c) Minimal (ultra-brief)"
read -p "   Choice (a/b/c): " STYLE_CHOICE

case $STYLE_CHOICE in
  a|A|casual) STYLE="casual" ;;
  b|B|professional) STYLE="professional" ;;
  c|C|minimal) STYLE="minimal" ;;
  *) STYLE="casual" ;;
esac

# Chat frequency
echo ""
echo "3. How often should agents chat?"
echo "   a) Frequent (every 15 seconds)"
echo "   b) Normal (every 30 seconds)"
echo "   c) Occasional (every 60 seconds)"
echo "   d) Rare (every 2 minutes)"
read -p "   Choice (a/b/c/d): " FREQ_CHOICE

case $FREQ_CHOICE in
  a|A) INTERVAL=15 ;;
  b|B) INTERVAL=30 ;;
  c|C) INTERVAL=60 ;;
  d|D) INTERVAL=120 ;;
  *) INTERVAL=30 ;;
esac

# Quiet hours
echo ""
echo "4. Enable quiet hours? (no chat at night)"
read -p "   Enable? (Y/n): " QUIET_CHOICE

if [[ $QUIET_CHOICE =~ ^[Nn]$ ]]; then
  QUIET_ENABLED=false
else
  QUIET_ENABLED=true
  echo ""
  read -p "   Start hour (0-23, default 23): " QUIET_START
  QUIET_START=${QUIET_START:-23}
  read -p "   End hour (0-23, default 8): " QUIET_END
  QUIET_END=${QUIET_END:-8}
fi

# Sound effects
echo ""
echo "5. Enable retro sound effects?"
read -p "   Enable? (y/N): " SOUND_CHOICE

if [[ $SOUND_CHOICE =~ ^[Yy]$ ]]; then
  SOUND_ENABLED=true
else
  SOUND_ENABLED=false
fi

# Generate config
echo ""
echo -e "${BLUE}Generating config...${NC}"

cat > "$CONFIG_FILE" <<EOF
{
  "owner": {
    "name": "$OWNER_NAME",
    "emoji": "👤"
  },
  "waterCooler": {
    "style": "$STYLE",
    "intervalSeconds": $INTERVAL,
    "quietHours": {
      "enabled": $QUIET_ENABLED,
      "start": ${QUIET_START:-23},
      "end": ${QUIET_END:-8}
    }
  },
  "ui": {
    "soundEffects": $SOUND_ENABLED,
    "theme": "default"
  },
  "cooldown": {
    "defaultMs": 300000
  }
}
EOF

echo -e "${GREEN}✓${NC} Config saved to $CONFIG_FILE"
echo ""

# Summary
echo -e "${BLUE}Your Office Setup:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Owner: $OWNER_NAME"
echo "Style: $STYLE"
echo "Chat frequency: every $INTERVAL seconds"
if [ "$QUIET_ENABLED" = true ]; then
  echo "Quiet hours: ${QUIET_START}:00 - ${QUIET_END}:00"
else
  echo "Quiet hours: disabled"
fi
echo "Sound effects: $SOUND_ENABLED"
echo ""

# Offer to start
echo -e "${GREEN}Setup complete!${NC}"
echo ""
read -p "Start OpenClawfice now? (Y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Nn]$ ]]; then
  echo ""
  echo -e "${BLUE}Starting OpenClawfice...${NC}"
  echo "Visit: http://localhost:3333"
  echo ""
  
  # Open browser after delay
  (sleep 3 && {
    if command -v open &>/dev/null; then
      open http://localhost:3333
    elif command -v xdg-open &>/dev/null; then
      xdg-open http://localhost:3333
    fi
  }) &
  
  # Start the app
  npm run dev
else
  echo "Run 'openclawfice' when you're ready!"
fi
