#!/usr/bin/env node
/**
 * Isolated recording with VISIBLE Chrome window.
 * 
 * Same as record-isolated.mjs but launches a visible browser window
 * so you can see exactly what's being recorded (useful for debugging).
 * 
 * The window is completely separate from your main browser - you can
 * keep working while recording happens in the isolated window.
 * 
 * Usage: node record-isolated-visible.mjs <output_name> [duration_seconds] [feature_type]
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
  console.error('Usage: node record-isolated-visible.mjs <output_name> [duration_seconds] [feature_type]');
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
        await page.evaluate(() => {
          const agents = ['Cipher', 'Nova', 'Scout', 'Forge', 'Pixel'];
          const agent = agents[Math.floor(Math.random() * agents.length)];
          const amount = 50 + Math.floor(Math.random() * 150);
          window.postMessage({ type: 'demo_trigger', action: 'xp', agent, amount }, '*');
        });
        await sleep(500);
        break;

      case 'meeting':
        await page.evaluate(() => {
          window.postMessage({ 
            type: 'demo_trigger', 
            action: 'meeting',
            agents: ['Cipher', 'Nova'],
            topic: 'Launch Strategy'
          }, '*');
        });
        await sleep(1000);
        break;

      case 'accomplishment':
        await page.evaluate(() => {
          const feed = document.querySelector('[data-accomplishments-feed]') 
            || document.querySelector('.accomplishments')
            || document.querySelector('#accomplishments');
          if (feed) {
            feed.scrollIntoView({ behavior: 'smooth', block: 'center' });
            feed.style.animation = 'pulse 2s ease-in-out';
          }
        });
        await sleep(500);
        break;

      case 'quest':
        await page.evaluate(() => {
          window.postMessage({ type: 'demo_trigger', action: 'quest' }, '*');
        });
        await sleep(1000);
        break;

      case 'watercooler':
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
        // No special trigger
        break;
    }
  } catch (err) {
    console.error(`Failed to trigger ${feature} demo:`, err.message);
  }
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error('ERROR: Chrome/Chromium not found');
    process.exit(1);
  }

  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  for (const f of readdirSync(FRAMES_DIR)) {
    unlinkSync(join(FRAMES_DIR, f));
  }

  console.log(`Recording: ${url} (feature: ${featureType}) → ${FINAL_FILE} (${duration}s)`);
  console.log('📹 VISIBLE MODE: Watch the isolated Chrome window!');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false, // ⭐ VISIBLE window!
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1280,800',
      '--window-position=100,100', // Position away from main browser
    ],
    defaultViewport: {
      width: 1280,
      height: 800,
      deviceScaleFactor: 2,
    },
  });

  try {
    const page = await browser.newPage();

    // Set a distinct title so it's obvious this is the recording window
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(document, 'title', {
        get() { return '🔴 OpenClawfice Recording'; },
        set() { /* ignore */ }
      });
    });

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    await sleep(2000);

    if (featureType !== 'default') {
      await triggerFeatureDemo(page, featureType);
    }

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
