#!/bin/bash

# OpenClawfice Demo GIF Creation Helper
# This script helps automate GIF creation from screen recording

set -e

echo "🎬 OpenClawfice Demo GIF Creator"
echo "================================="
echo ""

# Check if input video exists
if [ ! -f "$1" ]; then
  echo "❌ Usage: $0 <input-video.mov>"
  echo ""
  echo "Steps:"
  echo "  1. Record screen with QuickTime/ScreenFlow:"
  echo "     - Open localhost:3333/?demo=true"
  echo "     - Record 10-15 seconds following DEMO-GIF-BRIEF.md"
  echo "     - Save as demo-recording.mov"
  echo ""
  echo "  2. Run this script:"
  echo "     ./scripts/create-demo-gif.sh demo-recording.mov"
  echo ""
  exit 1
fi

INPUT_VIDEO="$1"
OUTPUT_DIR="public"
OUTPUT_FILE="$OUTPUT_DIR/openclawfice-demo.gif"
OUTPUT_MOBILE="$OUTPUT_DIR/openclawfice-demo-mobile.gif"

echo "📁 Input: $INPUT_VIDEO"
echo "📁 Output: $OUTPUT_FILE"
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
  echo "❌ ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

# Create output directory if needed
mkdir -p "$OUTPUT_DIR"

# Check if gifski is available (better quality)
if command -v gifski &> /dev/null; then
  echo "✅ Using Gifski (high quality)"
  echo ""
  
  echo "🎨 Creating desktop GIF (1200×675)..."
  gifski \
    --fps 30 \
    --width 1200 \
    --quality 90 \
    "$INPUT_VIDEO" \
    -o "$OUTPUT_FILE"
  
  echo "📱 Creating mobile GIF (800×450)..."
  gifski \
    --fps 30 \
    --width 800 \
    --quality 85 \
    "$INPUT_VIDEO" \
    -o "$OUTPUT_MOBILE"
  
else
  echo "⚠️  Gifski not found, using ffmpeg (lower quality)"
  echo "   Install gifski for better results: brew install gifski"
  echo ""
  
  echo "🎨 Creating desktop GIF (1200×675)..."
  ffmpeg -i "$INPUT_VIDEO" \
    -vf "fps=30,scale=1200:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
    -loop 0 \
    "$OUTPUT_FILE" \
    -y
  
  echo "📱 Creating mobile GIF (800×450)..."
  ffmpeg -i "$INPUT_VIDEO" \
    -vf "fps=30,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
    -loop 0 \
    "$OUTPUT_MOBILE" \
    -y
fi

echo ""
echo "✅ GIF creation complete!"
echo ""

# Check file sizes
DESKTOP_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
MOBILE_SIZE=$(ls -lh "$OUTPUT_MOBILE" | awk '{print $5}')

echo "📊 File Sizes:"
echo "   Desktop: $DESKTOP_SIZE ($OUTPUT_FILE)"
echo "   Mobile:  $MOBILE_SIZE ($OUTPUT_MOBILE)"
echo ""

# Warn if too large
DESKTOP_BYTES=$(stat -f%z "$OUTPUT_FILE" 2>/dev/null || stat -c%s "$OUTPUT_FILE")
if [ "$DESKTOP_BYTES" -gt 5242880 ]; then
  echo "⚠️  Desktop GIF is over 5MB! Twitter may not accept it."
  echo "   Try reducing quality or duration."
  echo ""
  echo "   Reduce quality:"
  echo "   gifski --fps 30 --width 1200 --quality 70 \"$INPUT_VIDEO\" -o \"$OUTPUT_FILE\""
  echo ""
  echo "   Or reduce resolution:"
  echo "   gifski --fps 30 --width 1000 --quality 90 \"$INPUT_VIDEO\" -o \"$OUTPUT_FILE\""
  echo ""
fi

echo "🎉 Ready to use!"
echo ""
echo "Test upload to Twitter to verify file size and quality."
echo "GIFs should loop seamlessly and load quickly on mobile."
