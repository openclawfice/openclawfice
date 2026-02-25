import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { exec } from 'child_process';
import { findRelatedFile } from '../../../../lib/file-finder';
import { requireAuth } from '../../../../lib/auth';

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

// Resolve gateway URL and auth from openclaw config
function getGatewayUrl(): string {
  try {
    const ocConfig = join(OPENCLAW_DIR, 'openclaw.json');
    if (existsSync(ocConfig)) {
      const cfg = JSON.parse(readFileSync(ocConfig, 'utf-8'));
      if (cfg.gateway?.url) return cfg.gateway.url.replace(/\/$/, '').replace('ws://', 'http://').replace('wss://', 'https://');
    }
  } catch {}
  // Fallback: try common local ports
  return 'http://127.0.0.1:18789';
}

function getGatewayAuth(): string | null {
  try {
    const ocConfig = join(OPENCLAW_DIR, 'openclaw.json');
    if (existsSync(ocConfig)) {
      const cfg = JSON.parse(readFileSync(ocConfig, 'utf-8'));
      if (typeof cfg.gateway?.auth === 'string') return cfg.gateway.auth;
      if (cfg.gateway?.auth?.token) return cfg.gateway.auth.token;
    }
  } catch {}
  return null;
}

// Map display names (from quest "from" field) → OpenClaw agent session keys
function resolveAgentSessionKeys(): Record<string, string> {
  const map: Record<string, string> = {};
  try {
    const ocConfig = join(OPENCLAW_DIR, 'openclaw.json');
    if (existsSync(ocConfig)) {
      const cfg = JSON.parse(readFileSync(ocConfig, 'utf-8'));
      const agents = cfg.agents?.list || [];
      for (const agent of agents) {
        // Read agent identity to get display name
        const workspace = agent.workspace || cfg.agents?.defaults?.workspace || '';
        if (workspace) {
          const identityPath = join(workspace, 'IDENTITY.md');
          try {
            if (existsSync(identityPath)) {
              const identity = readFileSync(identityPath, 'utf-8');
              const nameMatch = identity.match(/\*\*Name:\*\*\s*(.+)/);
              if (nameMatch) {
                map[nameMatch[1].trim().toLowerCase()] = `agent:${agent.id}:main`;
              }
            }
          } catch {}
        }
        // Also map the agent id itself
        map[agent.id] = `agent:${agent.id}:main`;
      }
    }
  } catch {}
  return map;
}

// Isolated recording via headless Chrome (no user disruption)
const RECORD_ISOLATED = join(process.cwd(), 'scripts', 'record-isolated.mjs');
const RECORD_LEGACY = join(process.cwd(), 'scripts', 'record-loom.sh');
const RECORD_DURATION = 6;
const MIN_RECORDING_GAP_MS = 15000; // At most one recording every 15 seconds
let lastRecordingStarted = 0;

function detectFeatureType(title: string, detail: string = ''): string {
  const text = `${title} ${detail}`.toLowerCase();
  
  // UI features — these have specific demo triggers that show the feature
  if (text.match(/\bxp\b|experience|level|celebration|animation|points/i)) return 'xp';
  if (text.match(/meeting|collaborate|discussion|sync|call/i)) return 'meeting';
  if (text.match(/quest|modal|decision|approval/i)) return 'quest';
  if (text.match(/water[- ]?cooler|chat|conversation/i)) return 'watercooler';
  if (text.match(/accomplishment|achievement|feed|completed/i)) return 'accomplishment';
  
  // Non-UI work — skip recording (a generic dashboard recording is misleading)
  // These accomplishments don't have a visual feature to demo
  return 'skip';
}

function triggerRecording(accomplishmentId: string, title: string, who: string, detail: string = '') {
  // Prefer isolated recorder; fall back to legacy screencapture
  const useIsolated = existsSync(RECORD_ISOLATED);
  const hasLegacy = existsSync(RECORD_LEGACY);
  if (!useIsolated && !hasLegacy) return;

  // Rate limit: skip if a recording started recently
  const now = Date.now();
  if (now - lastRecordingStarted < MIN_RECORDING_GAP_MS) {
    console.log(`[recording] Skipped for ${accomplishmentId} (rate limited, last was ${Math.round((now - lastRecordingStarted) / 1000)}s ago)`);
    return;
  }
  lastRecordingStarted = now;

  // Mark as recording synchronously so the UI can show REC immediately
  try {
    const accs = readJson(ACCOMPLISHMENTS_FILE);
    const target = accs.find((a: any) => a.id === accomplishmentId && !a.screenshot);
    if (target) {
      target.screenshot = 'recording';
      writeJson(ACCOMPLISHMENTS_FILE, accs);
    }
  } catch {}

  // Detect what feature this accomplishment is about
  const featureType = detectFeatureType(title, detail);

  // Skip recording for non-UI work — a generic dashboard recording is misleading
  if (featureType === 'skip') {
    console.log(`[recording] Skipped for ${accomplishmentId} (non-UI work, no feature to demo)`);
    // Remove the 'recording' marker since we're not actually recording
    try {
      const accs2 = readJson(ACCOMPLISHMENTS_FILE);
      const target2 = accs2.find((a: any) => a.id === accomplishmentId && a.screenshot === 'recording');
      if (target2) {
        delete target2.screenshot;
        writeJson(ACCOMPLISHMENTS_FILE, accs2);
      }
    } catch {}
    return;
  }

  // Build command — isolated headless recorder or legacy screencapture
  let cmd: string;
  if (useIsolated) {
    cmd = `node "${RECORD_ISOLATED}" "${accomplishmentId}" ${RECORD_DURATION} "${featureType}"`;
  } else {
    const ttsText = `${who} just completed: ${title}`;
    cmd = `bash "${RECORD_LEGACY}" "${accomplishmentId}" ${RECORD_DURATION} "${ttsText.replace(/"/g, '\\"')}"`;
  }

  // Generous timeout: headless Chrome startup + recording + encoding
  const timeoutMs = useIsolated ? (RECORD_DURATION + 30) * 1000 : (RECORD_DURATION + 15) * 1000;

  exec(cmd, { timeout: timeoutMs }, (err, stdout) => {
    const updateScreenshot = (value: string | undefined) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const accomplishments = readJson(ACCOMPLISHMENTS_FILE);
          const acc = accomplishments.find(
            (a: any) => a.id === accomplishmentId
          );
          if (acc) {
            if (value) {
              acc.screenshot = value;
            } else if (acc.screenshot === 'recording') {
              // Only clear if still in recording state (don't overwrite a valid screenshot)
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
      console.error('Recording failed for accomplishment:', String(accomplishmentId).replace(/[\r\n]/g, ''), err.message);
      updateScreenshot(undefined);
      return;
    }
    const filename = stdout.trim();
    if (!filename || filename.startsWith('ERROR') || filename.startsWith('SKIP')) {
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
  const authError = requireAuth(request);
  if (authError) return authError;

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

  const accomplishments = readJson(ACCOMPLISHMENTS_FILE);
  let dirty = false;
  for (const acc of accomplishments) {
    if (!acc.file && acc.title) {
      const related = findRelatedFile(acc.title, acc.detail || '');
      if (related) {
        acc.file = related;
        dirty = true;
      }
    }
  }
  if (dirty) {
    try { ensureStatusDir(); writeJson(ACCOMPLISHMENTS_FILE, accomplishments); } catch {}
  }

  return NextResponse.json({
    actions: readJson(ACTIONS_FILE),
    accomplishments,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  // Require authentication for POST operations
  const authError = requireAuth(request);
  if (authError) return authError;

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
        actionAgent: action?.from || null,  // who created the quest (for agent polling)
        from: getOwnerName(),
        response: body.response,
        respondedAt: Date.now(),
      });
      writeJson(RESPONSES_FILE, responses.slice(-100));

      // Auto-notify agent who created the quest
      if (action?.from) {
        try {
          const agentName = action.from.toLowerCase();
          // Map display names → actual OpenClaw agent IDs
          const agentSessionMap: Record<string, string> = resolveAgentSessionKeys();
          const sessionKey = agentSessionMap[agentName];
          // Extract the agent ID from session key (agent:<id>:main → <id>)
          const agentId = sessionKey ? sessionKey.replace('agent:', '').replace(':main', '') : agentName;
          const notifyMessage = `[Quest Response] Tyler responded to your quest: "${action.title}"\n\nResponse: ${body.response}\n\nPlease take action on this response now. If this was an email approval, send the email. If this was a decision, implement it.`;
          
          // Use OpenClaw CLI to send message to agent (fire-and-forget)
          const escapedMsg = notifyMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n');
          exec(`openclaw agent --agent "${agentId}" -m "${escapedMsg}" --json 2>/dev/null`, { timeout: 30000 }, (err, stdout, stderr) => {
            if (err) {
              console.log(`[quest-notify] ⚠️ CLI notification to ${agentId} failed: ${err.message}`);
            } else {
              console.log(`[quest-notify] ✅ Notified agent ${agentId} about quest response via CLI`);
            }
          });
        } catch (err) {
          // Silent fail
          console.log('[quest-notify] Notification failed:', err);
        }
      }

      // Auto-create accomplishment
      const accomplishments = readJson(ACCOMPLISHMENTS_FILE);
      const responseAccId = `response-${body.id}`;
      const responseTitle = `Resolved: ${action?.title || body.id}`;
      const responseDetail = `Response: ${body.response}`;
      accomplishments.push({
        id: responseAccId,
        icon: '✅',
        title: responseTitle,
        detail: responseDetail,
        who: getOwnerName(),
        timestamp: Date.now(),
      });
      writeJson(ACCOMPLISHMENTS_FILE, trimAccomplishments(accomplishments));
      triggerRecording(responseAccId, responseTitle, getOwnerName(), responseDetail);

      return NextResponse.json({ success: true });
    }

    // Add accomplishment
    if (body.type === 'add_accomplishment') {
      const accomplishments = readJson(ACCOMPLISHMENTS_FILE);
      const a = body.accomplishment || body;
      const accId = a.id || Date.now().toString();
      const relatedFile = a.file || findRelatedFile(a.title || '', a.detail || '') || undefined;
      accomplishments.push({
        id: accId,
        icon: a.icon || '✅',
        title: a.title,
        detail: a.detail,
        who: a.who,
        screenshot: a.screenshot,
        file: relatedFile,
        timestamp: a.timestamp || Date.now(),
      });
      writeJson(ACCOMPLISHMENTS_FILE, trimAccomplishments(accomplishments));

      // Auto-record a loom-style video if no screenshot was provided
      if (!a.screenshot) {
        triggerRecording(accId, a.title || 'Accomplishment', a.who || 'Agent', a.detail || '');
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
      const legacyRelatedFile = body.file || findRelatedFile(body.title || '', body.detail || '') || undefined;
      accomplishments.push({
        id: legacyAccId,
        icon: body.icon || '✅',
        title: body.title,
        detail: body.detail,
        who: body.who,
        screenshot: body.screenshot,
        file: legacyRelatedFile,
        timestamp: Date.now(),
      });
      writeJson(ACCOMPLISHMENTS_FILE, trimAccomplishments(accomplishments));

      if (!body.screenshot) {
        triggerRecording(legacyAccId, body.title || 'Accomplishment', body.who || 'Agent', body.detail || '');
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
