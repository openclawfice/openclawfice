#!/usr/bin/env node

/**
 * Auto-Generate Demo GIF
 * 
 * This script uses Playwright to automatically record the OpenClawfice demo
 * and generate a viral-ready GIF.
 * 
 * Prerequisites:
 *   npm install -D playwright
 *   npx playwright install chromium
 * 
 * Usage:
 *   node scripts/auto-generate-demo-gif.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if playwright is installed
try {
  require.resolve('playwright');
} catch {
  console.log('❌ Playwright not installed');
  console.log('');
  console.log('Install with:');
  console.log('  npm install -D playwright');
  console.log('  npx playwright install chromium');
  process.exit(1);
}

const { chromium } = require('playwright');

const DEMO_URL = 'http://localhost:3333/?demo=true';
const OUTPUT_DIR = path.join(__dirname, '../public');
const FRAMES_DIR = path.join(OUTPUT_DIR, 'gif-frames');
const OUTPUT_GIF = path.join(OUTPUT_DIR, 'openclawfice-demo.gif');

// Scene timing (in milliseconds)
const SCENES = [
  { name: 'full-dashboard', duration: 2000, action: 'hold' },
  { name: 'hover-agent', duration: 1000, action: 'hover', selector: '[data-agent-id="nova"]' },
  { name: 'click-agent', duration: 0, action: 'click', selector: '[data-agent-id="nova"]' },
  { name: 'agent-panel', duration: 2000, action: 'hold' },
  { name: 'close-panel', duration: 0, action: 'click', selector: '[data-close-panel]' },
  { name: 'scroll-quest', duration: 1000, action: 'scroll', offset: 400 },
  { name: 'click-quest', duration: 0, action: 'click', selector: '[data-quest-id]' },
  { name: 'expanded-quest', duration: 2000, action: 'hold' },
  { name: 'scroll-back', duration: 1000, action: 'scroll', offset: -400 },
  { name: 'final-view', duration: 1000, action: 'hold' },
];

async function captureFrame(page, frameNumber) {
  const framePath = path.join(FRAMES_DIR, `frame-${String(frameNumber).padStart(4, '0')}.png`);
  await page.screenshot({ path: framePath, fullPage: false });
  return framePath;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateGIF() {
  console.log('🎬 Auto-Generating OpenClawfice Demo GIF');
  console.log('=========================================');
  console.log('');

  // Create frames directory
  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
  } else {
    // Clean existing frames
    const files = fs.readdirSync(FRAMES_DIR);
    files.forEach(file => fs.unlinkSync(path.join(FRAMES_DIR, file)));
  }

  // Launch browser
  console.log('🌐 Launching browser...');
  const browser = await chromium.launch({ headless: false }); // Set to false to see what's happening
  const context = await browser.newContext({
    viewport: { width: 1200, height: 675 },
    deviceScaleFactor: 2, // Retina quality
  });
  const page = await context.newPage();

  // Navigate to demo
  console.log(`📍 Navigating to ${DEMO_URL}...`);
  await page.goto(DEMO_URL, { waitUntil: 'networkidle' });
  await sleep(2000); // Wait for demo to fully load

  console.log('📸 Capturing frames...');
  let frameNumber = 0;
  const frameRate = 30; // 30 FPS
  const frameInterval = 1000 / frameRate; // ~33ms per frame

  // Execute scenes
  for (const scene of SCENES) {
    console.log(`  Scene: ${scene.name}`);
    
    // Perform action
    switch (scene.action) {
      case 'hover':
        if (scene.selector) {
          const element = await page.$(scene.selector);
          if (element) {
            await element.hover();
          }
        }
        break;
      
      case 'click':
        if (scene.selector) {
          const element = await page.$(scene.selector);
          if (element) {
            await element.click();
            await sleep(300); // Animation delay
          }
        }
        break;
      
      case 'scroll':
        if (scene.offset) {
          await page.evaluate((offset) => {
            window.scrollBy({ top: offset, behavior: 'smooth' });
          }, scene.offset);
        }
        break;
      
      case 'hold':
      default:
        // Just hold the current view
        break;
    }

    // Capture frames for this scene's duration
    const frames = Math.floor(scene.duration / frameInterval);
    for (let i = 0; i < frames; i++) {
      await captureFrame(page, frameNumber++);
      await sleep(frameInterval);
    }
  }

  console.log(`✅ Captured ${frameNumber} frames`);
  console.log('');

  await browser.close();

  // Convert frames to GIF using ffmpeg
  console.log('🎞️  Converting frames to GIF...');
  
  try {
    // Check if ffmpeg is installed
    execSync('which ffmpeg', { stdio: 'ignore' });
    
    // Create GIF with ffmpeg
    const ffmpegCmd = `ffmpeg -y -framerate ${frameRate} -pattern_type glob -i '${FRAMES_DIR}/frame-*.png' -vf "fps=${frameRate},scale=1200:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ${OUTPUT_GIF}`;
    
    execSync(ffmpegCmd, { stdio: 'inherit' });
    
    // Check file size
    const stats = fs.statSync(OUTPUT_GIF);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    console.log('');
    console.log('✅ GIF created successfully!');
    console.log(`📦 File size: ${fileSizeMB.toFixed(2)} MB`);
    console.log(`📁 Location: ${OUTPUT_GIF}`);
    console.log('');
    
    if (fileSizeMB > 5) {
      console.log('⚠️  WARNING: File size exceeds 5MB (Twitter limit)');
      console.log('');
      console.log('To reduce size, try:');
      console.log('  1. Reduce frame rate (e.g., 20 FPS instead of 30)');
      console.log('  2. Reduce resolution (e.g., 1000×562)');
      console.log('  3. Use gifski for better compression:');
      console.log(`     gifski --fps 30 --width 1200 --quality 70 ${FRAMES_DIR}/frame-*.png -o ${OUTPUT_GIF}`);
    } else {
      console.log('✅ File size is under 5MB - ready for Twitter!');
    }
    
    // Clean up frames
    console.log('');
    console.log('🧹 Cleaning up frames...');
    const files = fs.readdirSync(FRAMES_DIR);
    files.forEach(file => fs.unlinkSync(path.join(FRAMES_DIR, file)));
    fs.rmdirSync(FRAMES_DIR);
    
    console.log('');
    console.log('🎉 Done! Demo GIF is ready for launch.');
    
  } catch (error) {
    console.error('❌ Error creating GIF:', error.message);
    console.log('');
    console.log('Make sure ffmpeg is installed:');
    console.log('  brew install ffmpeg');
    process.exit(1);
  }
}

// Run
generateGIF().catch(console.error);
