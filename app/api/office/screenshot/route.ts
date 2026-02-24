import { NextResponse } from 'next/server';
import { existsSync, statSync, createReadStream } from 'fs';
import { join, extname } from 'path';
import { homedir } from 'os';
import { validateFilename } from '@/lib/input-validation';

const STATUS_DIR = join(homedir(), '.openclaw', '.status', 'screenshots');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get('file');

  if (!file || !validateFilename(file)) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  const filePath = join(STATUS_DIR, file);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const ext = extname(file).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  };
  const contentType = mimeMap[ext] || 'application/octet-stream';
  const stat = statSync(filePath);
  const fileSize = stat.size;

  // Handle Range requests (required for <video> seek/play)
  const range = req.headers.get('range');
  if (range) {
    const match = range.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const stream = createReadStream(filePath, { start, end });
      const readable = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk: string | Buffer) => controller.enqueue(new Uint8Array(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))));
          stream.on('end', () => controller.close());
          stream.on('error', (err) => controller.error(err));
        },
      });

      return new Response(readable, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  }

  // Full file response with Accept-Ranges header
  const stream = createReadStream(filePath);
  const readable = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk: string | Buffer) => controller.enqueue(new Uint8Array(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))));
      stream.on('end', () => controller.close());
      stream.on('error', (err) => controller.error(err));
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(fileSize),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
