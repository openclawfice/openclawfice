#!/usr/bin/env node
/**
 * Isolated Loom-style recording using headless Chrome.
 * 
 * Launches an invisible browser, navigates to OpenClawfice,
 * optionally triggers a feature demo, then captures video.
 * 
 * Usage: node record-isolated.mjs <output_name> [duration_seconds] [feature_type]
 * 
 * Feature types:
 *   - default: Record current state
 *   - xp: Trigger XP celebration animation
 *   - meeting: Show meeting room
 *   - accomplishment: Highlight accomplishments feed
 *   - quest: Show quest modal
 *   - watercooler: Focus on water cooler chat
 */

import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

const outputName = process.argv[2];
const duration = parseInt(process.argv[3] || '6', 10);
const featureType = process.argv[4] || 'default';

if (!outputName) {
  console.error('Usage: node record-isolated.mjs <output_name> [duration_seconds] [feature_type]');
  process.exit(1);
}

const SCREENSHOTS_DIR = join(homedir(), '.openclaw', '.status', 'screenshots');
const TEMP_DIR = join('/tmp', 'openclawfice-isolated-recording');
const FRAMES_DIR = join(TEMP_DIR, `frames-${outputName}`);
const FINAL_FILE = join(SCREENSHOTS_DIR, `${outputName}.mp4`);
const url = 'http://localhost:3333';

// Chrome executable path
const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function triggerFeatureDemo(page, feature) {
  console.log(`Triggering feature demo: ${feature}`);
  
  try {
    switch (feature) {
      case 'xp':
        // Trigger XP celebration for a random agent
        await page.evaluate(() => {
          const agents = ['Cipher', 'Nova', 'Scout', 'Forge', 'Pixel'];
          const agent = agents[Math.floor(Math.random() * agents.length)];
          const amount = 50 + Math.floor(Math.random() * 150);
          window.postMessage({ type: 'demo_trigger', action: 'xp', agent, amount }, '*');
        });
        await sleep(500); // Let animation start
        break;

      case 'meeting':
        // Show meeting room with agents
        await page.evaluate(() => {
          window.postMessage({ 
            type: 'demo_trigger', 
            action: 'meeting',
            agents: ['Cipher', 'Nova'],
            topic: 'Launch Strategy'
          }, '*');
        });
        await sleep(1000); // Let meeting room appear
        break;

      case 'accomplishment':
        // Scroll to accomplishments feed and highlight it
        await page.evaluate(() => {
          const feed = document.querySelector('[data-accomplishments-feed]') 
            || document.querySelector('.accomplishments')
            || document.querySelector('#accomplishments');
          if (feed) {
            feed.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a subtle highlight pulse
            feed.style.animation = 'pulse 2s ease-in-out';
          }
        });
        await sleep(500);
        break;

      case 'quest':
        // Show quest modal
        await page.evaluate(() => {
          window.postMessage({ type: 'demo_trigger', action: 'quest' }, '*');
        });
        await sleep(1000);
        break;

      case 'watercooler':
        // Scroll to water cooler chat
        await page.evaluate(() => {
          const watercooler = document.querySelector('[data-watercooler]')
            || document.querySelector('.water-cooler')
            || document.querySelector('#water-cooler');
          if (watercooler) {
            watercooler.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
        await sleep(500);
        break;

      case 'default':
      default:
        // No special trigger, just record current state
        break;
    }
  } catch (err) {
    console.error(`Failed to trigger ${feature} demo:`, err.message);
    // Continue with recording anyway
  }
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error('ERROR: Chrome/Chromium not found');
    process.exit(1);
  }

  // Ensure directories exist
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  // Clean up any leftover frames
  for (const f of readdirSync(FRAMES_DIR)) {
    unlinkSync(join(FRAMES_DIR, f));
  }

  console.log(`Recording: ${url} (feature: ${featureType}) → ${FINAL_FILE} (${duration}s)`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1280,800',
    ],
    defaultViewport: {
      width: 1280,
      height: 800,
      deviceScaleFactor: 2, // Retina quality
    },
  });

  try {
    const page = await browser.newPage();

    // Navigate and wait for the page to be fully loaded
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

    // Extra wait for animations and data to load
    await sleep(2000);

    // Trigger feature demo if specified
    if (featureType !== 'default') {
      await triggerFeatureDemo(page, featureType);
    }

    // Capture frames at ~10fps
    const fps = 10;
    const totalFrames = duration * fps;
    const frameInterval = 1000 / fps;

    console.log(`Capturing ${totalFrames} frames at ${fps}fps...`);

    for (let i = 0; i < totalFrames; i++) {
      const frameNum = String(i).padStart(5, '0');
      await page.screenshot({
        path: join(FRAMES_DIR, `frame-${frameNum}.png`),
        type: 'png',
      });

      if (i < totalFrames - 1) {
        await sleep(frameInterval);
      }
    }

    console.log(`Captured ${totalFrames} frames. Encoding mp4...`);

    // Stitch frames into mp4 with ffmpeg
    try {
      execSync(
        `ffmpeg -y -framerate ${fps} -i "${FRAMES_DIR}/frame-%05d.png" ` +
        `-vf "scale=1280:-2" ` +
        `-c:v libx264 -preset fast -crf 26 ` +
        `-pix_fmt yuv420p ` +
        `-movflags +faststart ` +
        `-an ` +
        `"${FINAL_FILE}"`,
        { stdio: 'pipe', timeout: 30000 }
      );
    } catch (e) {
      console.error('ERROR: ffmpeg encoding failed:', e.message);
      process.exit(1);
    }

    // Clean up frames
    for (const f of readdirSync(FRAMES_DIR)) {
      unlinkSync(join(FRAMES_DIR, f));
    }

    if (existsSync(FINAL_FILE)) {
      console.log(`${outputName}.mp4`);
    } else {
      console.error('ERROR: Output file not created');
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(err => {
  console.error('Recording failed:', err.message);
  process.exit(1);
});
