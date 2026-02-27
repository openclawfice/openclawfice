import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics.json');

interface VisitEvent {
  timestamp: string;
  page: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  referrer?: string;
  userAgent?: string;
}

function readAnalytics(): VisitEvent[] {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return [];
}

function writeAnalytics(events: VisitEvent[]) {
  // Keep last 10K events to avoid unbounded growth
  const trimmed = events.slice(-10000);
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(trimmed, null, 2));
}

// POST /api/analytics — log a visit event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event: VisitEvent = {
      timestamp: new Date().toISOString(),
      page: body.page || '/',
      utm_source: body.utm_source,
      utm_medium: body.utm_medium,
      utm_campaign: body.utm_campaign,
      utm_content: body.utm_content,
      referrer: body.referrer,
      userAgent: req.headers.get('user-agent') || undefined,
    };

    const events = readAnalytics();
    events.push(event);
    writeAnalytics(events);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}

// GET /api/analytics — get summary stats (requires auth token)
export async function GET(req: NextRequest) {
  // Check auth for reading analytics
  const tokenPath = path.join(process.env.HOME || '~', '.openclaw', '.openclawfice-token');
  let expectedToken = '';
  try {
    expectedToken = fs.readFileSync(tokenPath, 'utf-8').trim();
  } catch { /* no token = no auth */ }

  if (expectedToken) {
    const provided = req.headers.get('x-openclawfice-token') || '';
    if (provided !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const events = readAnalytics();

  // Group by source
  const bySource: Record<string, number> = {};
  const byCampaign: Record<string, number> = {};
  const byPage: Record<string, number> = {};
  const last24h: VisitEvent[] = [];
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;

  for (const e of events) {
    const src = e.utm_source || 'direct';
    bySource[src] = (bySource[src] || 0) + 1;

    if (e.utm_campaign) {
      byCampaign[e.utm_campaign] = (byCampaign[e.utm_campaign] || 0) + 1;
    }

    byPage[e.page] = (byPage[e.page] || 0) + 1;

    if (new Date(e.timestamp).getTime() > cutoff) {
      last24h.push(e);
    }
  }

  return NextResponse.json({
    total: events.length,
    last24h: last24h.length,
    bySource,
    byCampaign,
    byPage,
    recentEvents: last24h.slice(-50),
  });
}
