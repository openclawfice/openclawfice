import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const CHAT_FILE = join(STATUS_DIR, 'chat.json');
const ACCOMPLISHMENTS_FILE = join(STATUS_DIR, 'accomplishments.json');
const CONFIG_PATHS = [
  join(process.cwd(), 'openclawfice.config.json'),
  join(homedir(), '.openclaw', 'openclawfice.config.json'),
];

const OPENCLAW_BIN = join(homedir(), '.local', 'node', 'bin', 'openclaw');
const WATERCOOLER_SESSION = 'watercooler';
const AGENT_TIMEOUT = 20;

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

function readAccomplishments(): any[] {
  try {
    if (existsSync(ACCOMPLISHMENTS_FILE)) {
      return JSON.parse(readFileSync(ACCOMPLISHMENTS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

interface AgentInfo {
  id: string;
  name: string;
  role?: string;
  status: string;
  task?: string;
}

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Pick which agent should speak next. Avoids the last speaker,
 * and if someone was mentioned by name they get priority.
 */
function pickSpeaker(agents: AgentInfo[], recentChat: any[]): AgentInfo | null {
  if (agents.length === 0) return null;
  const last = recentChat[recentChat.length - 1];

  if (last) {
    const mentioned = agents.find(
      a => a.name !== last.from && last.text?.toLowerCase().includes(a.name.toLowerCase()),
    );
    if (mentioned) return mentioned;

    const others = agents.filter(a => a.name !== last.from);
    if (others.length > 0) return pick(others);
  }

  return pick(agents);
}

/**
 * Build a concise prompt for the agent's water cooler turn.
 * Gives them the recent chat + team context so they can reply naturally.
 */
function buildPrompt(
  speaker: AgentInfo,
  allAgents: AgentInfo[],
  recentChat: any[],
  mission?: { goal?: string; priorities?: string[] },
  accomplishments?: any[],
): string {
  const lines: string[] = [];

  lines.push(
    'WATER COOLER CHAT — reply with ONE short message (1-2 sentences, under 200 characters).',
    'Rules: plain text only, no markdown/bold/headers. No prefixing with your name. No meta-commentary.',
    'Be casual and specific. Reference real work. If asked a question, answer it briefly.',
    'Do NOT use tools or start tasks. Just reply with the message text and nothing else.',
    '',
  );

  if (mission?.goal) {
    lines.push(`Team mission: ${mission.goal}`);
    if (mission.priorities?.length) {
      lines.push(`Priorities: ${mission.priorities.join(', ')}`);
    }
    lines.push('');
  }

  lines.push('Team status:');
  for (const a of allAgents) {
    if (a.id === '_owner') continue;
    const taskStr = a.task ? ` — working on: ${a.task}` : '';
    lines.push(`- ${a.name} (${a.role || a.id}): ${a.status}${taskStr}`);
  }

  // Add recent accomplishments
  const recent = (accomplishments || [])
    .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 5);
  if (recent.length > 0) {
    lines.push('', 'Recent accomplishments:');
    for (const a of recent) {
      lines.push(`- ${a.who}: ${a.title}`);
    }
  }

  lines.push('');

  if (recentChat.length > 0) {
    lines.push('Recent chat:');
    for (const m of recentChat.slice(-8)) {
      lines.push(`${m.from}: ${m.text}`);
    }
    lines.push('', `Now reply as ${speaker.name}. Just the message text, nothing else.`);
  } else {
    lines.push(`Start a conversation as ${speaker.name}. Say something about what you're working on or ask a teammate something specific.`);
  }

  return lines.join('\n');
}

/**
 * Send a message to an agent via the gateway and get their response.
 */
function getAgentReply(agentId: string, prompt: string): string | null {
  try {
    const escaped = prompt.replace(/'/g, "'\\''");
    const cmd = [
      OPENCLAW_BIN, 'agent',
      '--agent', agentId,
      '--session-id', WATERCOOLER_SESSION,
      '--thinking', 'off',
      '--timeout', String(AGENT_TIMEOUT),
      '--json',
      '--message', `'${escaped}'`,
    ].join(' ');

    const output = execSync(cmd, {
      encoding: 'utf-8',
      timeout: (AGENT_TIMEOUT + 5) * 1000,
      env: process.env,
    });

    // Parse the JSON output — find the last JSON object in stdout
    const lines = output.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{')) {
        try {
          const obj = JSON.parse(lines.slice(i).join('\n'));
          const text = obj?.result?.payloads?.[0]?.text;
          if (text) return text.trim();
        } catch {}
      }
    }
  } catch (err: any) {
    // Try to parse response from stderr/stdout even on non-zero exit
    const out = err.stdout || '';
    const lines = out.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim().startsWith('{')) {
        try {
          const obj = JSON.parse(lines.slice(i).join('\n'));
          const text = obj?.result?.payloads?.[0]?.text;
          if (text) return text.trim();
        } catch {}
      }
    }
  }
  return null;
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

    // Allow adding a user message to the chat
    if (body.type === 'user_message' && body.from && body.text) {
      const chat = readChat();
      chat.push({ from: body.from, text: body.text, ts: Date.now() });
      const maxMessages = waterCoolerConfig.maxMessages || 50;
      writeFileSync(CHAT_FILE, JSON.stringify(chat.slice(-maxMessages), null, 2));
      return NextResponse.json({ success: true });
    }

    if (waterCoolerConfig.enabled === false) {
      return NextResponse.json({ success: false, error: 'Water cooler disabled' });
    }

    const chat = readChat();
    const agentNames: string[] = body.agentNames || [];
    const allAgents: AgentInfo[] = body.allAgents || [];

    // Map name -> agent ID for gateway routing
    const nameToAgent: Record<string, AgentInfo> = {};
    for (const a of allAgents) {
      nameToAgent[a.name] = a;
    }

    // Pick who speaks
    const npcAgents = allAgents.filter(a => a.id !== '_owner');
    const speaker = pickSpeaker(npcAgents, chat);
    if (!speaker) {
      return NextResponse.json({ success: false, error: 'No agents available' });
    }

    const accomplishments = readAccomplishments();
    const prompt = buildPrompt(speaker, allAgents, chat, config.mission, accomplishments);
    const reply = getAgentReply(speaker.id, prompt);

    if (reply) {
      let text = reply;
      // Strip markdown artifacts
      text = text.replace(/\*\*/g, '').replace(/^---+\s*/gm, '').replace(/^#+\s*/gm, '');
      // Remove any "Name:" prefix
      const prefixPattern = new RegExp(`^${speaker.name}:\\s*`, 'i');
      text = text.replace(prefixPattern, '');
      // Remove quotes wrapping
      if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
        text = text.slice(1, -1);
      }
      // Take only the first meaningful line/paragraph if model was verbose
      const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
      text = paragraphs[0] || text;
      // Collapse newlines within the paragraph
      text = text.replace(/\n/g, ' ').trim();
      // Truncate if still too long
      if (text.length > 280) text = text.slice(0, 277) + '...';

      const newMessage = { from: speaker.name, text, ts: Date.now() };
      chat.push(newMessage);
      const maxMessages = waterCoolerConfig.maxMessages || 50;
      writeFileSync(CHAT_FILE, JSON.stringify(chat.slice(-maxMessages), null, 2));
      return NextResponse.json({ success: true, message: newMessage });
    }

    return NextResponse.json({ success: false, error: 'Agent did not respond' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate chat' }, { status: 500 });
  }
}
