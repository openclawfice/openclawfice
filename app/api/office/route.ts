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
      const name = override.name || identity.name || agent.name || agent.id;
      const role = override.role || identity.role || identity.creature || 'Agent';
      const emoji = override.emoji || identity.emoji || '🤖';
      
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
      };
    });

    // Add owner: check USER.md in the main agent's workspace for name
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

      const agentId = job.agentId;
      if (agentId && (!result[agentId] || nextRun < result[agentId])) {
        result[agentId] = nextRun;
      }
    }
  } catch (err) {
    console.error('Failed to read cron jobs:', err);
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
 * Infer what an agent is doing from the tail of their session transcript.
 */
function inferTask(agentId: string, sessionId: string): string {
  const filePath = join(AGENTS_DIR, agentId, 'sessions', `${sessionId}.jsonl`);
  if (!existsSync(filePath)) return '';

  const lines = readTailLines(filePath, 20);

  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const entry = JSON.parse(lines[i]);
      const msg = entry.type === 'message' ? entry.message : entry;
      if (!msg?.role) continue;

      // Look for assistant messages with tool calls or meaningful text
      if (msg.role === 'assistant' && msg.content) {
        const parts = Array.isArray(msg.content) ? msg.content : [];
        
        // Prefer tool calls
        const toolCall = parts.find((c: any) => c.type === 'toolCall');
        if (toolCall) {
          const name = toolCall.name || toolCall.toolName || 'a tool';
          return `Using ${name}...`;
        }
        
        // Otherwise use text content
        const textPart = parts.find((c: any) => c.type === 'text');
        if (textPart?.text && textPart.text.length > 10) {
          let task = textPart.text
            .split('\n')
            .map((l: string) => l.trim())
            .find((l: string) => 
              l.length > 10 && 
              !l.startsWith('#') && 
              !l.startsWith('---') &&
              !l.includes('HEARTBEAT')
            ) || '';
          
          task = task.replace(/^\*+\s*/, '').replace(/\*+$/, '').trim();
          if (task.length > 80) task = task.slice(0, 77) + '...';
          if (task) return task;
        }
      }
    } catch {}
  }
  
  return '';
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
        if (text.length > 5 && !text.includes('HEARTBEAT') && !text.includes('Read HEARTBEAT.md') && !text.includes('Pre-compaction memory flush')) {
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

  // Auto-discover agents
  const agentConfigs = discoverAgents();
  
  // Get next cron run times for cooldown timers
  const nextCronRuns = getNextCronRuns();

  // Build agent statuses
  const agents = agentConfigs.map(cfg => {
    const agentDirId = cfg.id === '_owner' ? 'main' : cfg.id;
    const sessions = readSessionsJson(agentDirId);
    const statusFile = readStatusFile(agentDirId);
    
    // Find the session we're tracking (or most recent)
    let targetSession: SessionInfo | null = null;
    if (cfg.sessionKey && sessions[cfg.sessionKey]) {
      targetSession = sessions[cfg.sessionKey];
    } else {
      // Find most recently updated session
      for (const session of Object.values(sessions)) {
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
    if (targetSession) {
      const minsSinceUpdate = (now - targetSession.updatedAt) / 60000;
      
      if (minsSinceUpdate < (cfg.workingThresholdMin || 5)) {
        status = 'working';
        mood = 'great';
        task = cfg.id === '_owner' 
          ? inferOwnerTask(agentDir, targetSession.sessionId)
          : inferTask(agentDir, targetSession.sessionId);
        if (!task) task = 'Working...';
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
    if (status === 'idle') {
      for (const session of Object.values(sessions)) {
        if (session === targetSession) continue;
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
      lastActive: status === 'idle' ? (updatedAt ? formatTime(updatedAt) : 'Unknown') : undefined,
      nextTaskAt: status === 'idle' && nextCronRuns[cfg.id] ? nextCronRuns[cfg.id] : undefined,
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
