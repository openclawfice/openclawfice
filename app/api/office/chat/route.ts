import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const CHAT_FILE = join(STATUS_DIR, 'chat.json');
const CONFIG_PATHS = [
  join(process.cwd(), 'openclawfice.config.json'),
  join(homedir(), '.openclaw', 'openclawfice.config.json'),
];

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

/**
 * Read waterCooler config
 */
function readWaterCoolerConfig(): any {
  for (const path of CONFIG_PATHS) {
    if (existsSync(path)) {
      try {
        const config = JSON.parse(readFileSync(path, 'utf-8'));
        return config.waterCooler || {};
      } catch {}
    }
  }
  
  // Defaults
  return {
    enabled: true,
    frequency: '45s',
    style: 'casual',
    context: true,
    maxMessages: 50,
    quiet: { enabled: false },
  };
}

/**
 * Generate chat message with style variants
 */
function generateChatMessage(
  agentNames: string[], 
  style: string = 'casual',
  useContext: boolean = true,
  personality?: string,
  agentContext?: any
): { from: string; text: string; ts: number } | null {
  if (agentNames.length === 0) return null;
  
  const from = agentNames[Math.floor(Math.random() * agentNames.length)];
  const hour = new Date().getHours();
  
  // Style-specific prompts
  const casualMorning = [
    "Morning! Ready to ship some code ☕",
    "What's on the agenda today?",
    "Fresh deploy incoming 🚀",
    "Coffee first, then we conquer the backlog ☕",
  ];
  
  const casualAfternoon = [
    "How's everyone doing?",
    "Making good progress today 💪",
    "Anyone need a hand with anything?",
    "Lunch break was great, back to it!",
  ];
  
  const casualEvening = [
    "Wrapping up for the day",
    "Good progress today team! 🎉",
    "Tomorrow's looking good 👍",
    "Time to push and call it a day",
  ];
  
  const casualIdle = [
    "Taking a quick break",
    "Anyone want coffee? ☕",
    "Monitoring the systems 👀",
    "Standing by for tasks",
    "Ready when you are!",
  ];
  
  const professionalMorning = [
    "Good morning. Beginning daily tasks.",
    "Ready to start the day.",
    "Morning standup complete.",
  ];
  
  const professionalAfternoon = [
    "Progress update: on track.",
    "Available for collaboration.",
    "Continuing assigned tasks.",
  ];
  
  const professionalEvening = [
    "Completing final tasks for today.",
    "Daily objectives met.",
    "Preparing for tomorrow.",
  ];
  
  const professionalIdle = [
    "Standing by.",
    "Available for assignment.",
    "Monitoring queue.",
  ];
  
  const minimalMorning = ["Morning", "Ready", "Start"];
  const minimalAfternoon = ["Progress good", "Available", "Working"];
  const minimalEvening = ["Wrapping up", "Done", "Tomorrow"];
  const minimalIdle = ["Idle", "Available", "Ready"];
  
  // Context-aware prompts (if enabled and context provided)
  let contextPrompts: string[] = [];
  if (useContext && agentContext) {
    const task = agentContext.task || agentContext.lastTask;
    if (task && style === 'casual') {
      contextPrompts = [
        `Just wrapped up: ${task} ✅`,
        `Working on: ${task}`,
        `Almost done with ${task}!`,
      ];
    } else if (task && style === 'professional') {
      contextPrompts = [
        `Task completed: ${task}`,
        `In progress: ${task}`,
      ];
    }
  }
  
  // Select prompt set based on style and time
  let prompts: string[] = [];
  
  if (style === 'minimal') {
    if (hour >= 6 && hour < 12) prompts = minimalMorning;
    else if (hour >= 12 && hour < 18) prompts = minimalAfternoon;
    else if (hour >= 18 && hour < 22) prompts = minimalEvening;
    else prompts = minimalIdle;
  } else if (style === 'professional') {
    if (hour >= 6 && hour < 12) prompts = professionalMorning;
    else if (hour >= 12 && hour < 18) prompts = professionalAfternoon;
    else if (hour >= 18 && hour < 22) prompts = professionalEvening;
    else prompts = professionalIdle;
  } else {
    // casual (default)
    if (hour >= 6 && hour < 12) prompts = casualMorning;
    else if (hour >= 12 && hour < 18) prompts = casualAfternoon;
    else if (hour >= 18 && hour < 22) prompts = casualEvening;
    else prompts = casualIdle;
  }
  
  // Mix in context prompts if available
  if (contextPrompts.length > 0) {
    prompts = [...prompts, ...contextPrompts];
  }
  
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
    const config = readWaterCoolerConfig();
    
    // Check if water cooler is enabled
    if (config.enabled === false) {
      return NextResponse.json({ success: false, error: 'Water cooler disabled' });
    }
    
    const chat = readChat();
    
    // Generate a new chat message from idle agents
    const agentNames = body.agentNames || [];
    const agentContext = body.context;
    const style = config.style || 'casual';
    const useContext = config.context !== false;
    const personality = config.personality?.enabled ? config.personality.instructions : undefined;
    
    const newMessage = generateChatMessage(agentNames, style, useContext, personality, agentContext);
    
    if (newMessage) {
      chat.push(newMessage);
      
      // Apply configured message limit
      const maxMessages = config.maxMessages || 50;
      const trimmed = chat.slice(-maxMessages);
      
      writeFileSync(CHAT_FILE, JSON.stringify(trimmed, null, 2));
      return NextResponse.json({ success: true, message: newMessage });
    }
    
    return NextResponse.json({ success: false, error: 'No agents available' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate chat' }, { status: 500 });
  }
}
