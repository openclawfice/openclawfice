#!/bin/bash
# Smart feature recording - focuses on OpenClawfice and captures just that window
# Usage: record-feature.sh <output_filename> [duration_seconds] [tts_text]

set -e

OUTPUT_NAME="${1:?Usage: record-feature.sh <output_name> [duration] [tts_text]}"
DURATION="${2:-6}"
TTS_TEXT="${3:-}"

SCREENSHOTS_DIR="${HOME}/.openclaw/.status/screenshots"
TEMP_DIR="/tmp/openclawfice-recording"
mkdir -p "$SCREENSHOTS_DIR" "$TEMP_DIR"

VIDEO_FILE="$TEMP_DIR/${OUTPUT_NAME}-window.mov"
FINAL_FILE="$SCREENSHOTS_DIR/${OUTPUT_NAME}.mp4"

# Function to get OpenClawfice window ID
get_window_id() {
  osascript 2>/dev/null <<'APPLESCRIPT' || echo ""
    tell application "System Events"
      set browserApps to {"Google Chrome", "Safari", "Firefox", "Brave Browser", "Arc"}
      repeat with browserApp in browserApps
        if exists (process browserApp) then
          tell process browserApp
            set windowList to every window
            repeat with w in windowList
              try
                set windowTitle to name of w
                if windowTitle contains "OpenClawfice" or windowTitle contains "localhost:3333" then
                  -- Get window ID for screencapture
                  set windowID to id of w
                  return windowID
                end if
              end try
            end repeat
          end tell
        end if
      end repeat
    end tell
    return ""
APPLESCRIPT
}

# Try to find OpenClawfice window
WINDOW_ID=$(get_window_id)

if [ -n "$WINDOW_ID" ] && [ "$WINDOW_ID" != "" ]; then
  # Record just the OpenClawfice window (not entire screen)
  /usr/sbin/screencapture -l"$WINDOW_ID" -V "$DURATION" -x "$VIDEO_FILE" 2>/dev/null
  
  if [ ! -f "$VIDEO_FILE" ]; then
    echo "ERROR: Window capture failed, falling back to full screen" >&2
    # Fallback: capture entire screen
    /usr/sbin/screencapture -V "$DURATION" -x "$VIDEO_FILE" 2>/dev/null
  fi
else
  echo "WARNING: Could not find OpenClawfice window, capturing full screen" >&2
  # Fallback: capture entire screen
  /usr/sbin/screencapture -V "$DURATION" -x "$VIDEO_FILE" 2>/dev/null
fi

if [ ! -f "$VIDEO_FILE" ]; then
  echo "ERROR: screencapture failed completely" >&2
  exit 1
fi

# Add TTS audio if provided
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
