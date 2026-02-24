#!/bin/bash
#
# Demo GIF Re-Record (Option B — 45 minutes)
#
# Problem: Current demo GIF has fourth-wall break + error states + too zoomed out
# Solution: Re-record with focused zoom sequence showing best features
#
# Sequence:
#   0:00-0:03 — Full dashboard (establish context)
#   0:03-0:05 — Zoom to Work Room (80% of frame)
#   0:05-0:08 — Agent completes task → XP toast pops → speech bubble changes
#   0:08-0:10 — Quest Log updates (checkmark animation)
#   0:10-0:12 — Agent moves to Lounge (movement animation)
#   0:12-0:15 — Zoom out to full office

set -e

cd "$(dirname "$0")/.."

echo "🎬 Demo GIF Re-Record (Option B: Zoom Sequence)"
echo "================================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:3333/?demo=true > /dev/null; then
  echo "❌ OpenClawfice demo server not running!"
  echo ""
  echo "Start it first:"
  echo "  npm run dev"
  echo ""
  echo "Then open another terminal and run this script."
  exit 1
fi

echo "✅ Demo server detected at http://localhost:3333"
echo ""

# Backup original
if [ ! -f public/openclawfice-demo-original.gif ]; then
  echo "📦 Backing up original..."
  cp public/openclawfice-demo.gif public/openclawfice-demo-original.gif
  echo "   ✅ Backup saved: public/openclawfice-demo-original.gif"
else
  echo "📦 Original backup already exists"
fi

echo ""
echo "🎥 Starting isolated recording with zoom sequence..."
echo ""
echo "This will:"
echo "  1. Launch headless Chrome"
echo "  2. Navigate to demo mode"
echo "  3. Wait for XP animation to fire"
echo "  4. Capture 15 seconds of activity"
echo "  5. Convert to GIF"
echo ""
echo "Estimated time: 2-3 minutes"
echo ""

# Use existing record-isolated.mjs script
# Feature: xp (triggers XP animation which is the money shot)
# Duration: 15 seconds
# Output: public/openclawfice-demo-v2.gif

node scripts/record-isolated.mjs \
  --feature xp \
  --duration 15 \
  --output public/openclawfice-demo-v2.gif

echo ""
echo "✅ New demo GIF created: public/openclawfice-demo-v2.gif"
echo ""

# Check file size
new_size=$(stat -f%z public/openclawfice-demo-v2.gif)
new_kb=$((new_size / 1024))

echo "📊 New File Size: ${new_kb}KB"
echo ""

if [ $new_kb -gt 5120 ]; then
  echo "⚠️  WARNING: File exceeds 5MB Twitter limit!"
  echo "   Current: ${new_kb}KB"
  echo "   Limit: 5120KB"
  echo ""
  echo "Compress with:"
  echo "  gifsicle -O3 --lossy=80 public/openclawfice-demo-v2.gif -o public/openclawfice-demo-compressed.gif"
fi

# Preview
echo "👁️  Opening preview..."
open public/openclawfice-demo-v2.gif

echo ""
echo "🤔 Review the new GIF. Does it:"
echo "   ✅ Show XP animations clearly?"
echo "   ✅ Focus on NPCs/agents working?"
echo "   ✅ Avoid meta-discussion in Water Cooler?"
echo "   ✅ Look professional and viral-ready?"
echo ""
echo "If YES:"
echo "  mv public/openclawfice-demo-v2.gif public/openclawfice-demo.gif"
echo "  git add public/openclawfice-demo.gif"
echo "  git commit -m 'feat: Re-record demo GIF with zoom sequence and XP animations'"
echo ""
echo "If NO:"
echo "  # Adjust parameters and try again:"
echo "  node scripts/record-isolated.mjs --feature meeting --duration 15 --output public/test.gif"
echo ""
echo "To restore original:"
echo "  cp public/openclawfice-demo-original.gif public/openclawfice-demo.gif"
echo ""
echo "⏱️  Total time: ~3 minutes"
