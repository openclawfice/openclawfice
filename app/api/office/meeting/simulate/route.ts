import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const MEETING_FILE = join(STATUS_DIR, 'meeting.json');

/**
 * Meeting Conversation Simulator
 * 
 * Adds one message per call to simulate real-time discussion.
 * Called by the frontend every 3s when a meeting is active.
 * Messages are topic-aware — every response references the actual topic.
 */

const AGENT_NAMES: Record<string, string> = {
  'main': 'Cipher',
  'outreach': 'Scout',
  'openclawfice': 'Pixel',
  'ocf-pm': 'Nova',
  'ocf-dev': 'Forge',
};

// Agent personality voices — each agent sounds different
const AGENT_STYLES: Record<string, { opener: string; agree: string; push: string; conclude: string }> = {
  'Cipher': {
    opener: 'From an ops perspective,',
    agree: 'Solid point.',
    push: 'But we need to consider the infrastructure implications.',
    conclude: 'I can set up the monitoring for this.',
  },
  'Scout': {
    opener: 'From the user acquisition angle,',
    agree: 'That tracks with what I\'m seeing in creator data.',
    push: 'But will this actually help us get more signups?',
    conclude: 'I\'ll research how competitors handle this.',
  },
  'Pixel': {
    opener: 'Architecturally speaking,',
    agree: 'Clean approach. That\'s maintainable.',
    push: 'The implementation complexity worries me though.',
    conclude: 'I\'ll draft the technical spec.',
  },
  'Nova': {
    opener: 'From a product standpoint,',
    agree: 'Users would love that.',
    push: 'But is this the highest priority right now?',
    conclude: 'Let me add this to the roadmap with a clear timeline.',
  },
  'Forge': {
    opener: 'From a dev perspective,',
    agree: 'That\'s doable. I\'ve built similar things before.',
    push: 'What about edge cases and error handling?',
    conclude: 'I\'ll start prototyping this today.',
  },
};

/**
 * Generate a contextual message based on the topic, speaker, and conversation position.
 * Every message references the actual topic — no generic filler.
 */
function generateMessage(topic: string, agentName: string, position: number, totalParticipants: number): string {
  const style = AGENT_STYLES[agentName] || AGENT_STYLES['Cipher'];
  const topicShort = topic.length > 60 ? topic.slice(0, 57) + '...' : topic;
  
  // Extract key concepts from topic for natural references
  const words = topic.toLowerCase().split(/\s+/);
  const hasQuestion = topic.includes('?');
  const hasOr = words.includes('or') || words.includes('vs');
  const isAboutSecurity = words.some(w => ['security', 'auth', 'token', 'vulnerability', 'codeql', 'safe'].includes(w));
  const isAboutFeature = words.some(w => ['feature', 'build', 'add', 'implement', 'create', 'design'].includes(w));
  const isAboutBug = words.some(w => ['bug', 'fix', 'broken', 'error', 'crash', 'issue'].includes(w));
  const isAboutPriority = words.some(w => ['priority', 'first', 'important', 'urgent', 'focus', 'roadmap'].includes(w));
  const isAboutLaunch = words.some(w => ['launch', 'ship', 'deploy', 'release', 'publish'].includes(w));

  // Round 1: Opening statements (positions 0 to totalParticipants-1)
  if (position < totalParticipants) {
    if (position === 0) {
      if (hasOr) return `${style.opener} this is a classic tradeoff. Let me break down both sides of "${topicShort}"`;
      if (hasQuestion) return `${style.opener} good question. My take on "${topicShort}" is we should lean toward action`;
      return `${style.opener} "${topicShort}" — I have strong thoughts on this. Let's hash it out`;
    }
    if (isAboutSecurity) return `${style.agree} Security-wise, the risk here is real but bounded. We should scope the fix carefully`;
    if (isAboutFeature) return `${style.agree} I think we can ship a V1 of this quickly, then iterate based on feedback`;
    if (isAboutBug) return `${style.push} How critical is this? If it's affecting users, we fix it now. Otherwise, it queues behind the current sprint`;
    return `Interesting framing. ${style.opener.toLowerCase()} I see both an opportunity and a risk here`;
  }

  // Round 2: Deeper discussion (positions totalParticipants to 2*totalParticipants-1)
  if (position < totalParticipants * 2) {
    if (isAboutSecurity) return `${style.push} We should add auth tokens before launch. Without that, any local app can hit our endpoints`;
    if (isAboutLaunch) return `The launch itself isn't blocked by this. ${style.agree} But we should have a plan for the first week`;
    if (isAboutPriority) return `${style.push} If we try to do everything we'll ship nothing. Pick the top 2 and commit`;
    if (hasOr) return `I'm leaning toward the first option but ${style.push.toLowerCase()} What does the data say?`;
    return `Building on what was said — ${style.push.toLowerCase()} We need concrete next steps, not just discussion`;
  }

  // Round 3: Resolution forming (positions 2*totalParticipants to 3*totalParticipants-1)
  if (position < totalParticipants * 3) {
    if (isAboutSecurity) return `OK here's the plan: token auth for API endpoints, CORS lockdown, rate limiting. ${style.conclude}`;
    if (isAboutFeature) return `Consensus is forming. Let's timebox this to 2 days and review. ${style.conclude}`;
    if (isAboutBug) return `${style.agree} Fix it this sprint. I'll pair with whoever owns that code. ${style.conclude}`;
    return `Good points all around. ${style.conclude} Let's reconvene once we have a prototype`;
  }

  // Round 4+: Wrap up
  if (isAboutSecurity) return `Agreed — security fix ships this week, no excuses. Meeting adjourned 🔒`;
  if (isAboutLaunch) return `Let's launch. We've discussed enough — time to ship and iterate. 🚀`;
  return `Clear action items from everyone. Let's execute and check in tomorrow. Good meeting 👍`;
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

    const participants = data.participants || [];
    const currentIndex = data.transcript.length;
    const maxMessages = Math.min(participants.length * 4, 16); // 4 rounds max, 16 messages cap

    // Discussion complete
    if (currentIndex >= maxMessages) {
      data.currentRound = data.maxRounds || 4;
      mkdirSync(STATUS_DIR, { recursive: true });
      writeFileSync(MEETING_FILE, JSON.stringify(data, null, 2));
      return NextResponse.json({ done: true, totalMessages: currentIndex });
    }

    // Rate limit: 6 second gap between messages (feels like real typing time)
    const lastEntry = data.transcript[data.transcript.length - 1];
    if (lastEntry && (Date.now() - lastEntry.timestamp) < 6000) {
      return NextResponse.json({ waiting: true });
    }

    // Pick next participant (round-robin)
    const participantId = participants[currentIndex % participants.length] || 'unknown';
    const agentName = AGENT_NAMES[participantId] || participantId;
    const round = Math.floor(currentIndex / Math.max(participants.length, 2)) + 1;

    const message = generateMessage(data.topic || '', agentName, currentIndex, participants.length);

    const entry = {
      agent: agentName,
      message,
      round,
      timestamp: Date.now(),
    };

    data.transcript.push(entry);
    data.currentRound = round;
    data.lastMessage = `${agentName}: ${message}`;

    mkdirSync(STATUS_DIR, { recursive: true });
    writeFileSync(MEETING_FILE, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, entry, totalMessages: data.transcript.length });
  } catch (err: any) {
    const safeMsg = String(err?.message || 'Unknown error').replace(/[\r\n]/g, ' ');
    console.error('Meeting simulate error:', safeMsg);
    return NextResponse.json({ error: safeMsg }, { status: 500 });
  }
}
