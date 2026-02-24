import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const MEETING_FILE = path.join(os.homedir(), '.openclaw', 'openclawfice-meeting.json');

export async function GET() {
  try {
    const data = await fs.readFile(MEETING_FILE, 'utf-8');
    const meeting = JSON.parse(data);
    return NextResponse.json(meeting);
  } catch (err: any) {
    // No meeting active
    if (err.code === 'ENOENT') {
      return NextResponse.json({ active: false });
    }
    console.error('Failed to read meeting:', err);
    return NextResponse.json({ active: false });
  }
}

// End a meeting
export async function DELETE() {
  try {
    await fs.unlink(MEETING_FILE);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return NextResponse.json({ success: true });
    }
    console.error('Failed to end meeting:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to end meeting' },
      { status: 500 }
    );
  }
}
