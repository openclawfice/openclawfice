import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const STATUS_DIR = join(OPENCLAW_DIR, '.status');
const ACTIONS_FILE = join(STATUS_DIR, 'actions.json');
const ACCOMPLISHMENTS_FILE = join(STATUS_DIR, 'accomplishments.json');
const RESPONSES_FILE = join(STATUS_DIR, 'responses.json');

const CONFIG_PATHS = [
  join(process.cwd(), 'openclawfice.config.json'),
  join(OPENCLAW_DIR, 'openclawfice.config.json'),
];

function getOwnerName(): string {
  for (const p of CONFIG_PATHS) {
    try {
      if (existsSync(p)) {
        const cfg = JSON.parse(readFileSync(p, 'utf-8'));
        if (cfg.owner?.name) return cfg.owner.name;
      }
    } catch {}
  }
  try {
    const ocConfig = join(OPENCLAW_DIR, 'openclaw.json');
    if (existsSync(ocConfig)) {
      const cfg = JSON.parse(readFileSync(ocConfig, 'utf-8'));
      const mainAgent = cfg.agents?.list?.find((a: any) => a.id === 'main');
      const workspace = mainAgent?.workspace || cfg.agents?.defaults?.workspace || '';
      const userMd = join(workspace, 'USER.md');
      if (workspace && existsSync(userMd)) {
        const match = readFileSync(userMd, 'utf-8').match(/[-*]*\s*\*\*Name:\*\*\s*(.+)/);
        if (match) return match[1].trim();
      }
    }
  } catch {}
  return 'Owner';
}

function ensureStatusDir() {
  try {
    const fs = require('fs');
    if (!fs.existsSync(STATUS_DIR)) fs.mkdirSync(STATUS_DIR, { recursive: true });
  } catch {}
}

function readJson(path: string): any[] {
  try {
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {}
  return [];
}

function writeJson(path: string, data: any[]) {
  writeFileSync(path, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json({
    actions: readJson(ACTIONS_FILE),
    accomplishments: readJson(ACCOMPLISHMENTS_FILE),
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  ensureStatusDir();

  try {
    const body = await request.json();

    // Add action (quest)
    if (body.type === 'add_action') {
      const actions = readJson(ACTIONS_FILE);
      const action = body.action || body;
      actions.push({
        id: action.id || Date.now().toString(),
        type: action.type || 'decision',
        icon: action.icon || '❓',
        title: action.title,
        description: action.description,
        from: action.from,
        priority: action.priority || 'medium',
        createdAt: action.createdAt || Date.now(),
        data: action.data || {},
      });
      writeJson(ACTIONS_FILE, actions);
      return NextResponse.json({ success: true });
    }

    // Remove action
    if (body.type === 'remove_action') {
      const actions = readJson(ACTIONS_FILE).filter((a: any) => a.id !== body.id);
      writeJson(ACTIONS_FILE, actions);
      return NextResponse.json({ success: true });
    }

    // Respond to action (quest response)
    if (body.type === 'respond_action') {
      const actions = readJson(ACTIONS_FILE);
      const action = actions.find((a: any) => a.id === body.id);
      const remaining = actions.filter((a: any) => a.id !== body.id);
      writeJson(ACTIONS_FILE, remaining);

      // Save response for agent polling
      const responses = readJson(RESPONSES_FILE);
      responses.push({
        actionId: body.id,
        actionTitle: action?.title || body.id,
        from: getOwnerName(),
        response: body.response,
        respondedAt: Date.now(),
      });
      writeJson(RESPONSES_FILE, responses.slice(-100));

      // Auto-create accomplishment
      const accomplishments = readJson(ACCOMPLISHMENTS_FILE);
      accomplishments.push({
        id: `response-${body.id}`,
        icon: '✅',
        title: `Resolved: ${action?.title || body.id}`,
        detail: `Response: ${body.response}`,
        who: getOwnerName(),
        timestamp: Date.now(),
      });
      writeJson(ACCOMPLISHMENTS_FILE, accomplishments);

      return NextResponse.json({ success: true });
    }

    // Add accomplishment
    if (body.type === 'add_accomplishment') {
      const accomplishments = readJson(ACCOMPLISHMENTS_FILE);
      const a = body.accomplishment || body;
      accomplishments.push({
        id: a.id || Date.now().toString(),
        icon: a.icon || '✅',
        title: a.title,
        detail: a.detail,
        who: a.who,
        screenshot: a.screenshot,
        timestamp: a.timestamp || Date.now(),
      });
      writeJson(ACCOMPLISHMENTS_FILE, accomplishments);
      return NextResponse.json({ success: true });
    }

    // Legacy compat
    if (body.type === 'action') {
      const actions = readJson(ACTIONS_FILE);
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
      writeJson(ACTIONS_FILE, actions);
      return NextResponse.json({ success: true });
    }

    if (body.type === 'accomplishment') {
      const accomplishments = readJson(ACCOMPLISHMENTS_FILE);
      accomplishments.push({
        id: body.id || Date.now().toString(),
        icon: body.icon || '✅',
        title: body.title,
        detail: body.detail,
        who: body.who,
        screenshot: body.screenshot,
        timestamp: Date.now(),
      });
      writeJson(ACCOMPLISHMENTS_FILE, accomplishments);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
