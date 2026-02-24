#!/usr/bin/env node
/**
 * Record a demo GIF using headless Chrome + ffmpeg.
 * 
 * Captures demo mode at a tight viewport, skips the tour,
 * waits for animations to settle, then records frames and converts to GIF.
 * 
 * Usage: node scripts/record-demo-gif.mjs
 * Output: public/openclawfice-demo.gif
 */

import puppeteer from 'puppeteer-core';
import { mkdirSync, existsSync, unlinkSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FRAMES_DIR = '/tmp/demo-gif-frames';
const OUTPUT_MP4 = '/tmp/demo-gif-raw.mp4';
const OUTPUT_GIF = join(process.cwd(), 'public', 'openclawfice-demo.gif');

// Viewport: wide enough for 2-column layout, tight enough to avoid dead space
const WIDTH = 1100;
const HEIGHT = 700;
const FPS = 12;
const DURATION_S = 10;

async function main() {
  console.log('🎬 Recording demo GIF...');
  
  // Clean up old frames
  if (existsSync(FRAMES_DIR)) {
    for (const f of readdirSync(FRAMES_DIR)) unlinkSync(join(FRAMES_DIR, f));
  } else {
    mkdirSync(FRAMES_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 });

  // Skip the demo tour
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('openclawfice-tour-seen', 'true');
  });

  console.log('📡 Loading demo page...');
  await page.goto('http://localhost:3333/demo', { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for animations to settle and agents to render
  await new Promise(r => setTimeout(r, 4000));

  // Scroll down slightly to show more content below the demo banner
  await page.evaluate(() => {
    window.scrollBy(0, 50);
  });
  await new Promise(r => setTimeout(r, 500));

  console.log(`📸 Capturing ${DURATION_S}s at ${FPS}fps...`);
  const totalFrames = DURATION_S * FPS;
  const frameInterval = 1000 / FPS;
  
  for (let i = 0; i < totalFrames; i++) {
    const padded = String(i).padStart(4, '0');
    await page.screenshot({
      path: join(FRAMES_DIR, `frame-${padded}.png`),
      type: 'png',
    });
    
    if (i % FPS === 0) {
      process.stdout.write(`  ${Math.round((i / totalFrames) * 100)}%...`);
    }
    
    // Wait for next frame, but also let the page animate
    await new Promise(r => setTimeout(r, frameInterval));
  }
  console.log(' 100%');

  await browser.close();

  // Convert frames to GIF using ffmpeg (palette-based for quality + small size)
  console.log('🎨 Converting to GIF...');
  
  // Generate palette for better color quality
  const paletteCmd = `ffmpeg -y -framerate ${FPS} -i ${FRAMES_DIR}/frame-%04d.png -vf "fps=${FPS},scale=800:-1:flags=lanczos,palettegen=max_colors=128:stats_mode=diff" /tmp/demo-palette.png`;
  execSync(paletteCmd, { stdio: 'pipe' });
  
  // Create GIF using palette
  const gifCmd = `ffmpeg -y -framerate ${FPS} -i ${FRAMES_DIR}/frame-%04d.png -i /tmp/demo-palette.png -lavfi "fps=${FPS},scale=800:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3" ${OUTPUT_GIF}`;
  execSync(gifCmd, { stdio: 'pipe' });
  
  const stats = execSync(`ls -la "${OUTPUT_GIF}"`).toString().trim();
  const sizeKB = Math.round(parseInt(stats.split(/\s+/)[4]) / 1024);
  
  console.log(`\n✅ Demo GIF saved: ${OUTPUT_GIF}`);
  console.log(`📊 Size: ${sizeKB}KB (target: <5MB)`);
  console.log(`📐 Resolution: 800px wide, ${FPS}fps, ${DURATION_S}s loop`);
  
  // Clean up frames
  for (const f of readdirSync(FRAMES_DIR)) unlinkSync(join(FRAMES_DIR, f));
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
