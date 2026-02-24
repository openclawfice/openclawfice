#!/bin/bash
# OpenClawfice Health Check — unified verification script
# Usage: bash scripts/check.sh [local|prod|all]
# Default: local

set +e  # Don't exit on errors — we handle them

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
NC='\033[0m'

pass=0; fail=0; warn=0

ok()   { echo -e "  ${GREEN}✅${NC} $1"; ((pass++)); }
bad()  { echo -e "  ${RED}❌${NC} $1"; ((fail++)); }
meh()  { echo -e "  ${YELLOW}⚠️${NC}  $1"; ((warn++)); }

check_url() {
  local label="$1" url="$2" expect="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
  if [ "$code" = "$expect" ]; then ok "$label ($code)"; else bad "$label (got $code, want $expect)"; fi
}

check_url_contains() {
  local label="$1" url="$2" needle="$3"
  local body
  body=$(curl -s --max-time 5 "$url" 2>/dev/null || echo "")
  if echo "$body" | grep -qi "$needle" 2>/dev/null; then ok "$label"; else bad "$label (missing: $needle)"; fi
}

MODE="${1:-local}"
BASE_LOCAL="http://localhost:3333"
BASE_PROD="https://openclawfice.com"

echo ""
echo -e "${BOLD}🏥 OpenClawfice Health Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$MODE" = "local" ] || [ "$MODE" = "all" ]; then
  echo ""
  echo -e "${BOLD}📍 Local (localhost:3333)${NC}"
  check_url "Homepage" "$BASE_LOCAL"
  check_url "Office API" "$BASE_LOCAL/api/office"
  check_url "Demo mode" "$BASE_LOCAL/demo"
  check_url "Install page" "$BASE_LOCAL/install"
  check_url "Landing page" "$BASE_LOCAL/landing"

  # Check API returns agents
  agents=$(curl -s "$BASE_LOCAL/api/office" 2>/dev/null | python3 -c 'import json,sys; print(len(json.load(sys.stdin).get("agents",[])))' 2>/dev/null || echo "0")
  if [ "$agents" -gt 0 ]; then ok "Agents detected: $agents"; else bad "No agents found"; fi

  # Check demo GIF exists
  if [ -f "public/openclawfice-demo.gif" ]; then
    size=$(du -k "public/openclawfice-demo.gif" | cut -f1)
    ok "Demo GIF: ${size}KB"
  else
    bad "Demo GIF missing"
  fi

  # Check TypeScript compiles
  if npx tsc --noEmit 2>/dev/null; then
    ok "TypeScript clean"
  else
    meh "TypeScript errors (run 'npx tsc --noEmit')"
  fi
fi

if [ "$MODE" = "prod" ] || [ "$MODE" = "all" ]; then
  echo ""
  echo -e "${BOLD}🌐 Production (openclawfice.com)${NC}"
  check_url "Homepage" "$BASE_PROD"
  check_url "Demo mode" "$BASE_PROD/demo"
  check_url "Install page" "$BASE_PROD/install"
  check_url_contains "Security section" "$BASE_PROD" "VERIFIED"
  check_url_contains "Hero text" "$BASE_PROD" "YOUR AI AGENTS"
  check_url_contains "Zero config" "$BASE_PROD" "Zero Config"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}✅ $pass passed${NC}  ${RED}❌ $fail failed${NC}  ${YELLOW}⚠️  $warn warnings${NC}"

if [ $fail -gt 0 ]; then
  echo -e "\n  ${RED}${BOLD}ISSUES FOUND${NC} — fix before launching"
  exit 1
else
  echo -e "\n  ${GREEN}${BOLD}ALL CLEAR${NC} 🚀"
fi
