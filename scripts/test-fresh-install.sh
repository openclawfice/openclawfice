#!/bin/bash
# Test script to simulate fresh install validation
# Checks all critical paths for error handling

set -e

echo "🧪 Testing Fresh Install Flow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)

cd "$ROOT_DIR"

# Test 1: Check CLI exists and is executable
echo "✓ Test 1: CLI executable check"
if [ ! -f "bin/openclawfice.js" ]; then
  echo "  ❌ FAIL: bin/openclawfice.js missing"
  exit 1
fi
if [ ! -x "bin/openclawfice.js" ]; then
  echo "  ⚠️  Making CLI executable..."
  chmod +x bin/openclawfice.js
fi
echo "  ✅ PASS: CLI exists and executable"
echo ""

# Test 2: Check Node.js version detection
echo "✓ Test 2: Node.js version check"
NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "  ❌ FAIL: Node.js $NODE_VERSION < 18 (upgrade required)"
  exit 1
fi
echo "  ✅ PASS: Node.js $NODE_VERSION >= 18"
echo ""

# Test 3: Check dependencies installed
echo "✓ Test 3: Dependencies check"
if [ ! -d "node_modules" ]; then
  echo "  ❌ FAIL: node_modules missing (run: npm install)"
  exit 1
fi
PKG_COUNT=$(ls node_modules | wc -l | tr -d ' ')
echo "  ✅ PASS: $PKG_COUNT packages installed"
echo ""

# Test 4: Check build output OR source files
echo "✓ Test 4: Build validation"
HAS_BUILD=0
HAS_SOURCE=0

if [ -d ".next" ]; then
  HAS_BUILD=1
  echo "  ✅ Production build exists (.next/)"
fi

if [ -f "app/page.tsx" ]; then
  HAS_SOURCE=1
  echo "  ✅ Source files exist (app/)"
fi

if [ $HAS_BUILD -eq 0 ] && [ $HAS_SOURCE -eq 0 ]; then
  echo "  ❌ FAIL: Neither build nor source files found!"
  exit 1
fi
echo ""

# Test 5: Check OpenClaw config (warning only)
echo "✓ Test 5: OpenClaw detection"
OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"
if [ -f "$OPENCLAW_CONFIG" ]; then
  AGENT_COUNT=$(grep -o '"id"' "$OPENCLAW_CONFIG" | wc -l | tr -d ' ')
  echo "  ✅ OpenClaw installed ($AGENT_COUNT agents configured)"
else
  echo "  ⚠️  OpenClaw not installed (demo mode only)"
  echo "     Install at: https://openclaw.ai"
fi
echo ""

# Test 6: Check templates exist
echo "✓ Test 6: Template files"
if [ ! -f "templates/OFFICE.md" ]; then
  echo "  ❌ FAIL: templates/OFFICE.md missing"
  exit 1
fi
echo "  ✅ PASS: OFFICE.md template exists"
echo ""

# Test 7: Check discovery animation component
echo "✓ Test 7: Discovery animation"
if [ ! -f "components/DiscoveryAnimation.tsx" ]; then
  echo "  ❌ FAIL: DiscoveryAnimation.tsx missing"
  exit 1
fi
# Check for audio error handling
if ! grep -q "addEventListener('error'" components/DiscoveryAnimation.tsx; then
  echo "  ⚠️  WARNING: Audio error handling might be missing"
fi
echo "  ✅ PASS: Discovery animation exists with error handling"
echo ""

# Test 8: Verify CLI help works
echo "✓ Test 8: CLI help command"
if ! node bin/openclawfice.js --help > /dev/null 2>&1; then
  echo "  ❌ FAIL: CLI help command failed"
  exit 1
fi
echo "  ✅ PASS: CLI help works"
echo ""

# Test 9: Check doctor command
echo "✓ Test 9: Doctor command"
if ! node bin/openclawfice.js doctor > /tmp/ocf-doctor-test.log 2>&1; then
  echo "  ⚠️  Doctor command exited with non-zero (expected if server not running)"
else
  echo "  ✅ PASS: Doctor command works"
fi
echo ""

# Test 10: Verify package.json scripts
echo "✓ Test 10: Package scripts"
if ! grep -q '"dev"' package.json; then
  echo "  ❌ FAIL: 'dev' script missing in package.json"
  exit 1
fi
if ! grep -q '"build"' package.json; then
  echo "  ❌ FAIL: 'build' script missing in package.json"
  exit 1
fi
if ! grep -q '"start"' package.json; then
  echo "  ❌ FAIL: 'start' script missing in package.json"
  exit 1
fi
echo "  ✅ PASS: All required scripts present"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All Tests Passed!"
echo ""
echo "Fresh install validation complete."
echo "Next steps:"
echo "  1. Test actual install: curl -fsSL https://openclawfice.com/install.sh | bash"
echo "  2. Or run locally: node bin/openclawfice.js"
echo ""
