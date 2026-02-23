import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const ACTIONS_FILE = join(STATUS_DIR, 'actions.json');
const ACCOMPLISHMENTS_FILE = join(STATUS_DIR, 'accomplishments.json');

// Ensure status dir exists
function ensureStatusDir() {
  try {
    const fs = require('fs');
    if (!fs.existsSync(STATUS_DIR)) {
      fs.mkdirSync(STATUS_DIR, { recursive: true });
    }
  } catch {}
}

function readActions(): any[] {
  try {
    if (existsSync(ACTIONS_FILE)) {
      return JSON.parse(readFileSync(ACTIONS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function readAccomplishments(): any[] {
  try {
    if (existsSync(ACCOMPLISHMENTS_FILE)) {
      return JSON.parse(readFileSync(ACCOMPLISHMENTS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

export async function GET() {
  const actions = readActions();
  const accomplishments = readAccomplishments();
  
  return NextResponse.json({
    actions,
    accomplishments,
    timestamp: new Date().toISOString(),
  });
}

// POST endpoint to add actions/accomplishments
export async function POST(request: Request) {
  ensureStatusDir();
  
  try {
    const body = await request.json();
    
    if (body.type === 'action') {
      const actions = readActions();
      actions.push({
        id: body.id || Date.now().toString(),
        type: body.actionType || 'decision',
        icon: body.icon || '❓',
        title: body.title,
        description: body.description,
        from: body.from,
        priority: body.priority || 'medium',
        createdAt: Date.now(),
        data: body.data || {},
      });
      writeFileSync(ACTIONS_FILE, JSON.stringify(actions, null, 2));
      return NextResponse.json({ success: true, action: actions[actions.length - 1] });
    }
    
    if (body.type === 'accomplishment') {
      const accomplishments = readAccomplishments();
      accomplishments.push({
        id: body.id || Date.now().toString(),
        icon: body.icon || '✅',
        title: body.title,
        detail: body.detail,
        who: body.who,
        timestamp: Date.now(),
      });
      writeFileSync(ACCOMPLISHMENTS_FILE, JSON.stringify(accomplishments, null, 2));
      return NextResponse.json({ success: true, accomplishment: accomplishments[accomplishments.length - 1] });
    }
    
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
