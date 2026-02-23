#!/bin/bash
# Record a Loom-style screen capture of the OpenClawfice dashboard
# Usage: record-loom.sh <output_filename> [duration_seconds] [tts_text]
# Outputs the final mp4 path on success

set -e

OUTPUT_NAME="${1:?Usage: record-loom.sh <output_name> [duration] [tts_text]}"
DURATION="${2:-6}"
TTS_TEXT="${3:-}"

SCREENSHOTS_DIR="${HOME}/.openclaw/.status/screenshots"
TEMP_DIR="/tmp/openclawfice-recording"
mkdir -p "$SCREENSHOTS_DIR" "$TEMP_DIR"

VIDEO_FILE="$TEMP_DIR/${OUTPUT_NAME}-screen.mov"
FINAL_FILE="$SCREENSHOTS_DIR/${OUTPUT_NAME}.mp4"

# Record screen (captures whatever is currently displayed — no window switching)
/usr/sbin/screencapture -V "$DURATION" -x "$VIDEO_FILE" 2>/dev/null

if [ ! -f "$VIDEO_FILE" ]; then
  echo "ERROR: screencapture failed" >&2
  exit 1
fi

if [ -n "$TTS_TEXT" ] && command -v say &>/dev/null; then
  AUDIO_FILE="$TEMP_DIR/${OUTPUT_NAME}-audio.aiff"
  say -o "$AUDIO_FILE" --rate=180 "$TTS_TEXT" 2>/dev/null

  ffmpeg -y -i "$VIDEO_FILE" -i "$AUDIO_FILE" \
    -vf "scale=1280:-2" \
    -c:v libx264 -preset fast -crf 28 \
    -c:a aac -b:a 128k \
    -shortest \
    -movflags +faststart \
    "$FINAL_FILE" 2>/dev/null

  rm -f "$AUDIO_FILE"
else
  ffmpeg -y -i "$VIDEO_FILE" \
    -vf "scale=1280:-2" \
    -c:v libx264 -preset fast -crf 28 \
    -an \
    -movflags +faststart \
    "$FINAL_FILE" 2>/dev/null
fi

rm -f "$VIDEO_FILE"

if [ -f "$FINAL_FILE" ]; then
  echo "${OUTPUT_NAME}.mp4"
else
  echo "ERROR: ffmpeg encoding failed" >&2
  exit 1
fi
