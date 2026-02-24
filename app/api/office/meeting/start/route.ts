/**
 * Meeting Start Route — DO NOT OVERWRITE
 * 
 * Transcript starts EMPTY and gets populated live by /simulate endpoint.
 * This creates a real-time discussion feel (messages appear one by one).
 * 
 * Owner: Cipher | Last updated: 2026-02-24
 */
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const STATUS_DIR = path.join(os.homedir(), '.openclaw', '.status');
const MEETING_FILE = path.join(STATUS_DIR, 'meeting.json');

export async function POST(req: Request) {
  try {
    const { topic, participants } = await req.json();

    if (!topic || !participants || participants.length < 2) {
      return NextResponse.json(
        { error: 'Meeting requires a topic and at least 2 participants' },
        { status: 400 }
      );
    }

    const meeting = {
      active: true,
      topic,
      participants,
      currentRound: 1,
      maxRounds: 4,
      startedAt: Date.now(),
      lastMessage: `Meeting started: ${topic}`,
      transcript: [], // Empty! Simulate endpoint fills this in live
    };

    await fs.mkdir(STATUS_DIR, { recursive: true });
    await fs.writeFile(MEETING_FILE, JSON.stringify(meeting, null, 2));

    return NextResponse.json({ success: true, meeting });
  } catch (err: any) {
    console.error('Failed to start meeting:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to start meeting' },
      { status: 500 }
    );
  }
}
