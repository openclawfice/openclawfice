import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn, execSync } from 'child_process';
import { getUnconsumedInsights, markInsightConsumed, type Insight } from './watercooler-ticker';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const STATUS_DIR = join(OPENCLAW_DIR, '.status');
const AUTOWORK_FILE = join(STATUS_DIR, 'autowork.json');
const CHAT_FILE = join(STATUS_DIR, 'chat.json');
const ACTIONS_FILE = join(STATUS_DIR, 'actions.json');
const ACCOMPLISHMENTS_FILE = join(STATUS_DIR, 'accomplishments.json');
const OPENCLAW_CONFIG = join(OPENCLAW_DIR, 'openclaw.json');

const CONFIG_PATHS = [
  join(process.cwd(), 'openclawfice.config.json'),
  join(OPENCLAW_DIR, 'openclawfice.config.json'),
];

const DEFAULT_DIRECTIVE =
  'Check your memory and recent work, then pick up where you left off or start the next highest-impact task for your role. ' +
  'Do NOT just report status — actually open files, write code, create documents, or run commands. ' +
  'If your previous tasks are done, look at the mission and priorities and find something new to build or improve.';

const MAX_SENDS_PER_TICK = 2;
const MIN_GAP_MS = 30_000;
const TICK_INTERVAL_MS = 15_000;

interface AutoworkPolicy {
  enabled: boolean;
  intervalMs: number;
  directive: string;
  lastSentAt: number;
}

interface Mission {
  goal?: string;
  priorities?: string[];
  context?: string;
}

export interface AutoworkConfig {
  maxSendsPerTick?: number;
  policies: Record<string, AutoworkPolicy>;
}

export interface TickResult {
  sent: string[];
  queued: string[];
  tick: number;
}

function findOpenclawBin(): string {
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
}

const OPENCLAW_BIN = findOpenclawBin();

export function readConfig(): AutoworkConfig {
  try {
    if (existsSync(AUTOWORK_FILE)) {
      const raw = JSON.parse(readFileSync(AUTOWORK_FILE, 'utf-8'));
      if (raw.policies) return raw as AutoworkConfig;
      const policies: Record<string, AutoworkPolicy> = {};
      for (const [k, v] of Object.entries(raw)) {
        if (k === 'maxSendsPerTick') continue;
        const old = v as any;
        policies[k] = {
          enabled: old.enabled ?? false,
          intervalMs: old.intervalMs ?? 600_000,
          directive: old.directive || old.prompt || '',
          lastSentAt: old.lastSentAt ?? 0,
        };
      }
      return { maxSendsPerTick: raw.maxSendsPerTick, policies };
    }
  } catch {}
  return { policies: {} };
}

export function writeConfig(config: AutoworkConfig): void {
  if (!existsSync(STATUS_DIR)) mkdirSync(STATUS_DIR, { recursive: true });
  writeFileSync(AUTOWORK_FILE, JSON.stringify(config, null, 2));
}

export function readMission(): Mission {
  for (const p of CONFIG_PATHS) {
    try {
      if (existsSync(p)) {
        const cfg = JSON.parse(readFileSync(p, 'utf-8'));
        if (cfg.mission) return cfg.mission;
      }
    } catch {}
  }
  return {};
}

function getTeamStatus(): { id: string; name: string; status: string; task?: string }[] {
  const result: { id: string; name: string; status: string; task?: string }[] = [];
  try {
    if (!existsSync(OPENCLAW_CONFIG)) return result;
    const ocCfg = JSON.parse(readFileSync(OPENCLAW_CONFIG, 'utf-8'));
    const agents = ocCfg.agents?.list || [];
    const defaultWs = ocCfg.agents?.defaults?.workspace || '';

    for (const agent of agents) {
      const ws = agent.workspace || defaultWs;
      let name = agent.id;
      try {
        const idPath = join(ws, 'IDENTITY.md');
        if (existsSync(idPath)) {
          const txt = readFileSync(idPath, 'utf-8');
          const m = txt.match(/[-*]*\s*\*\*Name:\*\*\s*(.+)/);
          if (m) name = m[1].trim();
        }
      } catch {}

      const sessDir = join(OPENCLAW_DIR, 'agents', agent.id, 'sessions');
      let status = 'idle';
      let task: string | undefined;
      try {
        const sessFile = join(sessDir, 'sessions.json');
        if (existsSync(sessFile)) {
          const sessions = JSON.parse(readFileSync(sessFile, 'utf-8'));
          const main = sessions.main || sessions[Object.keys(sessions)[0]];
          if (main) {
            const age = Date.now() - (main.updatedAt || 0);
            if (age < 5 * 60_000) status = 'working';
          }
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

      result.push({ id: agent.id, name, status, task });
    }
  } catch {}
  return result;
}

function readJsonSafe(path: string): any[] {
  try {
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {}
  return [];
}

function getRecentChat(limit = 15): { from: string; text: string; ts: number }[] {
  return readJsonSafe(CHAT_FILE).slice(-limit);
}

function getOpenQuests(): { title: string; from: string; priority: string; description?: string }[] {
  return readJsonSafe(ACTIONS_FILE).map((a: any) => ({
    title: a.title,
    from: a.from,
    priority: a.priority || 'medium',
    description: a.description,
  }));
}

function getRecentAccomplishments(limit = 10): { title: string; who: string; detail?: string }[] {
  return readJsonSafe(ACCOMPLISHMENTS_FILE).slice(-limit).map((a: any) => ({
    title: a.title,
    who: a.who,
    detail: a.detail,
  }));
}

/**
 * Score how relevant an insight is to a given agent. Higher = more relevant.
 * Factors: the agent was mentioned by name, the suggestion references their
 * role keywords, or the agent participated in the thread.
 */
function scoreInsightForAgent(
  insight: Insight,
  agentId: string,
  agentName: string,
  agentRole?: string,
): number {
  let score = 1;
  const all = `${insight.take.text} ${insight.hunch.text} ${insight.suggestion.text}`.toLowerCase();
  const nameLower = agentName.toLowerCase();

  // Direct mention in suggestion carries heavy weight
  if (insight.suggestion.text.toLowerCase().includes(nameLower)) score += 10;
  // Mentioned anywhere in thread
  if (all.includes(nameLower)) score += 3;

  // Role-keyword matching
  if (agentRole) {
    const roleWords = agentRole.toLowerCase().split(/[\s,/]+/).filter(w => w.length > 3);
    for (const w of roleWords) {
      if (all.includes(w)) score += 2;
    }
  }

  // Participated in the thread — they have context already
  const participants = [insight.take.from, insight.hunch.from, insight.suggestion.from];
  if (participants.some(p => p.toLowerCase() === nameLower)) score += 2;

  // Recency bonus (insights from the last hour get a boost)
  const ageMs = Date.now() - insight.completedAt;
  if (ageMs < 3600_000) score += 2;

  return score;
}

function getAgentName(
  agentId: string,
  team: { id: string; name: string; status: string; task?: string }[],
): string {
  return team.find(t => t.id === agentId)?.name || agentId;
}

function getAgentRole(agentId: string): string | undefined {
  try {
    if (!existsSync(OPENCLAW_CONFIG)) return undefined;
    const cfg = JSON.parse(readFileSync(OPENCLAW_CONFIG, 'utf-8'));
    const agents = cfg.agents?.list || [];
    const defaultWs = cfg.agents?.defaults?.workspace || '';
    const agent = agents.find((a: any) => a.id === agentId);
    if (!agent) return undefined;
    const ws = agent.workspace || defaultWs;
    const idPath = join(ws, 'IDENTITY.md');
    if (existsSync(idPath)) {
      const txt = readFileSync(idPath, 'utf-8');
      const rm = txt.match(/[-*]*\s*\*\*Role:\*\*\s*(.+)/);
      if (rm) return rm[1].trim();
    }
  } catch {}
  return undefined;
}

export function composePrompt(
  agentId: string,
  directive: string,
  mission: Mission,
  team: { id: string; name: string; status: string; task?: string }[],
): string {
  const parts: string[] = [];

  if (mission.goal) {
    parts.push(`## Company Mission\n${mission.goal}`);
    if (mission.priorities?.length) {
      parts.push('## Current Priorities\n' + mission.priorities.map((p, i) => `${i + 1}. ${p}`).join('\n'));
    }
    if (mission.context) {
      parts.push(`## Context\n${mission.context}`);
    }
  }

  // ── Water cooler insights → prioritized task ──────────────────────────
  const agentName = getAgentName(agentId, team);
  const agentRole = getAgentRole(agentId);
  const insights = getUnconsumedInsights(agentId);

  if (insights.length > 0) {
    const scored = insights
      .map(i => ({ insight: i, score: scoreInsightForAgent(i, agentId, agentName, agentRole) }))
      .sort((a, b) => b.score - a.score);

    const top = scored[0];
    if (top.score >= 3) {
      const i = top.insight;
      parts.push(
        '## Team Insight (from water cooler discussion — HIGH PRIORITY)\n' +
        'Your team just worked through this thread:\n' +
        `- Observation (${i.take.from}): ${i.take.text}\n` +
        `- Hypothesis (${i.hunch.from}): ${i.hunch.text}\n` +
        `- Suggested action (${i.suggestion.from}): ${i.suggestion.text}\n\n` +
        'If this is relevant to your role, prioritize acting on this suggestion. ' +
        'The team discussed it and arrived at this as a concrete next step.',
      );
      markInsightConsumed(i.threadId, agentId);
    }

    // Show other recent insights as context
    const others = scored.slice(top.score >= 3 ? 1 : 0, 4);
    if (others.length > 0) {
      const lines = others.map(o =>
        `- ${o.insight.suggestion.from} suggested: "${o.insight.suggestion.text}" ` +
        `(based on ${o.insight.take.from}'s observation about: "${o.insight.take.text.slice(0, 60)}")`,
      );
      parts.push('## Other Team Insights\n' + lines.join('\n'));
      for (const o of others) markInsightConsumed(o.insight.threadId, agentId);
    }
  }

  parts.push(`## Your Directive\n${directive || DEFAULT_DIRECTIVE}`);

  const others = team.filter(t => t.id !== agentId);
  if (others.length > 0) {
    const lines = others.map(t => {
      const taskStr = t.task ? ` — ${t.task}` : '';
      return `- ${t.name}: ${t.status}${taskStr}`;
    });
    parts.push('## Team Status\n' + lines.join('\n'));
  }

  const quests = getOpenQuests();
  if (quests.length > 0) {
    const lines = quests.map(q => {
      const desc = q.description ? ` — ${q.description}` : '';
      return `- [${q.priority}] ${q.title} (from ${q.from})${desc}`;
    });
    parts.push('## Open Quests (needs attention)\n' + lines.join('\n'));
  }

  const recentAccomplishments = getRecentAccomplishments();
  if (recentAccomplishments.length > 0) {
    const lines = recentAccomplishments.map(a => {
      const detail = a.detail ? ` — ${a.detail}` : '';
      return `- ${a.who}: ${a.title}${detail}`;
    });
    parts.push('## Recent Accomplishments (already done — don\'t repeat)\n' + lines.join('\n'));
  }

  const recentChat = getRecentChat();
  if (recentChat.length > 0) {
    const lines = recentChat.map(m => `- ${m.from}: ${m.text}`);
    parts.push(
      '## Recent Water Cooler Chat\n' +
      'Review this conversation for action items, requests, blockers, or ideas that you can help with:\n' +
      lines.join('\n'),
    );
  }

  parts.push(
    '---\n' +
    'IMPORTANT: You must DO actual work right now — use tools to read/write files, run commands, create deliverables. ' +
    'Do NOT just reply with a status update or say you are idle. ' +
    'Pick a concrete task and execute it.\n\n' +
    'If there is a Team Insight above that is relevant to your role, that should be your top priority.\n\n' +
    'When you finish something, record it as an accomplishment (a Loom-style screen recording is automatically captured):\n\n' +
    '```bash\n' +
    'curl -s -X POST http://localhost:3333/api/office/actions \\\n' +
    '  -H "Content-Type: application/json" \\\n' +
    '  -d \'{"type":"add_accomplishment","accomplishment":{"icon":"✅","title":"<what you did>","detail":"<brief detail>","who":"<your name>"}}\'\n' +
    '```\n\n' +
    'If blocked on something specific, raise a quest. But "nothing to do" is never acceptable — ' +
    'there is always something to improve, document, test, review, or plan for the mission.',
  );

  return parts.join('\n\n');
}

export function sendToAgent(agentId: string, message: string): void {
  const proc = spawn(OPENCLAW_BIN, ['agent', '--agent', agentId, '--message', message], {
    env: process.env,
    detached: true,
    stdio: 'ignore',
  });
  proc.unref();
}

/**
 * Run one tick: check enabled policies and send work prompts to due agents.
 * Optionally force-send to a specific agent (bypasses concurrency limit).
 */
export function runTick(forceAgent?: string): TickResult {
  const config = readConfig();
  const policies = config.policies;
  const limit = config.maxSendsPerTick ?? MAX_SENDS_PER_TICK;
  const now = Date.now();

  let mission: Mission | null = null;
  let team: ReturnType<typeof getTeamStatus> | null = null;
  const loadContext = () => {
    if (!mission) mission = readMission();
    if (!team) team = getTeamStatus();
  };

  if (forceAgent) {
    loadContext();
    const policy = policies[forceAgent] || {
      enabled: false,
      intervalMs: 600_000,
      directive: '',
      lastSentAt: 0,
    };
    const prompt = composePrompt(forceAgent, policy.directive, mission!, team!);
    sendToAgent(forceAgent, prompt);
    policy.lastSentAt = now;
    policies[forceAgent] = policy;
    writeConfig(config);
    return { sent: [forceAgent], queued: [], tick: now };
  }

  const due: [string, AutoworkPolicy][] = [];
  for (const [agentId, policy] of Object.entries(policies)) {
    if (!policy.enabled) continue;
    // Respect manual stop cooldown
    try {
      const stopFile = join(STATUS_DIR, `${agentId}-stopped.json`);
      if (existsSync(stopFile)) {
        const stopData = JSON.parse(readFileSync(stopFile, 'utf-8'));
        if (stopData.stoppedUntil && now < stopData.stoppedUntil) continue;
      }
    } catch {}
    const elapsed = now - (policy.lastSentAt || 0);
    if (elapsed >= policy.intervalMs && elapsed >= MIN_GAP_MS) {
      due.push([agentId, policy]);
    }
  }

  if (due.length === 0) {
    return { sent: [], queued: [], tick: now };
  }

  due.sort((a, b) => (a[1].lastSentAt || 0) - (b[1].lastSentAt || 0));

  const toSend = due.slice(0, limit);
  const queued = due.slice(limit);
  const sent: string[] = [];

  loadContext();
  for (const [agentId, policy] of toSend) {
    const prompt = composePrompt(agentId, policy.directive, mission!, team!);
    sendToAgent(agentId, prompt);
    policy.lastSentAt = now;
    sent.push(agentId);
  }

  writeConfig(config);

  if (sent.length > 0) {
    console.log(`[autowork-ticker] Sent work to: ${sent.join(', ')}`);
  }

  return { sent, queued: queued.map(([id]) => id), tick: now };
}

const g = globalThis as any;
if (!g.__awTicker) g.__awTicker = { interval: null };
const awState: { interval: ReturnType<typeof setInterval> | null } = g.__awTicker;

/**
 * Start the server-side autowork ticker. Safe to call multiple times;
 * only one interval runs at a time.
 */
export function startTicker(): void {
  if (awState.interval) return;
  console.log('[autowork-ticker] Starting server-side ticker (interval: 15s)');
  awState.interval = setInterval(() => {
    try {
      runTick();
    } catch (err) {
      console.error('[autowork-ticker] Tick error:', err);
    }
  }, TICK_INTERVAL_MS);
}

export function stopTicker(): void {
  if (awState.interval) {
    clearInterval(awState.interval);
    awState.interval = null;
    console.log('[autowork-ticker] Stopped');
  }
}
