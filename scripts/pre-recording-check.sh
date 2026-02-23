#!/bin/bash

# Pre-Recording Checklist for Demo GIF
# Run this before starting screen recording to ensure everything is perfect

echo "🎬 Pre-Recording Checklist for Demo GIF"
echo "========================================"
echo ""

PASS=0
FAIL=0

check_pass() {
  echo "✅ $1"
  ((PASS++))
}

check_fail() {
  echo "❌ $1"
  ((FAIL++))
}

# 1. Check if server is running
echo "1️⃣  Server Status"
if curl -s http://localhost:3333 > /dev/null 2>&1; then
  check_pass "Server running at localhost:3333"
else
  check_fail "Server NOT running"
  echo "   Fix: cd ~/clawd-openclawfice/openclawfice && npm run dev"
  exit 1
fi
echo ""

# 2. Check demo mode
echo "2️⃣  Demo Mode"
DEMO_RESPONSE=$(curl -s http://localhost:3333/api/demo)
if echo "$DEMO_RESPONSE" | grep -q '"agents"'; then
  AGENT_COUNT=$(echo "$DEMO_RESPONSE" | grep -o '"id"' | wc -l | xargs)
  if [ "$AGENT_COUNT" -eq "5" ]; then
    check_pass "Demo mode working (5 agents present)"
  else
    check_fail "Demo has $AGENT_COUNT agents (expected 5)"
  fi
else
  check_fail "Demo mode not responding correctly"
  exit 1
fi
echo ""

# 3. Check demo page loads
echo "3️⃣  Demo Page"
if curl -s "http://localhost:3333/?demo=true" | grep -q "OpenClawfice\|OPENCLAWFICE"; then
  check_pass "Demo page loads correctly"
else
  check_fail "Demo page not loading"
fi
echo ""

# 4. Browser check
echo "4️⃣  Browser"
if [ -d "/Applications/Google Chrome.app" ] || [ -d "/Applications/Chromium.app" ]; then
  check_pass "Chrome/Chromium available for recording"
elif [ -d "/Applications/Safari.app" ]; then
  check_pass "Safari available for recording"
else
  check_fail "No browser found for recording"
fi
echo ""

# 5. Recording tools
echo "5️⃣  Recording Tools"
TOOLS_FOUND=0

if [ -d "/Applications/QuickTime Player.app" ]; then
  check_pass "QuickTime available"
  ((TOOLS_FOUND++))
fi

if command -v screencapture &> /dev/null; then
  check_pass "screencapture command available"
  ((TOOLS_FOUND++))
fi

if [ -d "/Applications/ScreenFlow.app" ] || [ -d "/Applications/Kap.app" ]; then
  check_pass "Professional recording tool available"
  ((TOOLS_FOUND++))
fi

if [ $TOOLS_FOUND -eq 0 ]; then
  echo "⚠️  No auto-detected recording tools"
  echo "   (This is OK if you have your own screen recorder)"
  echo "   Recommended: QuickTime, ScreenFlow, Kap, or OBS"
else
  check_pass "Recording tools available"
fi
echo ""

# 6. Conversion tools
echo "6️⃣  GIF Conversion"
if command -v gifski &> /dev/null; then
  check_pass "Gifski installed (best quality)"
elif command -v ffmpeg &> /dev/null; then
  check_pass "ffmpeg installed (fallback)"
else
  check_fail "No GIF conversion tool found"
  echo "   Install: brew install gifski"
fi
echo ""

# 7. Documentation
echo "7️⃣  Documentation"
if [ -f "docs/DEMO-GIF-QUICK-START.md" ]; then
  check_pass "DEMO-GIF-QUICK-START.md ready"
else
  check_fail "Quick start guide missing"
fi

if [ -f "docs/DEMO-GIF-BRIEF.md" ]; then
  check_pass "DEMO-GIF-BRIEF.md ready"
else
  check_fail "Full brief missing"
fi
echo ""

# 8. Output directory
echo "8️⃣  Output Setup"
if [ -d "public" ]; then
  check_pass "public/ directory exists"
else
  mkdir -p public
  check_pass "Created public/ directory"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary: $PASS passed, $FAIL failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 Ready to record!"
  echo ""
  echo "📋 Next Steps:"
  echo "   1. Open browser: http://localhost:3333/?demo=true"
  echo "   2. Clear notifications/popups"
  echo "   3. Read docs/DEMO-GIF-QUICK-START.md"
  echo "   4. Practice the sequence 2-3 times"
  echo "   5. Start recording!"
  echo ""
  echo "🎬 Recording sequence (15 seconds):"
  echo "   0:00 - Hold on full dashboard (2s)"
  echo "   0:02 - Click agent NPC (Nova/Forge)"
  echo "   0:05 - Hold on detail panel (2s)"
  echo "   0:07 - Close panel"
  echo "   0:08 - Scroll to Quest Log"
  echo "   0:09 - Click quest to expand"
  echo "   0:11 - Hold (2s)"
  echo "   0:13 - Scroll back to top"
  echo "   0:14 - Cursor to header CTA"
  echo "   0:15 - STOP"
  echo ""
  echo "Good luck! 🚀"
  exit 0
else
  echo "🚨 Fix issues above before recording"
  exit 1
fi
