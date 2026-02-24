// Shared utility functions for OpenClawfice components

import type { Agent, Mood } from './types';

// Generate random pastel colors for agents
export function randomColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 60%, 55%)`;
}

// Generate default needs/skills/xp for auto-discovered agents
export function generateAgentDefaults(id: string) {
  const hash = (s: string) => s.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
  const h = Math.abs(hash(id));

  return {
    needs: {
      energy: 50 + (h % 40),
      output: 60 + (h % 30),
      collab: 40 + (h % 50),
      queue: 30 + (h % 60),
      focus: 70 + (h % 25),
    },
    skills: [
      { name: 'Analysis', level: 5 + (h % 15), icon: '📊' },
      { name: 'Automation', level: 5 + ((h * 2) % 12), icon: '⚙️' },
      { name: 'Code', level: 5 + ((h * 3) % 10), icon: '💻' },
    ],
    xp: 1000 + (h % 3000),
    level: 5 + (h % 15),
  };
}

// Prettify raw task strings for display (sanitize shell commands, truncate junk)
export function prettifyTask(task: string): string {
  if (!task) return '';
  let t = task.trim();

  // Strip markdown bold/headers
  t = t.replace(/\*\*/g, '').replace(/^#+\s*/gm, '');

  // If it starts with a tool/command prefix, clean it
  if (/^(exec|read|write|edit|browser|web_search|web_fetch|memory_search|sessions_send|tts):/i.test(t)) {
    const colonIdx = t.indexOf(':');
    const rest = t.slice(colonIdx + 1).trim();
    // If the rest is a shell command, try to extract meaning
    if (rest.startsWith('cd ') || rest.startsWith('ls ') || rest.startsWith('cat ') ||
        rest.startsWith('grep ') || rest.startsWith('curl ') || rest.startsWith('sleep ') ||
        rest.startsWith('find ') || rest.startsWith('npx ') || rest.startsWith('git ') ||
        rest.includes('&&') || rest.includes('|')) {
      // Extract the most meaningful part
      const parts = rest.split('&&').map(p => p.trim());
      const meaningful = parts.find(p => !p.startsWith('cd ') && !p.startsWith('sleep ') && !p.startsWith('echo '));
      if (meaningful) {
        t = meaningful.split('|')[0].trim();
        if (t.length > 60) t = t.slice(0, 57) + '...';
      } else {
        return 'Running commands...';
      }
    } else {
      t = rest;
    }
  }

  // Truncate overly long strings
  if (t.length > 80) t = t.slice(0, 77) + '...';

  // If it still looks like code/commands, give a generic label
  if (t.match(/[{}\[\]<>\\|;]/) && t.length > 30) {
    return 'Working on code...';
  }

  return t;
}

// Generate quirky RPG-style mood messages
export function getQuirkyMoodMessage(agent: Agent): string {
  const { mood, status, task } = agent;

  const messages: Record<Mood, string[]> = {
    great: [
      '✨ In the zone!',
      '🎯 Peak performance!',
      '🚀 On fire today!',
      '💪 Crushing it!',
      '⚡ Full power!',
      '🎮 +10 XP per minute',
      '🌟 Legendary mode',
      '🎊 Living the dream',
    ],
    good: [
      '👍 Steady progress',
      '☕ Caffeinated & ready',
      '🎵 Vibing',
      '✅ Getting things done',
      '🔥 Productive flow',
      '💼 Business as usual',
      '🎯 Locked in',
      '⚙️ Operating smoothly',
    ],
    okay: [
      '😐 Could use coffee',
      '🤔 Contemplating life',
      '📊 Mildly motivated',
      '🌤️ Partly productive',
      '⏱️ Waiting for inspiration',
      '📝 Going through motions',
      '💭 Daydreaming a bit',
      '🎲 Rolling with it',
    ],
    stressed: [
      '😰 Too many tabs open',
      '🔥 Everything is fine™',
      '😵 Context switching overload',
      '⚠️ Mental stack overflow',
      '😤 Needs vacation',
      '🆘 Send help (or snacks)',
      '💥 Burnout imminent',
      '🌪️ Chaos mode',
    ],
  };

  if (status === 'idle') {
    return '😴 Chillin\' in the lounge';
  }

  if (agent.nextTaskAt && agent.nextTaskAt > Date.now()) {
    const mins = Math.floor((agent.nextTaskAt - Date.now()) / 60000);
    if (mins < 5) return '⏰ Almost time to work!';
    if (mins < 15) return '🛋️ Enjoying the break';
    return '💤 On cooldown';
  }

  if (task) {
    if (task.toLowerCase().includes('bug')) return '🐛 Bug hunting mode';
    if (task.toLowerCase().includes('meeting')) return '💼 Professional mode ON';
    if (task.toLowerCase().includes('review')) return '👀 Critic mode activated';
    if (task.toLowerCase().includes('writing')) return '✍️ Literary genius at work';
    if (task.toLowerCase().includes('deploy')) return '🚀 Launch sequence initiated';
  }

  const pool = messages[mood];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Format interval in human-readable form
export function formatInterval(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}
