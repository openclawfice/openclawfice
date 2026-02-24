#!/bin/bash
# Quick health check for OpenClawfice
# Usage: ./scripts/health-check.sh

set -e

echo "🏥 OpenClawfice Health Check"
echo "=============================="
echo

# Check 1: Server running?
echo "1. Server status..."
if lsof -i :3333 > /dev/null 2>&1; then
  echo "   ✅ Server running on port 3333"
else
  echo "   ❌ Server NOT running"
  exit 1
fi

# Check 2: Homepage loads?
echo "2. Homepage..."
if curl -sf http://localhost:3333 > /dev/null; then
  echo "   ✅ Homepage loads"
else
  echo "   ❌ Homepage failed"
  exit 1
fi

# Check 3: API responding?
echo "3. Office API..."
if curl -sf http://localhost:3333/api/office > /dev/null; then
  echo "   ✅ Office API working"
else
  echo "   ❌ Office API failed"
  exit 1
fi

# Check 4: Demo mode?
echo "4. Demo mode..."
if curl -sf "http://localhost:3333/?demo=true" > /dev/null; then
  echo "   ✅ Demo mode works"
else
  echo "   ❌ Demo mode failed"
  exit 1
fi

# Check 5: Build artifacts?
echo "5. Build status..."
if [ -d ".next" ]; then
  echo "   ✅ Build artifacts present"
else
  echo "   ⚠️  No build artifacts (run: npm run build)"
fi

# Check 6: Demo GIF?
echo "6. Visual assets..."
if [ -f "public/openclawfice-demo.gif" ]; then
  SIZE=$(ls -lh public/openclawfice-demo.gif | awk '{print $5}')
  echo "   ✅ Demo GIF present ($SIZE)"
else
  echo "   ❌ Demo GIF missing"
fi

echo
echo "=============================="
echo "✅ All checks passed!"
echo
echo "Ready to launch? Open: LAUNCH-CHECKLIST-FINAL.md"
