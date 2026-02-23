import { NextResponse } from 'next/server';
import { readFileSync, existsSync, openSync, fstatSync, readSync, closeSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const AGENTS_DIR = join(homedir(), '.openclaw', 'agents');

interface LogEntry {
  ts: string;
  role: 'user' | 'assistant' | 'tool';
  type: 'text' | 'tool_use' | 'tool_result';
  content: string;
  toolName?: string;
}

function readTailLines(filePath: string, maxLines: number): string[] {
  try {
    const fd = openSync(filePath, 'r');
    const stat = fstatSync(fd);
    const chunkSize = Math.min(stat.size, 512 * 1024);
    const buf = Buffer.alloc(chunkSize);
    readSync(fd, buf, 0, chunkSize, stat.size - chunkSize);
    closeSync(fd);
    return buf.toString('utf-8').split('\n').filter(l => l.trim());
  } catch {
    return [];
  }
}

function parseTranscriptEntries(lines: string[]): LogEntry[] {
  const entries: LogEntry[] = [];

  for (const line of lines) {
    try {
      const raw = JSON.parse(line);
      const entry = raw.type === 'message' ? raw : { message: raw, timestamp: raw.timestamp };
      const msg = entry.message;
      if (!msg?.role) continue;

      const ts = entry.timestamp || raw.timestamp || '';

      if (msg.role === 'assistant') {
        const parts = Array.isArray(msg.content) ? msg.content : [];

        for (const part of parts) {
          if (part.type === 'text' && part.text?.trim()) {
            entries.push({ ts, role: 'assistant', type: 'text', content: part.text.trim() });
          } else if (part.type === 'tool_use' || part.type === 'toolCall') {
            const name = part.name || part.toolName || 'unknown_tool';
            let inputStr = '';
            const inp = part.input || part.arguments || null;
            if (inp) {
              try {
                if (inp.command || inp.cmd) {
                  inputStr = inp.command || inp.cmd;
                } else if (inp.path || inp.file_path) {
                  inputStr = inp.path || inp.file_path;
                  if (inp.pattern) inputStr += ` (pattern: ${inp.pattern})`;
                  if (inp.old_string) inputStr += `\nold: ${inp.old_string.slice(0, 200)}`;
                  if (inp.new_string) inputStr += `\nnew: ${inp.new_string.slice(0, 200)}`;
                } else if (inp.pattern || inp.query || inp.regex) {
                  inputStr = inp.pattern || inp.query || inp.regex;
                } else {
                  inputStr = JSON.stringify(inp).slice(0, 300);
                }
              } catch {
                inputStr = '[input]';
              }
            }
            entries.push({
              ts, role: 'assistant', type: 'tool_use',
              content: inputStr,
              toolName: name,
            });
          }
        }
      } else if (msg.role === 'user') {
        const c = msg.content;
        const text = typeof c === 'string' ? c
          : Array.isArray(c) ? (c.find((x: any) => x.type === 'text')?.text || '') : '';
        if (!text) continue;
        entries.push({ ts, role: 'user', type: 'text', content: text });
      } else if (msg.role === 'tool' || msg.role === 'toolResult') {
        const c = msg.content;
        const text = typeof c === 'string' ? c
          : Array.isArray(c) ? (c.find((x: any) => x.type === 'text')?.text || '') : '';
        if (!text) continue;
        entries.push({
          ts, role: 'tool', type: 'tool_result',
          content: text,
        });
      }
    } catch {}
  }

  return entries;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get('agentId');
  const limit = Math.min(parseInt(searchParams.get('limit') || '80'), 500);

  if (!agentId) {
    return NextResponse.json({ error: 'agentId required' }, { status: 400 });
  }

  const agentDirId = agentId === '_owner' ? 'main' : agentId;
  const sessionsFile = join(AGENTS_DIR, agentDirId, 'sessions', 'sessions.json');

  if (!existsSync(sessionsFile)) {
    return NextResponse.json({ entries: [], sessions: [] });
  }

  let sessions: Record<string, any> = {};
  try {
    sessions = JSON.parse(readFileSync(sessionsFile, 'utf-8'));
  } catch {
    return NextResponse.json({ entries: [], sessions: [] });
  }

  // Find the most recent session (include all sessions)
  let targetKey = '';
  let targetSession: any = null;
  for (const [key, session] of Object.entries(sessions) as [string, any][]) {
    if (!targetSession || session.updatedAt > targetSession.updatedAt) {
      targetSession = session;
      targetKey = key;
    }
  }

  if (!targetSession) {
    return NextResponse.json({ entries: [], sessions: [] });
  }

  const transcriptPath = join(AGENTS_DIR, agentDirId, 'sessions', `${targetSession.sessionId}.jsonl`);
  const lines = readTailLines(transcriptPath, limit * 3);
  const entries = parseTranscriptEntries(lines).slice(-limit);

  // Build session list summary
  const sessionList = Object.entries(sessions)
    .map(([key, s]: [string, any]) => ({
      key,
      sessionId: s.sessionId,
      updatedAt: s.updatedAt,
      active: key === targetKey,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 10);

  return NextResponse.json({
    entries,
    activeSession: {
      key: targetKey,
      sessionId: targetSession.sessionId,
      updatedAt: targetSession.updatedAt,
    },
    sessions: sessionList,
  });
}
