import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { requireAuth } from '../../../../lib/auth';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const OPENCLAW_CONFIG = join(OPENCLAW_DIR, 'openclaw.json');

/**
 * Export workflow configuration as git-friendly JSON.
 * Allows teams to version control, fork, diff, and merge configs.
 */
export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    // Read OpenClaw config
    if (!existsSync(OPENCLAW_CONFIG)) {
      return NextResponse.json(
        { error: 'OpenClaw config not found', path: OPENCLAW_CONFIG },
        { status: 404 }
      );
    }

    const config = JSON.parse(readFileSync(OPENCLAW_CONFIG, 'utf-8'));

    // Build a clean, git-friendly export
    const workflow = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      exported_by: 'openclawfice',
      
      // Agent configuration
      agents: (config.agents?.list || []).map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        role: agent.role || 'AI Agent',
        emoji: agent.emoji || '🤖',
        workspace: agent.workspace,
        // Exclude runtime-specific paths
      })),

      // Gateway configuration (if present)
      gateway: config.gateway ? {
        url: config.gateway.url || 'http://localhost:3000',
        // Exclude tokens - teams should use env vars
      } : undefined,

      // Defaults
      defaults: config.agents?.defaults ? {
        workspace: config.agents.defaults.workspace,
        model: config.agents.defaults.model,
      } : undefined,

      // OpenClawfice-specific metadata
      metadata: {
        export_source: 'openclawfice',
        compatible_with: ['openclaw >= 0.1.0'],
        description: 'AI agent workflow configuration',
      },
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(workflow, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="workflow-${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to export workflow', details: error.message },
      { status: 500 }
    );
  }
}
