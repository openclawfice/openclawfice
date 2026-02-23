import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';
import { homedir } from 'os';
import { readFileSync, writeFileSync, existsSync } from 'fs';

// Find openclaw binary: check PATH first, then common install locations
function findOpenclawBin(): string {
  const { execSync } = require('child_process');
  try {
    return execSync('which openclaw', { encoding: 'utf-8' }).trim();
  } catch {}
  const candidates = [
    join(homedir(), '.local/node/bin/openclaw'),
    join(homedir(), '.local/bin/openclaw'),
    '/usr/local/bin/openclaw',
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return 'openclaw'; // fallback to PATH
}

const OPENCLAW_BIN = findOpenclawBin();
const CHAT_FILE = join(homedir(), '.openclaw', '.status', 'chat.json');

/**
 * Send a message to an OpenClaw agent (fire and forget)
 */
function sendToAgentAsync(agentId: string, message: string): void {
  // Fire and forget - don't wait for response
  const proc = spawn(OPENCLAW_BIN, ['agent', '--agent', agentId, '--message', message], {
    env: process.env,
    detached: true,
    stdio: 'ignore',
  });
  
  // Unref so it doesn't block
  proc.unref();
}

/**
 * Add message to water cooler chat log
 */
function addToChatLog(from: string, text: string): void {
  try {
    let chatLog: any[] = [];
    if (existsSync(CHAT_FILE)) {
      chatLog = JSON.parse(readFileSync(CHAT_FILE, 'utf-8'));
    }
    
    chatLog.push({
      from,
      text,
      ts: Date.now()
    });
    
    // Keep last 50 messages
    if (chatLog.length > 50) {
      chatLog = chatLog.slice(-50);
    }
    
    writeFileSync(CHAT_FILE, JSON.stringify(chatLog, null, 2));
  } catch (err) {
    console.error('Failed to add to chat log:', err);
  }
}

/**
 * POST endpoint to send messages to agents
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, message, broadcast, agentIds } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (broadcast && agentIds && Array.isArray(agentIds)) {
      // Broadcast to multiple agents
      for (const id of agentIds) {
        sendToAgentAsync(id, message);
      }
      
      // Add to water cooler chat log so it appears in UI
      addToChatLog('You', message);
      
      return NextResponse.json({ 
        success: true, 
        broadcast: true,
        agentCount: agentIds.length,
        message 
      });
    }

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required for DM' }, { status: 400 });
    }

    // Send message to specific agent (fire and forget)
    sendToAgentAsync(agentId, message);
    
    // Also add to water cooler for visibility
    addToChatLog('You', `→ ${agentId}: ${message}`);

    return NextResponse.json({ 
      success: true, 
      agentId, 
      message,
      sent: true 
    });

  } catch (err: any) {
    return NextResponse.json({ 
      error: err.message || 'Failed to send message'
    }, { status: 500 });
  }
}
