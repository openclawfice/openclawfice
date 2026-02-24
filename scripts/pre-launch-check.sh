#!/bin/bash
# Pre-Launch Verification Script for OpenClawfice
# Run this before launching to verify everything works

# Don't exit on error - we want to check everything
set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 OpenClawfice Pre-Launch Verification"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

echo "📋 Checking Prerequisites..."
echo "----------------------------"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_pass "Node.js installed: $NODE_VERSION"
else
    check_fail "Node.js not found (required)"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    check_pass "npm installed: $NPM_VERSION"
else
    check_fail "npm not found (required)"
fi

# Check OpenClaw
if [ -d "$HOME/.openclaw" ]; then
    check_pass "OpenClaw directory exists: ~/.openclaw"
else
    check_warn "OpenClaw directory not found (needed for real data)"
fi

echo ""
echo "📦 Checking Project Files..."
echo "----------------------------"

cd "$PROJECT_ROOT"

# Check package.json
if [ -f "package.json" ]; then
    check_pass "package.json exists"
else
    check_fail "package.json missing"
fi

# Check dependencies
if [ -d "node_modules" ]; then
    check_pass "node_modules installed"
else
    check_fail "node_modules missing (run: npm install)"
fi

# Check critical files
FILES=(
    "app/page.tsx"
    "app/api/office/route.ts"
    "app/api/office/actions/route.ts"
    "public/openclawfice-demo.gif"
    "public/og-image.png"
    "README.md"
    "LICENSE"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file exists"
    else
        check_fail "$file missing"
    fi
done

echo ""
echo "🔍 Checking Documentation..."
echo "----------------------------"

DOCS=(
    "README.md"
    "INSTALL.md"
    "docs/LAUNCH-NOW.txt"
    "docs/internal/LAUNCH-IN-5-MINUTES.md"
    "docs/internal/VIRAL-LAUNCH-COPY.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "$doc exists"
    else
        check_warn "$doc missing (recommended)"
    fi
done

echo ""
echo "🎨 Checking Visual Assets..."
echo "----------------------------"

ASSETS=(
    "public/openclawfice-demo.gif"
    "public/og-image.png"
    "public/screenshot.png"
    "public/icon.svg"
)

for asset in "${ASSETS[@]}"; do
    if [ -f "$asset" ]; then
        SIZE=$(du -h "$asset" | cut -f1)
        check_pass "$asset exists ($SIZE)"
    else
        check_warn "$asset missing"
    fi
done

echo ""
echo "🛠️ Checking Build..."
echo "----------------------------"

# Check if .next exists (previously built)
if [ -d ".next" ]; then
    check_pass ".next directory exists (previously built)"
    
    # Try to check if it's recent
    NEXT_MODIFIED=$(find .next -type f -newer package.json 2>/dev/null | wc -l | tr -d ' ')
    if [ "$NEXT_MODIFIED" -gt 0 ]; then
        check_pass "Build is up-to-date"
    else
        check_warn "Build might be stale (run: npm run build)"
    fi
else
    check_warn ".next not found (run: npm run build)"
fi

echo ""
echo "🌐 Checking Server..."
echo "----------------------------"

# Check if server is running
if lsof -i :3333 &> /dev/null; then
    check_pass "Server running on port 3333"
    
    # Try to fetch the homepage
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3333 | grep -q "200"; then
        check_pass "Homepage responds with 200 OK"
    else
        check_warn "Homepage not responding correctly"
    fi
    
    # Check demo mode
    if curl -s "http://localhost:3333/?demo=true" | grep -q "demo"; then
        check_pass "Demo mode accessible"
    else
        check_warn "Demo mode not working"
    fi
    
    # Check API endpoints
    if curl -s "http://localhost:3333/api/office" | grep -q "agents"; then
        check_pass "API endpoint /api/office works"
    else
        check_warn "API endpoint not responding"
    fi
else
    check_warn "Server not running on port 3333 (start with: npm run dev)"
fi

echo ""
echo "📝 Checking License..."
echo "----------------------------"

if [ -f "LICENSE" ]; then
    if grep -q "AGPL" LICENSE; then
        check_pass "License is AGPL-3.0"
    elif grep -q "MIT" LICENSE; then
        check_warn "License is MIT (docs say AGPL)"
    else
        check_warn "License type unclear"
    fi
fi

if [ -f "README.md" ]; then
    if grep -q "AGPL" README.md; then
        check_pass "README references AGPL"
    elif grep -q "MIT" README.md; then
        check_fail "README says MIT but LICENSE is AGPL (needs fix!)"
    fi
fi

if [ -f "package.json" ]; then
    if grep -q "AGPL" package.json; then
        check_pass "package.json has AGPL license"
    else
        check_warn "package.json license field might need update"
    fi
fi

echo ""
echo "🔗 Checking Links..."
echo "----------------------------"

# Check if repo URL is correct in docs
if grep -r "github.com/openclawfice/openclawfice" README.md &> /dev/null; then
    check_pass "GitHub repo URL found in README"
else
    check_warn "GitHub repo URL might need updating in README"
fi

# Check if demo URL is consistent
if grep -r "openclawfice.com" README.md &> /dev/null; then
    check_pass "Demo URL found in README"
else
    check_warn "Demo URL might be missing from README"
fi

echo ""
echo "========================================"
echo "📊 SUMMARY"
echo "========================================"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${YELLOW}Warnings: $WARN${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}❌ NOT READY TO LAUNCH${NC}"
    echo "Fix the failed checks above before launching."
    echo ""
    exit 1
elif [ $WARN -gt 5 ]; then
    echo -e "${YELLOW}⚠️  CAUTION: Multiple warnings${NC}"
    echo "Review warnings above. Launch at your discretion."
    echo ""
    exit 0
else
    echo -e "${GREEN}✅ READY TO LAUNCH!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review docs/internal/LAUNCH-IN-5-MINUTES.md"
    echo "2. Test demo mode: open http://localhost:3333/?demo=true"
    echo "3. Copy launch message from docs/internal/VIRAL-LAUNCH-COPY.md"
    echo "4. Post to Discord/Twitter"
    echo "5. Celebrate! 🎉"
    echo ""
    exit 0
fi
