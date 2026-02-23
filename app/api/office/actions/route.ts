import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { exec } from 'child_process';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const STATUS_DIR = join(OPENCLAW_DIR, '.status');
const ACTIONS_FILE = join(STATUS_DIR, 'actions.json');
const ACCOMPLISHMENTS_FILE = join(STATUS_DIR, 'accomplishments.json');
const ACCOMPLISHMENTS_ARCHIVE = join(STATUS_DIR, 'accomplishments-archive.jsonl');
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

const RECORD_SCRIPT = join(process.cwd(), 'scripts', 'record-loom.sh');
const RECORD_DURATION = 6;

function triggerRecording(accomplishmentId: string, title: string, who: string) {
  if (!existsSync(RECORD_SCRIPT)) return;

  // Mark as recording synchronously so the UI can show REC immediately
  try {
    const accs = readJson(ACCOMPLISHMENTS_FILE);
    const target = accs.find((a: any) => a.id === accomplishmentId && !a.screenshot);
    if (target) {
      target.screenshot = 'recording';
      writeJson(ACCOMPLISHMENTS_FILE, accs);
    }
  } catch {}

  const ttsText = `${who} just completed: ${title}`;
  const cmd = `bash "${RECORD_SCRIPT}" "${accomplishmentId}" ${RECORD_DURATION} "${ttsText.replace(/"/g, '\\"')}"`;

  exec(cmd, { timeout: (RECORD_DURATION + 15) * 1000 }, (err, stdout) => {
    const updateScreenshot = (value: string | undefined) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const accomplishments = readJson(ACCOMPLISHMENTS_FILE);
          const acc = accomplishments.find(
            (a: any) => a.id === accomplishmentId && a.screenshot === 'recording'
          );
          if (acc) {
            if (value) {
              acc.screenshot = value;
            } else {
              delete acc.screenshot;
            }
            writeJson(ACCOMPLISHMENTS_FILE, accomplishments);
          }
          return;
        } catch {
          // Retry on file contention
        }
      }
    };

    if (err) {
      console.error(`Recording failed for ${accomplishmentId}:`, err.message);
      updateScreenshot(undefined);
      return;
    }
    const filename = stdout.trim();
    if (!filename || filename.startsWith('ERROR')) {
      updateScreenshot(undefined);
      return;
    }

    updateScreenshot(filename);
  });
}

const MAX_ACCOMPLISHMENTS = 200;

function trimAccomplishments(list: any[]): any[] {
  if (list.length <= MAX_ACCOMPLISHMENTS) return list;

  const overflow = list.slice(0, list.length - MAX_ACCOMPLISHMENTS);
  try {
    ensureStatusDir();
    const lines = overflow.map(a => JSON.stringify(a)).join('\n') + '\n';
    appendFileSync(ACCOMPLISHMENTS_ARCHIVE, lines);
  } catch {}

  return list.slice(list.length - MAX_ACCOMPLISHMENTS);
}

function readArchive(offset: number, limit: number): { items: any[]; total: number } {
  try {
    if (!existsSync(ACCOMPLISHMENTS_ARCHIVE)) return { items: [], total: 0 };
    const raw = readFileSync(ACCOMPLISHMENTS_ARCHIVE, 'utf-8').trim();
    if (!raw) return { items: [], total: 0 };
    const lines = raw.split('\n');
    const total = lines.length;
    // Reverse so newest archived items come first
    const reversed = lines.reverse();
    const sliced = reversed.slice(offset, offset + limit);
    const items = sliced.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const archiveOffset = parseInt(url.searchParams.get('archiveOffset') || '', 10);

  if (!isNaN(archiveOffset)) {
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const archive = readArchive(archiveOffset, limit);
    return NextResponse.json({
      archive: archive.items,
      archiveTotal: archive.total,
      offset: archiveOffset,
      limit,
    });
  }

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
      const responseAccId = `response-${body.id}`;
      const responseTitle = `Resolved: ${action?.title || body.id}`;
      accomplishments.push({
        id: responseAccId,
        icon: '✅',
        title: responseTitle,
        detail: `Response: ${body.response}`,
        who: getOwnerName(),
        timestamp: Date.now(),
      });
      writeJson(ACCOMPLISHMENTS_FILE, trimAccomplishments(accomplishments));
      triggerRecording(responseAccId, responseTitle, getOwnerName());

      return NextResponse.json({ success: true });
    }

    // Add accomplishment
    if (body.type === 'add_accomplishment') {
      const accomplishments = readJson(ACCOMPLISHMENTS_FILE);
      const a = body.accomplishment || body;
      const accId = a.id || Date.now().toString();
      accomplishments.push({
        id: accId,
        icon: a.icon || '✅',
        title: a.title,
        detail: a.detail,
        who: a.who,
        screenshot: a.screenshot,
        timestamp: a.timestamp || Date.now(),
      });
      writeJson(ACCOMPLISHMENTS_FILE, trimAccomplishments(accomplishments));

      // Auto-record a loom-style video if no screenshot was provided
      if (!a.screenshot) {
        triggerRecording(accId, a.title || 'Accomplishment', a.who || 'Agent');
      }

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
      const legacyAccId = body.id || Date.now().toString();
      accomplishments.push({
        id: legacyAccId,
        icon: body.icon || '✅',
        title: body.title,
        detail: body.detail,
        who: body.who,
        screenshot: body.screenshot,
        timestamp: Date.now(),
      });
      writeJson(ACCOMPLISHMENTS_FILE, trimAccomplishments(accomplishments));

      if (!body.screenshot) {
        triggerRecording(legacyAccId, body.title || 'Accomplishment', body.who || 'Agent');
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
