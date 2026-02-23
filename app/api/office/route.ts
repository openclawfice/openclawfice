import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const OPENCLAW_CONFIG = join(OPENCLAW_DIR, 'openclaw.json');
const AGENTS_DIR = join(OPENCLAW_DIR, 'agents');
const CRON_JOBS_FILE = join(OPENCLAW_DIR, 'cron', 'jobs.json');
const STATUS_DIR = join(OPENCLAW_DIR, '.status');
const ACTIVITY_FILE = join(STATUS_DIR, 'activity.json');
const CHAT_FILE = join(STATUS_DIR, 'chat.json');
const WATERCOOLER_MARKER = join(STATUS_DIR, 'watercooler-active.json');

interface SessionInfo {
  sessionId: string;
  updatedAt: number;
}

interface AgentConfig {
  id: string;
  name: string;
  role?: string;
  emoji?: string;
  color?: string;
  skinColor?: string;
  shirtColor?: string;
  hairColor?: string;
  sessionKey?: string;
  workingThresholdMin?: number;
  hasIdentity?: boolean;
}

/**
 * Parse IDENTITY.md to extract agent display info (Name, Role/Creature, Emoji, Vibe).
 */
function parseIdentityMd(filePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    if (!existsSync(filePath)) return result;
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    for (const line of lines) {
      // Match patterns like: - **Name:** Cipher  or  - **Emoji:** ⚡
      const match = line.match(/[-*]*\s*\*\*(\w+):\*\*\s*(.+)/);
      if (match) {
        result[match[1].toLowerCase()] = match[2].trim();
      }
    }
  } catch {}
  return result;
}

/**
 * Read openclawfice.config.json for display overrides (colors, NPC appearance, etc.)
 */
function readOfficeConfig(): { office?: any; agents?: Record<string, any>; owner?: any } {
  try {
    const candidates = [
      join(process.cwd(), 'openclawfice.config.json'),
      join(homedir(), '.openclaw', 'openclawfice.config.json'),
    ];
    for (const path of candidates) {
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, 'utf-8'));
      }
    }
  } catch {}
  return {};
}

/**
 * Generate a deterministic color from a string (for agents without config)
 */
function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * Auto-discover agents from openclaw.json.
 * Pulls display names from each agent's IDENTITY.md.
 * Merges optional overrides from openclawfice.config.json.
 */
function discoverAgents(): AgentConfig[] {
  try {
    if (!existsSync(OPENCLAW_CONFIG)) return [];
    const config = JSON.parse(readFileSync(OPENCLAW_CONFIG, 'utf-8'));
    const agentsList = config.agents?.list || [];
    const defaultWorkspace = config.agents?.defaults?.workspace;
    const officeConfig = readOfficeConfig();
    const agentOverrides = officeConfig.agents || {};
    const ownerConfig = officeConfig.owner || {};
    
    const agents: AgentConfig[] = agentsList.map((agent: any) => {
      const override = agentOverrides[agent.id] || {};
      
      // Read IDENTITY.md from agent's workspace
      const workspace = agent.workspace || defaultWorkspace || '';
      const identity = parseIdentityMd(join(workspace, 'IDENTITY.md'));
      
      // Priority: config override > IDENTITY.md > openclaw.json > defaults
      // Capitalize raw IDs: "main" → "Main", "my-agent" → "My Agent"
      const fallbackName = (agent.name || agent.id)
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      const name = override.name || identity.name || fallbackName;
      const role = override.role || identity.role || identity.creature || 'Agent';
      const emoji = override.emoji || identity.emoji || '🤖';
      const hasIdentity = !!identity.name;
      
      return {
        id: agent.id,
        name,
        role,
        emoji,
        color: override.color || hashColor(name),
        skinColor: override.skinColor,
        shirtColor: override.shirtColor || override.color || hashColor(name),
        hairColor: override.hairColor,
        sessionKey: agent.sessionKey || `agent:${agent.id}:main`,
        workingThresholdMin: override.workingThresholdMin || agent.workingThresholdMin || 5,
        hasIdentity,
      };
    });

    // Add owner: check USER.md in the main agent's workspace for name
    // Only show owner if USER.md exists or owner is configured
    const mainAgent = agentsList.find((a: any) => a.id === 'main');
    const mainWorkspace = mainAgent?.workspace || defaultWorkspace || '';
    let ownerName = ownerConfig.name || '';
    if (!ownerName) {
      try {
        const userMd = join(mainWorkspace, 'USER.md');
        if (existsSync(userMd)) {
          const content = readFileSync(userMd, 'utf-8');
          const match = content.match(/[-*]*\s*\*\*Name:\*\*\s*(.+)/);
          if (match) ownerName = match[1].trim();
        }
      } catch {}
    }
    
    if (ownerName) {
      agents.unshift({
        id: '_owner',
        name: ownerName,
        role: ownerConfig.role || 'Owner',
        emoji: ownerConfig.emoji || '👑',
        color: ownerConfig.color || '#10b981',
        skinColor: ownerConfig.skinColor,
        shirtColor: ownerConfig.shirtColor || ownerConfig.color || '#10b981',
        hairColor: ownerConfig.hairColor,
        sessionKey: 'agent:main:main',
        workingThresholdMin: ownerConfig.workingThresholdMin || 60,
      });
    }

    return agents;
  } catch (err) {
    console.error('Failed to discover agents:', err);
    return [];
  }
}

/**
 * Read sessions.json for an agent
 */
function readSessionsJson(agentId: string): Record<string, SessionInfo> {
  try {
    const file = join(AGENTS_DIR, agentId, 'sessions', 'sessions.json');
    if (existsSync(file)) {
      return JSON.parse(readFileSync(file, 'utf-8'));
    }
  } catch (err) {
    console.error(`Failed to read sessions for ${agentId}:`, err);
  }
  return {};
}

/**
 * Read agent status file (manual overrides)
 */
function readStatusFile(agentId: string): { task?: string; status?: string; mood?: string; updatedAt?: number } {
  try {
    const file = join(STATUS_DIR, `${agentId}.json`);
    if (existsSync(file)) {
      return JSON.parse(readFileSync(file, 'utf-8'));
    }
  } catch {}
  return {};
}

/**
 * Read cron jobs and find the next scheduled run per agent.
 */
function resolveJobTarget(job: any): string {
  const name = (job.name || '').toLowerCase();
  const payload = (job.payload?.message || '').toLowerCase();
  const combined = name + ' ' + payload;

  // More specific matches first
  if (combined.includes('ocf-pm') || combined.includes('nova')) return 'ocf-pm';
  if (combined.includes('ocf-dev') || combined.includes('forge')) return 'ocf-dev';
  if (combined.includes('scout') || combined.includes('outreach')) return 'outreach';
  if (combined.includes('pixel') || combined.includes('openclawfice')) return 'openclawfice';
  return job.agentId || 'main';
}

function getNextCronRuns(): Record<string, number> {
  const result: Record<string, number> = {};
  try {
    if (!existsSync(CRON_JOBS_FILE)) return result;
    const data = JSON.parse(readFileSync(CRON_JOBS_FILE, 'utf-8'));
    const jobs: any[] = data.jobs || [];
    const now = Date.now();

    for (const job of jobs) {
      if (!job.enabled) continue;
      const nextRun = job.state?.nextRunAtMs;
      if (!nextRun || nextRun < now) continue;

      const targetAgent = resolveJobTarget(job);
      if (targetAgent && (!result[targetAgent] || nextRun < result[targetAgent])) {
        result[targetAgent] = nextRun;
      }
    }
  } catch (err) {
    console.error('Failed to read cron jobs:', err);
  }
  return result;
}

function getAgentCooldowns(): Record<string, { jobId: string; jobName: string; intervalMs: number; enabled: boolean; nextRunAt?: number }> {
  const result: Record<string, any> = {};
  try {
    if (!existsSync(CRON_JOBS_FILE)) return result;
    const data = JSON.parse(readFileSync(CRON_JOBS_FILE, 'utf-8'));
    const jobs: any[] = data.jobs || [];

    // Map of agent names/ids to look for in job names
    const agentKeywords: Record<string, string[]> = {};

    for (const job of jobs) {
      if (!job.schedule?.everyMs) continue; // only interval-based jobs
      const name = (job.name || '').toLowerCase();
      const isSelfWork = name.includes('self-assign') || name.includes('self-check') || name.includes('cooldown');
      if (!isSelfWork) continue;

      const targetAgent = resolveJobTarget(job);

      if (!result[targetAgent]) {
        result[targetAgent] = {
          jobId: job.id,
          jobName: job.name || 'Unnamed',
          intervalMs: job.schedule.everyMs,
          enabled: job.enabled !== false,
          nextRunAt: job.state?.nextRunAtMs,
        };
      }
    }
  } catch (err) {
    console.error('Failed to read cooldowns:', err);
  }
  return result;
}

/**
 * Read the last N lines of a JSONL file efficiently (tail reading).
 */
function readTailLines(filePath: string, maxLines: number = 20): string[] {
  try {
    const fs = require('fs');
    const fd = fs.openSync(filePath, 'r');
    const stat = fs.fstatSync(fd);
    const chunkSize = Math.min(stat.size, 65536); // last 64KB
    const buf = Buffer.alloc(chunkSize);
    fs.readSync(fd, buf, 0, chunkSize, stat.size - chunkSize);
    fs.closeSync(fd);
    const lines = buf.toString('utf-8').split('\n').filter((l: string) => l.trim());
    return lines.slice(-maxLines);
  } catch {
    return [];
  }
}

/**
 * Detect whether recent transcript lines contain watercooler chat.
 * Watercooler user prompts contain "WATER COOLER CHAT".
 */
function isWatercoolerEntry(msg: any): boolean {
  if (!msg) return false;
  const c = msg.content;
  const text = typeof c === 'string' ? c
    : Array.isArray(c) ? (c.find((x: any) => x.type === 'text')?.text || '') : '';
  return text.includes('WATER COOLER CHAT');
}

interface TaskEvidence {
  task: string;
  hasToolCalls: boolean;
  lastToolUseTs: number;
  lastActivityTs: number;
}

/**
 * Infer what an agent is doing from the tail of their session transcript.
 * Also returns evidence of actual work (tool calls) vs just chatting.
 */
function inferTaskWithEvidence(agentId: string, sessionId: string): TaskEvidence {
  const empty: TaskEvidence = { task: '', hasToolCalls: false, lastToolUseTs: 0, lastActivityTs: 0 };
  const filePath = join(AGENTS_DIR, agentId, 'sessions', `${sessionId}.jsonl`);
  if (!existsSync(filePath)) return empty;

  const lines = readTailLines(filePath, 40);
  let task = '';
  let hasToolCalls = false;
  let lastToolUseTs = 0;
  let lastActivityTs = 0;
  let inWatercoolerBlock = false;

  // First pass: scan for tool calls and timestamps
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const msg = entry.type === 'message' ? entry.message : entry;
      const ts = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
      if (!msg?.role) continue;

      if (ts > lastActivityTs) lastActivityTs = ts;

      if (msg.role === 'assistant' && Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if (part.type === 'tool_use') {
            hasToolCalls = true;
            if (ts > lastToolUseTs) lastToolUseTs = ts;
          }
        }
      }
    } catch {}
  }

  // Second pass (reverse): find the task description, skipping watercooler blocks
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const entry = JSON.parse(lines[i]);
      const msg = entry.type === 'message' ? entry.message : entry;
      if (!msg?.role) continue;

      // If we hit a watercooler user prompt, mark that we're in a watercooler block
      if (msg.role === 'user' && isWatercoolerEntry(msg)) {
        inWatercoolerBlock = true;
        continue;
      }

      // Skip assistant replies that immediately follow a watercooler prompt
      if (msg.role === 'assistant' && inWatercoolerBlock) {
        inWatercoolerBlock = false;
        continue;
      }
      inWatercoolerBlock = false;

      if (!task && msg.role === 'assistant' && msg.content) {
        const parts = Array.isArray(msg.content) ? msg.content : [];
        const textPart = parts.find((c: any) => c.type === 'text');
        if (textPart?.text && textPart.text.length > 10) {
          let t = textPart.text
            .split('\n')
            .map((l: string) => l.trim())
            .find((l: string) => 
              l.length > 10 && 
              !l.startsWith('#') && 
              !l.startsWith('---') &&
              !l.startsWith('```') &&
              !l.includes('HEARTBEAT')
            ) || '';
          t = t.replace(/^\*+\s*/, '').replace(/\*+$/, '').replace(/^[-•]\s*/, '').trim();
          if (t.length > 80) t = t.slice(0, 77) + '...';
          if (t) { task = t; break; }
        }

        // Check for tool calls as task evidence
        const toolPart = parts.find((c: any) => c.type === 'tool_use');
        if (toolPart) {
          const name = toolPart.name || 'unknown';
          let detail = '';
          if (toolPart.input) {
            detail = toolPart.input.path || toolPart.input.command || toolPart.input.pattern || '';
            if (detail.length > 60) detail = '...' + detail.slice(-57);
          }
          task = detail ? `${name}: ${detail}` : name;
          break;
        }
      }

      if (!task && msg.role === 'user') {
        const c = msg.content;
        const text = typeof c === 'string' ? c
          : Array.isArray(c) ? (c.find((x: any) => x.type === 'text')?.text || '') : '';
        if (text.length > 10 && !text.includes('HEARTBEAT') && !text.includes('Read HEARTBEAT.md')
            && !text.includes('Agent-to-agent') && !text.includes('announce step')
            && !text.includes('Pre-compaction memory flush') && !text.includes('WATER COOLER CHAT')) {
          let t = text.replace(/^\[.*?\]\s*/, '').replace(/\n/g, ' ').trim();
          if (t.length > 80) t = t.slice(0, 77) + '...';
          task = t;
          break;
        }
      }
    } catch {}
  }
  
  return { task, hasToolCalls, lastToolUseTs, lastActivityTs };
}

function inferTask(agentId: string, sessionId: string): string {
  return inferTaskWithEvidence(agentId, sessionId).task;
}

/**
 * Infer what the owner (human) is doing from their last user message.
 */
function inferOwnerTask(agentId: string, sessionId: string): string {
  const filePath = join(AGENTS_DIR, agentId, 'sessions', `${sessionId}.jsonl`);
  if (!existsSync(filePath)) return '';
  const lines = readTailLines(filePath, 50);
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const entry = JSON.parse(lines[i]);
      const msg = entry.type === 'message' ? entry.message : entry;
      if (msg?.role === 'user') {
        const c = msg.content;
        const text = typeof c === 'string' ? c
          : Array.isArray(c) ? (c.find((x: any) => x.type === 'text')?.text || '') : '';
        if (text.length > 5 && !text.includes('HEARTBEAT') && !text.includes('Read HEARTBEAT.md') && !text.includes('Pre-compaction memory flush') && !text.includes('WATER COOLER CHAT')) {
          let task = text.replace(/^\[.*?\]\s*/, '').replace(/\n/g, ' ').trim();
          if (task.length > 80) task = task.slice(0, 77) + '...';
          return task;
        }
      }
    } catch {}
  }
  return '';
}

/**
 * Read activity log
 */
function readActivityLog(): { t: string; who: string; text: string }[] {
  try {
    if (existsSync(ACTIVITY_FILE)) {
      return JSON.parse(readFileSync(ACTIVITY_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

/**
 * Read chat log
 */
function readChatLog(): { from: string; text: string; ts: number }[] {
  try {
    if (existsSync(CHAT_FILE)) {
      return JSON.parse(readFileSync(CHAT_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

/**
 * Format timestamp as human-readable time
 */
function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });
}

/**
 * Main API handler
 */
export async function GET() {
  const now = Date.now();

  // Read watercooler markers — agents that were recently chatting, not working
  let wcMarkers: Record<string, number> = {};
  try {
    if (existsSync(WATERCOOLER_MARKER)) {
      wcMarkers = JSON.parse(readFileSync(WATERCOOLER_MARKER, 'utf-8'));
    }
  } catch {}
  const WC_GRACE_MS = 30_000; // ignore session activity within 30s of a watercooler call

  // Auto-discover agents
  const agentConfigs = discoverAgents();
  
  // Get next cron run times for cooldown timers
  const nextCronRuns = getNextCronRuns();
  const agentCooldowns = getAgentCooldowns();

  // Read autowork policies to get next auto-task times
  let autoworkPolicies: Record<string, { enabled: boolean; intervalMs: number; lastSentAt: number }> = {};
  try {
    const awFile = join(STATUS_DIR, 'autowork.json');
    if (existsSync(awFile)) {
      const raw = JSON.parse(readFileSync(awFile, 'utf-8'));
      autoworkPolicies = raw.policies || {};
    }
  } catch {}

  // Build agent statuses
  const agents = agentConfigs.map(cfg => {
    const agentDirId = cfg.id === '_owner' ? 'main' : cfg.id;
    const sessions = readSessionsJson(agentDirId);
    const statusFile = readStatusFile(agentDirId);
    
    // Find the session we're tracking (or most recent), ignoring non-work sessions
    const IGNORED_SESSIONS = ['watercooler', 'watercooler-test'];
    let targetSession: SessionInfo | null = null;
    if (cfg.sessionKey && sessions[cfg.sessionKey]) {
      targetSession = sessions[cfg.sessionKey];
    } else {
      for (const [key, session] of Object.entries(sessions)) {
        if (IGNORED_SESSIONS.some(s => key.includes(`:${s}`))) continue;
        if (!targetSession || session.updatedAt > targetSession.updatedAt) {
          targetSession = session;
        }
      }
    }

    let status: 'working' | 'idle' | 'blocked' = 'idle';
    let task = '';
    let mood: 'great' | 'good' | 'okay' | 'stressed' = 'good';
    let updatedAt = targetSession?.updatedAt || 0;

    // Primary signal: session activity
    const agentDir = cfg.id === '_owner' ? 'main' : cfg.id;
    // Check if session activity is just from watercooler chat
    const wcLastActive = wcMarkers[cfg.id] || 0;
    const isWatercoolerActivity = (now - wcLastActive) < WC_GRACE_MS;

    let evidence: TaskEvidence | null = null;

    if (targetSession && !isWatercoolerActivity) {
      const minsSinceUpdate = (now - targetSession.updatedAt) / 60000;
      const threshold = cfg.workingThresholdMin || 5;
      
      if (minsSinceUpdate < threshold) {
        if (cfg.id === '_owner') {
          task = inferOwnerTask(agentDir, targetSession.sessionId);
          status = 'working';
          mood = 'great';
        } else {
          evidence = inferTaskWithEvidence(agentDir, targetSession.sessionId);
          task = evidence.task;

          // Only count as "working" if there are actual tool calls (real work),
          // OR if the last tool call was recent. Text-only responses (no tools)
          // use a much shorter window — the agent just replied but isn't doing work.
          const hasRecentToolUse = evidence.lastToolUseTs > 0 &&
            (now - evidence.lastToolUseTs) / 60000 < threshold;
          const textOnlyThresholdMin = 0.5; // 30 seconds for text-only

          if (hasRecentToolUse) {
            status = 'working';
            mood = 'great';
          } else if (minsSinceUpdate < textOnlyThresholdMin) {
            status = 'working';
            mood = 'good';
          }
          // Otherwise stays idle — agent just chatted or said it's idle
        }
        if (status === 'working' && !task) task = 'Working...';
      }
    }

    // Override with status file if fresher
    if (statusFile.status && statusFile.updatedAt) {
      const statusMins = (now - statusFile.updatedAt) / 60000;
      if (statusMins < (cfg.workingThresholdMin || 5)) {
        status = statusFile.status as any;
        if (statusFile.task) task = statusFile.task;
        if (statusFile.mood) mood = statusFile.mood as any;
        updatedAt = statusFile.updatedAt;
      }
    }

    // Also check for spawned sub-sessions
    if (status === 'idle' && !isWatercoolerActivity) {
      for (const [key, session] of Object.entries(sessions)) {
        if (session === targetSession) continue;
        if (IGNORED_SESSIONS.some(s => key.includes(`:${s}`))) continue;
        const sessMins = (now - session.updatedAt) / 60000;
        if (sessMins < (cfg.workingThresholdMin || 5)) {
          status = 'working';
          mood = 'good';
          task = inferTask(agentDir, session.sessionId) || 'Working on a subtask...';
          updatedAt = session.updatedAt;
          break;
        }
      }
    }

    // Detect if agent has ever run
    const hasEverRun = updatedAt > 0;

    return {
      id: cfg.id,
      name: cfg.name,
      role: cfg.role,
      emoji: cfg.emoji,
      color: cfg.color,
      skinColor: cfg.skinColor,
      shirtColor: cfg.shirtColor || cfg.color,
      hairColor: cfg.hairColor,
      status,
      task: status === 'working' ? task : undefined,
      mood,
      lastActive: status === 'idle' 
        ? (hasEverRun ? formatTime(updatedAt) : 'Not yet active') 
        : undefined,
      nextTaskAt: (() => {
        if (status !== 'idle') return undefined;
        const cronNext = nextCronRuns[cfg.id] || 0;
        const aw = autoworkPolicies[cfg.id];
        const awNext = (aw?.enabled && aw.lastSentAt && aw.intervalMs)
          ? aw.lastSentAt + aw.intervalMs : 0;
        const candidates = [cronNext, awNext].filter(t => t > 0);
        return candidates.length > 0 ? Math.min(...candidates) : undefined;
      })(),
      cooldown: agentCooldowns[cfg.id] || undefined,
      isNew: !hasEverRun,
      hasIdentity: cfg.hasIdentity !== false,
      workEvidence: evidence ? {
        hasToolCalls: evidence.hasToolCalls,
        lastToolUseTs: evidence.lastToolUseTs,
        lastActivityTs: evidence.lastActivityTs,
      } : undefined,
    };
  });

  // Read activity log + chat log
  const activityLog = readActivityLog();
  const chatLog = readChatLog();

  return NextResponse.json({ 
    agents,
    activityLog,
    chatLog,
    timestamp: new Date(now).toISOString() 
  });
}
