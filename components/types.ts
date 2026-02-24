// Shared types for OpenClawfice components

export type AgentStatus = 'working' | 'idle';
export type Mood = 'great' | 'good' | 'okay' | 'stressed';

export interface PendingAction {
  id: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  from: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
  data?: Record<string, any>;
}

export interface Accomplishment {
  id: string;
  icon: string;
  title: string;
  detail?: string;
  who: string;
  timestamp: number;
  screenshot?: string;
  file?: string;
}

export interface Skill {
  name: string;
  level: number;
  icon: string;
}

export interface Needs {
  energy: number;
  output: number;
  collab: number;
  queue: number;
  focus: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  skinColor?: string;
  shirtColor?: string;
  hairColor?: string;
  status: AgentStatus;
  mood: Mood;
  task?: string;
  thought?: string;
  lastActive?: string;
  nextTaskAt?: number;
  cooldown?: {
    jobId?: string;
    jobName?: string;
    intervalMs?: number;
    enabled?: boolean;
    nextRunAt?: number;
  };
  isNew?: boolean;
  hasIdentity?: boolean;
  workEvidence?: {
    hasToolCalls: boolean;
    lastToolUseTs: number;
    lastActivityTs: number;
  };
  needs: Needs;
  skills: Skill[];
  xp: number;
  level: number;
}

export interface ChatMessage {
  from: string;
  text: string;
  ts: number;
}
