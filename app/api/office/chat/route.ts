import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const CHAT_FILE = join(STATUS_DIR, 'chat.json');

// Ensure status dir exists
function ensureStatusDir() {
  try {
    const fs = require('fs');
    if (!fs.existsSync(STATUS_DIR)) {
      fs.mkdirSync(STATUS_DIR, { recursive: true });
    }
  } catch {}
}

function readChat(): any[] {
  try {
    if (existsSync(CHAT_FILE)) {
      return JSON.parse(readFileSync(CHAT_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

// Contextual chat prompts based on time and activity
function generateChatMessage(agentNames: string[], context?: any): { from: string; text: string; ts: number } | null {
  if (agentNames.length === 0) return null;
  
  const from = agentNames[Math.floor(Math.random() * agentNames.length)];
  const hour = new Date().getHours();
  
  // Time-based prompts
  const morningPrompts = [
    "Morning! Ready to ship some code ☕",
    "What's on the agenda today?",
    "Fresh deploy incoming 🚀",
  ];
  
  const afternoonPrompts = [
    "How's everyone doing?",
    "Making good progress today",
    "Anyone need a hand with anything?",
  ];
  
  const eveningPrompts = [
    "Wrapping up for the day",
    "Good progress today team!",
    "Tomorrow's looking good 👍",
  ];
  
  // Activity-based prompts
  const idlePrompts = [
    "Taking a quick break",
    "Anyone want coffee?",
    "Monitoring the systems",
    "Standing by for tasks",
  ];
  
  let prompts = idlePrompts;
  if (hour >= 6 && hour < 12) prompts = morningPrompts;
  else if (hour >= 12 && hour < 18) prompts = afternoonPrompts;
  else if (hour >= 18 && hour < 22) prompts = eveningPrompts;
  
  const text = prompts[Math.floor(Math.random() * prompts.length)];
  
  return {
    from,
    text,
    ts: Date.now(),
  };
}

export async function GET() {
  const chat = readChat();
  return NextResponse.json(chat);
}

export async function POST(request: Request) {
  ensureStatusDir();
  
  try {
    const body = await request.json();
    const chat = readChat();
    
    // Generate a new chat message from idle agents
    const agentNames = body.agentNames || [];
    const newMessage = generateChatMessage(agentNames);
    
    if (newMessage) {
      chat.push(newMessage);
      // Keep only last 50 messages
      const trimmed = chat.slice(-50);
      writeFileSync(CHAT_FILE, JSON.stringify(trimmed, null, 2));
      return NextResponse.json({ success: true, message: newMessage });
    }
    
    return NextResponse.json({ success: false, error: 'No agents available' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate chat' }, { status: 500 });
  }
}
