import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const MEETING_FILE = path.join(os.homedir(), '.openclaw', 'openclawfice-meeting.json');

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
      participants, // array of agent IDs
      currentRound: 1,
      maxRounds: 4,
      startedAt: Date.now(),
      lastMessage: '',
      transcript: [], // Initialize transcript for UI
    };

    await fs.mkdir(path.dirname(MEETING_FILE), { recursive: true });
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
