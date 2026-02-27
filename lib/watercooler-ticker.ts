import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn, execSync } from 'child_process';
import { randomUUID } from 'crypto';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const STATUS_DIR = join(OPENCLAW_DIR, '.status');
const CHAT_FILE = join(STATUS_DIR, 'chat.json');
const INSIGHTS_FILE = join(STATUS_DIR, 'insights.json');
const ACCOMPLISHMENTS_FILE = join(STATUS_DIR, 'accomplishments.json');
const OPENCLAW_CONFIG = join(OPENCLAW_DIR, 'openclaw.json');

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

// All water cooler messages go through ONE dedicated session on a dynamically
// chosen host agent. This keeps the water cooler isolated from work threads.
const WC_SESSION_ID = 'watercooler-room';
const AGENT_TIMEOUT = 45;

/**
 * Pick the least-busy non-owner agent as the watercooler host for this message.
 * Rotates dynamically so we don't contend with agents doing autowork.
 * The prompt carries full thread context, so changing host mid-thread is fine.
 */
function pickHostAgent(agents: AgentInfo[]): string {
  const npc = agents.filter(a => a.id !== '_owner');
  if (npc.length === 0) return 'main';
  const idle = npc.filter(a => a.status !== 'working');
  if (idle.length > 0) return idle[Math.floor(Math.random() * idle.length)].id;
  return npc[Math.floor(Math.random() * npc.length)].id;
}

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase = 'take' | 'hunch' | 'suggestion';
const PHASE_ORDER: Phase[] = ['take', 'hunch', 'suggestion'];

interface ChatMessage {
  from: string;
  text: string;
  ts: number;
  phase?: Phase;
  threadId?: string;
}

interface AgentInfo {
  id: string;
  name: string;
  role?: string;
  vibe?: string;
  creature?: string;
  identity?: string; // full IDENTITY.md text for soul injection
  status: string;
  task?: string;
}

export interface Insight {
  threadId: string;
  take: { from: string; text: string; ts: number };
  hunch: { from: string; text: string; ts: number };
  suggestion: { from: string; text: string; ts: number };
  completedAt: number;
  consumedBy: string[];
}

interface ThreadState {
  threadId: string;
  phase: Phase;
  messages: ChatMessage[];
  participants: string[];
}

// ─── File I/O ───────────────────────────────────────────────────────────────

function ensureStatusDir() {
  try {
    if (!existsSync(STATUS_DIR)) mkdirSync(STATUS_DIR, { recursive: true });
  } catch {}
}

function readChat(): ChatMessage[] {
  try {
    if (existsSync(CHAT_FILE)) return JSON.parse(readFileSync(CHAT_FILE, 'utf-8'));
  } catch {}
  return [];
}

function writeChat(chat: ChatMessage[]) {
  ensureStatusDir();
  writeFileSync(CHAT_FILE, JSON.stringify(chat.slice(-80), null, 2));
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

export function readInsights(): Insight[] {
  try {
    if (existsSync(INSIGHTS_FILE)) return JSON.parse(readFileSync(INSIGHTS_FILE, 'utf-8'));
  } catch {}
  return [];
}

function writeInsights(insights: Insight[]) {
  ensureStatusDir();
  writeFileSync(INSIGHTS_FILE, JSON.stringify(insights.slice(-50), null, 2));
}

// ─── Agent Discovery ────────────────────────────────────────────────────────

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
      let vibe: string | undefined;
      let creature: string | undefined;
      let identity: string | undefined;
      try {
        const idPath = join(ws, 'IDENTITY.md');
        if (existsSync(idPath)) {
          const txt = readFileSync(idPath, 'utf-8');
          identity = txt;
          const nm = txt.match(/[-*]*\s*\*\*Name:\*\*\s*(.+)/);
          if (nm) name = nm[1].trim();
          const rm = txt.match(/[-*]*\s*\*\*Role:\*\*\s*(.+)/);
          if (rm) role = rm[1].trim();
          const vm = txt.match(/[-*]*\s*\*\*Vibe:\*\*\s*(.+)/);
          if (vm) vibe = vm[1].trim();
          const cm = txt.match(/[-*]*\s*\*\*Creature:\*\*\s*(.+)/);
          if (cm) creature = cm[1].trim();
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

      result.push({ id: agent.id, name, role, vibe, creature, identity, status, task });
    }
  } catch {}
  return result;
}

// ─── Speaker Selection ──────────────────────────────────────────────────────

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function pickSpeakerForPhase(
  phase: Phase,
  idleAgents: AgentInfo[],
  thread: ThreadState,
): AgentInfo | null {
  if (idleAgents.length === 0) return null;

  if (phase === 'take') return pick(idleAgents);

  const alreadySpoke = new Set(thread.participants);
  const fresh = idleAgents.filter(a => !alreadySpoke.has(a.name));
  if (fresh.length > 0) return pick(fresh);

  const lastSpeaker = thread.messages[thread.messages.length - 1]?.from;
  const others = idleAgents.filter(a => a.name !== lastSpeaker);
  return others.length > 0 ? pick(others) : pick(idleAgents);
}

// ─── Prompt Building ────────────────────────────────────────────────────────

function buildRoster(allAgents: AgentInfo[], speakerId?: string): string {
  return allAgents
    .filter(a => a.id !== '_owner')
    .map(a => {
      const you = a.id === speakerId ? ' (you)' : '';
      const vibeStr = a.vibe ? ` | ${a.vibe}` : '';
      return `- ${a.name}${you} (${a.role || a.creature || a.id}${vibeStr}): ${a.status}${a.task ? ` — ${a.task}` : ''}`;
    })
    .join('\n');
}

function buildSoulBlock(agent: AgentInfo): string {
  const parts: string[] = [];
  parts.push(`Name: ${agent.name}`);
  if (agent.role) parts.push(`Role: ${agent.role}`);
  if (agent.creature) parts.push(`Type: ${agent.creature}`);
  if (agent.vibe) parts.push(`Personality: ${agent.vibe}`);
  return parts.join('\n');
}

function buildPrompt(
  phase: Phase,
  speaker: AgentInfo,
  allAgents: AgentInfo[],
  thread: ThreadState | null,
  mission?: { goal?: string; priorities?: string[] },
  accomplishments?: any[],
): string {
  const lines: string[] = [];

  // System framing with full identity injection
  lines.push(
    `THIS IS THE WATER COOLER THREAD — a dedicated space for team brainstorming.`,
    '',
    `You ARE ${speaker.name}. Embody this identity fully:`,
    buildSoulBlock(speaker),
    '',
    `Speak in ${speaker.name}'s voice and personality. Draw from their unique perspective,`,
    `expertise, and way of thinking. Don't be generic — be distinctly ${speaker.name}.`,
    `Reply with ONLY the message text. No tools, no actions, no markdown.`,
    '',
  );

  // Phase-specific instructions
  if (phase === 'take') {
    lines.push(
      'PHASE: TAKE (share an observation)',
      'Start a new discussion thread. Share something specific you\'ve noticed or',
      'discovered from your work — a pattern, gap, surprising data point, or connection.',
      'Be concrete and grounded, not vague. Frame it as an observation.',
    );
  } else if (phase === 'hunch' && thread) {
    lines.push(
      'PHASE: HUNCH (build a hypothesis)',
      `${thread.messages[0].from} observed: "${thread.messages[0].text}"`,
      '',
      'Build on this with a hunch — a hypothesis, intuition, or "what if".',
      'Connect it to something you know from your own work. Think out loud.',
    );
  } else if (phase === 'suggestion' && thread) {
    lines.push(
      'PHASE: SUGGESTION (propose a concrete action)',
      `${thread.messages[0].from} observed: "${thread.messages[0].text}"`,
      `${thread.messages[1].from} hypothesized: "${thread.messages[1].text}"`,
      '',
      'Close this thread with a specific, actionable suggestion.',
      'Name the task AND who should do it. Be concrete.',
    );
  }

  lines.push(
    '',
    'Rules: 1-2 sentences, under 200 chars. Plain text only. Don\'t prefix with your name.',
    '',
  );

  if (mission?.goal) {
    lines.push(`Mission: ${mission.goal}`);
    if (mission.priorities?.length) lines.push(`Priorities: ${mission.priorities.join(', ')}`);
    lines.push('');
  }

  lines.push('Team:', buildRoster(allAgents, speaker.id));

  const recent = (accomplishments || [])
    .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 5);
  if (recent.length > 0) {
    lines.push('', 'Recent accomplishments:');
    for (const a of recent) lines.push(`- ${a.who}: ${a.title}`);
  }

  lines.push('', `Now reply as ${speaker.name}. Just the message text, nothing else.`);
  return lines.join('\n');
}

// ─── Dedicated Thread Communication ─────────────────────────────────────────
// All water cooler messages route through ONE session on ONE host agent.
// The prompt tells the host to roleplay as whichever team member's turn it is.
// This keeps the water cooler completely out of every agent's work context.

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

function sendToWatercoolerThread(host: string, prompt: string): Promise<string | null> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let resolved = false;
    const done = (result: string | null) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      resolve(result);
    };

    console.log(`[watercooler] → dedicated thread (session=${WC_SESSION_ID}, host=${host}, ${prompt.length} chars)`);
    const proc = spawn(OPENCLAW_BIN, [
      'agent',
      '--agent', host,
      '--session-id', WC_SESSION_ID,
      '--thinking', 'off',
      '--timeout', String(AGENT_TIMEOUT),
      '--json',
      '--message', prompt,
    ], { env: process.env, stdio: ['pipe', 'pipe', 'pipe'] });

    const timer = setTimeout(() => {
      console.error(`[watercooler] Thread timed out (pid ${proc.pid})`);
      proc.kill('SIGKILL');
      done(null);
    }, (AGENT_TIMEOUT + 10) * 1000);

    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      console.log(`[watercooler] Thread reply received (code ${code}, ${stdout.length} chars)`);
      if (stderr) console.error(`[watercooler] stderr: ${stderr.slice(0, 200)}`);
      done(parseResponseText(stdout));
    });

    proc.on('error', (err: Error) => {
      console.error(`[watercooler] spawn error: ${err.message}`);
      done(null);
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

// ─── Thread Management ──────────────────────────────────────────────────────

function saveInsightFromThread(thread: ThreadState) {
  if (thread.messages.length < 3) return;
  const insights = readInsights();
  insights.push({
    threadId: thread.threadId,
    take: { from: thread.messages[0].from, text: thread.messages[0].text, ts: thread.messages[0].ts },
    hunch: { from: thread.messages[1].from, text: thread.messages[1].text, ts: thread.messages[1].ts },
    suggestion: { from: thread.messages[2].from, text: thread.messages[2].text, ts: thread.messages[2].ts },
    completedAt: Date.now(),
    consumedBy: [],
  });
  writeInsights(insights);
  console.log(`[watercooler] Thread ${thread.threadId} completed → insight saved`);
}

export function markInsightConsumed(threadId: string, agentId: string) {
  const insights = readInsights();
  const insight = insights.find(i => i.threadId === threadId);
  if (insight && !insight.consumedBy.includes(agentId)) {
    insight.consumedBy.push(agentId);
    writeInsights(insights);
  }
}

export function getUnconsumedInsights(agentId: string): Insight[] {
  return readInsights().filter(i => !i.consumedBy.includes(agentId));
}

// ─── Main Generation ────────────────────────────────────────────────────────

export async function generateChat(): Promise<{ success: boolean; message?: any; error?: string }> {
  ensureStatusDir();
  const config = readOfficeConfig();
  const wcConfig = config.waterCooler || {};

  if (wcConfig.enabled === false) return { success: false, error: 'disabled' };

  const allAgents = discoverAgents();
  const npcAgents = allAgents.filter(a => a.id !== '_owner');
  if (npcAgents.length < 2) return { success: false, error: 'need at least 2 agents' };

  const thread = state.currentThread;
  const nextPhase = thread ? PHASE_ORDER[thread.messages.length] : 'take';
  if (!nextPhase) {
    state.currentThread = null;
    return { success: false, error: 'thread overflow — resetting' };
  }

  const speaker = pickSpeakerForPhase(
    nextPhase as Phase,
    allAgents,
    thread || { threadId: '', phase: 'take', messages: [], participants: [] },
  );
  if (!speaker) return { success: false, error: 'no speaker' };

  const accomplishments = readAccomplishments();
  const prompt = buildPrompt(nextPhase as Phase, speaker, allAgents, thread, config.mission, accomplishments);

  // Pick the least-busy agent as host; prompt carries all context so host can rotate
  const host = pickHostAgent(allAgents);
  const reply = await sendToWatercoolerThread(host, prompt);
  if (!reply) return { success: false, error: 'agent did not respond' };

  const text = cleanReply(speaker.name, reply);
  const threadId = thread?.threadId || randomUUID().slice(0, 8);
  const msg: ChatMessage = {
    from: speaker.name,
    text,
    ts: Date.now(),
    phase: nextPhase as Phase,
    threadId,
  };

  const chat = readChat();
  chat.push(msg);
  writeChat(chat);

  if (nextPhase === 'take') {
    state.currentThread = {
      threadId,
      phase: 'take',
      messages: [msg],
      participants: [speaker.name],
    };
    console.log(`[watercooler] ── ${threadId} ── TAKE by ${speaker.name}: ${text.slice(0, 60)}`);
  } else if (nextPhase === 'hunch') {
    thread!.messages.push(msg);
    thread!.participants.push(speaker.name);
    thread!.phase = 'hunch';
    console.log(`[watercooler] ── ${threadId} ── HUNCH by ${speaker.name}: ${text.slice(0, 60)}`);
  } else {
    thread!.messages.push(msg);
    thread!.participants.push(speaker.name);
    thread!.phase = 'suggestion';
    saveInsightFromThread(thread!);
    state.currentThread = null;
    console.log(`[watercooler] ── ${threadId} ── SUGGESTION by ${speaker.name}: ${text.slice(0, 60)}`);
  }

  return { success: true, message: msg };
}

// ─── Ticker State & Scheduling ──────────────────────────────────────────────

const g = globalThis as any;
if (!g.__wcTicker) g.__wcTicker = {
  running: false,
  nextChatAt: 0,
  generating: false,
  currentThread: null as ThreadState | null,
};
const state: {
  running: boolean;
  nextChatAt: number;
  generating: boolean;
  currentThread: ThreadState | null;
} = g.__wcTicker;

function parseInterval(str: string): number {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 45000;
  const [, num, unit] = match;
  const n = parseInt(num, 10);
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * multipliers[unit];
}

function computeDelay(): number {
  const config = readOfficeConfig();
  const wcConfig = config.waterCooler || {};
  const baseFreq = parseInterval(wcConfig.frequency || '45s');

  if (state.currentThread) {
    const inThreadDelay = Math.max(10_000, baseFreq * 0.4);
    return inThreadDelay + (Math.random() - 0.5) * inThreadDelay * 0.3;
  }

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
      state.nextChatAt = Date.now() + 60_000;
      setTimeout(runOneTick, 60_000);
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
  const phase = state.currentThread
    ? PHASE_ORDER[state.currentThread.messages.length] || 'take'
    : 'take';
  console.log(`[watercooler] Generating ${phase}...`);
  try {
    const result = await generateChat();
    if (!result.success) {
      console.log(`[watercooler] Generation failed: ${result.error}`);
      if (result.error === 'agent did not respond' && state.currentThread) {
        console.log(`[watercooler] Abandoning stalled thread ${state.currentThread.threadId}`);
        state.currentThread = null;
      }
    }
  } catch (err) {
    console.error('[watercooler] Error:', err);
  } finally {
    state.generating = false;
    if (state.running) scheduleNextTick();
  }
}

export function startTicker(): void {
  if (state.running) return;
  state.running = true;
  console.log(`[watercooler] Starting ticker — dedicated thread (session=${WC_SESSION_ID}, host=dynamic)`);
  scheduleNextTick();
}

export function stopTicker(): void {
  state.running = false;
  state.nextChatAt = 0;
  state.generating = false;
  state.currentThread = null;
  console.log('[watercooler] Stopped');
}

export function getNextChatIn(): number {
  if (state.generating) return -1;
  if (state.nextChatAt === 0) return 0;
  return Math.max(0, Math.round((state.nextChatAt - Date.now()) / 1000));
}
