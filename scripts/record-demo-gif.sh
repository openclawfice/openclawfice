#!/bin/bash

# OpenClawfice Demo GIF Recording Script
# Guides Tyler through recording the perfect demo GIF

echo "🎬 OpenClawfice Demo GIF Recording Guide"
echo "========================================="
echo ""
echo "This script will guide you through recording a viral-ready demo GIF."
echo "Time required: 30-45 minutes"
echo ""

# Check if demo is running
if ! curl -s "http://localhost:3333/?demo=true" > /dev/null 2>&1; then
  echo "❌ Demo mode not accessible at http://localhost:3333"
  echo ""
  echo "Starting server..."
  cd "$(dirname "$0")/.."
  npm run dev &
  sleep 5
  
  if ! curl -s "http://localhost:3333/?demo=true" > /dev/null 2>&1; then
    echo "❌ Still can't reach demo. Start server manually with: npm run dev"
    exit 1
  fi
fi

echo "✅ Demo mode is running at: http://localhost:3333/?demo=true"
echo ""

# Check for recording tools
echo "📹 Checking for recording tools..."
echo ""

HAS_GIFSKI=false
HAS_FFMPEG=false
HAS_KAP=false

if command -v gifski &> /dev/null; then
  echo "✅ Gifski found (recommended)"
  HAS_GIFSKI=true
else
  echo "⚠️  Gifski not found"
  echo "   Install with: brew install gifski"
fi

if command -v ffmpeg &> /dev/null; then
  echo "✅ FFmpeg found"
  HAS_FFMPEG=true
else
  echo "⚠️  FFmpeg not found"
  echo "   Install with: brew install ffmpeg"
fi

if [ -d "/Applications/Kap.app" ]; then
  echo "✅ Kap found (easy GIF recording)"
  HAS_KAP=true
else
  echo "⚠️  Kap not found"
  echo "   Install from: https://getkap.co"
fi

echo ""

# Recommend best tool
if $HAS_KAP; then
  echo "🎯 RECOMMENDED: Use Kap (easiest)"
  echo ""
  echo "Steps:"
  echo "1. Open Kap app"
  echo "2. Click record button"
  echo "3. Select recording area (1200×675 recommended)"
  echo "4. Follow recording script below"
  echo "5. Stop recording"
  echo "6. Export as GIF (30 FPS, <5MB)"
elif $HAS_GIFSKI && $HAS_FFMPEG; then
  echo "🎯 RECOMMENDED: Use QuickTime + Gifski"
  echo ""
  echo "Steps:"
  echo "1. Open QuickTime Player"
  echo "2. File → New Screen Recording"
  echo "3. Record the actions (see script below)"
  echo "4. Save as video.mov"
  echo "5. Run: gifski --fps 30 --width 1200 --quality 90 video.mov -o demo.gif"
else
  echo "🎯 RECOMMENDED: Install Kap (easiest option)"
  echo ""
  echo "Install: brew install --cask kap"
  echo "Then run this script again"
  exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 RECORDING SCRIPT (Follow Exactly)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Duration: 10-15 seconds"
echo "Resolution: 1200×675 (or record larger and crop)"
echo "Frame rate: 30 FPS"
echo ""
echo "ACTIONS:"
echo ""
echo "  00:00-00:02  Hold on full dashboard"
echo "               • Show 5 agents in office"
echo "               • Quest log visible"
echo "               • Accomplishments visible"
echo ""
echo "  00:02-00:03  Move cursor to Nova (PM agent)"
echo "               • Smooth cursor movement"
echo "               • Hover over Nova's NPC"
echo ""
echo "  00:03-00:05  Click Nova"
echo "               • Detail panel slides in from right"
echo "               • Hold to show skills, needs, XP"
echo ""
echo "  00:05-00:07  Close panel"
echo "               • Click X button"
echo "               • Panel slides out"
echo ""
echo "  00:07-00:09  Scroll to Quest Log"
echo "               • Smooth scroll down"
echo "               • Show pending quest"
echo ""
echo "  00:09-00:11  Click quest to expand"
echo "               • Quest expands to show details"
echo "               • Show decision options"
echo ""
echo "  00:11-00:13  Hold on expanded quest"
echo "               • Let viewer read details"
echo ""
echo "  00:13-00:15  Zoom back to full dashboard"
echo "               • Scroll back up"
echo "               • Show full office view"
echo "               • END"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 PRO TIPS:"
echo ""
echo "  • Practice the movements 2-3 times before recording"
echo "  • Keep cursor movements smooth and deliberate"
echo "  • Record multiple takes, pick the best one"
echo "  • Final GIF must be under 5MB (critical for Twitter)"
echo "  • Test upload to Twitter before finalizing"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Ready to open demo mode in browser? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Opening demo mode..."
  open "http://localhost:3333/?demo=true"
  echo ""
  echo "✅ Demo mode opened in browser"
  echo ""
  echo "Now:"
  echo "1. Position your recording tool"
  echo "2. Start recording"
  echo "3. Follow the script above (00:00-00:15)"
  echo "4. Stop recording"
  echo "5. Save/export as demo.gif"
else
  echo "Skipped opening browser. Open manually: http://localhost:3333/?demo=true"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 AFTER RECORDING:"
echo ""

if $HAS_GIFSKI && $HAS_FFMPEG; then
  echo "Convert video to GIF with Gifski:"
  echo ""
  echo "  gifski --fps 30 --width 1200 --quality 90 video.mov -o demo.gif"
  echo ""
  echo "Check file size:"
  echo ""
  echo "  ls -lh demo.gif"
  echo ""
  echo "If over 5MB, reduce quality:"
  echo ""
  echo "  gifski --fps 30 --width 1200 --quality 70 video.mov -o demo.gif"
  echo ""
fi

echo "Save final GIF to:"
echo ""
echo "  ~/clawd-openclawfice/openclawfice/public/openclawfice-demo.gif"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Once complete, record accomplishment:"
echo ""
echo "  curl -s -X POST http://localhost:3333/api/office/actions \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"type\":\"add_accomplishment\",\"accomplishment\":{\"icon\":\"🎬\",\"title\":\"Demo GIF created\",\"detail\":\"10-15 sec viral-ready GIF showing OpenClawfice in action\",\"who\":\"Pixel\"}}'"
echo ""
echo "Good luck! 🚀"
