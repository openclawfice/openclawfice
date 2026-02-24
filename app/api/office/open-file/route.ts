import { NextResponse } from 'next/server';
import { basename } from 'path';
import { exec } from 'child_process';
import { findFile, findRelatedFile, getAgentWorkspaces } from '../../../../lib/file-finder';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filename = url.searchParams.get('name');
  const title = url.searchParams.get('title');

  if (title) {
    const detail = url.searchParams.get('detail') || '';
    const resolved = findRelatedFile(title, detail);
    if (!resolved) {
      return NextResponse.json({ error: 'No related file found' }, { status: 404 });
    }
    return NextResponse.json({ path: resolved, filename: basename(resolved) });
  }

  if (!filename) {
    return NextResponse.json({ error: 'Missing name parameter' }, { status: 400 });
  }

  const resolved = findFile(filename);
  if (!resolved) {
    return NextResponse.json({ error: 'File not found', searched: getAgentWorkspaces() }, { status: 404 });
  }

  return NextResponse.json({ path: resolved, filename: basename(resolved) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const filename = body.name;
    if (!filename) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    const resolved = findFile(filename);
    if (!resolved) {
      return NextResponse.json({ error: 'File not found', searched: getAgentWorkspaces() }, { status: 404 });
    }

    const editors = ['cursor', 'code'];
    let opened = false;
    for (const editor of editors) {
      try {
        await new Promise<void>((resolve, reject) => {
          exec(`${editor} "${resolved}"`, { timeout: 5000 }, (err) => {
            if (err) reject(err); else resolve();
          });
        });
        opened = true;
        break;
      } catch { continue; }
    }

    if (!opened) {
      exec(`open "${resolved}"`, { timeout: 5000 });
    }

    return NextResponse.json({ path: resolved, opened: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to open file' }, { status: 500 });
  }
}
