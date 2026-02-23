import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_PATHS = [
  join(process.cwd(), 'openclawfice.config.json'),
  join(homedir(), '.openclaw', 'openclawfice.config.json'),
];

const DEFAULTS = {
  waterCooler: {
    enabled: true,
    frequency: '45s',
    maxMessages: 50,
    quiet: { enabled: false, start: '23:00', end: '08:00' },
  },
  mission: { goal: '', priorities: [] as string[], context: '' },
};

function findConfigPath(): string {
  for (const p of CONFIG_PATHS) {
    if (existsSync(p)) return p;
  }
  // Default write location
  return CONFIG_PATHS[0];
}

function readConfig(): any {
  for (const path of CONFIG_PATHS) {
    if (existsSync(path)) {
      try {
        return JSON.parse(readFileSync(path, 'utf-8'));
      } catch {}
    }
  }
  return { ...DEFAULTS };
}

export async function GET() {
  return NextResponse.json(readConfig());
}

/**
 * POST — update config fields (deep-merged into existing config)
 */
export async function POST(request: Request) {
  try {
    const patch = await request.json();
    const config = readConfig();

    // Deep-merge patch into config (one level)
    for (const [key, value] of Object.entries(patch)) {
      if (value && typeof value === 'object' && !Array.isArray(value) && config[key] && typeof config[key] === 'object') {
        config[key] = { ...config[key], ...value };
      } else {
        config[key] = value;
      }
    }

    const configPath = findConfigPath();
    const dir = join(configPath, '..');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(configPath, JSON.stringify(config, null, 2));

    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save config' }, { status: 500 });
  }
}
