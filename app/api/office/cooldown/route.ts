import { NextResponse } from 'next/server';
import { gatewayRpc } from '@/lib/gateway-rpc';

export async function POST(request: Request) {
  try {
    const { jobId, intervalMs, enabled } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'jobId required' }, { status: 400 });
    }

    const patch: Record<string, any> = {};

    if (intervalMs !== undefined && typeof intervalMs === 'number' && intervalMs >= 60000) {
      patch.schedule = { kind: 'every', everyMs: intervalMs };
    }

    if (enabled !== undefined && typeof enabled === 'boolean') {
      patch.enabled = enabled;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
    }

    // Use gateway RPC to update the cron job in the running scheduler
    const result = await gatewayRpc('cron.update', { jobId, patch });

    return NextResponse.json({
      success: true,
      job: result,
    });
  } catch (err: any) {
    console.error('Cooldown update failed:', err);
    return NextResponse.json({ error: err.message || 'Failed to update cooldown' }, { status: 500 });
  }
}
