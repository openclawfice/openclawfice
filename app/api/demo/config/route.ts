import { NextResponse } from 'next/server';

/**
 * Demo Mode Config API — Returns demo config
 */
export async function GET() {
  return NextResponse.json({
    waterCooler: {
      enabled: true,
      frequency: 300000, // 5 minutes
      style: 'casual',
      personality: 'friendly',
    },
    meetingRoom: {
      enabled: true,
    },
  });
}
