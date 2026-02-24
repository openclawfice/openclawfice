#!/bin/bash
# Record OpenClawfice in an isolated browser window (Puppeteer/Playwright)
# This runs completely independently of user's current browser activity
# Usage: record-isolated.sh <output_filename> [duration_seconds] [feature_url]

set -e

OUTPUT_NAME="${1:?Usage: record-isolated.sh <output_name> [duration] [feature_url]}"
DURATION="${2:-6}"
FEATURE_URL="${3:-http://localhost:3333}"

SCREENSHOTS_DIR="${HOME}/.openclaw/.status/screenshots"
TEMP_DIR="/tmp/openclawfice-recording"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$SCREENSHOTS_DIR" "$TEMP_DIR"

FINAL_FILE="$SCREENSHOTS_DIR/${OUTPUT_NAME}.mp4"

# Create Node.js recording script
RECORDER_SCRIPT="$TEMP_DIR/recorder.js"
cat > "$RECORDER_SCRIPT" <<'RECORDER_JS'
const puppeteer = require('puppeteer');
const fs = require('fs');
const { spawn } = require('child_process');

const outputName = process.argv[2];
const duration = parseInt(process.argv[3]) || 6;
const featureUrl = process.argv[4] || 'http://localhost:3333';
const screenshotsDir = process.argv[5];

(async () => {
  let browser;
  let ffmpegProcess;
  
  try {
    // Launch headless browser (isolated from user's activity)
    browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: {
        width: 1280,
        height: 800,
      },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    
    // Navigate to OpenClawfice
    await page.goto(featureUrl, { waitUntil: 'networkidle2' });
    
    // Wait for page to fully render
    await page.waitForTimeout(1000);
    
    // Start screen recording using Chrome DevTools Protocol
    const client = await page.target().createCDPSession();
    await client.send('Page.startScreencast', {
      format: 'png',
      quality: 90,
      maxWidth: 1280,
      maxHeight: 800,
      everyNthFrame: 2, // 30fps / 2 = 15fps
    });

    const frames = [];
    
    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
      frames.push(data);
      await client.send('Page.screencastFrameAck', { sessionId });
    });

    // Record for specified duration
    await page.waitForTimeout(duration * 1000);
    
    // Stop recording
    await client.send('Page.stopScreencast');
    
    console.log(`Captured ${frames.length} frames`);
    
    // Save frames to temp directory
    const tempFramesDir = `/tmp/openclawfice-frames-${outputName}`;
    if (!fs.existsSync(tempFramesDir)) {
      fs.mkdirSync(tempFramesDir, { recursive: true });
    }
    
    for (let i = 0; i < frames.length; i++) {
      const framePath = `${tempFramesDir}/frame-${String(i).padStart(5, '0')}.png`;
      fs.writeFileSync(framePath, frames[i], 'base64');
    }
    
    console.log('Frames saved, encoding video...');
    
    // Use ffmpeg to create video from frames
    const outputPath = `${screenshotsDir}/${outputName}.mp4`;
    const ffmpegArgs = [
      '-framerate', '15',
      '-pattern_type', 'glob',
      '-i', `${tempFramesDir}/frame-*.png`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '28',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outputPath
    ];
    
    ffmpegProcess = spawn('ffmpeg', ffmpegArgs, { stdio: 'pipe' });
    
    await new Promise((resolve, reject) => {
      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`Video saved: ${outputPath}`);
          // Clean up temp frames
          fs.rmSync(tempFramesDir, { recursive: true, force: true });
          resolve();
        } else {
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
    });
    
    console.log(outputName + '.mp4');
    
  } catch (err) {
    console.error('Recording failed:', err.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
RECORDER_JS

# Check if puppeteer is installed
if ! node -e "require('puppeteer')" 2>/dev/null; then
  echo "ERROR: puppeteer not installed" >&2
  echo "Install with: npm install -g puppeteer" >&2
  echo "Or: cd ~/clawd-openclawfice/openclawfice && npm install puppeteer" >&2
  exit 1
fi

# Run the Node.js recorder
node "$RECORDER_SCRIPT" "$OUTPUT_NAME" "$DURATION" "$FEATURE_URL" "$SCREENSHOTS_DIR"

# Clean up temp script
rm -f "$RECORDER_SCRIPT"
