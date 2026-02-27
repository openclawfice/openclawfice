import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import {
  readConfig,
  writeConfig,
  readMission,
  runTick,
} from '../../../../lib/autowork-ticker';

const MAX_SENDS_PER_TICK = 2;

/**
 * GET — return all auto-work policies, config, and current mission
 */
export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

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
  const authError = requireAuth(request);
  if (authError) return authError;

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
 * PUT — tick: force-send to a specific agent (bypasses concurrency limit).
 * The regular tick now runs server-side via instrumentation.ts, so this
 * endpoint is only needed for manual force-sends from the UI.
 *
 * Body: { agentId? } — if omitted, runs one normal tick cycle.
 */
export async function PUT(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    let forceAgent: string | undefined;
    try {
      const body = await request.json();
      forceAgent = body?.agentId;
    } catch {}

    const result = runTick(forceAgent);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Tick failed' }, { status: 500 });
  }
}
