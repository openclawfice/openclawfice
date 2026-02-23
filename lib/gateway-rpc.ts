/**
 * OpenClaw Gateway RPC Client
 * 
 * Sends cron updates to the running gateway via a child process,
 * since Next.js API routes can't reliably use the `ws` WebSocket package.
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { homedir } from 'os';

const SCRIPT = join(homedir(), '.openclaw', '.status', 'gateway-rpc-helper.mjs');

export async function gatewayRpc(method: string, params: Record<string, any> = {}, timeoutMs = 8000): Promise<any> {
  const paramsB64 = Buffer.from(JSON.stringify(params)).toString('base64');
  
  try {
    const result = execSync(
      `node ${SCRIPT} ${method} ${paramsB64}`,
      { encoding: 'utf-8', timeout: timeoutMs }
    );
    const parsed = JSON.parse(result.trim());
    if (parsed.error) throw new Error(parsed.error);
    return parsed;
  } catch (err: any) {
    if (err.stdout) {
      try {
        const parsed = JSON.parse(err.stdout.trim());
        if (parsed.error) throw new Error(parsed.error);
      } catch {}
    }
    throw new Error(err.message || 'gateway RPC failed');
  }
}
