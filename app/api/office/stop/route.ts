import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { gatewayRpc } from '@/lib/gateway-rpc';
import { requireAuth } from '../../../../lib/auth';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const AUTOWORK_FILE = join(STATUS_DIR, 'autowork.json');
const STOP_COOLDOWN_MS = 10 * 60_000; // 10 min — agent stays idle after stop

/**
 * POST — stop an agent's current work and send them to idle.
 *
 * 1. Aborts the agent's active gateway session run
 * 2. Pauses auto-work so the agent doesn't get re-assigned immediately
 * 3. Writes a stop marker so the office API forces idle status
 *
 * Body: { agentId, pauseAutowork?: boolean }
 */
export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const { agentId, pauseAutowork = true } = await request.json();

    if (!agentId || typeof agentId !== 'string') {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 });
    }

    const sessionKey = `agent:${agentId}:main`;
    let aborted = false;

    // Abort the active run on the agent's main session
    try {
      await gatewayRpc('sessions.abort', { sessionKey }, 5000);
      aborted = true;
    } catch (err: any) {
      console.error('sessions.abort failed for agent:', String(agentId).replace(/[\r\n]/g, ''), err.message);
    }

    // Write a stop marker — office API will force idle until this expires
    try {
      if (!existsSync(STATUS_DIR)) mkdirSync(STATUS_DIR, { recursive: true });
      const stopFile = join(STATUS_DIR, `${agentId}-stopped.json`);
      writeFileSync(stopFile, JSON.stringify({
        stoppedAt: Date.now(),
        stoppedUntil: Date.now() + STOP_COOLDOWN_MS,
      }));
    } catch {}

    // Pause auto-work so the tick doesn't re-send immediately
    if (pauseAutowork) {
      try {
        if (existsSync(AUTOWORK_FILE)) {
          const raw = JSON.parse(readFileSync(AUTOWORK_FILE, 'utf-8'));
          const policies = raw.policies || raw;
          if (policies[agentId]) {
            policies[agentId].enabled = false;
            if (raw.policies) {
              raw.policies = policies;
              writeFileSync(AUTOWORK_FILE, JSON.stringify(raw, null, 2));
            } else {
              writeFileSync(AUTOWORK_FILE, JSON.stringify(policies, null, 2));
            }
          }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      agentId,
      aborted,
      autoworkPaused: pauseAutowork,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to stop agent' }, { status: 500 });
  }
}
