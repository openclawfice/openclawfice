import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'fs';

const html = `<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      color: #e2e8f0;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      overflow: hidden;
      position: relative;
    }
    /* Subtle grid pattern */
    body::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .left {
      flex: 1;
      padding: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      z-index: 1;
    }
    .emoji-title {
      font-size: 48px;
      margin-bottom: 20px;
    }
    .title {
      font-family: 'Press Start 2P', monospace;
      font-size: 36px;
      line-height: 1.4;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #c4b5fd, #f9a8d4, #fbbf24);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 22px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 30px;
      max-width: 500px;
    }
    .features {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .feature {
      background: rgba(99,102,241,0.15);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 14px;
      color: #a5b4fc;
      font-weight: 600;
    }
    .right {
      width: 420px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
    }
    .npcs {
      display: flex;
      flex-direction: column;
      gap: 16px;
      transform: rotate(-3deg);
    }
    .npc-row {
      display: flex;
      gap: 12px;
    }
    .npc {
      width: 80px;
      height: 80px;
      background: rgba(30,41,59,0.8);
      border: 2px solid #334155;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .npc-emoji { font-size: 32px; }
    .npc-status {
      font-size: 8px;
      color: #6366f1;
      font-weight: 700;
    }
    .npc.working { border-color: #6366f1; box-shadow: 0 0 12px rgba(99,102,241,0.3); }
    .npc.idle { border-color: #334155; opacity: 0.7; }
    .bottom-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15,23,42,0.6);
      border-top: 1px solid rgba(99,102,241,0.15);
      z-index: 1;
    }
    .url {
      font-family: monospace;
      font-size: 16px;
      color: #6366f1;
      font-weight: 700;
    }
    .badge {
      background: rgba(16,185,129,0.15);
      border: 1px solid rgba(16,185,129,0.4);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      color: #6ee7b7;
      font-weight: 600;
    }
    /* Glow effect */
    .glow {
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
    }
    .glow-1 { background: #6366f1; top: -50px; right: 200px; }
    .glow-2 { background: #ec4899; bottom: -50px; left: 300px; }
  </style>
</head>
<body>
  <div class="glow glow-1"></div>
  <div class="glow glow-2"></div>
  
  <div class="left">
    <div class="emoji-title">🏢</div>
    <div class="title">YOUR AI AGENTS,<br>BUT THEY'RE SIMS</div>
    <div class="subtitle">Turn your OpenClaw agents into pixel art NPCs in a retro virtual office.</div>
    <div class="features">
      <div class="feature">🎮 Pixel Art NPCs</div>
      <div class="feature">⚡ Real-Time Status</div>
      <div class="feature">📋 Quest Log</div>
      <div class="feature">💬 Water Cooler</div>
      <div class="feature">🏆 XP & Leveling</div>
    </div>
  </div>
  
  <div class="right">
    <div class="npcs">
      <div class="npc-row">
        <div class="npc working">
          <div class="npc-emoji">🧑‍💻</div>
          <div class="npc-status">⚡ CODING</div>
        </div>
        <div class="npc working">
          <div class="npc-emoji">📊</div>
          <div class="npc-status">⚡ PLANNING</div>
        </div>
        <div class="npc idle">
          <div class="npc-emoji">☕</div>
          <div class="npc-status">💤 LOUNGE</div>
        </div>
      </div>
      <div class="npc-row">
        <div class="npc idle">
          <div class="npc-emoji">🎨</div>
          <div class="npc-status">💤 IDLE</div>
        </div>
        <div class="npc working">
          <div class="npc-emoji">🔧</div>
          <div class="npc-status">⚡ DEPLOY</div>
        </div>
        <div class="npc working">
          <div class="npc-emoji">📧</div>
          <div class="npc-status">⚡ OUTREACH</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="bottom-bar">
    <div class="url">openclawfice.com</div>
    <div class="badge">✅ Open Source • Zero Config</div>
  </div>
</body>
</html>`;

async function generate() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // Wait for font to load
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1000));
  
  const screenshot = await page.screenshot({ type: 'png' });
  writeFileSync('/Users/tylerbot/clawd-openclawfice/openclawfice/public/og-image.png', screenshot);
  
  console.log('OG image generated!');
  console.log('Size:', screenshot.length, 'bytes');
  
  await browser.close();
}

generate().catch(console.error);
