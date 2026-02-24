#!/bin/bash
# Record OpenClawfice in an isolated Chrome app window
# Opens a separate Chrome window just for recording, independent of user's browsing
# Usage: record-app-window.sh <output_filename> [duration_seconds]

set -e

OUTPUT_NAME="${1:?Usage: record-app-window.sh <output_name> [duration]}"
DURATION="${2:-6}"

SCREENSHOTS_DIR="${HOME}/.openclaw/.status/screenshots"
TEMP_DIR="/tmp/openclawfice-recording"
mkdir -p "$SCREENSHOTS_DIR" "$TEMP_DIR"

VIDEO_FILE="$TEMP_DIR/${OUTPUT_NAME}-isolated.mov"
FINAL_FILE="$SCREENSHOTS_DIR/${OUTPUT_NAME}.mp4"

# Function to open OpenClawfice in isolated Chrome app window
open_isolated_window() {
  # Use Chrome app mode - creates a borderless window that's separate from main browser
  if command -v "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" &>/dev/null; then
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
      --app=http://localhost:3333 \
      --new-window \
      --window-size=1280,800 \
      --window-position=0,0 \
      --user-data-dir="$TEMP_DIR/chrome-recording-profile" \
      &>/dev/null &
    
    CHROME_PID=$!
    echo "$CHROME_PID" > "$TEMP_DIR/chrome-recording.pid"
    
    # Wait for window to fully load
    sleep 2
    
  elif command -v "/Applications/Arc.app/Contents/MacOS/Arc" &>/dev/null; then
    # Arc browser
    open -na "Arc" --args --app=http://localhost:3333 --new-window
    sleep 2
    
  elif command -v "safari" &>/dev/null; then
    # Safari (opens in normal window, less ideal)
    open -a Safari http://localhost:3333
    sleep 2
  else
    echo "ERROR: No supported browser found (Chrome, Arc, or Safari)" >&2
    return 1
  fi
}

# Function to get the isolated window ID
get_isolated_window_id() {
  # Wait a bit for the window to appear
  sleep 1
  
  osascript 2>/dev/null <<'APPLESCRIPT' || echo ""
    tell application "System Events"
      -- Look for Chrome app window (no tab bar, just localhost:3333)
      if exists (process "Google Chrome") then
        tell process "Google Chrome"
          set windowList to every window
          -- App windows are usually the first one or have specific properties
          repeat with w in windowList
            try
              set windowTitle to name of w
              if windowTitle contains "localhost:3333" or windowTitle contains "OpenClawfice" then
                -- Get window position and size
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
    end tell
    return ""
APPLESCRIPT
}

# Function to close the isolated window
close_isolated_window() {
  if [ -f "$TEMP_DIR/chrome-recording.pid" ]; then
    CHROME_PID=$(cat "$TEMP_DIR/chrome-recording.pid")
    kill "$CHROME_PID" 2>/dev/null || true
    rm -f "$TEMP_DIR/chrome-recording.pid"
  fi
  
  # Clean up Chrome profile directory
  rm -rf "$TEMP_DIR/chrome-recording-profile" 2>/dev/null || true
}

# Trap to ensure cleanup on exit
trap close_isolated_window EXIT

# Open isolated window
echo "Opening isolated recording window..." >&2
open_isolated_window

# Get window region
REGION=$(get_isolated_window_id)

if [ -z "$REGION" ]; then
  echo "ERROR: Could not find isolated recording window" >&2
  exit 1
fi

echo "Recording window region: $REGION" >&2

# Record the isolated window
/usr/sbin/screencapture -V "$DURATION" -R "$REGION" -x "$VIDEO_FILE" 2>/dev/null

if [ ! -f "$VIDEO_FILE" ]; then
  echo "ERROR: screencapture failed" >&2
  exit 1
fi

# Encode to MP4
ffmpeg -y -i "$VIDEO_FILE" \
  -vf "scale=1280:-2" \
  -c:v libx264 -preset fast -crf 28 \
  -an \
  -movflags +faststart \
  "$FINAL_FILE" 2>/dev/null

rm -f "$VIDEO_FILE"

# Close the isolated window
close_isolated_window

if [ -f "$FINAL_FILE" ]; then
  echo "${OUTPUT_NAME}.mp4"
else
  echo "ERROR: ffmpeg encoding failed" >&2
  exit 1
fi
