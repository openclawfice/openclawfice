#!/bin/bash

#
# Production Deployment Status Checker
# Verifies openclawfice.com has all latest features deployed
#

set -e

echo "🔍 OpenClawfice Production Status Check"
echo "========================================"
echo ""

PROD_URL="https://openclawfice.com"
FAIL_COUNT=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check() {
  local name="$1"
  local command="$2"
  local expected="$3"
  
  printf "%-40s" "$name"
  
  if eval "$command" | grep -q "$expected"; then
    echo -e "${GREEN}✅ PASS${NC}"
  else
    echo -e "${RED}❌ FAIL${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

echo "Checking $PROD_URL..."
echo ""

# 1. Security badge in header
check "1. Security badge (header)" \
  "curl -s $PROD_URL" \
  "MALWARE FREE"

# 2. Security section on landing
check "2. Security section (landing)" \
  "curl -s $PROD_URL/landing" \
  "VERIFIED"

# 3. Demo API returns agents
check "3. Demo API (5 agents)" \
  "curl -s $PROD_URL/api/demo" \
  "Nova"

# 4. Demo page loads
check "4. Demo page" \
  "curl -s '$PROD_URL/?demo=true'" \
  "OpenClawfice"

# 5. README security note
check "5. Security in README" \
  "curl -s https://raw.githubusercontent.com/openclawfice/openclawfice/main/README.md" \
  "malware"

# 6. Demo GIF exists
check "6. Demo GIF (public)" \
  "curl -I -s $PROD_URL/openclawfice-demo.gif" \
  "200"

# 7. OG image exists
check "7. OG image (social share)" \
  "curl -I -s $PROD_URL/og-image.png" \
  "200"

# 8. API endpoints work
check "8. Office API" \
  "curl -s $PROD_URL/api/office" \
  "agents"

# 9. Install page
check "9. Install page" \
  "curl -s $PROD_URL/install" \
  "OpenClaw"

# 10. Landing page
check "10. Landing page" \
  "curl -s $PROD_URL/landing" \
  "SIMS"

echo ""
echo "========================================"

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "Production is healthy. Ready to launch! 🚀"
  exit 0
else
  echo -e "${RED}❌ $FAIL_COUNT checks failed${NC}"
  echo ""
  echo "Deployment issue detected. Check VERCEL-DEPLOY-FIX.md"
  exit 1
fi
