import { NextResponse } from 'next/server';
import { DEMO_AGENTS } from '../../demo/data';

/**
 * Demo Mode API — Returns hardcoded demo agents
 */
export async function GET() {
  return NextResponse.json({
    agents: DEMO_AGENTS,
    activityLog: [],
  });
}
