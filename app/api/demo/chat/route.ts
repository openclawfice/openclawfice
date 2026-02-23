import { NextResponse } from 'next/server';
import { DEMO_CHAT } from '../../../demo/data';

/**
 * Demo Mode Chat API — Returns hardcoded demo chat messages
 */
export async function GET() {
  return NextResponse.json({
    messages: DEMO_CHAT,
  });
}
