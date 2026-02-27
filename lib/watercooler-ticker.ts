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

// Dedicated watercooler agent — created via `openclaw agents add watercooler`.
// Has its own workspace, session history, and uses a fast/cheap model (haiku).
// No autowork ever touches it. Completely isolated from all work threads.
const WC_AGENT = 'watercooler';
const WC_SESSION_ID = 'room';
const AGENT_TIMEOUT = 30;

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
  workspace?: string;
  role?: string;
  vibe?: string;
  creature?: string;
  soul?: string;
  heartbeat?: string;
  memory?: string;
  recentWork?: string;  // recent accomplishments by this agent only
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

// ─── Agent Context Helpers ───────────────────────────────────────────────────

function getRecentWorkForAgent(agentName: string): string {
  const accs = readAccomplishments();
  const mine = accs
    .filter((a: any) => a.who === agentName)
    .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 5);
  if (mine.length === 0) return '';
  return mine.map((a: any) => `- ${a.title || a.text || '(untitled)'}`).join('\n');
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
      let soul: string | undefined;
      let heartbeat: string | undefined;
      let memory: string | undefined;
      try {
        const idPath = join(ws, 'IDENTITY.md');
        if (existsSync(idPath)) {
          const txt = readFileSync(idPath, 'utf-8');
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
      try {
        const soulPath = join(ws, 'SOUL.md');
        if (existsSync(soulPath)) soul = readFileSync(soulPath, 'utf-8').slice(0, 4000);
      } catch {}
      try {
        const hbPath = join(ws, 'HEARTBEAT.md');
        if (existsSync(hbPath)) heartbeat = readFileSync(hbPath, 'utf-8').slice(0, 3000);
      } catch {}
      try {
        const memPath = join(ws, 'MEMORY.md');
        if (existsSync(memPath)) memory = readFileSync(memPath, 'utf-8').slice(0, 4000);
      } catch {}

      let status = 'idle';
      let task: string | undefined;
      try {
        const sessFile = join(OPENCLAW_DIR, 'agents', agent.id, 'sessions', 'sessions.json');
        if (existsSync(sessFile)) {
          const sessions = JSON.parse(readFileSync(sessFile, 'utf-8'));
          const mainKey = `agent:${agent.id}:main`;
          const mainSess = sessions[mainKey];
          if (mainSess && Date.now() - (mainSess.updatedAt || 0) < 3 * 60_000) status = 'working';
        }
      } catch {}
      try {
        // Status files may be keyed by display name (e.g. cipher.json) or agent id
        const candidates = [join(STATUS_DIR, `${agent.id}.json`), join(STATUS_DIR, `${name.toLowerCase()}.json`)];
        for (const sf of candidates) {
          if (existsSync(sf)) {
            const s = JSON.parse(readFileSync(sf, 'utf-8'));
            if (s.task) task = s.task;
            // Only trust status file if updated within the last 15 minutes
            const age = Date.now() - (s.updatedAt || 0);
            if (s.status && age < 15 * 60_000) {
              status = s.status;
            }
            break;
          }
        }
      } catch {}

      const recentWork = getRecentWorkForAgent(name);
      result.push({ id: agent.id, name, workspace: ws, role, vibe, creature, soul, heartbeat, memory, recentWork, status, task });
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
      const hbSummary = a.heartbeat
        ? ` [Focus: ${a.heartbeat.split('\n').find(l => l.trim().length > 10)?.trim().slice(0, 80) || 'see heartbeat'}]`
        : '';
      return `- ${a.name}${you} (${a.role || a.creature || a.id}${vibeStr}): ${a.status}${a.task ? ` — ${a.task}` : ''}${hbSummary}`;
    })
    .join('\n');
}

function buildSoulBlock(agent: AgentInfo): string {
  const parts: string[] = [];
  parts.push(`## Identity`);
  parts.push(`Name: ${agent.name}`);
  if (agent.role) parts.push(`Role: ${agent.role}`);
  if (agent.creature) parts.push(`Type: ${agent.creature}`);
  if (agent.vibe) parts.push(`Personality: ${agent.vibe}`);
  if (agent.workspace) parts.push(`Workspace: ${agent.workspace}`);

  if (agent.soul) {
    parts.push(`\n## ${agent.name}'s Soul (personality, approach, boundaries)`);
    parts.push(agent.soul);
  }
  if (agent.heartbeat) {
    parts.push(`\n## ${agent.name}'s Current Priorities (what they're actually doing)`);
    parts.push(agent.heartbeat);
  }
  if (agent.memory) {
    parts.push(`\n## ${agent.name}'s Memory (real facts, real people, real data)`);
    parts.push(agent.memory);
  }
  if (agent.recentWork) {
    parts.push(`\n## ${agent.name}'s Recent Accomplishments (actually completed)`);
    parts.push(agent.recentWork);
  }

  return parts.join('\n');
}

function buildPrompt(
  phase: Phase,
  speaker: AgentInfo,
  allAgents: AgentInfo[],
  thread: ThreadState | null,
  mission?: { goal?: string; priorities?: string[] },
): string {
  const lines: string[] = [];

  lines.push(
    `WATER COOLER THREAD — team brainstorming space.`,
    '',
    `You ARE ${speaker.name}. Below is ${speaker.name}'s COMPLETE context — soul, current`,
    `priorities, memory, and recent work. This is your ONLY source of truth.`,
    '',
    `═══════════════════════════════════════════════════`,
    buildSoulBlock(speaker),
    `═══════════════════════════════════════════════════`,
    '',
    `GROUNDING RULES (non-negotiable):`,
    `• You may ONLY reference projects, data, people, and experiences that appear`,
    `  in ${speaker.name}'s context above.`,
    `• If something is NOT in the context above, you do NOT know about it.`,
    `  Do not speculate about things outside your direct experience.`,
    `• Do not claim to have done outreach, seen data, talked to users, or shipped`,
    `  features unless the context above specifically mentions it.`,
    `• Stay in your lane — ${speaker.role || speaker.creature || speaker.id} is your`,
    `  actual job. Don't opine on areas you have no context for.`,
    `• Speak from first-hand experience, not assumptions about what the team does.`,
    '',
  );

  if (phase === 'take') {
    lines.push(
      'PHASE: TAKE (share an observation from YOUR actual work)',
      `Look at YOUR heartbeat, memory, and recent accomplishments above.`,
      `Pick ONE specific, concrete thing you noticed or learned from YOUR OWN work.`,
      `It must be something you can point to in your context. No generic observations.`,
    );
  } else if (phase === 'hunch' && thread) {
    lines.push(
      'PHASE: HUNCH (build a hypothesis using YOUR knowledge)',
      `${thread.messages[0].from} observed: "${thread.messages[0].text}"`,
      '',
      `Respond with a hypothesis that connects this to something from YOUR OWN`,
      `experience (in your memory/heartbeat above). If you have no relevant context`,
      `to connect it to, say so honestly rather than making something up.`,
    );
  } else if (phase === 'suggestion' && thread) {
    lines.push(
      'PHASE: SUGGESTION (propose a concrete action)',
      `${thread.messages[0].from} observed: "${thread.messages[0].text}"`,
      `${thread.messages[1].from} hypothesized: "${thread.messages[1].text}"`,
      '',
      `Close this thread with a specific, actionable suggestion. Name the task AND`,
      `who should do it based on what each person actually does (see team roster).`,
      `Only suggest things within the team's actual capabilities and current work.`,
    );
  }

  lines.push(
    '',
    'Format: 1-2 sentences, under 200 chars. Plain text. No name prefix. No markdown.',
    '',
  );

  if (mission?.goal) {
    lines.push(`Team Mission: ${mission.goal}`);
    if (mission.priorities?.length) lines.push(`Priorities: ${mission.priorities.join(', ')}`);
    lines.push('');
  }

  lines.push('Team Roster (what each person ACTUALLY does):', buildRoster(allAgents, speaker.id));

  lines.push('', `Reply as ${speaker.name} now. Only the message text.`);
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

function sendToWatercoolerThread(prompt: string): Promise<string | null> {
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

    console.log(`[watercooler] → ${WC_AGENT}:${WC_SESSION_ID} (${prompt.length} chars)`);
    const proc = spawn(OPENCLAW_BIN, [
      'agent',
      '--agent', WC_AGENT,
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
  const teamAgents = allAgents.filter(a => a.id !== '_owner' && a.id !== WC_AGENT);
  const idleAgents = teamAgents.filter(a => a.status !== 'working');
  if (idleAgents.length < 2) {
    return { success: false, error: `only ${idleAgents.length} idle agent(s) — need 2+` };
  }

  const thread = state.currentThread;
  const nextPhase = thread ? PHASE_ORDER[thread.messages.length] : 'take';
  if (!nextPhase) {
    state.currentThread = null;
    return { success: false, error: 'thread overflow — resetting' };
  }

  const speaker = pickSpeakerForPhase(
    nextPhase as Phase,
    idleAgents,
    thread || { threadId: '', phase: 'take', messages: [], participants: [] },
  );
  if (!speaker) return { success: false, error: 'no idle speaker' };

  const prompt = buildPrompt(nextPhase as Phase, speaker, allAgents, thread, config.mission);

  const reply = await sendToWatercoolerThread(prompt);
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
  console.log(`[watercooler] Starting ticker — dedicated agent (${WC_AGENT}:${WC_SESSION_ID})`);
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
