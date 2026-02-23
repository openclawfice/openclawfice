import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn } from 'child_process';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const STATUS_DIR = join(OPENCLAW_DIR, '.status');
const AUTOWORK_FILE = join(STATUS_DIR, 'autowork.json');
const OPENCLAW_CONFIG = join(OPENCLAW_DIR, 'openclaw.json');

const CONFIG_PATHS = [
  join(process.cwd(), 'openclawfice.config.json'),
  join(OPENCLAW_DIR, 'openclawfice.config.json'),
];

const DEFAULT_DIRECTIVE =
  'Continue any in-progress tasks, or find and start your highest priority task based on your role and current assignments.';

const MAX_SENDS_PER_TICK = 2;
const MIN_GAP_MS = 30_000;

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

interface AutoworkConfig {
  maxSendsPerTick?: number;
  policies: Record<string, AutoworkPolicy>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findOpenclawBin(): string {
  const { execSync } = require('child_process');
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

function readConfig(): AutoworkConfig {
  try {
    if (existsSync(AUTOWORK_FILE)) {
      const raw = JSON.parse(readFileSync(AUTOWORK_FILE, 'utf-8'));
      if (raw.policies) return raw as AutoworkConfig;
      // Migrate old flat format → new format
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

function writeConfig(config: AutoworkConfig): void {
  if (!existsSync(STATUS_DIR)) mkdirSync(STATUS_DIR, { recursive: true });
  writeFileSync(AUTOWORK_FILE, JSON.stringify(config, null, 2));
}

function readMission(): Mission {
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

/**
 * Get a snapshot of what each agent is currently doing, by reading the
 * lightweight status files the main /api/office route also uses.
 */
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

      // Infer working/idle from session freshness
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

      // Read task from status override file if available
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

/**
 * Build a mission-driven prompt for an agent.
 */
function composePrompt(agentId: string, directive: string, mission: Mission, team: { id: string; name: string; status: string; task?: string }[]): string {
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

  parts.push(`## Your Directive\n${directive || DEFAULT_DIRECTIVE}`);

  const others = team.filter(t => t.id !== agentId);
  if (others.length > 0) {
    const lines = others.map(t => {
      const taskStr = t.task ? ` — ${t.task}` : '';
      return `- ${t.name}: ${t.status}${taskStr}`;
    });
    parts.push('## Team Status\n' + lines.join('\n'));
  }

  parts.push(
    '---\n' +
    'Work on your highest priority task that advances the mission above. ' +
    'If you finish something, record it as an accomplishment:\n\n' +
    '```bash\n' +
    'curl -s -X POST http://localhost:3333/api/office/actions \\\n' +
    '  -H "Content-Type: application/json" \\\n' +
    '  -d \'{"type":"add_accomplishment","accomplishment":{"icon":"✅","title":"<what you did>","detail":"<brief detail>","who":"<your name>"}}\'\n' +
    '```\n\n' +
    'If blocked or need a decision, raise a quest instead. If nothing to do, report idle briefly.'
  );

  return parts.join('\n\n');
}

function sendToAgent(agentId: string, message: string): void {
  const proc = spawn(OPENCLAW_BIN, ['agent', '--agent', agentId, '--message', message], {
    env: process.env,
    detached: true,
    stdio: 'ignore',
  });
  proc.unref();
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/**
 * GET — return all auto-work policies, config, and current mission
 */
export async function GET() {
  const config = readConfig();
  const mission = readMission();
  return NextResponse.json({
    maxSendsPerTick: config.maxSendsPerTick ?? MAX_SENDS_PER_TICK,
    mission,
    policies: config.policies,
  });
}

/**
 * POST — create or update an agent's auto-work policy
 * Body: { agentId, enabled?, intervalMs?, directive?, maxSendsPerTick? }
 */
export async function POST(request: Request) {
  try {
    const { agentId, enabled, intervalMs, directive, maxSendsPerTick } = await request.json();

    const config = readConfig();

    if (typeof maxSendsPerTick === 'number' && maxSendsPerTick >= 1 && maxSendsPerTick <= 10) {
      config.maxSendsPerTick = maxSendsPerTick;
    }

    if (agentId && typeof agentId === 'string') {
      const existing = config.policies[agentId] || {
        enabled: false,
        intervalMs: 600_000,
        directive: '',
        lastSentAt: 0,
      };

      if (typeof enabled === 'boolean') existing.enabled = enabled;
      if (typeof intervalMs === 'number' && intervalMs >= 60_000) existing.intervalMs = intervalMs;
      if (typeof directive === 'string') existing.directive = directive;

      config.policies[agentId] = existing;
      writeConfig(config);
      return NextResponse.json({ success: true, policy: existing });
    }

    writeConfig(config);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update' }, { status: 500 });
  }
}

/**
 * PUT — tick: check enabled policies and send mission-driven work prompts,
 * respecting the concurrency limit. Remaining agents queue for next tick.
 *
 * Pass { agentId } to force-send to one agent immediately (bypasses limit).
 */
export async function PUT(request: Request) {
  try {
    let forceAgent: string | undefined;
    try {
      const body = await request.json();
      forceAgent = body?.agentId;
    } catch {}

    const config = readConfig();
    const policies = config.policies;
    const limit = config.maxSendsPerTick ?? MAX_SENDS_PER_TICK;
    const now = Date.now();

    // Lazy-load mission and team status only when we actually need to send
    let mission: Mission | null = null;
    let team: ReturnType<typeof getTeamStatus> | null = null;
    const loadContext = () => {
      if (!mission) mission = readMission();
      if (!team) team = getTeamStatus();
    };

    // Force-send bypasses concurrency limit
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
      return NextResponse.json({ sent: [forceAgent], queued: [], tick: now });
    }

    // Collect agents whose timer has elapsed
    const due: [string, AutoworkPolicy][] = [];
    for (const [agentId, policy] of Object.entries(policies)) {
      if (!policy.enabled) continue;
      const elapsed = now - (policy.lastSentAt || 0);
      if (elapsed >= policy.intervalMs && elapsed >= MIN_GAP_MS) {
        due.push([agentId, policy]);
      }
    }

    if (due.length === 0) {
      return NextResponse.json({ sent: [], queued: [], tick: now });
    }

    // Prioritize: agents waiting longest go first
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

    return NextResponse.json({
      sent,
      queued: queued.map(([id]) => id),
      tick: now,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Tick failed' }, { status: 500 });
  }
}
