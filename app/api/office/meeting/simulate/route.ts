import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const MEETING_FILE = path.join(os.homedir(), '.openclaw', 'openclawfice-meeting.json');

/**
 * Meeting Conversation Simulator
 * 
 * Generates realistic back-and-forth dialogue between agents in a meeting.
 * Called periodically by the frontend to advance the conversation.
 */

// Conversation templates based on meeting topics
const CONVERSATION_TEMPLATES: Record<string, Array<{ agent: number; messages: string[] }>> = {
  default: [
    { agent: 0, messages: [
      "Let me share my perspective on {topic}.",
      "I think we should approach {topic} systematically.",
      "Here's what I'm seeing with {topic}...",
      "My take on {topic} is...",
    ]},
    { agent: 1, messages: [
      "That's a good point. I'd add that...",
      "I see it differently. Consider this...",
      "Building on that idea...",
      "Interesting angle. What if we...",
    ]},
    { agent: 0, messages: [
      "Fair point. Though I think...",
      "That could work if we also...",
      "Good insight. How about...",
      "I see where you're going...",
    ]},
    { agent: 1, messages: [
      "Exactly. And we could...",
      "That makes sense. We should...",
      "Agreed. Let's also consider...",
      "Yes! And if we combine that with...",
    ]},
  ],
  technical: [
    { agent: 0, messages: [
      "Looking at the architecture for {topic}...",
      "From a technical standpoint on {topic}...",
      "The implementation of {topic} could be...",
    ]},
    { agent: 1, messages: [
      "What about performance implications?",
      "How does that scale?",
      "Have we considered edge cases?",
    ]},
    { agent: 0, messages: [
      "Good catch. We'd handle that by...",
      "Performance should be fine because...",
      "Edge cases are covered with...",
    ]},
    { agent: 1, messages: [
      "That works. Let's also add...",
      "Makes sense. We should document...",
      "Solid approach. One more thing...",
    ]},
  ],
  strategy: [
    { agent: 0, messages: [
      "Strategically, {topic} positions us to...",
      "From a business perspective on {topic}...",
      "The opportunity with {topic} is...",
    ]},
    { agent: 1, messages: [
      "What's the timeline looking like?",
      "What metrics are we tracking?",
      "How does this align with our goals?",
    ]},
    { agent: 0, messages: [
      "Timeline is roughly...",
      "Key metrics would be...",
      "This aligns with our goal to...",
    ]},
    { agent: 1, messages: [
      "Perfect. I'll track that.",
      "That works. Let's set up...",
      "Good plan. Next steps are...",
    ]},
  ],
};

// Detect conversation style from topic
function getConversationStyle(topic: string): 'technical' | 'strategy' | 'default' {
  const lowerTopic = topic.toLowerCase();
  if (lowerTopic.includes('code') || lowerTopic.includes('implement') || 
      lowerTopic.includes('bug') || lowerTopic.includes('feature') ||
      lowerTopic.includes('api') || lowerTopic.includes('database')) {
    return 'technical';
  }
  if (lowerTopic.includes('strategy') || lowerTopic.includes('launch') ||
      lowerTopic.includes('marketing') || lowerTopic.includes('user') ||
      lowerTopic.includes('growth') || lowerTopic.includes('plan')) {
    return 'strategy';
  }
  return 'default';
}

// Generate a message for a specific round
function generateMessage(
  template: Array<{ agent: number; messages: string[] }>,
  participants: string[],
  topic: string,
  round: number,
  turnInRound: number,
): { agent: string; message: string } {
  const templateIndex = Math.min(turnInRound, template.length - 1);
  const turn = template[templateIndex];
  const agentIndex = turn.agent % participants.length;
  const agent = participants[agentIndex];
  
  // Pick a random message from the template
  const messages = turn.messages;
  const messageTemplate = messages[Math.floor(Math.random() * messages.length)];
  
  // Replace {topic} placeholder
  const message = messageTemplate.replace('{topic}', topic);
  
  return { agent, message };
}

export async function POST() {
  try {
    // Read current meeting state
    const data = await fs.readFile(MEETING_FILE, 'utf-8');
    const meeting = JSON.parse(data);

    if (!meeting.active) {
      return NextResponse.json({ error: 'No active meeting' }, { status: 400 });
    }

    // Initialize transcript if not present
    if (!meeting.transcript) {
      meeting.transcript = [];
    }

    const { currentRound, maxRounds, participants, topic, transcript } = meeting;

    // Don't add more messages if meeting is over
    if (currentRound > maxRounds) {
      return NextResponse.json({ success: true, meeting });
    }

    // Determine conversation style
    const style = getConversationStyle(topic || 'discussion');
    const template = CONVERSATION_TEMPLATES[style];

    // Calculate how many messages should exist for this round
    const messagesPerRound = 2; // Back and forth between 2 agents
    const expectedMessages = (currentRound - 1) * messagesPerRound;
    const currentMessages = transcript.filter((m: any) => m.round < currentRound).length;
    const messagesInCurrentRound = transcript.filter((m: any) => m.round === currentRound).length;

    // Add a new message if we're behind schedule
    if (messagesInCurrentRound < messagesPerRound) {
      const newMessage = generateMessage(
        template,
        participants,
        topic || 'this topic',
        currentRound,
        messagesInCurrentRound,
      );

      transcript.push({
        agent: newMessage.agent,
        message: newMessage.message,
        round: currentRound,
        timestamp: Date.now(),
      });

      // Update lastMessage
      meeting.lastMessage = `${newMessage.agent}: ${newMessage.message}`;

      // Advance round if we completed this one
      if (messagesInCurrentRound + 1 >= messagesPerRound && currentRound < maxRounds) {
        meeting.currentRound++;
      }

      // Save updated meeting
      await fs.writeFile(MEETING_FILE, JSON.stringify(meeting, null, 2));
    }

    return NextResponse.json({ success: true, meeting });
  } catch (err: any) {
    console.error('Failed to simulate meeting:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to simulate meeting' },
      { status: 500 }
    );
  }
}
