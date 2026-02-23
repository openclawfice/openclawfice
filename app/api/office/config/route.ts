import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_PATHS = [
  join(process.cwd(), 'openclawfice.config.json'),
  join(homedir(), '.openclaw', 'openclawfice.config.json'),
];

/**
 * Read openclawfice.config.json with defaults
 */
function readConfig(): any {
  for (const path of CONFIG_PATHS) {
    if (existsSync(path)) {
      try {
        return JSON.parse(readFileSync(path, 'utf-8'));
      } catch {}
    }
  }
  
  // Return defaults if no config found
  return {
    waterCooler: {
      enabled: true,
      frequency: '45s',
      style: 'casual',
      context: true,
      maxMessages: 50,
      quiet: {
        enabled: false,
      },
    },
  };
}

export async function GET() {
  const config = readConfig();
  return NextResponse.json(config);
}
