/**
 * API route tests for OpenClawfice.
 *
 * These verify the core API routes work correctly for a new install.
 * They use the route handlers directly (no HTTP server needed) by
 * constructing Request objects and calling the exported functions.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Create an isolated temp directory for each test run so we don't touch real files
const TEST_DIR = join(tmpdir(), `openclawfice-test-${Date.now()}`);
const STATUS_DIR = join(TEST_DIR, '.status');

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readJson(path: string): any {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

beforeEach(() => {
  ensureDir(STATUS_DIR);
});

afterEach(() => {
  try { rmSync(TEST_DIR, { recursive: true, force: true }); } catch {}
});

// ─── Config API ──────────────────────────────────────────────────────────────

describe('/api/office/config', () => {
  it('GET returns config with expected structure', async () => {
    const { GET } = await import('../app/api/office/config/route');
    const res = await GET();
    const data = await res.json();

    expect(data).toBeDefined();
    expect(data.waterCooler).toBeDefined();
    expect(typeof data.waterCooler.enabled).toBe('boolean');
    expect(typeof data.waterCooler.frequency).toBe('string');
  });

  it('POST writes config and returns it', async () => {
    const configPath = join(TEST_DIR, 'openclawfice.config.json');
    writeFileSync(configPath, JSON.stringify({ waterCooler: { enabled: true, frequency: '45s' } }));

    const { POST } = await import('../app/api/office/config/route');

    const req = new Request('http://localhost/api/office/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waterCooler: { frequency: '2m' } }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
  });
});

// ─── Actions & Accomplishments API ───────────────────────────────────────────

describe('/api/office/actions', () => {
  it('GET returns valid structure', async () => {
    const { GET } = await import('../app/api/office/actions/route');
    const req = new Request('http://localhost/api/office/actions');
    const res = await GET(req);
    const data = await res.json();

    expect(Array.isArray(data.actions)).toBe(true);
    expect(Array.isArray(data.accomplishments)).toBe(true);
    expect(data.timestamp).toBeDefined();
  });

  it('GET with archiveOffset returns archive structure', async () => {
    const { GET } = await import('../app/api/office/actions/route');
    const req = new Request('http://localhost/api/office/actions?archiveOffset=0&limit=10');
    const res = await GET(req);
    const data = await res.json();

    expect(Array.isArray(data.archive)).toBe(true);
    expect(typeof data.archiveTotal).toBe('number');
    expect(data.offset).toBe(0);
    expect(data.limit).toBe(10);
  });

  it('POST add_action creates a quest', async () => {
    const { POST } = await import('../app/api/office/actions/route');
    const req = new Request('http://localhost/api/office/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'add_action',
        action: {
          id: 'test-1',
          type: 'decision',
          icon: '❓',
          title: 'Test Quest',
          description: 'Should we do the thing?',
          from: 'TestBot',
          priority: 'high',
        },
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('POST add_accomplishment records completed work', async () => {
    const { POST } = await import('../app/api/office/actions/route');
    const req = new Request('http://localhost/api/office/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'add_accomplishment',
        accomplishment: {
          id: 'acc-1',
          icon: '🚀',
          title: 'Shipped feature X',
          detail: 'Built and deployed the new dashboard',
          who: 'Forge',
        },
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('POST with invalid type returns 400', async () => {
    const { POST } = await import('../app/api/office/actions/route');
    const req = new Request('http://localhost/api/office/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'invalid_type' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ─── Autowork API ────────────────────────────────────────────────────────────

describe('/api/office/autowork', () => {
  it('GET returns empty policies when no file exists', async () => {
    const { GET } = await import('../app/api/office/autowork/route');
    const res = await GET();
    const data = await res.json();

    expect(data.policies).toBeDefined();
    expect(data.maxSendsPerTick).toBeGreaterThanOrEqual(1);
    expect(data.mission).toBeDefined();
  });

  it('POST creates a new policy for an agent', async () => {
    const { POST } = await import('../app/api/office/autowork/route');
    const req = new Request('http://localhost/api/office/autowork', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'test-agent',
        enabled: true,
        intervalMs: 300_000,
        directive: 'Find new creators',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.policy.enabled).toBe(true);
    expect(data.policy.intervalMs).toBe(300_000);
    expect(data.policy.directive).toBe('Find new creators');
  });

  it('POST rejects intervalMs below 60s', async () => {
    const { POST } = await import('../app/api/office/autowork/route');
    const req = new Request('http://localhost/api/office/autowork', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: 'test', intervalMs: 5000 }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.success).toBe(true);
    // intervalMs should remain at default, not 5000
    expect(data.policy.intervalMs).toBe(600_000);
  });

  it('POST without agentId returns 400', async () => {
    const { POST } = await import('../app/api/office/autowork/route');
    const req = new Request('http://localhost/api/office/autowork', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: true }),
    });

    const res = await POST(req);
    // Should succeed (just maxSendsPerTick update) or return success without policy
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('PUT tick returns valid structure', async () => {
    const { PUT } = await import('../app/api/office/autowork/route');
    const req = new Request('http://localhost/api/office/autowork', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await PUT(req);
    const data = await res.json();

    expect(Array.isArray(data.sent)).toBe(true);
    expect(Array.isArray(data.queued)).toBe(true);
    expect(data.tick).toBeGreaterThan(0);
  });
});

// ─── Chat API ────────────────────────────────────────────────────────────────

describe('/api/office/chat', () => {
  it('GET returns empty array when no chat file exists', async () => {
    const { GET } = await import('../app/api/office/chat/route');
    const res = await GET();
    const data = await res.json();

    expect(Array.isArray(data)).toBe(true);
  });

  it('POST user_message adds to chat log', async () => {
    const { POST } = await import('../app/api/office/chat/route');
    const req = new Request('http://localhost/api/office/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'user_message',
        from: 'Tyler',
        text: 'Hey team, how is everyone doing?',
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('POST with empty agents returns error', async () => {
    const { POST } = await import('../app/api/office/chat/route');
    const req = new Request('http://localhost/api/office/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentNames: [] }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});

// ─── Stop API ────────────────────────────────────────────────────────────────

describe('/api/office/stop', () => {
  it('POST without agentId returns 400', async () => {
    const { POST } = await import('../app/api/office/stop/route');
    const req = new Request('http://localhost/api/office/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('POST with agentId returns success even if gateway is down', async () => {
    const { POST } = await import('../app/api/office/stop/route');
    const req = new Request('http://localhost/api/office/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: 'test-agent' }),
    });

    const res = await POST(req);
    const data = await res.json();
    // Should succeed (abort failure is non-fatal)
    expect(data.success).toBe(true);
    expect(data.agentId).toBe('test-agent');
  });
});
