import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { requireAuth } from '../../../../lib/auth';
import { generateChat, getNextChatIn } from '../../../../lib/watercooler-ticker';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const CHAT_FILE = join(STATUS_DIR, 'chat.json');
const CONFIG_PATHS = [
  join(process.cwd(), 'openclawfice.config.json'),
  join(homedir(), '.openclaw', 'openclawfice.config.json'),
];

function readChat(): any[] {
  try {
    if (existsSync(CHAT_FILE)) return JSON.parse(readFileSync(CHAT_FILE, 'utf-8'));
  } catch {}
  return [];
}

function readOfficeConfig(): any {
  for (const path of CONFIG_PATHS) {
    if (existsSync(path)) {
      try { return JSON.parse(readFileSync(path, 'utf-8')); } catch {}
    }
  }
  return {};
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  if (url.searchParams.has('status')) {
    return NextResponse.json({ nextChatIn: getNextChatIn() });
  }

  return NextResponse.json(readChat());
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const config = readOfficeConfig();
    const waterCoolerConfig = config.waterCooler || {};

    // User message — add directly to chat log
    const chatFrom = body.from || body.agent;
    const chatText = body.text || body.message;
    if (body.type === 'user_message' && typeof chatFrom === 'string' && chatFrom.trim() && typeof chatText === 'string' && chatText.trim()) {
      const chat = readChat();
      chat.push({ from: chatFrom.trim(), text: chatText.trim(), ts: Date.now() });
      const maxMessages = waterCoolerConfig.maxMessages || 50;
      writeFileSync(CHAT_FILE, JSON.stringify(chat.slice(-maxMessages), null, 2));
      return NextResponse.json({ success: true });
    }

    // Agent chat generation — delegate to shared module (also used by server-side ticker)
    const result = await generateChat();
    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    }
    return NextResponse.json({ success: false, error: result.error });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate chat' }, { status: 500 });
  }
}
