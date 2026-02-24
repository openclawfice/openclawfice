#!/bin/bash
# Record a feature-focused demo of OpenClawfice
# Usage: record-feature-demo.sh <output_filename> <feature_type> [tts_text]
#
# Feature types:
#   - xp_celebration: Trigger XP animation
#   - meeting: Show meeting room with agents
#   - accomplishment: Show accomplishment being added
#   - quest: Show quest modal
#   - water_cooler: Show water cooler chat
#   - agent_status: Show agent status changes
#   - default: Record current state

set -e

OUTPUT_NAME="${1:?Usage: record-feature-demo.sh <output_name> <feature_type> [tts_text]}"
FEATURE_TYPE="${2:-default}"
TTS_TEXT="${3:-}"
DURATION=6

SCREENSHOTS_DIR="${HOME}/.openclaw/.status/screenshots"
TEMP_DIR="/tmp/openclawfice-recording"
mkdir -p "$SCREENSHOTS_DIR" "$TEMP_DIR"

VIDEO_FILE="$TEMP_DIR/${OUTPUT_NAME}-screen.mov"
FINAL_FILE="$SCREENSHOTS_DIR/${OUTPUT_NAME}.mp4"

# Function to get OpenClawfice window region
get_window_region() {
  osascript 2>/dev/null <<'APPLESCRIPT' || echo ""
    tell application "System Events"
      set browserApps to {"Google Chrome", "Safari", "Firefox", "Brave Browser", "Arc"}
      repeat with browserApp in browserApps
        if exists (process browserApp) then
          tell process browserApp
            set frontmost to true
            delay 0.2
            set windowList to every window
            repeat with w in windowList
              try
                set windowTitle to name of w
                if windowTitle contains "OpenClawfice" or windowTitle contains "localhost:3333" then
                  perform action "AXRaise" of w
                  delay 0.3
                  set windowPos to position of w
                  set windowSize to size of w
                  set windowX to item 1 of windowPos
                  set windowY to item 2 of windowPos
                  set windowW to item 1 of windowSize
                  set windowH to item 2 of windowSize
                  return "" & windowX & "," & windowY & "," & windowW & "," & windowH
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

# Function to trigger feature demo in browser
trigger_feature_demo() {
  local feature="$1"
  
  # Use AppleScript to execute JavaScript in the browser
  osascript 2>/dev/null <<APPLESCRIPT || true
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
                  set frontmost to true
                  perform action "AXRaise" of w
                  delay 0.5
                  
                  -- Execute feature-specific JavaScript
                  tell application browserApp
                    -- Use dev tools console to trigger demo
                    tell active tab of front window
                      -- Inject demo trigger based on feature type
                      if "$feature" is "xp_celebration" then
                        execute javascript "window.postMessage({type:'demo_xp', agent:'Cipher', amount:150}, '*')"
                      else if "$feature" is "meeting" then
                        execute javascript "window.postMessage({type:'demo_meeting', agents:['Cipher','Nova']}, '*')"
                      else if "$feature" is "accomplishment" then
                        execute javascript "window.postMessage({type:'demo_accomplishment'}, '*')"
                      else if "$feature" is "quest" then
                        execute javascript "window.postMessage({type:'demo_quest'}, '*')"
                      else if "$feature" is "water_cooler" then
                        execute javascript "window.postMessage({type:'demo_watercooler'}, '*')"
                      end if
                    end tell
                  end tell
                  
                  delay 0.5
                  return true
                end if
              end try
            end repeat
          end tell
        end if
      end repeat
    end tell
APPLESCRIPT
}

# Get window region
REGION=$(get_window_region)

if [ -z "$REGION" ]; then
  echo "ERROR: OpenClawfice window not found. Is http://localhost:3333 open in a browser?" >&2
  exit 1
fi

# Trigger feature demo if not default
if [ "$FEATURE_TYPE" != "default" ]; then
  echo "Triggering $FEATURE_TYPE demo..." >&2
  trigger_feature_demo "$FEATURE_TYPE"
  sleep 1
fi

# Record the window
/usr/sbin/screencapture -V "$DURATION" -R "$REGION" -x "$VIDEO_FILE" 2>/dev/null

if [ ! -f "$VIDEO_FILE" ]; then
  echo "ERROR: screencapture failed" >&2
  exit 1
fi

# Add voiceover if provided
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
