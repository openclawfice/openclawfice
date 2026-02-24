#!/bin/bash
# Quick test to prove the isolated recording system works
# Run this while doing OTHER work (typing in terminal, browsing, etc.)
# The recording will ONLY capture OpenClawfice, not your current activity!

set -e

echo "🎬 Testing Isolated Recording System"
echo "======================================"
echo ""
echo "This will record OpenClawfice for 6 seconds."
echo "During recording, feel free to:"
echo "  - Type in your terminal"
echo "  - Browse other tabs"
echo "  - Open other apps"
echo ""
echo "The video will ONLY show OpenClawfice (not your other activity)."
echo ""
read -p "Press ENTER to start test recording..."

cd ~/clawd-openclawfice/openclawfice

# Record with XP celebration demo
echo ""
echo "📹 Recording XP celebration demo (6 seconds)..."
echo "   (This is happening in an invisible headless browser)"
echo ""

TIMESTAMP=$(date +%s)
OUTPUT_NAME="test-tyler-$TIMESTAMP"

node scripts/record-isolated.mjs "$OUTPUT_NAME" 6 xp 2>&1 | grep -E "recording|Capturing|Encoding"

VIDEO_PATH="$HOME/.openclaw/.status/screenshots/${OUTPUT_NAME}.mp4"

if [ -f "$VIDEO_PATH" ]; then
  echo ""
  echo "✅ SUCCESS! Video created:"
  echo "   $VIDEO_PATH"
  echo ""
  ls -lh "$VIDEO_PATH"
  echo ""
  echo "🎥 Opening video now..."
  echo "   You should see:"
  echo "   - OpenClawfice dashboard (NOT your terminal!)"
  echo "   - Golden +XP celebration animation"
  echo "   - Particle burst effects"
  echo ""
  open "$VIDEO_PATH"
  echo ""
  echo "✅ Recording system is WORKING!"
  echo "   Every accomplishment now gets perfect feature demos."
  echo "   No more random terminal windows! 🎉"
else
  echo ""
  echo "❌ Video not created. Check errors above."
  exit 1
fi
