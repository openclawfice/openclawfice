import { NextResponse } from 'next/server';
import { DEMO_QUESTS, DEMO_ACCOMPLISHMENTS } from '../../../demo/data';

/**
 * Demo Mode Actions API — Returns hardcoded quests and accomplishments
 */
export async function GET() {
  return NextResponse.json({
    actions: DEMO_QUESTS,
    accomplishments: DEMO_ACCOMPLISHMENTS,
  });
}
