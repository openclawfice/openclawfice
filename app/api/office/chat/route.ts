import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const CHAT_FILE = join(STATUS_DIR, 'chat.json');
const CONFIG_PATHS = [
  join(process.cwd(), 'openclawfice.config.json'),
  join(homedir(), '.openclaw', 'openclawfice.config.json'),
];

function ensureStatusDir() {
  try {
    if (!existsSync(STATUS_DIR)) mkdirSync(STATUS_DIR, { recursive: true });
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

function readOfficeConfig(): any {
  for (const path of CONFIG_PATHS) {
    if (existsSync(path)) {
      try {
        return JSON.parse(readFileSync(path, 'utf-8'));
      } catch {}
    }
  }
  return {};
}

/**
 * Generate a water-cooler message. When a mission is configured, messages
 * reference actual work, priorities, and status — keeping the ambient chat
 * productive rather than decorative.
 */
function generateChatMessage(
  agentNames: string[],
  mission?: { goal?: string; priorities?: string[] },
  agentContexts?: Record<string, { task?: string; status?: string }>,
): { from: string; text: string; ts: number } | null {
  if (agentNames.length === 0) return null;

  const from = agentNames[Math.floor(Math.random() * agentNames.length)];
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // Build a pool of messages, weighted toward mission-relevant ones
  const pool: string[] = [];

  // If mission is set, generate mission-relevant messages
  if (mission?.goal) {
    pool.push(
      `Focused on the mission: ${mission.goal}`,
      `Checking what I can do next to advance the goal`,
      `Any blockers I should know about?`,
      `What's highest priority right now?`,
    );
    if (mission.priorities?.length) {
      const p = pick(mission.priorities);
      pool.push(
        `Working toward: ${p}`,
        `How are we doing on "${p}"?`,
        `I think "${p}" is the most impactful thing right now`,
        `Making progress on ${p}`,
      );
    }
  }

  // Context-aware: reference what the agent is actually doing
  if (agentContexts) {
    const ctx = agentContexts[from];
    if (ctx?.task) {
      pool.push(
        `Working on: ${ctx.task}`,
        `Almost done with ${ctx.task}`,
        `Update: ${ctx.task} is progressing well`,
      );
    }

    // Reference what teammates are doing
    const others = Object.entries(agentContexts).filter(([name]) => name !== from);
    if (others.length > 0) {
      const [teammate, tCtx] = pick(others as any) as any;
      if (tCtx?.task) {
        pool.push(`Nice work on ${tCtx.task}, ${teammate}!`);
      }
    }
  }

  // Fallback ambient messages (generic but work-oriented)
  pool.push(
    'Ready for the next task',
    'Checking my queue',
    'What needs attention?',
    'Standing by for assignments',
  );

  return {
    from,
    text: pick(pool),
    ts: Date.now(),
  };
}

export async function GET() {
  return NextResponse.json(readChat());
}

export async function POST(request: Request) {
  ensureStatusDir();

  try {
    const body = await request.json();
    const config = readOfficeConfig();
    const waterCoolerConfig = config.waterCooler || {};

    if (waterCoolerConfig.enabled === false) {
      return NextResponse.json({ success: false, error: 'Water cooler disabled' });
    }

    const chat = readChat();
    const agentNames: string[] = body.agentNames || [];
    const agentContexts: Record<string, { task?: string; status?: string }> = body.contexts || {};

    const newMessage = generateChatMessage(agentNames, config.mission, agentContexts);

    if (newMessage) {
      chat.push(newMessage);
      const maxMessages = waterCoolerConfig.maxMessages || 50;
      const trimmed = chat.slice(-maxMessages);
      writeFileSync(CHAT_FILE, JSON.stringify(trimmed, null, 2));
      return NextResponse.json({ success: true, message: newMessage });
    }

    return NextResponse.json({ success: false, error: 'No agents available' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate chat' }, { status: 500 });
  }
}
