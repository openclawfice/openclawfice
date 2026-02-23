import { NextResponse } from 'next/server';
import { DEMO_MEETING } from '../../../demo/data';

/**
 * Demo Mode Meeting API — Returns hardcoded demo meeting
 */
export async function GET() {
  return NextResponse.json(DEMO_MEETING);
}
