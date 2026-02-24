#!/bin/bash
#
# Quick Demo GIF Fix (Option A — 15 minutes)
#
# Problem: Current demo GIF shows meta-discussion in Water Cooler ("the looms are not actually recording a demo")
# Solution: Crop the GIF to remove the right 30% (Water Cooler section)
#
# Result: Focuses on Work Room + Quest Log + Accomplishments (the good stuff!)

set -e

cd "$(dirname "$0")/.."

echo "🎬 Demo GIF Quick Fix (Option A: Crop)"
echo "========================================"
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
echo "✂️  Cropping GIF (removing Water Cooler section)..."
echo ""

# Original: 800x500
# Crop: Remove right 240px (30%), keep left 560px
# New dimensions: 560x500
# Use palette optimization to keep file size small

ffmpeg -y -i public/openclawfice-demo.gif \
  -vf "crop=560:500:0:0,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  public/openclawfice-demo-cropped.gif

echo ""
echo "✅ Cropped GIF created!"
echo ""

# Check file sizes
original_size=$(stat -f%z public/openclawfice-demo.gif)
cropped_size=$(stat -f%z public/openclawfice-demo-cropped.gif)

original_kb=$((original_size / 1024))
cropped_kb=$((cropped_size / 1024))
savings=$((original_kb - cropped_kb))

echo "📊 File Sizes:"
echo "   Original: ${original_kb}KB"
echo "   Cropped:  ${cropped_kb}KB"
echo "   Savings:  ${savings}KB ($(( savings * 100 / original_kb ))%)"
echo ""

# Preview
echo "👁️  Opening preview..."
open public/openclawfice-demo-cropped.gif

echo ""
echo "🤔 Review the cropped GIF. Does it look good?"
echo ""
echo "If YES:"
echo "  mv public/openclawfice-demo-cropped.gif public/openclawfice-demo.gif"
echo "  git add public/openclawfice-demo.gif"
echo "  git commit -m 'fix: Crop demo GIF to remove meta-discussion'"
echo ""
echo "If NO:"
echo "  rm public/openclawfice-demo-cropped.gif"
echo "  # Try Option B (re-record with zoom) instead"
echo ""
echo "To restore original:"
echo "  cp public/openclawfice-demo-original.gif public/openclawfice-demo.gif"
