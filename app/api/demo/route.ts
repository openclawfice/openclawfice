export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { DEMO_AGENTS, DEMO_TASKS } from '../../demo/data';

/**
 * Demo Mode API — Returns simulated live agent data
 * 
 * Each request randomly updates agents to create the illusion of a living workspace:
 * - Agents switch between working/idle
 * - Tasks rotate from task pool
 * - Subtle randomness makes it feel real
 */
export async function GET() {
  const now = Date.now();
  
  // Simulate live agents with random status/task changes
  const simulatedAgents = DEMO_AGENTS.map((agent) => {
    // 15% chance an agent changes status on each poll
    const shouldChangeStatus = Math.random() < 0.15;
    
    // 25% chance a working agent gets a new task
    const shouldChangeTask = agent.status === 'working' && Math.random() < 0.25;
    
    let newStatus = agent.status;
    let newTask = agent.task;
    
    if (shouldChangeStatus) {
      newStatus = agent.status === 'working' ? 'idle' : 'working';
    }
    
    if (shouldChangeTask && DEMO_TASKS[agent.id as keyof typeof DEMO_TASKS]) {
      const tasks = DEMO_TASKS[agent.id as keyof typeof DEMO_TASKS];
      newTask = tasks[Math.floor(Math.random() * tasks.length)];
    }
    
    // If agent just switched to idle, clear task
    if (newStatus === 'idle') {
      newTask = '';
    }
    
    // If agent just switched to working but has no task, assign one
    if (newStatus === 'working' && !newTask && DEMO_TASKS[agent.id as keyof typeof DEMO_TASKS]) {
      const tasks = DEMO_TASKS[agent.id as keyof typeof DEMO_TASKS];
      newTask = tasks[Math.floor(Math.random() * tasks.length)];
    }
    
    return {
      ...agent,
      status: newStatus,
      task: newTask,
      // Add work evidence for status verification
      workEvidence: newStatus === 'working' ? {
        hasToolCalls: true,
        lastToolUseTs: now - 30000, // 30 seconds ago
        lastActivityTs: now - 10000, // 10 seconds ago
      } : undefined,
    };
  });
  
  return NextResponse.json({
    agents: simulatedAgents,
    activityLog: [],
  });
}
