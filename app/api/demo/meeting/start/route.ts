export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';

/**
 * Demo Mode: Start a meeting
 * In demo mode, we just acknowledge it was created
 */
export async function POST(req: Request) {
  try {
    const { topic, participants } = await req.json();
    
    // Return a minimal meeting structure
    return NextResponse.json({
      success: true,
      meeting: {
        active: true,
        topic,
        participants,
        currentRound: 1,
        maxRounds: 4,
        startedAt: Date.now(),
        lastMessage: '',
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to start demo meeting' },
      { status: 500 }
    );
  }
}
