export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { DEMO_CHAT, DEMO_CHAT_MESSAGES } from '../../../demo/data';

/**
 * Demo Mode Chat API — Returns simulated live water cooler chat
 * 
 * Starts with static history, then randomly adds new messages from the pool
 * to create the feeling of an active team chatting
 */

// Track last message index (resets on server restart, but that's fine for demo)
let messageIndex = 0;
let lastMessageTime = Date.now();

export async function GET() {
  const now = Date.now();
  const timeSinceLastMessage = now - lastMessageTime;
  
  // Add a new message every 8-15 seconds (with 60% probability on each poll)
  const shouldAddMessage = timeSinceLastMessage > 8000 && Math.random() < 0.6;
  
  let messages = [...DEMO_CHAT];
  
  if (shouldAddMessage && DEMO_CHAT_MESSAGES.length > 0) {
    const nextMessage = DEMO_CHAT_MESSAGES[messageIndex % DEMO_CHAT_MESSAGES.length];
    messages.push({
      ...nextMessage,
      ts: now,
    });
    messageIndex++;
    lastMessageTime = now;
    
    // Keep only last 10 messages to avoid infinite growth
    messages = messages.slice(-10);
  }
  
  return NextResponse.json({
    messages,
  });
}
