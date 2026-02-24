import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const MEETING_FILE = join(STATUS_DIR, 'meeting.json');

/**
 * Meeting Conversation Simulator
 * 
 * Advances the meeting transcript with contextual back-and-forth dialogue.
 * Called by the frontend every 3s when a meeting is active.
 * Adds one new message per call to simulate real-time discussion.
 */

const AGENT_NAMES: Record<string, string> = {
  'main': 'Cipher',
  'outreach': 'Scout',
  'openclawfice': 'Pixel',
  'ocf-pm': 'Nova',
  'ocf-dev': 'Forge',
};

// Topic-aware conversation templates
const TEMPLATES: Record<string, string[]> = {
  security: [
    "Let's review these security findings carefully",
    "I've analyzed the CodeQL results — most are false positives for localhost apps",
    "Agreed, but the log injection issues are legit. We should fix those",
    "I'll patch those. What about auth tokens for the API endpoints?",
    "Token auth is smart but not a launch blocker. Week 1 post-launch",
    "CORS headers too — we should lock down to localhost origin only",
    "Makes sense. Keep CodeQL active for ongoing monitoring of new commits",
    "OK consensus: ship as-is, add auth + CORS post-launch. All critical vulns patched",
  ],
  launch: [
    "Everything is deployed and verified. Zero blockers",
    "Demo mode works perfectly — transcript, water cooler, all of it",
    "We need Tyler to tweet and post on Discord. That's the only step left",
    "The share card is ready too — canvas-generated, retina quality",
    "What about the setup wizard? Is it intuitive for first-time users?",
    "Built it yesterday — 5 questions, auto-generates config, starts the app",
    "Perfect. So launch checklist is: tweet + Discord post + monitor feedback",
    "Let's do it. All systems GO",
  ],
  feature: [
    "Let me share my perspective on the implementation",
    "What's the user story here? What problem are we solving?",
    "Users want a more interactive experience — something that feels alive",
    "That's actually straightforward. We have the data, just need the UI",
    "Should we prioritize this over the security improvements?",
    "Security first, but this is a close second. Both improve user trust",
    "I can prototype something in an hour. Quick feedback loop",
    "Let's do it. Ship fast, iterate based on user reactions",
  ],
  default: [
    "This is important. Let's think it through carefully",
    "I see where you're going. What about the tradeoffs?",
    "Fair point. We need to weigh short-term vs long-term impact",
    "Building on that — we could split it into phases",
    "Phase 1 ships this week, Phase 2 after we get user feedback",
    "Agreed. Let's also set up metrics so we know if it's working",
    "Good call. I'll own the implementation, you handle the measurement",
    "Perfect. Let's reconvene after Phase 1 ships",
  ],
};

function pickTemplate(topic: string): string[] {
  const lower = topic.toLowerCase();
  if (lower.includes('security') || lower.includes('codeql') || lower.includes('vuln') || lower.includes('auth')) return TEMPLATES.security;
  if (lower.includes('launch') || lower.includes('deploy') || lower.includes('ship') || lower.includes('release')) return TEMPLATES.launch;
  if (lower.includes('feature') || lower.includes('build') || lower.includes('design') || lower.includes('ui')) return TEMPLATES.feature;
  return TEMPLATES.default;
}

export async function POST() {
  try {
    if (!existsSync(MEETING_FILE)) {
      return NextResponse.json({ active: false });
    }

    const data = JSON.parse(readFileSync(MEETING_FILE, 'utf-8'));

    if (!data.active) {
      return NextResponse.json({ active: false });
    }

    if (!Array.isArray(data.transcript)) {
      data.transcript = [];
    }

    const messages = pickTemplate(data.topic || '');
    const participants = data.participants || [];
    const currentIndex = data.transcript.length;

    // Don't add more than template allows
    if (currentIndex >= messages.length) {
      // Meeting discussion complete — advance to final round
      data.currentRound = data.maxRounds || 4;
      mkdirSync(STATUS_DIR, { recursive: true });
      writeFileSync(MEETING_FILE, JSON.stringify(data, null, 2));
      return NextResponse.json({ done: true, transcript: data.transcript });
    }

    // Rate limit: don't add messages faster than every 8 seconds
    const lastEntry = data.transcript[data.transcript.length - 1];
    if (lastEntry && (Date.now() - lastEntry.timestamp) < 8000) {
      return NextResponse.json({ waiting: true });
    }

    // Pick the next participant (round-robin)
    const participantId = participants[currentIndex % participants.length] || 'unknown';
    const agentName = AGENT_NAMES[participantId] || participantId;
    const round = Math.floor(currentIndex / Math.max(participants.length, 2)) + 1;

    const entry = {
      agent: agentName,
      message: messages[currentIndex],
      round,
      timestamp: Date.now(),
    };

    data.transcript.push(entry);
    data.currentRound = round;
    data.lastMessage = `${agentName}: ${messages[currentIndex]}`;

    mkdirSync(STATUS_DIR, { recursive: true });
    writeFileSync(MEETING_FILE, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, entry, totalMessages: data.transcript.length });
  } catch (err: any) {
    const safeMsg = String(err?.message || 'Unknown error').replace(/[\r\n]/g, ' ');
    console.error('Meeting simulate error:', safeMsg);
    return NextResponse.json({ error: safeMsg }, { status: 500 });
  }
}
