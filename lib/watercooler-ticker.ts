import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn, execSync } from 'child_process';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const STATUS_DIR = join(OPENCLAW_DIR, '.status');
const CHAT_FILE = join(STATUS_DIR, 'chat.json');
const ACCOMPLISHMENTS_FILE = join(STATUS_DIR, 'accomplishments.json');
const OPENCLAW_CONFIG = join(OPENCLAW_DIR, 'openclaw.json');
const WATERCOOLER_MARKER = join(STATUS_DIR, 'watercooler-active.json');

const CONFIG_PATHS = [
  join(process.cwd(), 'openclawfice.config.json'),
  join(OPENCLAW_DIR, 'openclawfice.config.json'),
];

const OPENCLAW_BIN = (() => {
  try {
    return execSync('which openclaw', { encoding: 'utf-8' }).trim();
  } catch {}
  const candidates = [
    join(homedir(), '.local/node/bin/openclaw'),
    join(homedir(), '.local/bin/openclaw'),
    '/usr/local/bin/openclaw',
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return 'openclaw';
})();

const WATERCOOLER_SESSION = 'watercooler';
const AGENT_TIMEOUT = 45;
const CHECK_INTERVAL_MS = 5_000;

interface AgentInfo {
  id: string;
  name: string;
  role?: string;
  status: string;
  task?: string;
}

function ensureStatusDir() {
  try {
    if (!existsSync(STATUS_DIR)) mkdirSync(STATUS_DIR, { recursive: true });
  } catch {}
}

function readChat(): any[] {
  try {
    if (existsSync(CHAT_FILE)) return JSON.parse(readFileSync(CHAT_FILE, 'utf-8'));
  } catch {}
  return [];
}

function readOfficeConfig(): any {
  for (const path of CONFIG_PATHS) {
    if (existsSync(path)) {
      try { return JSON.parse(readFileSync(path, 'utf-8')); } catch {}
    }
  }
  return {};
}

function readAccomplishments(): any[] {
  try {
    if (existsSync(ACCOMPLISHMENTS_FILE)) return JSON.parse(readFileSync(ACCOMPLISHMENTS_FILE, 'utf-8'));
  } catch {}
  return [];
}

function discoverAgents(): AgentInfo[] {
  const result: AgentInfo[] = [];
  try {
    if (!existsSync(OPENCLAW_CONFIG)) return result;
    const cfg = JSON.parse(readFileSync(OPENCLAW_CONFIG, 'utf-8'));
    const agents = cfg.agents?.list || [];
    const defaultWs = cfg.agents?.defaults?.workspace || '';

    for (const agent of agents) {
      const ws = agent.workspace || defaultWs;
      let name = agent.id;
      let role: string | undefined;
      try {
        const idPath = join(ws, 'IDENTITY.md');
        if (existsSync(idPath)) {
          const txt = readFileSync(idPath, 'utf-8');
          const nm = txt.match(/[-*]*\s*\*\*Name:\*\*\s*(.+)/);
          if (nm) name = nm[1].trim();
          const rm = txt.match(/[-*]*\s*\*\*Role:\*\*\s*(.+)/);
          if (rm) role = rm[1].trim();
        }
      } catch {}

      let status = 'idle';
      let task: string | undefined;
      try {
        const sessFile = join(OPENCLAW_DIR, 'agents', agent.id, 'sessions', 'sessions.json');
        if (existsSync(sessFile)) {
          const sessions = JSON.parse(readFileSync(sessFile, 'utf-8'));
          const main = sessions.main || sessions[Object.keys(sessions)[0]];
          if (main && Date.now() - (main.updatedAt || 0) < 5 * 60_000) status = 'working';
        }
      } catch {}
      try {
        const sf = join(STATUS_DIR, `${agent.id}.json`);
        if (existsSync(sf)) {
          const s = JSON.parse(readFileSync(sf, 'utf-8'));
          if (s.task) task = s.task;
          if (s.status) status = s.status;
        }
      } catch {}

      result.push({ id: agent.id, name, role, status, task });
    }
  } catch {}
  return result;
}

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

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
    if (mission.priorities?.length) lines.push(`Priorities: ${mission.priorities.join(', ')}`);
    lines.push('');
  }
  lines.push('Team status:');
  for (const a of allAgents) {
    if (a.id === '_owner') continue;
    const taskStr = a.task ? ` — working on: ${a.task}` : '';
    lines.push(`- ${a.name} (${a.role || a.id}): ${a.status}${taskStr}`);
  }
  const recent = (accomplishments || [])
    .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 5);
  if (recent.length > 0) {
    lines.push('', 'Recent accomplishments:');
    for (const a of recent) lines.push(`- ${a.who}: ${a.title}`);
  }
  lines.push('');
  if (recentChat.length > 0) {
    lines.push('Recent chat:');
    for (const m of recentChat.slice(-8)) lines.push(`${m.from}: ${m.text}`);
    lines.push('', `Now reply as ${speaker.name}. Just the message text, nothing else.`);
  } else {
    lines.push(`Start a conversation as ${speaker.name}. Say something about what you're working on or ask a teammate something specific.`);
  }
  return lines.join('\n');
}

function markWatercoolerActive(agentId: string) {
  try {
    let markers: Record<string, number> = {};
    if (existsSync(WATERCOOLER_MARKER)) markers = JSON.parse(readFileSync(WATERCOOLER_MARKER, 'utf-8'));
    markers[agentId] = Date.now();
    writeFileSync(WATERCOOLER_MARKER, JSON.stringify(markers));
  } catch {}
}

function parseResponseText(output: string): string | null {
  const lines = output.trim().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().startsWith('{')) {
      try {
        const obj = JSON.parse(lines.slice(i).join('\n'));
        const text = obj?.result?.payloads?.[0]?.text;
        if (text) return text.trim();
      } catch {}
    }
  }
  return null;
}

function getAgentReply(agentId: string, prompt: string): Promise<string | null> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    const proc = spawn(OPENCLAW_BIN, [
      'agent',
      '--agent', agentId,
      '--session-id', WATERCOOLER_SESSION,
      '--thinking', 'off',
      '--timeout', String(AGENT_TIMEOUT),
      '--json',
      '--message', prompt,
    ], { env: process.env });

    const timer = setTimeout(() => {
      proc.kill();
      console.error('[watercooler-ticker] agent timed out');
      resolve(null);
    }, (AGENT_TIMEOUT + 10) * 1000);

    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    proc.on('close', () => {
      clearTimeout(timer);
      if (stderr) console.error(`[watercooler-ticker] agent stderr: ${stderr.slice(0, 200)}`);
      const text = parseResponseText(stdout);
      resolve(text);
    });

    proc.on('error', (err: Error) => {
      clearTimeout(timer);
      console.error(`[watercooler-ticker] spawn error: ${err.message}`);
      resolve(null);
    });
  });
}

function cleanReply(speakerName: string, raw: string): string {
  let text = raw;
  text = text.replace(/\*\*/g, '').replace(/^---+\s*/gm, '').replace(/^#+\s*/gm, '');
  const prefixPattern = new RegExp(`^${speakerName}:\\s*`, 'i');
  text = text.replace(prefixPattern, '');
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1);
  }
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  text = paragraphs[0] || text;
  text = text.replace(/\n/g, ' ').trim();
  if (text.length > 280) text = text.slice(0, 277) + '...';
  return text;
}

function parseInterval(str: string): number {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 45000;
  const [, num, unit] = match;
  const n = parseInt(num, 10);
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * multipliers[unit];
}

/**
 * Generate one water cooler chat message. Called by the ticker when the
 * scheduled time arrives.
 */
export async function generateChat(): Promise<{ success: boolean; message?: any; error?: string }> {
  ensureStatusDir();
  const config = readOfficeConfig();
  const wcConfig = config.waterCooler || {};

  if (wcConfig.enabled === false) return { success: false, error: 'disabled' };

  const allAgents = discoverAgents();
  const npcAgents = allAgents.filter(a => a.id !== '_owner');
  if (npcAgents.length < 2) return { success: false, error: 'need at least 2 agents' };

  const chat = readChat();
  const speaker = pickSpeaker(npcAgents, chat);
  if (!speaker) return { success: false, error: 'no speaker' };

  const accomplishments = readAccomplishments();
  const prompt = buildPrompt(speaker, allAgents, chat, config.mission, accomplishments);
  markWatercoolerActive(speaker.id);
  const reply = await getAgentReply(speaker.id, prompt);
  markWatercoolerActive(speaker.id);

  if (!reply) return { success: false, error: 'agent did not respond' };

  const text = cleanReply(speaker.name, reply);
  const newMessage = { from: speaker.name, text, ts: Date.now() };
  chat.push(newMessage);
  const maxMessages = wcConfig.maxMessages || 50;
  writeFileSync(CHAT_FILE, JSON.stringify(chat.slice(-maxMessages), null, 2));
  console.log(`[watercooler-ticker] ${speaker.name}: ${text.slice(0, 80)}${text.length > 80 ? '...' : ''}`);
  return { success: true, message: newMessage };
}

const g = globalThis as any;
if (!g.__wcTicker) g.__wcTicker = { running: false, nextChatAt: 0, generating: false };
const state: { running: boolean; nextChatAt: number; generating: boolean } = g.__wcTicker;

function computeDelay(): number {
  const config = readOfficeConfig();
  const wcConfig = config.waterCooler || {};
  const baseFreq = parseInterval(wcConfig.frequency || '45s');
  return baseFreq + (Math.random() - 0.5) * baseFreq * 0.5;
}

function scheduleNextTick() {
  const config = readOfficeConfig();
  const wcConfig = config.waterCooler || {};
  if (wcConfig.enabled === false) {
    state.nextChatAt = 0;
    state.running = false;
    return;
  }

  if (wcConfig.quiet?.enabled) {
    const tz = wcConfig.quiet.timezone || 'America/New_York';
    const hour = parseInt(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: tz }));
    const quietStart = parseInt(wcConfig.quiet.start?.split(':')[0] || '23');
    const quietEnd = parseInt(wcConfig.quiet.end?.split(':')[0] || '8');
    if (hour >= quietStart || hour < quietEnd) {
      const delay = 60_000;
      state.nextChatAt = Date.now() + delay;
      setTimeout(runOneTick, delay);
      return;
    }
  }

  const delay = computeDelay();
  state.nextChatAt = Date.now() + delay;
  setTimeout(runOneTick, delay);
}

async function runOneTick() {
  if (!state.running) return;
  state.generating = true;
  console.log('[watercooler-ticker] Generating chat...');
  try {
    const result = await generateChat();
    if (!result.success) {
      console.log(`[watercooler-ticker] Generation failed: ${result.error}`);
    }
  } catch (err) {
    console.error('[watercooler-ticker] Error:', err);
  } finally {
    state.generating = false;
    if (state.running) scheduleNextTick();
  }
}

/**
 * Start the server-side water cooler ticker. Uses recursive setTimeout
 * for reliability across Next.js dev mode hot reloads.
 */
export function startTicker(): void {
  if (state.running) return;
  state.running = true;
  console.log('[watercooler-ticker] Starting server-side ticker');
  scheduleNextTick();
}

export function stopTicker(): void {
  state.running = false;
  state.nextChatAt = 0;
  state.generating = false;
  console.log('[watercooler-ticker] Stopped');
}

/** Seconds until the next scheduled chat, or -1 if generating, or 0 if disabled. */
export function getNextChatIn(): number {
  if (state.generating) return -1;
  if (state.nextChatAt === 0) return 0;
  return Math.max(0, Math.round((state.nextChatAt - Date.now()) / 1000));
}
