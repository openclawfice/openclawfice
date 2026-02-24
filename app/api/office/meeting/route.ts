import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const MEETING_FILE = join(STATUS_DIR, 'meeting.json');

export async function GET() {
  try {
    if (!existsSync(MEETING_FILE)) {
      return NextResponse.json({ active: false });
    }

    const data = JSON.parse(readFileSync(MEETING_FILE, 'utf-8'));
    
    // Return meeting data including transcript
    return NextResponse.json({
      active: data.active || false,
      topic: data.topic || '',
      participants: data.participants || [],
      currentRound: data.currentRound || 1,
      maxRounds: data.maxRounds || 4,
      startedAt: data.startedAt || Date.now(),
      lastMessage: data.lastMessage || '',
      transcript: data.transcript || [],
    });
  } catch (err) {
    console.error('Failed to read meeting.json:', err);
    return NextResponse.json({ active: false });
  }
}

/**
 * POST — Add a message to the meeting transcript
 * Body: { agent: string, message: string, round?: number }
 */
export async function POST(req: Request) {
  try {
    const { agent, message, round } = await req.json();

    if (!agent || !message) {
      return NextResponse.json({ error: 'agent and message required' }, { status: 400 });
    }

    if (!existsSync(MEETING_FILE)) {
      return NextResponse.json({ error: 'No active meeting' }, { status: 404 });
    }

    const data = JSON.parse(readFileSync(MEETING_FILE, 'utf-8'));

    if (!data.active) {
      return NextResponse.json({ error: 'Meeting is not active' }, { status: 400 });
    }

    // Initialize transcript array if missing
    if (!Array.isArray(data.transcript)) {
      data.transcript = [];
    }

    // Cap transcript at 100 messages to prevent unbounded growth
    const entry = {
      agent,
      message,
      round: round || data.currentRound || 1,
      timestamp: Date.now(),
    };

    data.transcript.push(entry);
    if (data.transcript.length > 100) {
      data.transcript = data.transcript.slice(-100);
    }

    // Also update lastMessage for backward compatibility
    data.lastMessage = `${agent}: ${message}`;
    if (round) {
      data.currentRound = round;
    }

    mkdirSync(STATUS_DIR, { recursive: true });
    writeFileSync(MEETING_FILE, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    const safeMsg = String(err?.message || 'Unknown error').replace(/[\r\n]/g, ' ');
    console.error('Failed to add meeting message:', safeMsg);
    return NextResponse.json({ error: safeMsg }, { status: 500 });
  }
}

/**
 * DELETE — End the active meeting
 */
export async function DELETE() {
  try {
    if (existsSync(MEETING_FILE)) {
      unlinkSync(MEETING_FILE);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const safeMsg = String(err?.message || 'Unknown error').replace(/[\r\n]/g, ' ');
    console.error('Failed to end meeting:', safeMsg);
    return NextResponse.json({ error: safeMsg }, { status: 500 });
  }
}
