import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn } from 'child_process';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const AUTOWORK_FILE = join(STATUS_DIR, 'autowork.json');

const DEFAULT_PROMPT =
  'Auto-work check-in. Continue any in-progress tasks, or find and start your highest priority task based on your role and current assignments. If truly idle with nothing to do, briefly report your status.';

// Max agents to send work to in a single tick. Remaining agents queue
// for the next tick (~15s later). Prevents hitting API rate limits when
// many agents have auto-work enabled on similar intervals.
const MAX_SENDS_PER_TICK = 2;

// After sending to an agent, enforce a minimum gap before the same agent
// can be auto-sent again, regardless of configured interval. Prevents
// rapid re-sends if the tick fires faster than the interval resolves.
const MIN_GAP_MS = 30_000;

interface AutoworkPolicy {
  enabled: boolean;
  intervalMs: number;
  prompt: string;
  lastSentAt: number;
}

interface AutoworkConfig {
  maxSendsPerTick?: number;
  policies: Record<string, AutoworkPolicy>;
}

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
      // Support both old format (flat policies) and new format (with config)
      if (raw.policies) return raw as AutoworkConfig;
      return { policies: raw };
    }
  } catch {}
  return { policies: {} };
}

function writeConfig(config: AutoworkConfig): void {
  if (!existsSync(STATUS_DIR)) mkdirSync(STATUS_DIR, { recursive: true });
  writeFileSync(AUTOWORK_FILE, JSON.stringify(config, null, 2));
}

function sendToAgent(agentId: string, message: string): void {
  const proc = spawn(OPENCLAW_BIN, ['agent', '--agent', agentId, '--message', message], {
    env: process.env,
    detached: true,
    stdio: 'ignore',
  });
  proc.unref();
}

/**
 * GET — return all auto-work policies and config
 */
export async function GET() {
  const config = readConfig();
  return NextResponse.json({
    maxSendsPerTick: config.maxSendsPerTick ?? MAX_SENDS_PER_TICK,
    ...config.policies,
  });
}

/**
 * POST — create or update an agent's auto-work policy
 * Body: { agentId, enabled?, intervalMs?, prompt?, maxSendsPerTick? }
 */
export async function POST(request: Request) {
  try {
    const { agentId, enabled, intervalMs, prompt, maxSendsPerTick } = await request.json();

    const config = readConfig();

    // Allow updating global concurrency limit
    if (typeof maxSendsPerTick === 'number' && maxSendsPerTick >= 1 && maxSendsPerTick <= 10) {
      config.maxSendsPerTick = maxSendsPerTick;
    }

    if (agentId && typeof agentId === 'string') {
      const existing = config.policies[agentId] || {
        enabled: false,
        intervalMs: 600_000,
        prompt: DEFAULT_PROMPT,
        lastSentAt: 0,
      };

      if (typeof enabled === 'boolean') existing.enabled = enabled;
      if (typeof intervalMs === 'number' && intervalMs >= 60_000) existing.intervalMs = intervalMs;
      if (typeof prompt === 'string') existing.prompt = prompt || DEFAULT_PROMPT;

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
 * PUT — tick: check all enabled policies and send work where interval has
 * elapsed, respecting the concurrency limit. Agents that don't fit in this
 * tick are queued for the next one (~15s).
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

    // Force-send always goes through immediately (manual user action)
    if (forceAgent) {
      const policy = policies[forceAgent] || {
        enabled: false,
        intervalMs: 600_000,
        prompt: DEFAULT_PROMPT,
        lastSentAt: 0,
      };
      sendToAgent(forceAgent, policy.prompt || DEFAULT_PROMPT);
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

    // Prioritize: agents waiting the longest get sent first
    due.sort((a, b) => (a[1].lastSentAt || 0) - (b[1].lastSentAt || 0));

    const toSend = due.slice(0, limit);
    const queued = due.slice(limit);
    const sent: string[] = [];

    for (const [agentId, policy] of toSend) {
      sendToAgent(agentId, policy.prompt || DEFAULT_PROMPT);
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
