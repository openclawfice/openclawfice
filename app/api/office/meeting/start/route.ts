import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const MEETING_FILE = path.join(os.homedir(), '.openclaw', 'openclawfice-meeting.json');

/**
 * Generate a synthetic meeting transcript based on topic and participants.
 * Creates realistic back-and-forth discussion with 4-8 messages.
 */
function generateMeetingTranscript(topic: string, participants: string[], startTime: number): any[] {
  const transcript: any[] = [];
  
  // Agent name mapping (handle both IDs and display names)
  const agentNames: Record<string, string> = {
    'ocf-pm': 'Nova',
    'nova': 'Nova',
    'ocf-dev': 'Forge',
    'forge': 'Forge',
    'openclawfice': 'Pixel',
    'pixel': 'Pixel',
    'outreach': 'Scout',
    'scout': 'Scout',
    'main': 'Cipher',
    'cipher': 'Cipher',
  };

  const getName = (id: string) => agentNames[id.toLowerCase()] || id;

  // Dynamic message templates that incorporate the topic
  const messageTemplates = [
    // Opener
    [
      `Let's discuss ${topic}`,
      `Alright team, focusing on: ${topic}`,
      `Good question. Let me share my thoughts on ${topic}`,
      `This is important. Here's my perspective on ${topic}`,
    ],
    // Response
    [
      "That's a solid point. I'd add that we should also consider...",
      "Good angle. Have we thought about the implications for...",
      "Interesting approach. What if we also looked at...",
      "I see where you're going. Building on that...",
    ],
    // Counter or detail
    [
      "Fair point, though I think we need to weigh the tradeoffs carefully",
      "That could work if we also account for edge cases",
      "Agreed on the direction. Let's break down the specifics",
      "Makes sense. We should prioritize based on impact",
    ],
    // Resolution/Next steps
    [
      "Perfect. I'll take the lead on that part",
      "Sounds like a plan. Let's document this and move forward",
      "Great discussion. Next steps are clear now",
      "Agreed. Let's sync again once we have more data",
    ],
  ];

  // Build transcript with alternating participants
  const numMessages = Math.min(4 + Math.floor(Math.random() * 3), 6); // 4-6 messages
  for (let i = 0; i < numMessages; i++) {
    const participantIndex = i % participants.length;
    const agentId = participants[participantIndex];
    const round = Math.floor(i / participants.length) + 1;
    
    // Pick message from appropriate template tier
    const templateIndex = Math.min(i, messageTemplates.length - 1);
    const templates = messageTemplates[templateIndex];
    const message = templates[Math.floor(Math.random() * templates.length)];

    transcript.push({
      agent: getName(agentId),
      message,
      round,
      timestamp: startTime + (i * 5000), // 5 seconds between messages
    });
  }

  return transcript;
}

export async function POST(req: Request) {
  try {
    const { topic, participants } = await req.json();

    if (!topic || !participants || participants.length < 2) {
      return NextResponse.json(
        { error: 'Meeting requires a topic and at least 2 participants' },
        { status: 400 }
      );
    }

    // Generate synthetic transcript
    const now = Date.now();
    const transcript = generateMeetingTranscript(topic, participants, now);
    
    const meeting = {
      active: true,
      topic,
      participants, // array of agent IDs
      currentRound: Math.ceil(transcript.length / participants.length),
      maxRounds: 4,
      startedAt: now,
      lastMessage: transcript.length > 0 ? transcript[transcript.length - 1].message : `Meeting started: ${topic}`,
      transcript,
    };

    await fs.mkdir(path.dirname(MEETING_FILE), { recursive: true });
    await fs.writeFile(MEETING_FILE, JSON.stringify(meeting, null, 2));

    return NextResponse.json({ success: true, meeting });
  } catch (err: any) {
    console.error('Failed to start meeting:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to start meeting' },
      { status: 500 }
    );
  }
}
