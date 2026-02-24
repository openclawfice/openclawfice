#!/bin/bash
# Verify OpenClawfice production deployment
# Checks if key features are live on openclawfice.com

set -e

PROD_URL="https://openclawfice.com"
LOCAL_URL="http://localhost:3333"

echo "🔍 Production Deployment Verification"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_passed=0
check_failed=0

# Function to check if string exists in URL
check_feature() {
  local name="$1"
  local url="$2"
  local search_string="$3"
  
  echo -n "Checking $name... "
  
  if curl -s "$url" | grep -qi "$search_string"; then
    echo -e "${GREEN}✅ FOUND${NC}"
    ((check_passed++))
    return 0
  else
    echo -e "${RED}❌ MISSING${NC}"
    ((check_failed++))
    return 1
  fi
}

echo "Production URL: $PROD_URL"
echo "Local URL: $LOCAL_URL"
echo ""

# Check 1: Security badge in header
echo "1️⃣  Security Badge (Header)"
check_feature "  Header badge" "$PROD_URL" "MALWARE FREE"

# Check 2: Security section on landing page
echo ""
echo "2️⃣  Security Section (Landing Page)"
check_feature "  Landing security" "$PROD_URL/landing" "VERIFIED.*MALWARE SCANNED"
check_feature "  Anti-Malware card" "$PROD_URL/landing" "Anti-Malware"
check_feature "  CodeQL card" "$PROD_URL/landing" "CodeQL Analysis"
check_feature "  Dependabot card" "$PROD_URL/landing" "Dependabot"
check_feature "  Zero CVEs card" "$PROD_URL/landing" "Zero CVEs"

# Check 3: Demo GIF
echo ""
echo "3️⃣  Demo Assets"
check_feature "  Demo GIF" "$PROD_URL/public/" "openclawfice-demo"

# Check 4: Critical pages exist
echo ""
echo "4️⃣  Critical Pages"
for page in "" "/landing" "/demo" "/install"; do
  echo -n "  $page... "
  if curl -s -o /dev/null -w "%{http_code}" "$PROD_URL$page" | grep -q "200"; then
    echo -e "${GREEN}✅ 200 OK${NC}"
    ((check_passed++))
  else
    echo -e "${RED}❌ FAILED${NC}"
    ((check_failed++))
  fi
done

# Summary
echo ""
echo "======================================"
echo "Summary: $check_passed passed, $check_failed failed"
echo ""

if [ $check_failed -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Production is ready.${NC}"
  exit 0
else
  echo -e "${RED}❌ $check_failed checks failed. Production needs deployment.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Check Vercel dashboard: https://vercel.com/openclawfice/openclawfice"
  echo "2. Trigger manual deploy if auto-deploy failed"
  echo "3. Check build logs for errors"
  echo "4. Re-run this script after deploy completes"
  exit 1
fi
