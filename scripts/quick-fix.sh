#!/bin/bash
set -e

# OpenClawfice Quick Fix Script
# Diagnoses and fixes common issues automatically

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔧 OpenClawfice Quick Fix 🔧          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Check 1: Is Node.js installed?
echo -e "${YELLOW}[1/8]${NC} Checking Node.js..."
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found${NC}"
  echo "  Install from: https://nodejs.org"
  exit 1
else
  NODE_VERSION=$(node -v | sed 's/v//')
  echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"
fi

# Check 2: Is npm installed?
echo -e "${YELLOW}[2/8]${NC} Checking npm..."
if ! command -v npm &>/dev/null; then
  echo -e "${RED}✗ npm not found${NC}"
  exit 1
else
  NPM_VERSION=$(npm -v)
  echo -e "${GREEN}✓ npm $NPM_VERSION${NC}"
fi

# Check 3: Are dependencies installed?
echo -e "${YELLOW}[3/8]${NC} Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚠ node_modules missing — installing...${NC}"
  npm install
  echo -e "${GREEN}✓ Dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Dependencies present${NC}"
fi

# Check 4: Is .next cache corrupted?
echo -e "${YELLOW}[4/8]${NC} Checking build cache..."
if [ -d ".next" ]; then
  echo -e "${YELLOW}⚠ Clearing .next cache...${NC}"
  rm -rf .next
  echo -e "${GREEN}✓ Cache cleared${NC}"
else
  echo -e "${GREEN}✓ No stale cache${NC}"
fi

# Check 5: Is port 3333 available?
echo -e "${YELLOW}[5/8]${NC} Checking port 3333..."
if lsof -i:3333 &>/dev/null; then
  echo -e "${YELLOW}⚠ Port 3333 in use — killing process...${NC}"
  lsof -t -i:3333 | xargs kill -9 2>/dev/null || true
  sleep 1
  echo -e "${GREEN}✓ Port freed${NC}"
else
  echo -e "${GREEN}✓ Port available${NC}"
fi

# Check 6: Is OpenClaw installed?
echo -e "${YELLOW}[6/8]${NC} Checking OpenClaw..."
if command -v openclaw &>/dev/null; then
  OPENCLAW_VERSION=$(openclaw --version 2>/dev/null || echo "unknown")
  echo -e "${GREEN}✓ OpenClaw installed ($OPENCLAW_VERSION)${NC}"
else
  echo -e "${YELLOW}⚠ OpenClaw not found${NC}"
  echo "  Install from: https://openclaw.ai"
fi

# Check 7: Are agents configured?
echo -e "${YELLOW}[7/8]${NC} Checking agents..."
if [ -f "$HOME/.openclaw/openclaw.json" ]; then
  AGENT_COUNT=$(jq '.agents | length' "$HOME/.openclaw/openclaw.json" 2>/dev/null || echo "0")
  if [ "$AGENT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ $AGENT_COUNT agents configured${NC}"
  else
    echo -e "${YELLOW}⚠ No agents found in config${NC}"
    echo "  Run: openclaw agent add"
  fi
else
  echo -e "${YELLOW}⚠ OpenClaw config not found${NC}"
  echo "  Run: openclaw init"
fi

# Check 8: Can we build?
echo -e "${YELLOW}[8/8]${NC} Testing build..."
if npm run build &>/dev/null; then
  echo -e "${GREEN}✓ Build successful${NC}"
else
  echo -e "${RED}✗ Build failed${NC}"
  echo "  Check errors: npm run build"
  exit 1
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ All checks passed!                  ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}→ Start the server:${NC} npm run dev"
echo -e "${BLUE}→ Open in browser:${NC} http://localhost:3333"
echo ""
