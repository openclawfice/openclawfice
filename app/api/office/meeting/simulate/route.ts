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
    // Round 1 non-opener: each agent responds in character
    if (isAboutSecurity) {
      const securityResponses: Record<string, string> = {
        'Cipher': 'I checked the CodeQL findings — 3 real vulnerabilities, rest are false positives for localhost. The log injection issues need fixing now',
        'Forge': 'The main risk is malicious apps on the same machine hitting our API. Token auth would close that attack vector completely',
        'Nova': 'From a product trust perspective, users see security badges on our landing page. We need to back that up with real protection',
        'Pixel': 'I already hardened the message API with input validation. But we need auth tokens on ALL endpoints, not just one',
        'Scout': 'Competitors are marketing their security as a feature. If we ship without auth, that\'s an easy attack vector for their sales team',
      };
      return securityResponses[agentName] || `${style.opener.toLowerCase()} the security implications here are significant`;
    }
    if (isAboutFeature) {
      const featureResponses: Record<string, string> = {
        'Cipher': 'I can have the infrastructure ready in a day. The question is whether we scope it right',
        'Forge': 'This is a 2-day build, max. I\'ve already explored the architecture for something similar',
        'Nova': 'Let\'s define the MVP scope first. What\'s the minimum that delivers value to users?',
        'Pixel': 'I\'d start with the API layer and work up. Clean architecture means we can iterate faster',
        'Scout': 'From a growth angle — will this feature help with acquisition or retention? That determines priority',
      };
      return featureResponses[agentName] || `${style.agree} I think we can scope this tightly`;
    }
    if (isAboutBug) return `${style.push} How critical is this? If it's user-facing, we drop everything and fix it now`;
    return `${style.opener.toLowerCase()} I see this differently. Let me explain my angle`;
  }

  // Round 2: Deeper discussion — more debate, specific to topic
  if (position < totalParticipants * 2) {
    if (isAboutSecurity) {
      const round2Sec: Record<string, string> = {
        'Cipher': 'Proposal: generate a random token on first run, store it in the config, require it in X-Auth-Token header on every request',
        'Forge': 'I can implement token auth + CORS in about 3 hours. The question is do we block launch for this or ship it Week 1?',
        'Nova': 'My recommendation: don\'t block launch. But put it on the Week 1 post-launch roadmap as P0. Users won\'t hit this in the first 48 hours',
        'Pixel': 'If we\'re shipping without auth, at minimum add rate limiting and CORS headers. That covers 80% of the risk for 20% of the effort',
        'Scout': 'Agreed with the phased approach. Ship now, secure next week. Our early users are technical — they understand localhost',
      };
      return round2Sec[agentName] || `${style.push} We need a concrete plan with deadlines, not just "we\'ll do it later"`;
    }
    if (isAboutLaunch) return `The launch itself isn't blocked. ${style.agree} But we need a monitoring plan for the first 24 hours`;
    if (isAboutPriority) return `${style.push} If we try to do everything we'll ship nothing. Let's pick the top 2 and commit hard`;
    if (hasOr) return `I'm leaning toward the first option. ${style.push.toLowerCase()} But let's look at what the data says before committing`;
    return `Building on what was said — ${style.push.toLowerCase()} We need concrete next steps with owners and deadlines`;
  }

  // Round 3: Resolution forming — action items + ownership
  if (position < totalParticipants * 3) {
    if (isAboutSecurity) {
      const round3Sec: Record<string, string> = {
        'Cipher': 'OK action plan: (1) Forge implements token auth by Wednesday, (2) I add CORS + rate limiting, (3) Pixel validates with the existing test suite',
        'Forge': 'I\'m on it. Token generation + validation middleware, done by end of day Wednesday. Will open a PR for review',
        'Nova': 'I\'ll update the security section of our docs and landing page once the auth is live. This becomes a feature, not just a fix',
        'Pixel': 'I\'ll write the integration tests. We should have automated checks that verify tokens are required on every endpoint',
        'Scout': 'Once auth is live, I\'ll update our pitch — "enterprise-grade localhost security" is a real differentiator',
      };
      return round3Sec[agentName] || `${style.conclude} The security plan is clear — let's execute`;
    }
    if (isAboutFeature) return `Consensus is forming. Let's timebox this to 2 days and review. ${style.conclude}`;
    if (isAboutBug) return `${style.agree} Fix it this sprint. ${style.conclude}`;
    return `Good points all around. ${style.conclude} Clear owners, clear deadlines — let's move`;
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
