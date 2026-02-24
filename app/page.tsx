'use client';

import { useState, useEffect, useRef } from 'react';
import { useDemoMode } from '../hooks/useDemoMode';
import { useRetroSFX } from '../hooks/useRetroSFX';
import { TemplateGallery } from '../components/TemplateGallery';
import { DemoBanner } from '../components/DemoBanner';
import { ShareModal } from '../components/ShareModal';
import { Celebration } from '../components/Celebration';

type AgentStatus = 'working' | 'idle';
type Mood = 'great' | 'good' | 'okay' | 'stressed';

interface PendingAction {
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

interface Accomplishment {
  id: string;
  icon: string;
  title: string;
  detail?: string;
  who: string;
  timestamp: number;
  screenshot?: string;
}

interface Skill {
  name: string;
  level: number;
  icon: string;
}

interface Needs {
  energy: number;
  output: number;
  collab: number;
  queue: number;
  focus: number;
}

interface Agent {
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

interface ChatMessage {
  from: string;
  text: string;
  ts: number;
}

// Generate random pastel colors for agents
function randomColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 60%, 55%)`;
}

// Generate default needs/skills/xp for auto-discovered agents
function generateAgentDefaults(id: string) {
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

// Generate quirky RPG-style mood messages
function getQuirkyMoodMessage(agent: Agent): string {
  const { mood, status, task } = agent;
  
  // Context-aware messages
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
  
  // Status-specific overrides
  if (status === 'idle') {
    return '😴 Chillin\' in the lounge';
  }
  
  if (agent.nextTaskAt && agent.nextTaskAt > Date.now()) {
    const mins = Math.floor((agent.nextTaskAt - Date.now()) / 60000);
    if (mins < 5) return '⏰ Almost time to work!';
    if (mins < 15) return '🛋️ Enjoying the break';
    return '💤 On cooldown';
  }
  
  // Task-specific messages
  if (task) {
    if (task.toLowerCase().includes('bug')) return '🐛 Bug hunting mode';
    if (task.toLowerCase().includes('meeting')) return '💼 Professional mode ON';
    if (task.toLowerCase().includes('review')) return '👀 Critic mode activated';
    if (task.toLowerCase().includes('writing')) return '✍️ Literary genius at work';
    if (task.toLowerCase().includes('deploy')) return '🚀 Launch sequence initiated';
  }
  
  // Random message from mood category
  const pool = messages[mood];
  return pool[Math.floor(Math.random() * pool.length)];
}

function Plumbob({ mood, agent }: { mood: Mood; agent?: Agent }) {
  const colors: Record<Mood, string> = {
    great: '#22c55e',
    good: '#84cc16',
    okay: '#eab308',
    stressed: '#ef4444',
  };
  const c = colors[mood];
  const message = agent ? getQuirkyMoodMessage(agent) : `Mood: ${mood}`;
  return (
    <div 
      title={message}
      style={{
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderBottom: `10px solid ${c}`,
        filter: `drop-shadow(0 0 4px ${c})`,
        animation: 'plumbobSpin 3s ease-in-out infinite',
        position: 'relative',
        top: -2,
        cursor: 'help',
      }}>
      <div style={{
        position: 'absolute',
        top: 10,
        left: -6,
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: `10px solid ${c}`,
      }} />
    </div>
  );
}

function CooldownTimer({ targetMs }: { targetMs: number }) {
  const [remaining, setRemaining] = useState('');
  
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, targetMs - Date.now());
      if (diff <= 0) {
        setRemaining('soon');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [targetMs]);
  
  return (
    <div style={{
      background: 'rgba(99,102,241,0.15)',
      border: '1px solid rgba(99,102,241,0.4)',
      borderRadius: 8,
      padding: '3px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      animation: 'fadeSlideIn 0.3s ease-out',
    }}>
      <span style={{ fontSize: 11 }}>⏳</span>
      <span style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 8,
        color: '#a5b4fc',
        letterSpacing: 1,
      }}>
        {remaining}
      </span>
    </div>
  );
}

// Generate unique NPC visual traits from agent ID (deterministic)
type HairStyle = 'classic' | 'spiky' | 'long' | 'mohawk' | 'bald' | 'afro' | 'bob' | 'ponytail';
type Accessory = 'none' | 'glasses' | 'headphones' | 'cap' | 'earring';

function getNpcTraits(id: string) {
  // Multiple independent hashes for uncorrelated trait selection
  const hash1 = id.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) >>> 0;
  const hash2 = id.split('').reduce((a, b) => ((a << 7) + a) ^ b.charCodeAt(0), 5381) >>> 0;
  const hash3 = id.split('').reduce((a, b) => a * 31 + b.charCodeAt(0), 7) >>> 0;
  
  const skinTones = ['#e8c4a0', '#f5d6b8', '#d4a574', '#c68c53', '#a0673c', '#7b4b2a', '#f0dcc8', '#e0b896'];
  const hairColors = ['#4a3728', '#1a1a2e', '#8b4513', '#d4a017', '#c0392b', '#2c3e50', '#7f8c8d', '#e8dacc', '#5c2d91', '#2ecc71'];
  const hairStyles: HairStyle[] = ['classic', 'spiky', 'long', 'mohawk', 'bald', 'afro', 'bob', 'ponytail'];
  const accessories: Accessory[] = ['none', 'glasses', 'headphones', 'cap', 'earring', 'none'];
  const pantsColors = ['#334155', '#1e293b', '#3b4252', '#4c566a', '#2d3748', '#1a202c', '#374151', '#2e1065'];
  
  return {
    skinColor: skinTones[hash1 % skinTones.length],
    hairColor: hairColors[hash2 % hairColors.length],
    hairStyle: hairStyles[hash3 % hairStyles.length],
    accessory: accessories[(hash1 + hash2) % accessories.length],
    pantsColor: pantsColors[hash3 % pantsColors.length],
  };
}

function NpcHair({ style, s, hairColor }: { style: HairStyle; s: number; hairColor: string }) {
  switch (style) {
    case 'spiky':
      return (<>
        <div style={{ position: 'absolute', top: -s * 0.5, left: s * 1.5, width: s * 5, height: s * 2.5, background: hairColor, borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.3}px ${s * 0.3}px` }} />
        {/* Spikes */}
        <div style={{ position: 'absolute', top: -s * 1.2, left: s * 2, width: s * 1.2, height: s * 1.5, background: hairColor, borderRadius: `${s}px ${s}px 0 0`, transform: 'rotate(-15deg)' }} />
        <div style={{ position: 'absolute', top: -s * 1.5, left: s * 3.5, width: s * 1.2, height: s * 1.8, background: hairColor, borderRadius: `${s}px ${s}px 0 0` }} />
        <div style={{ position: 'absolute', top: -s * 1.2, left: s * 5, width: s * 1.2, height: s * 1.5, background: hairColor, borderRadius: `${s}px ${s}px 0 0`, transform: 'rotate(15deg)' }} />
      </>);
    case 'long':
      return (<>
        <div style={{ position: 'absolute', top: 0, left: s * 0.5, width: s * 7, height: s * 2.5, background: hairColor, borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.3}px ${s * 0.3}px` }} />
        {/* Side locks */}
        <div style={{ position: 'absolute', top: s * 1.5, left: s * 0.2, width: s * 1.2, height: s * 4, background: hairColor, borderRadius: `0 0 ${s * 0.5}px ${s * 0.5}px` }} />
        <div style={{ position: 'absolute', top: s * 1.5, left: s * 6.6, width: s * 1.2, height: s * 4, background: hairColor, borderRadius: `0 0 ${s * 0.5}px ${s * 0.5}px` }} />
      </>);
    case 'mohawk':
      return (
        <div style={{ position: 'absolute', top: -s * 0.8, left: s * 2.8, width: s * 2.5, height: s * 3, background: hairColor, borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.3}px ${s * 0.3}px` }} />
      );
    case 'bald':
      return (
        <div style={{ position: 'absolute', top: s * 0.8, left: s * 1.2, width: s * 5.6, height: s * 1, background: hairColor, opacity: 0.3, borderRadius: `${s * 1}px ${s * 1}px 0 0` }} />
      );
    case 'afro':
      return (
        <div style={{ position: 'absolute', top: -s * 1.5, left: s * 0.2, width: s * 7.6, height: s * 4.5, background: hairColor, borderRadius: '50%' }} />
      );
    case 'bob':
      return (<>
        <div style={{ position: 'absolute', top: 0, left: s * 0.5, width: s * 7, height: s * 2.5, background: hairColor, borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.5}px ${s * 0.5}px` }} />
        <div style={{ position: 'absolute', top: s * 1.5, left: s * 0.3, width: s * 1.5, height: s * 2.5, background: hairColor, borderRadius: `0 0 ${s * 0.8}px ${s * 0.8}px` }} />
        <div style={{ position: 'absolute', top: s * 1.5, left: s * 6.2, width: s * 1.5, height: s * 2.5, background: hairColor, borderRadius: `0 0 ${s * 0.8}px ${s * 0.8}px` }} />
      </>);
    case 'ponytail':
      return (<>
        <div style={{ position: 'absolute', top: 0, left: s, width: s * 6, height: s * 2.5, background: hairColor, borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.3}px ${s * 0.3}px` }} />
        <div style={{ position: 'absolute', top: s * 1, left: s * 6.5, width: s * 1.5, height: s * 3.5, background: hairColor, borderRadius: `0 ${s}px ${s * 0.5}px 0` }} />
      </>);
    default: // classic
      return (
        <div style={{ position: 'absolute', top: 0, left: s, width: s * 6, height: s * 2.5, background: hairColor, borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.3}px ${s * 0.3}px` }} />
      );
  }
}

function NpcAccessory({ accessory, s, shirtColor }: { accessory: Accessory; s: number; shirtColor: string }) {
  switch (accessory) {
    case 'glasses':
      return (<>
        <div style={{ position: 'absolute', top: s * 2.3, left: s * 1.5, width: s * 2, height: s * 1.2, border: `${s * 0.25}px solid #94a3b8`, borderRadius: s * 0.3, background: 'rgba(148,163,184,0.15)' }} />
        <div style={{ position: 'absolute', top: s * 2.3, left: s * 4.5, width: s * 2, height: s * 1.2, border: `${s * 0.25}px solid #94a3b8`, borderRadius: s * 0.3, background: 'rgba(148,163,184,0.15)' }} />
        <div style={{ position: 'absolute', top: s * 2.7, left: s * 3.5, width: s * 1, height: s * 0.25, background: '#94a3b8' }} />
      </>);
    case 'headphones':
      return (<>
        <div style={{ position: 'absolute', top: -s * 0.3, left: s * 0.3, width: s * 7.4, height: s * 3, border: `${s * 0.35}px solid #475569`, borderRadius: `${s * 4}px ${s * 4}px 0 0`, borderBottom: 'none' }} />
        <div style={{ position: 'absolute', top: s * 2, left: s * 0, width: s * 1.2, height: s * 1.5, background: '#475569', borderRadius: s * 0.4 }} />
        <div style={{ position: 'absolute', top: s * 2, left: s * 6.8, width: s * 1.2, height: s * 1.5, background: '#475569', borderRadius: s * 0.4 }} />
      </>);
    case 'cap':
      return (<>
        <div style={{ position: 'absolute', top: -s * 0.3, left: s * 0.5, width: s * 7, height: s * 1.8, background: shirtColor, borderRadius: `${s * 1}px ${s * 1}px ${s * 0.2}px ${s * 0.2}px`, filter: 'brightness(0.8)' }} />
        <div style={{ position: 'absolute', top: s * 1, left: -s * 0.3, width: s * 4, height: s * 0.6, background: shirtColor, borderRadius: `${s * 0.3}px 0 0 ${s * 0.3}px`, filter: 'brightness(0.7)' }} />
      </>);
    case 'earring':
      return (
        <div style={{ position: 'absolute', top: s * 3.5, left: s * 6.8, width: s * 0.5, height: s * 0.5, background: '#fbbf24', borderRadius: '50%', boxShadow: `0 0 ${s * 0.3}px #fbbf24` }} />
      );
    default:
      return null;
  }
}

function NPC({ agent, size = 1, onClick, forceThought, flipped, hasCelebration }: {
  agent: Agent;
  size?: number;
  onClick?: () => void;
  forceThought?: string | null;
  flipped?: boolean;
  hasCelebration?: boolean;
}) {
  const s = 4 * size;
  const displayThought = forceThought || agent.thought;
  const [showThought, setShowThought] = useState(!!displayThought);

  useEffect(() => {
    if (!displayThought) {
      setShowThought(false);
      return;
    }
    setShowThought(true);
    const hideTimer = setTimeout(() => setShowThought(false), 6000);
    return () => clearTimeout(hideTimer);
  }, [displayThought]);

  // Generate unique traits from agent ID
  const traits = getNpcTraits(agent.id);
  const skinColor = agent.skinColor || traits.skinColor;
  const shirtColor = agent.shirtColor || agent.color || randomColor(agent.id);
  const hairColor = agent.hairColor || traits.hairColor;
  const pantsColor = traits.pantsColor;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => {
        if (onClick) (e.currentTarget.style.transform = 'scale(1.1)');
      }}
      onMouseLeave={e => {
        (e.currentTarget.style.transform = 'scale(1)');
      }}
    >
      {showThought && displayThought && (
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          color: '#1a1a2e',
          padding: '4px 10px',
          borderRadius: 10,
          fontSize: 9 * size,
          maxWidth: 180 * size,
          textAlign: 'center',
          animation: 'fadeSlideIn 0.3s ease-out',
          marginBottom: 4,
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          lineHeight: 1.3,
        }}>
          {displayThought}
        </div>
      )}
      {hasCelebration && <Celebration />}
      <Plumbob mood={agent.mood} agent={agent} />
      <div style={{
        width: s * 8,
        height: s * 10,
        imageRendering: 'pixelated' as any,
        position: 'relative',
        animation: 'npcBob 2s ease-in-out infinite',
        ...(flipped ? { transform: 'scaleX(-1)' } : {}),
      }}>
        {/* Hair — unique style per agent */}
        <NpcHair style={traits.hairStyle} s={s} hairColor={hairColor} />
        {/* Head */}
        <div style={{
          position: 'absolute',
          top: s * 1.5,
          left: s,
          width: s * 6,
          height: s * 3,
          background: skinColor,
          borderRadius: s * 0.5,
        }} />
        {/* Accessory — unique per agent */}
        <NpcAccessory accessory={traits.accessory} s={s} shirtColor={shirtColor} />
        {/* Eyes */}
        <div style={{
          position: 'absolute',
          top: s * 2.5,
          left: s * 2,
          width: s * 0.8,
          height: s * 0.8,
          background: '#1a1a2e',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute',
          top: s * 2.5,
          left: s * 5.2,
          width: s * 0.8,
          height: s * 0.8,
          background: '#1a1a2e',
          borderRadius: '50%',
        }} />
        {/* Smile/Frown */}
        {agent.mood === 'stressed' ? (
          <div style={{
            position: 'absolute',
            top: s * 3.5,
            left: s * 2.5,
            width: s * 3,
            height: s * 0.5,
            borderTop: `${s * 0.4}px solid #1a1a2e`,
            borderRadius: '0 0 50% 50%',
          }} />
        ) : (
          <div style={{
            position: 'absolute',
            top: s * 3.3,
            left: s * 2.5,
            width: s * 3,
            height: s * 0.8,
            borderBottom: `${s * 0.4}px solid #1a1a2e`,
            borderRadius: '0 0 50% 50%',
          }} />
        )}
        {/* Body */}
        <div style={{
          position: 'absolute',
          top: s * 4.5,
          left: 0,
          width: s * 8,
          height: s * 4,
          background: shirtColor,
          borderRadius: `${s * 0.5}px ${s * 0.5}px ${s}px ${s}px`,
        }} />
        {/* Arms */}
        <div style={{
          position: 'absolute',
          top: s * 5,
          left: -s * 0.8,
          width: s * 1.2,
          height: s * 2.5,
          background: shirtColor,
          borderRadius: s * 0.5,
        }} />
        <div style={{
          position: 'absolute',
          top: s * 5,
          left: s * 7.6,
          width: s * 1.2,
          height: s * 2.5,
          background: shirtColor,
          borderRadius: s * 0.5,
        }} />
        {/* Legs — unique pants color */}
        <div style={{
          position: 'absolute',
          top: s * 8.5,
          left: s * 1,
          width: s * 2.2,
          height: s * 2,
          background: pantsColor,
          borderRadius: `0 0 ${s * 0.4}px ${s * 0.4}px`,
        }} />
        <div style={{
          position: 'absolute',
          top: s * 8.5,
          left: s * 4.8,
          width: s * 2.2,
          height: s * 2,
          background: pantsColor,
          borderRadius: `0 0 ${s * 0.4}px ${s * 0.4}px`,
        }} />
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          fontSize: 9 * size,
          fontWeight: 700,
          padding: `${1 * size}px ${5 * size}px`,
          borderRadius: 4 * size,
          fontFamily: '"Press Start 2P", monospace, system-ui',
        }}>
          {agent.name}
        </div>
        <div style={{
          background: agent.color,
          color: '#fff',
          fontSize: 7 * size,
          fontWeight: 700,
          padding: `${1 * size}px ${3 * size}px`,
          borderRadius: 3 * size,
          fontFamily: '"Press Start 2P", monospace',
        }}>
          {agent.level}
        </div>
      </div>
      <div style={{
        fontSize: 8 * size,
        color: '#64748b',
        fontFamily: '"Press Start 2P", monospace',
      }}>
        {agent.role}
      </div>
    </div>
  );
}

function NeedBar({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
      <span>{icon}</span>
      <span style={{ width: 48, color: '#94a3b8', fontSize: 9 }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden', minWidth: 60 }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: value > 70 ? color : value > 40 ? '#eab308' : '#ef4444',
          borderRadius: 4,
          transition: 'width 1s ease',
        }} />
      </div>
      <span style={{ fontSize: 9, color: '#64748b', width: 24, textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

function SkillBadge({ skill }: { skill: Skill }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      background: '#1e293b',
      borderRadius: 6,
      padding: '3px 8px',
    }}>
      <span style={{ fontSize: 11 }}>{skill.icon}</span>
      <span style={{ fontSize: 9, color: '#94a3b8' }}>{skill.name}</span>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#6366f1' }}>Lv.{skill.level}</span>
    </div>
  );
}

const COOLDOWN_PRESETS = [
  { label: '1m', ms: 60000 },
  { label: '5m', ms: 300000 },
  { label: '10m', ms: 600000 },
  { label: '15m', ms: 900000 },
  { label: '30m', ms: 1800000 },
  { label: '1h', ms: 3600000 },
];

function formatInterval(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

function AgentPanel({ agent, onClose, autowork, onAutoworkUpdate, onStop, pendingChanges }: { agent: Agent; onClose: () => void; autowork?: { enabled: boolean; intervalMs: number; directive: string; lastSentAt: number }; onAutoworkUpdate?: (agentId: string, patch: Partial<{ enabled: boolean; intervalMs: number; directive: string }>) => void; onStop?: (agentId: string) => void; pendingChanges?: Partial<{ enabled: boolean; intervalMs: number; directive: string }> }) {
  const [awSaving, setAwSaving] = useState(false);
  const merged = { ...(autowork || { enabled: false, intervalMs: 600_000, directive: '', lastSentAt: 0 }), ...pendingChanges };
  const [awEnabled, setAwEnabled] = useState(merged.enabled ?? false);
  const [awIntervalMs, setAwIntervalMs] = useState(merged.intervalMs ?? 600_000);
  const [awDirective, setAwDirective] = useState(merged.directive ?? '');
  const [directiveDirty, setDirectiveDirty] = useState(false);
  const hasPending = !!pendingChanges && Object.keys(pendingChanges).length > 0;
  const [stopping, setStopping] = useState(false);
  const [dmMessage, setDmMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentConfirm, setSentConfirm] = useState(false);
  const [lastSent, setLastSent] = useState('');
  const [logEntries, setLogEntries] = useState<{ ts: string; role: string; type: string; content: string; toolName?: string }[]>([]);
  const [logLoading, setLogLoading] = useState(true);
  const [logCollapsed, setLogCollapsed] = useState<Record<number, boolean>>({});
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/office/logs?agentId=${encodeURIComponent(agent.id)}&limit=80`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) {
          setLogEntries(data.entries || []);
          setLogLoading(false);
          setTimeout(() => {
            if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
          }, 50);
        }
      } catch {
        if (!cancelled) setLogLoading(false);
      }
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [agent.id]);

  const sendDM = async () => {
    if (!dmMessage.trim() || sending) return;
    
    setSending(true);
    const messageText = dmMessage;
    try {
      const res = await fetch('/api/office/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id, message: messageText }),
      });
      
      if (res.ok) {
        setDmMessage('');
        setSentConfirm(true);
        setLastSent(messageText);
        setTimeout(() => setSentConfirm(false), 3000);
      } else {
        alert('Failed to send message');
      }
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: 320,
      background: '#0f172a',
      borderLeft: '3px solid #334155',
      zIndex: 100,
      padding: 20,
      overflowY: 'auto',
      animation: 'slideInRight 0.3s ease-out',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <h3 style={{
          margin: 0,
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 12,
        }}>
          {agent.name}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#94a3b8',
            borderRadius: 6,
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{
        color: agent.color,
        fontSize: 11,
        marginBottom: 16,
      }}>
        {agent.emoji} {agent.role}
      </div>

      {/* Stop Button — visible when agent is working */}
      {agent.id !== '_owner' && agent.status === 'working' && (
        <button
          onClick={async () => {
            setStopping(true);
            try {
              const res = await fetch('/api/office/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: agent.id }),
              });
              if (res.ok) {
                setAwEnabled(false);
                onAutoworkUpdate?.(agent.id, { enabled: false });
                onStop?.(agent.id);
              }
            } catch {}
            setStopping(false);
          }}
          disabled={stopping}
          style={{
            width: '100%',
            background: '#991b1b',
            border: '2px solid #dc2626',
            borderRadius: 8,
            padding: '8px 12px',
            color: '#fecaca',
            fontSize: 10,
            cursor: stopping ? 'not-allowed' : 'pointer',
            fontFamily: '"Press Start 2P", monospace',
            marginBottom: 16,
            opacity: stopping ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          {stopping ? '⏳ Stopping...' : '⛔ STOP — Return to Idle'}
        </button>
      )}

      {/* DM Input */}
      <div style={{
        background: '#1e293b',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        border: '1px solid #334155',
      }}>
        <div style={{
          fontSize: 9,
          color: '#64748b',
          textTransform: 'uppercase',
          marginBottom: 8,
          fontFamily: '"Press Start 2P", monospace',
        }}>
          💬 Send Message
        </div>
        {sentConfirm && lastSent && (
          <div style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 6,
            padding: '6px 10px',
            marginBottom: 8,
            fontSize: 10,
            color: '#6ee7b7',
            animation: 'fadeSlideIn 0.3s ease-out',
          }}>
            ✓ Sent: "{lastSent.length > 40 ? lastSent.slice(0, 37) + '...' : lastSent}"
          </div>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={dmMessage}
            onChange={(e) => setDmMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendDM()}
            placeholder={`Message ${agent.name}...`}
            disabled={sending}
            style={{
              flex: 1,
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: '8px 10px',
              color: '#e2e8f0',
              fontSize: 12,
              outline: 'none',
            }}
          />
          <button
            onClick={sendDM}
            disabled={sending || !dmMessage.trim()}
            style={{
              background: sentConfirm ? '#10b981' : '#6366f1',
              border: 'none',
              color: '#fff',
              borderRadius: 6,
              padding: '8px 12px',
              cursor: sending || !dmMessage.trim() ? 'not-allowed' : 'pointer',
              fontSize: 12,
              opacity: sending || !dmMessage.trim() ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            {sentConfirm ? '✓' : sending ? '...' : '→'}
          </button>
        </div>
        <div style={{
          fontSize: 8,
          color: '#64748b',
          marginTop: 6,
          fontStyle: 'italic',
        }}>
          Messages sent via OpenClaw CLI
        </div>
      </div>

      {agent.task && (() => {
        const ev = agent.workEvidence;
        const hasRealWork = ev?.hasToolCalls;
        const toolAge = ev?.lastToolUseTs ? Math.round((Date.now() - ev.lastToolUseTs) / 60000) : null;
        return (
          <div style={{
            background: '#1e293b',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            borderLeft: `3px solid ${hasRealWork ? '#10b981' : '#f59e0b'}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 4,
            }}>
              <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' }}>
                🔨 Working On
              </div>
              <div style={{
                fontSize: 7,
                padding: '2px 6px',
                borderRadius: 4,
                background: hasRealWork ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: hasRealWork ? '#6ee7b7' : '#fbbf24',
                border: `1px solid ${hasRealWork ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                fontFamily: '"Press Start 2P", monospace',
              }}>
                {hasRealWork
                  ? `✓ VERIFIED${toolAge !== null && toolAge > 0 ? ` ${toolAge}m ago` : ''}`
                  : '? UNVERIFIED'}
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#e2e8f0' }}>
              {agent.task}
            </div>
            {!hasRealWork && (
              <div style={{ fontSize: 9, color: '#92400e', marginTop: 6, fontStyle: 'italic' }}>
                No tool calls detected — agent may just be chatting
              </div>
            )}
          </div>
        );
      })()}

      {/* Activity Log */}
      <div style={{
        background: '#1e293b',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        border: '1px solid #334155',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' as const, fontFamily: '"Press Start 2P", monospace' }}>
            📋 Activity Log
          </div>
          <span style={{ fontSize: 8, color: '#475569' }}>
            {logEntries.length} entries
          </span>
        </div>
        <div
          ref={logRef}
          style={{
            maxHeight: 400,
            overflowY: 'auto',
            fontSize: 11,
            lineHeight: '16px',
            fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
          }}
        >
          {logLoading && (
            <div style={{ color: '#475569', fontStyle: 'italic', padding: '8px 0' }}>Loading...</div>
          )}
          {!logLoading && logEntries.length === 0 && (
            <div style={{ color: '#475569', fontStyle: 'italic', padding: '8px 0' }}>No activity yet</div>
          )}
          {!logLoading && logEntries.map((e, i) => {
            const isCollapsed = logCollapsed[i] !== undefined ? logCollapsed[i] : e.content.length > 300;
            const icon = e.role === 'assistant'
              ? (e.type === 'tool_use' ? '🔧' : '🤖')
              : e.role === 'user' ? '👤' : '📎';
            const labelColor = e.role === 'assistant'
              ? (e.type === 'tool_use' ? '#a78bfa' : '#93c5fd')
              : e.role === 'user' ? '#fbbf24' : '#64748b';
            const label = e.role === 'assistant'
              ? (e.type === 'tool_use' ? (e.toolName || 'tool') : 'assistant')
              : e.role === 'user' ? 'user' : 'result';
            const ts = e.ts ? new Date(e.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
            const displayContent = isCollapsed ? e.content.slice(0, 200) + '...' : e.content;
            const canCollapse = e.content.length > 300;

            return (
              <div key={i} style={{
                borderBottom: '1px solid rgba(51,65,85,0.3)',
                padding: '6px 0',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3,
                }}>
                  <span>{icon}</span>
                  <span style={{ color: labelColor, fontSize: 9, fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
                  {e.toolName && <span style={{ color: '#64748b', fontSize: 9 }}>({e.toolName})</span>}
                  <span style={{ marginLeft: 'auto', color: '#334155', fontSize: 8 }}>{ts}</span>
                </div>
                <div
                  onClick={canCollapse ? () => setLogCollapsed(prev => ({ ...prev, [i]: !isCollapsed })) : undefined}
                  style={{
                    color: e.role === 'tool' ? '#94a3b8' : '#cbd5e1',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: 10,
                    cursor: canCollapse ? 'pointer' : 'default',
                    maxHeight: isCollapsed ? 60 : undefined,
                    overflow: 'hidden',
                  }}
                >
                  {displayContent}
                </div>
                {canCollapse && (
                  <button
                    onClick={() => setLogCollapsed(prev => ({ ...prev, [i]: !isCollapsed }))}
                    style={{
                      background: 'none', border: 'none', color: '#6366f1',
                      fontSize: 9, cursor: 'pointer', padding: '2px 0',
                      fontFamily: 'inherit',
                    }}
                  >
                    {isCollapsed ? `▸ show all (${e.content.length} chars)` : '▾ collapse'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto-Work */}
      {agent.id !== '_owner' && (
        <div style={{
          background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 16,
          border: '1px solid #334155',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' as const, fontFamily: '"Press Start 2P", monospace' }}>
              ⏰ Auto-Work
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={async () => {
                  setAwSaving(true);
                  try {
                    const res = await fetch('/api/office/autowork', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ agentId: agent.id }),
                    });
                    if (res.ok) setAwEnabled(prev => prev);
                  } catch {}
                  setAwSaving(false);
                }}
                disabled={awSaving}
                style={{
                  background: '#0f172a', border: '1px solid #334155',
                  borderRadius: 6, padding: '3px 8px',
                  color: '#94a3b8', fontSize: 8, cursor: 'pointer',
                  fontFamily: '"Press Start 2P", monospace',
                  opacity: awSaving ? 0.5 : 1,
                }}
                title="Send work prompt now"
              >
                ▶ NOW
              </button>
              <button
                onClick={() => {
                  const newEnabled = !awEnabled;
                  setAwEnabled(newEnabled);
                  onAutoworkUpdate?.(agent.id, { enabled: newEnabled });
                }}
                style={{
                  background: awEnabled ? '#10b981' : '#475569',
                  border: 'none', borderRadius: 12, padding: '3px 10px',
                  color: '#fff', fontSize: 9, cursor: 'pointer',
                  fontFamily: '"Press Start 2P", monospace',
                  transition: 'background 0.2s',
                }}
              >
                {awEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5, marginBottom: 10 }}>
            {awEnabled
              ? `${agent.name} gets sent to work every ${formatInterval(awIntervalMs)}.`
              : `Paused — ${agent.name} will idle until manually tasked or enabled.`}
          </div>
          {hasPending && (
            <div style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 6, padding: '5px 8px', marginBottom: 10,
              fontSize: 9, color: '#fbbf24',
            }}>
              ⚠ Unsaved — apply changes from the banner below
            </div>
          )}

          <div style={{ fontSize: 8, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' as const }}>Interval</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {COOLDOWN_PRESETS.map(p => (
              <button
                key={p.ms}
                onClick={() => {
                  setAwIntervalMs(p.ms);
                  onAutoworkUpdate?.(agent.id, { intervalMs: p.ms });
                }}
                style={{
                  background: awIntervalMs === p.ms ? '#6366f1' : '#0f172a',
                  border: `1px solid ${awIntervalMs === p.ms ? '#6366f1' : '#334155'}`,
                  borderRadius: 6, padding: '4px 8px',
                  color: awIntervalMs === p.ms ? '#fff' : (awEnabled ? '#94a3b8' : '#475569'),
                  fontSize: 9, cursor: 'pointer',
                  fontFamily: '"Press Start 2P", monospace',
                  transition: 'all 0.15s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Directive */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4, textTransform: 'uppercase' as const }}>
              Directive — what should {agent.name} focus on?
            </div>
            <textarea
              value={awDirective}
              onChange={(e) => { setAwDirective(e.target.value); setDirectiveDirty(true); }}
              placeholder={`e.g. Focus on the highest priority task from the current sprint`}
              rows={3}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 6,
                padding: 8,
                color: '#e2e8f0',
                fontSize: 11,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'system-ui',
                boxSizing: 'border-box',
              }}
            />
            {directiveDirty && (
              <button
                onClick={() => {
                  setDirectiveDirty(false);
                  onAutoworkUpdate?.(agent.id, { directive: awDirective });
                }}
                style={{
                  marginTop: 4,
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  color: '#fff',
                  fontSize: 9,
                  cursor: 'pointer',
                  fontFamily: '"Press Start 2P", monospace',
                }}
              >
                Save Directive
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 9,
          color: '#64748b',
          textTransform: 'uppercase',
          marginBottom: 8,
          fontFamily: '"Press Start 2P", monospace',
        }}>
          Needs
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <NeedBar icon="⚡" label="Energy" value={agent.needs.energy} color="#22c55e" />
          <NeedBar icon="📊" label="Output" value={agent.needs.output} color="#6366f1" />
          <NeedBar icon="💬" label="Collab" value={agent.needs.collab} color="#f59e0b" />
          <NeedBar icon="📋" label="Queue" value={agent.needs.queue} color="#ef4444" />
          <NeedBar icon="🧠" label="Focus" value={agent.needs.focus} color="#14b8a6" />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 9,
          color: '#64748b',
          textTransform: 'uppercase',
          marginBottom: 8,
          fontFamily: '"Press Start 2P", monospace',
        }}>
          Skills
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {agent.skills.map(s => <SkillBadge key={s.name} skill={s} />)}
        </div>
      </div>

      <div style={{
        background: '#1e293b',
        borderRadius: 8,
        padding: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{ fontSize: 9, color: '#64748b' }}>XP</div>
        <div style={{ flex: 1, height: 6, background: '#0f172a', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${(agent.xp % 500) / 5}%`,
            height: '100%',
            background: '#6366f1',
            borderRadius: 3,
          }} />
        </div>
        <div style={{ fontSize: 9, color: '#6366f1' }}>{agent.xp} XP</div>
      </div>
    </div>
  );
}

function Room({
  title,
  icon,
  color,
  borderColor,
  children,
  style: extraStyle,
}: {
  title: string;
  icon: string;
  color: string;
  borderColor: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${color} 0%, ${color}ee 100%)`,
      border: `3px solid ${borderColor}`,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      ...extraStyle,
    }}>
      <div style={{
        position: 'absolute',
        top: 4,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#0f172a',
        border: `1px solid ${borderColor}`,
        borderRadius: 6,
        padding: '3px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 8,
          color: '#fff',
          textTransform: 'uppercase',
        }}>
          {title}
        </span>
      </div>
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, ${borderColor} 39px, ${borderColor} 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, ${borderColor} 39px, ${borderColor} 40px)`,
      }} />
      <div style={{
        position: 'relative',
        padding: '24px 8px 6px',
        zIndex: 1,
      }}>
        {children}
      </div>
    </div>
  );
}

const CHAT_FREQ_PRESETS = [
  { label: '5s', value: '5s' },
  { label: '15s', value: '15s' },
  { label: '30s', value: '30s' },
  { label: '45s', value: '45s' },
  { label: '1m', value: '1m' },
  { label: '2m', value: '2m' },
  { label: '5m', value: '5m' },
];

function SettingsPanel({ config, onConfigChange, onClose }: {
  config: any;
  onConfigChange: (c: any) => void;
  onClose: () => void;
}) {
  const wc = config.waterCooler || {};
  const mission = config.mission || {};
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [wcEnabled, setWcEnabled] = useState(wc.enabled !== false);
  const [wcFreq, setWcFreq] = useState(wc.frequency || '45s');
  const [quietEnabled, setQuietEnabled] = useState(wc.quiet?.enabled ?? false);
  const [quietStart, setQuietStart] = useState(wc.quiet?.start || '23:00');
  const [quietEnd, setQuietEnd] = useState(wc.quiet?.end || '08:00');
  const [mGoal, setMGoal] = useState(mission.goal || '');
  const [mPriorities, setMPriorities] = useState<string[]>(mission.priorities?.length ? mission.priorities : ['']);
  const [mContext, setMContext] = useState(mission.context || '');

  const save = async () => {
    setSaving(true);
    const patch = {
      waterCooler: {
        ...wc,
        enabled: wcEnabled,
        frequency: wcFreq,
        quiet: { enabled: quietEnabled, start: quietStart, end: quietEnd },
      },
      mission: {
        goal: mGoal,
        priorities: mPriorities.filter(p => p.trim()),
        context: mContext,
      },
    };
    try {
      const res = await fetch('/api/office/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = await res.json();
        onConfigChange(data.config);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {}
    setSaving(false);
  };

  const sectionStyle: React.CSSProperties = {
    background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 12,
    border: '1px solid #334155',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9, color: '#64748b', textTransform: 'uppercase',
    fontFamily: '"Press Start 2P", monospace', marginBottom: 6,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0f172a', border: '1px solid #334155',
    borderRadius: 6, padding: 8, color: '#e2e8f0', fontSize: 11, outline: 'none',
    fontFamily: 'system-ui', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 360,
      background: '#0f172a', borderLeft: '3px solid #334155',
      zIndex: 100, padding: 20, overflowY: 'auto',
      animation: 'slideInRight 0.3s ease-out',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontFamily: '"Press Start 2P", monospace', fontSize: 12 }}>⚙️ Settings</h3>
        <button onClick={onClose} style={{
          background: '#1e293b', border: '1px solid #334155', color: '#94a3b8',
          borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12,
        }}>✕</button>
      </div>

      {/* Mission */}
      <div style={sectionStyle}>
        <div style={labelStyle}>🎯 Company Mission</div>
        <div style={{ fontSize: 9, color: '#475569', marginBottom: 8 }}>
          Drives auto-work prompts and water cooler conversations
        </div>
        <input
          type="text"
          value={mGoal}
          onChange={(e) => setMGoal(e.target.value)}
          placeholder="What is your company trying to achieve?"
          style={{ ...inputStyle, marginBottom: 8 }}
        />
        <div style={{ ...labelStyle, fontSize: 8, marginTop: 4 }}>Priorities</div>
        {mPriorities.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <input
              type="text"
              value={p}
              onChange={(e) => {
                const next = [...mPriorities];
                next[i] = e.target.value;
                setMPriorities(next);
              }}
              placeholder={`Priority ${i + 1}`}
              style={{ ...inputStyle, flex: 1 }}
            />
            {mPriorities.length > 1 && (
              <button onClick={() => setMPriorities(mPriorities.filter((_, j) => j !== i))} style={{
                background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 12, padding: '0 4px',
              }}>×</button>
            )}
          </div>
        ))}
        <button onClick={() => setMPriorities([...mPriorities, ''])} style={{
          background: 'none', border: '1px dashed #334155', borderRadius: 6,
          color: '#64748b', fontSize: 9, padding: '4px 8px', cursor: 'pointer', width: '100%', marginTop: 2,
        }}>+ Add Priority</button>
        <div style={{ ...labelStyle, fontSize: 8, marginTop: 8 }}>Context</div>
        <textarea
          value={mContext}
          onChange={(e) => setMContext(e.target.value)}
          placeholder="Additional context about your business, metrics, constraints..."
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Water Cooler */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={labelStyle}>💬 Water Cooler</div>
          <button
            onClick={() => setWcEnabled(!wcEnabled)}
            style={{
              background: wcEnabled ? '#10b981' : '#475569', border: 'none', borderRadius: 12,
              padding: '3px 10px', color: '#fff', fontSize: 9, cursor: 'pointer',
              fontFamily: '"Press Start 2P", monospace', transition: 'background 0.2s',
            }}
          >{wcEnabled ? 'ON' : 'OFF'}</button>
        </div>
        <div style={{ fontSize: 9, color: '#475569', marginBottom: 8 }}>
          Chat message frequency in the lounge
        </div>
        <div style={{ ...labelStyle, fontSize: 8 }}>Frequency</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
          {CHAT_FREQ_PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => setWcFreq(p.value)}
              style={{
                background: wcFreq === p.value ? '#6366f1' : '#0f172a',
                border: `1px solid ${wcFreq === p.value ? '#6366f1' : '#334155'}`,
                borderRadius: 6, padding: '4px 8px',
                color: wcFreq === p.value ? '#fff' : '#94a3b8',
                fontSize: 9, cursor: 'pointer',
                fontFamily: '"Press Start 2P", monospace',
              }}
            >{p.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <button
            onClick={() => setQuietEnabled(!quietEnabled)}
            style={{
              background: quietEnabled ? '#6366f1' : '#0f172a',
              border: `1px solid ${quietEnabled ? '#6366f1' : '#334155'}`,
              borderRadius: 6, padding: '3px 8px',
              color: quietEnabled ? '#fff' : '#64748b', fontSize: 8, cursor: 'pointer',
              fontFamily: '"Press Start 2P", monospace',
            }}
          >{quietEnabled ? '🌙 ON' : '🌙 OFF'}</button>
          <span style={{ fontSize: 9, color: '#64748b' }}>Quiet hours</span>
        </div>
        {quietEnabled && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)}
              style={{ ...inputStyle, width: 'auto', fontSize: 10 }} />
            <span style={{ fontSize: 9, color: '#64748b' }}>to</span>
            <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)}
              style={{ ...inputStyle, width: 'auto', fontSize: 10 }} />
          </div>
        )}
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        style={{
          width: '100%',
          background: saved ? '#10b981' : '#6366f1',
          border: 'none', borderRadius: 8, padding: '10px 16px',
          color: '#fff', fontSize: 10, cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: '"Press Start 2P", monospace',
          opacity: saving ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
      >
        {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Settings'}
      </button>

      {/* Keyboard Shortcuts */}
      <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #334155' }}>
        <div style={{ fontSize: 9, fontFamily: '"Press Start 2P", monospace', color: '#94a3b8', marginBottom: 8 }}>⌨️ Shortcuts</div>
        {[
          ['1-9', 'Select agent'],
          ['T', 'Quest templates'],
          ['M', 'Call meeting'],
          ['?', 'Settings'],
          ['Esc', 'Close panel'],
        ].map(([key, desc]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <kbd style={{
              background: '#1e293b', border: '1px solid #475569', borderRadius: 3,
              padding: '1px 6px', fontSize: 9, color: '#e2e8f0', fontFamily: 'monospace',
            }}>{key}</kbd>
            <span style={{ fontSize: 9, color: '#64748b' }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isDemoMode, getApiPath } = useDemoMode();
  const sfx = useRetroSFX();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [time, setTime] = useState(new Date());
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [selectedAccomplishment, setSelectedAccomplishment] = useState<Accomplishment | null>(null);
  const [archivedAccomplishments, setArchivedAccomplishments] = useState<Accomplishment[]>([]);
  const [archiveTotal, setArchiveTotal] = useState(0);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [activeThought, setActiveThought] = useState<{ agentId: string; text: string } | null>(null);
  const [lastSeenChatCount, setLastSeenChatCount] = useState(0);
  const [nextChatIn, setNextChatIn] = useState(0);
  const chatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatTargetRef = useRef(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const [groupMessage, setGroupMessage] = useState('');
  const [sendingGroup, setSendingGroup] = useState(false);
  const [groupSent, setGroupSent] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [celebrations, setCelebrations] = useState<{ agentId: string; timestamp: number }[]>([]);
  const lastAccomplishmentCheck = useRef(0);
  const [showCallMeeting, setShowCallMeeting] = useState(false);
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meeting, setMeeting] = useState<{
    active: boolean;
    topic?: string;
    participants?: string[];
    currentRound?: number;
    maxRounds?: number;
    startedAt?: number;
    lastMessage?: string;
  }>({ active: false });
  const [config, setConfig] = useState<any>({});
  const [autoworkPolicies, setAutoworkPolicies] = useState<Record<string, { enabled: boolean; intervalMs: number; directive: string; lastSentAt: number }>>({});
  const [pendingAutowork, setPendingAutowork] = useState<Record<string, Partial<{ enabled: boolean; intervalMs: number; directive: string }>>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('openclawfice-sfx') === 'on' : false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Detect screen size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(getApiPath('/api/office/config'));
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Load autowork policies every 15s
  useEffect(() => {
    const fetchAutowork = async () => {
      try {
        const res = await fetch(getApiPath('/api/office/autowork'));
        if (res.ok) {
          const data = await res.json();
          setAutoworkPolicies(data.policies || {});
        }
      } catch {}
    };
    fetchAutowork();
    const i = setInterval(fetchAutowork, 15_000);
    return () => clearInterval(i);
  }, []);

  // Auto-work tick: trigger sends for agents whose timer has elapsed
  useEffect(() => {
    const tick = async () => {
      const hasEnabled = Object.values(autoworkPolicies).some(p => p.enabled);
      if (!hasEnabled) return;
      try {
        const res = await fetch('/api/office/autowork', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.sent?.length > 0) {
            const polRes = await fetch(getApiPath('/api/office/autowork'));
            if (polRes.ok) {
              const polData = await polRes.json();
              setAutoworkPolicies(polData.policies || {});
            }
          }
        }
      } catch {}
    };
    const i = setInterval(tick, 15_000);
    return () => clearInterval(i);
  }, [autoworkPolicies]);

  // Poll API for live status every 3s
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(getApiPath('/api/office'));
        const data = await res.json();
        if (data.agents) {
          setAgents(prev => {
            const updated = data.agents.map((a: any) => {
              const defaults = generateAgentDefaults(a.id);
              const old = prev.find(p => p.id === a.id);
              return {
                ...a,
                color: a.color || old?.color || randomColor(a.id),
                mood: (a.mood || 'good') as Mood,
                needs: old?.needs || defaults.needs,
                skills: a.skills || defaults.skills,
                xp: a.xp || defaults.xp,
                level: a.level || defaults.level,
              };
            });
            return updated;
          });
        }
        // Update activity log if present
        if (data.activityLog && data.activityLog.length > 0) {
          setActivityLog(data.activityLog);
        }
      } catch (err) {
        console.error('Failed to fetch agent status:', err);
      }
    };
    fetchStatus();
    const i = setInterval(fetchStatus, 3000);
    return () => clearInterval(i);
  }, []);

  // Poll meeting status every 3s
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await fetch(getApiPath('/api/office/meeting'));
        const data = await res.json();
        setMeeting(data);
      } catch (err) {
        console.error('Failed to fetch meeting status:', err);
      }
    };
    fetchMeeting();
    const i = setInterval(fetchMeeting, 3000);
    return () => clearInterval(i);
  }, []);

  // Poll actions/accomplishments every 5s
  useEffect(() => {
    const fetchActions = async () => {
      try {
        const res = await fetch(getApiPath('/api/office/actions'));
        const data = await res.json();
        if (data.actions) setPendingActions(data.actions);
        if (data.accomplishments) setAccomplishments(data.accomplishments);
      } catch {}
      try {
        const ar = await fetch(getApiPath('/api/office/actions') + '?archiveOffset=0&limit=0');
        const ad = await ar.json();
        if (typeof ad.archiveTotal === 'number') setArchiveTotal(ad.archiveTotal);
      } catch {}
    };
    fetchActions();
    const i = setInterval(fetchActions, 5000);
    return () => clearInterval(i);
  }, []);

  // Celebrate new accomplishments
  useEffect(() => {
    // On first load, just record the high-water mark — don't celebrate old ones
    if (lastAccomplishmentCheck.current === 0 && accomplishments.length > 0) {
      const maxTs = Math.max(...accomplishments.map(a => a.timestamp || 0));
      lastAccomplishmentCheck.current = maxTs;
      return;
    }

    let playedSound = false;
    accomplishments.forEach(acc => {
      if (acc.timestamp > lastAccomplishmentCheck.current) {
        // New accomplishment! Trigger celebration
        if (!playedSound) {
          sfx.play('achievement', 2000);
          playedSound = true;
        }
        const agent = agents.find(a => a.name === acc.who);
        if (agent) {
          setCelebrations(prev => [...prev, {
            agentId: agent.id,
            timestamp: Date.now(),
          }]);
          
          // Auto-remove after 1.5 seconds
          setTimeout(() => {
            setCelebrations(prev => 
              prev.filter(c => c.agentId !== agent.id || Date.now() - c.timestamp > 1500)
            );
          }, 1500);
        }
      }
    });
    
    // Update high-water mark to the max timestamp seen
    if (accomplishments.length > 0) {
      const maxTs = Math.max(...accomplishments.map(a => a.timestamp || 0));
      if (maxTs > lastAccomplishmentCheck.current) {
        lastAccomplishmentCheck.current = maxTs;
      }
    }
  }, [accomplishments, agents]);

  const loadArchive = async (reset = false) => {
    setArchiveLoading(true);
    try {
      const offset = reset ? 0 : archivedAccomplishments.length;
      const res = await fetch(`/api/office/actions?archiveOffset=${offset}&limit=50`);
      const data = await res.json();
      if (data.archive) {
        setArchivedAccomplishments(prev => reset ? data.archive : [...prev, ...data.archive]);
        setArchiveTotal(data.archiveTotal || 0);
      }
    } catch {}
    setArchiveLoading(false);
  };

  // Poll chat — uses demo chat API in demo mode, real office API otherwise
  useEffect(() => {
    const fetchChat = async () => {
      try {
        if (isDemoMode) {
          const res = await fetch(getApiPath('/api/office/chat'));
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages)) {
            setChatLog(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.messages)) {
                setTimeout(() => {
                  if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
                }, 100);
              }
              return data.messages;
            });
          }
        } else {
          const res = await fetch('/api/office');
          const data = await res.json();
          if (data.chatLog && Array.isArray(data.chatLog)) {
            setChatLog(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.chatLog)) {
                setTimeout(() => {
                  if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
                }, 100);
              }
              return data.chatLog;
            });
          }
        }
      } catch {}
    };
    fetchChat();
    const i = setInterval(fetchChat, isDemoMode ? 3000 : 5000);
    return () => clearInterval(i);
  }, [isDemoMode]);

  // Track new chat messages and sync thought bubbles
  useEffect(() => {
    if (chatLog.length > lastSeenChatCount) {
      // Only play message sound in real mode (not demo) to avoid constant chimes
      if (lastSeenChatCount > 0 && !isDemoMode) sfx.play('message', 5000);
      setLastSeenChatCount(chatLog.length);
      const lastMsg = chatLog[chatLog.length - 1];
      if (lastMsg) {
        const match = agents.find(a => a.name.toLowerCase() === lastMsg.from.toLowerCase());
        if (match) {
          setActiveThought({ agentId: match.id, text: `💭 ${lastMsg.text}` });
          setTimeout(() => setActiveThought(null), 8000);
        }
      }
    }
  }, [chatLog, lastSeenChatCount, agents]);

  // Schedule next chat message — only reschedule when chatLog length changes (new message arrived)
  const chatLogLen = chatLog.length;
  useEffect(() => {
    if (isDemoMode) return; // Demo mode has its own chat simulation
    const waterCoolerConfig = config.waterCooler || {};
    if (waterCoolerConfig.enabled === false) return;

    const npcAgents = agents.filter(a => a.id !== '_owner');
    if (npcAgents.length < 2) return;

    if (waterCoolerConfig.quiet?.enabled) {
      const now = new Date();
      const tz = waterCoolerConfig.quiet.timezone || 'America/New_York';
      const hour = parseInt(now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: tz }));
      const quietStart = parseInt(waterCoolerConfig.quiet.start?.split(':')[0] || '23');
      const quietEnd = parseInt(waterCoolerConfig.quiet.end?.split(':')[0] || '8');
      if (hour >= quietStart || hour < quietEnd) return;
    }

    // If a timer is already running and hasn't fired yet, don't reset
    if (chatTimerRef.current && chatTargetRef.current > Date.now()) return;

    const parseInterval = (str: string): number => {
      const match = str.match(/^(\d+)(s|m|h|d)$/);
      if (!match) return 45000;
      const [, num, unit] = match;
      const n = parseInt(num, 10);
      const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
      return n * multipliers[unit];
    };

    const baseFreq = parseInterval(waterCoolerConfig.frequency || '45s');
    const delay = baseFreq + (Math.random() - 0.5) * baseFreq * 0.5;
    chatTargetRef.current = Date.now() + delay;
    setNextChatIn(Math.round(delay / 1000));

    chatTimerRef.current = setTimeout(async () => {
      chatTimerRef.current = null;
      chatTargetRef.current = 0;
      setNextChatIn(-1);
      try {
        const allAgentData = agents
          .filter(a => a.id !== '_owner')
          .map(a => ({ id: a.id, name: a.name, role: a.role, status: a.status, task: a.task }));
        await fetch('/api/office/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentNames: allAgentData.map(a => a.name),
            allAgents: allAgentData,
          }),
        });
      } catch {}
      setNextChatIn(0);
    }, delay);

    return () => {
      if (chatTimerRef.current) clearTimeout(chatTimerRef.current);
      chatTimerRef.current = null;
      chatTargetRef.current = 0;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatLogLen, config.waterCooler?.frequency, config.waterCooler?.enabled]);

  // Countdown tick
  useEffect(() => {
    const tick = setInterval(() => {
      if (chatTargetRef.current > 0) {
        const remaining = Math.max(0, Math.round((chatTargetRef.current - Date.now()) / 1000));
        setNextChatIn(prev => prev === -1 ? prev : remaining);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Fluctuate needs slightly
  useEffect(() => {
    const timer = setInterval(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        needs: {
          energy: Math.max(5, Math.min(100, a.needs.energy + (Math.random() > 0.5 ? 2 : -2))),
          output: Math.max(5, Math.min(100, a.needs.output + (Math.random() > 0.4 ? 1 : -1))),
          collab: Math.max(5, Math.min(100, a.needs.collab + (Math.random() > 0.5 ? 2 : -3))),
          queue: Math.max(5, Math.min(100, a.needs.queue + (Math.random() > 0.6 ? 2 : -1))),
          focus: Math.max(5, Math.min(100, a.needs.focus + (Math.random() > 0.5 ? 1 : -2))),
        },
      })));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const sendGroupMessage = async () => {
    if (!groupMessage.trim() || sendingGroup) return;
    sfx.play('send');
    setSendingGroup(true);
    try {
      const ownerName = agents.find(a => a.id === '_owner')?.name || 'You';

      // Add user message to water cooler chat so agents see it and respond
      fetch('/api/office/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user_message', from: ownerName, text: groupMessage }),
      }).catch(() => {});

      // Send to all agents (broadcast)
      const res = await fetch('/api/office/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          broadcast: true,
          agentIds: agents.map(a => a.id),
          message: groupMessage 
        }),
      });
      
      if (res.ok) {
        setGroupMessage('');
        setGroupSent(true);
        setTimeout(() => setGroupSent(false), 3000);
      } else {
        alert('Failed to send group message');
      }
    } catch (err) {
      alert('Failed to send group message');
    } finally {
      setSendingGroup(false);
    }
  };

  const handleTemplateSelect = async (quest: any) => {
    try {
      // Add the cloned quest to actions
      const res = await fetch('/api/office/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'add', action: quest }),
      });
      
      if (res.ok) {
        // Refresh actions
        const actionsRes = await fetch(getApiPath('/api/office/actions'));
        const data = await actionsRes.json();
        if (data.actions) setPendingActions(data.actions);
      }
    } catch (err) {
      console.error('Failed to add template quest:', err);
    }
  };

  const agentsWithThoughts = agents.map(a => ({
    ...a,
    thought: activeThought && activeThought.agentId === a.id ? activeThought.text : a.thought,
  }));

  const working = agentsWithThoughts.filter(a => a.status === 'working');
  const idle = agentsWithThoughts.filter(a => a.status === 'idle');

  // Group accomplishments by date (newest first)
  const sortedAccomplishments = [...accomplishments].sort((a, b) => b.timestamp - a.timestamp);
  const groupedAccomplishments = sortedAccomplishments.reduce((groups, acc) => {
    const date = new Date(acc.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let label: string;
    if (date.toDateString() === today.toDateString()) {
      label = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday';
    } else {
      const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo < 7) {
        label = `${daysAgo} days ago`;
      } else if (daysAgo < 30) {
        const weeksAgo = Math.floor(daysAgo / 7);
        label = weeksAgo === 1 ? '1 week ago' : `${weeksAgo} weeks ago`;
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }
    
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(acc);
    return groups;
  }, {} as Record<string, typeof accomplishments>);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        setSelectedAgent(null);
        setShowTemplateGallery(false);
        setShowShareModal(false);
        setShowSettings(false);
        setShowCallMeeting(false);
        setSelectedAccomplishment(null);
      }
      if (key === '?' && !e.ctrlKey && !e.metaKey) {
        setShowSettings(prev => !prev);
      }
      if (key === 't' && !e.ctrlKey && !e.metaKey) {
        setShowTemplateGallery(prev => !prev);
      }
      if (key === 'm' && !e.ctrlKey && !e.metaKey) {
        setShowCallMeeting(prev => !prev);
      }
      // Number keys 1-9 to select agents
      if (key >= '1' && key <= '9' && !e.ctrlKey && !e.metaKey) {
        const idx = parseInt(key) - 1;
        const nonOwnerAgents = agents.filter(a => a.id !== '_owner');
        if (idx < nonOwnerAgents.length) {
          setSelectedAgent(prev => prev?.id === nonOwnerAgents[idx].id ? null : nonOwnerAgents[idx]);
          sfx.playClick();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [agents, sfx]);

  const hour = time.getHours();
  const bgGrad =
    hour >= 6 && hour < 18
      ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(180deg, #020617 0%, #0f172a 100%)';

  // Responsive sizing
  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';
  const npcSize = isMobile ? 0.6 : isTablet ? 0.75 : 0.9;
  const roomGap = isMobile ? 6 : 8;
  const roomPadding = isMobile ? '16px 6px 4px' : '24px 8px 6px';
  const baseFontSize = isMobile ? 10 : isTablet ? 9 : 8;
  const headerFontSize = isMobile ? 12 : 14;

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: bgGrad,
      color: '#e2e8f0',
      fontFamily: 'system-ui',
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />

      {/* Demo Mode Banner */}
      {isDemoMode && <DemoBanner />}

      {/* Header */}
      <div style={{
        background: '#0f172a',
        borderBottom: '2px solid #1e293b',
        padding: '6px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 6 : 10,
        }}>
          <span style={{ fontSize: isMobile ? 18 : 22 }}>🏢</span>
          <h1 style={{
            margin: 0,
            fontSize: headerFontSize,
            fontFamily: '"Press Start 2P", monospace',
          }}>
            {isMobile ? 'OCF' : 'OPENCLAWFICE'}
          </h1>
          <span style={{
            fontSize: isMobile ? 8 : 10,
            color: '#475569',
            marginLeft: isMobile ? 4 : 8,
          }}>
            {agents.length} {isMobile ? 'ag' : 'agents'}
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <Stat icon="🟢" n={working.length} />
          <Stat icon="☕" n={idle.length} />
          {pendingActions.length > 0 && <Stat icon="⚔️" n={pendingActions.length} />}
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 9,
            color: '#64748b',
          }}>
            {time.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'America/New_York',
            })}
          </div>
          <button
            onClick={() => { sfx.play('meetingStart'); setShowCallMeeting(true); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: 14,
              padding: '2px 4px',
            }}
            title="Call Meeting"
          >
            📞
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: 14,
              padding: '2px 4px',
            }}
            title="Share Your Office"
          >
            📸
          </button>
          <button
            onClick={() => { sfx.play('open'); setShowSettings(true); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: 14,
              padding: '2px 4px',
            }}
            title="Settings"
          >
            ⚙️
          </button>
          <button
            onClick={() => {
              const next = !sfxEnabled;
              setSfxEnabled(next);
              sfx.setEnabled(next);
              if (next) sfx.play('click');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: sfxEnabled ? '#475569' : '#1e293b',
              cursor: 'pointer',
              fontSize: 14,
              padding: '2px 4px',
              opacity: sfxEnabled ? 1 : 0.5,
            }}
            title={sfxEnabled ? 'Mute SFX' : 'Unmute SFX'}
          >
            {sfxEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* No Agents Empty State */}
      {agents.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 100px)',
          textAlign: 'center',
          padding: '20px',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
          <h2 style={{
            fontSize: isMobile ? 16 : 20,
            fontFamily: '"Press Start 2P", monospace',
            marginBottom: 20,
            color: '#e2e8f0',
          }}>
            Welcome to OpenClawfice!
          </h2>
          <div style={{
            fontSize: isMobile ? 12 : 14,
            color: '#94a3b8',
            maxWidth: 500,
            lineHeight: 1.8,
            marginBottom: 20,
          }}>
            No agents detected yet.
          </div>
          <div style={{
            fontSize: isMobile ? 11 : 13,
            color: '#64748b',
            maxWidth: 500,
            lineHeight: 1.6,
            textAlign: 'left',
          }}>
            <div style={{ marginBottom: 8 }}>To get started:</div>
            <div style={{ marginBottom: 6 }}>1. Make sure OpenClaw is running</div>
            <div style={{ marginBottom: 6 }}>2. Agents will appear here automatically from ~/.openclaw/openclaw.json</div>
            <div style={{ marginBottom: 20 }}>3. Send a message in OpenClaw to wake them up!</div>
            <div style={{ fontSize: isMobile ? 10 : 12, color: '#475569' }}>
              Need help? Check the <a href="/install" style={{ color: '#6366f1', textDecoration: 'none' }}>install guide</a>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Banner — shown when all agents are new (never ran) */}
      {agents.length > 0 && agents.every(a => a.isNew) && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1))',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 8,
          padding: '10px 16px',
          margin: '8px 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'fadeSlideIn 0.5s ease-out',
        }}>
          <span style={{ fontSize: 20 }}>👋</span>
          <div>
            <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>Welcome to your office!</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
              Your agents will appear here once they start working. Send a message in OpenClaw to wake them up!
              {agents.some(a => !a.hasIdentity) && (
                <> 💡 Tip: Add <code style={{ background: '#1e293b', padding: '1px 4px', borderRadius: 3 }}>IDENTITY.md</code> to agent workspaces to customize their names.</>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Identity tip — shown when some agents lack IDENTITY.md but aren't all new */}
      {agents.length > 0 && !agents.every(a => a.isNew) && agents.some(a => !a.hasIdentity) && (
        <div style={{
          background: 'rgba(167,139,250,0.08)',
          border: '1px solid rgba(167,139,250,0.2)',
          borderRadius: 8,
          padding: '6px 12px',
          margin: '8px 12px 0',
          fontSize: 10,
          color: '#a78bfa',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span>💡</span>
          <span>Some agents are using default names. Add <code style={{ background: '#1e293b', padding: '1px 4px', borderRadius: 3 }}>IDENTITY.md</code> to their workspaces to customize!</span>
        </div>
      )}

      {/* Office Floor — only show if agents exist */}
      {agents.length > 0 && (
      <div style={{
        padding: isMobile ? '6px' : '8px 12px 16px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 240px' : '1fr 260px',
        gap: roomGap,
        maxWidth: isMobile ? '100%' : 1400,
        margin: '0 auto',
        height: isMobile ? 'auto' : 'calc(100vh - 56px)',
        overflow: isMobile ? 'auto' : 'hidden',
      }}>
        {/* LEFT COLUMN */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: roomGap,
          minHeight: 0,
          overflow: isMobile ? 'visible' : 'hidden',
        }}>
          {/* WORK ROOM — hide in single agent mode */}
          {agents.length > 1 && (
          <Room
            title="Work Room"
            icon="💻"
            color="#0a1a10"
            borderColor="#166534"
            style={{ flex: '1 1 auto' }}
          >
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
              justifyContent: 'center',
              padding: '12px 0 4px',
              minHeight: 80,
            }}>
              {working.length > 0 ? (
                working.map(a => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {a.task && (
                      <div style={{ position: 'relative' }}>
                        <div onClick={(e) => { e.stopPropagation(); setExpandedTask(expandedTask === a.id ? null : a.id); }} style={{
                          background: 'rgba(16,185,129,0.12)',
                          border: '1px solid rgba(16,185,129,0.25)',
                          borderRadius: 4,
                          padding: '2px 6px',
                          fontSize: 8,
                          color: '#6ee7b7',
                          maxWidth: 140,
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                        }}>
                          {a.task}
                        </div>
                        {expandedTask === a.id && (
                          <div onClick={(e) => e.stopPropagation()} style={{
                            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                            marginTop: 4, zIndex: 100,
                            background: '#1e293b', border: '1px solid #334155',
                            borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#e2e8f0',
                            maxWidth: 320, minWidth: 180, whiteSpace: 'normal', wordBreak: 'break-word',
                            lineHeight: 1.4, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                            animation: 'fadeSlideIn 0.15s ease-out',
                          }}>
                            <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4, fontFamily: '"Press Start 2P", monospace' }}>{a.name}</div>
                            {a.task}
                          </div>
                        )}
                      </div>
                    )}
                    <NPC
                      agent={a}
                      size={npcSize}
                      onClick={() => { sfx.play('click'); setSelectedAgent(a); }}
                      forceThought={activeThought && activeThought.agentId === a.id ? activeThought.text : null}
                      hasCelebration={celebrations.some(c => c.agentId === a.id)}
                    />
                  </div>
                ))
              ) : (
                <div style={{
                  color: '#475569',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 7,
                  padding: 12,
                }}>
                  * nobody working *
                </div>
              )}
            </div>
          </Room>
          )}

          {/* MEETING ROOM — only appears when meeting.active = true */}
          {meeting.active && (
            <Room
              title="Meeting Room"
              icon="🤝"
              color="#1a0a2e"
              borderColor="#7c3aed"
              style={{
                flex: '0 0 auto',
                animation: 'fadeSlideIn 0.5s ease-out',
              }}
            >
              <div style={{
                padding: '12px 12px 16px',
              }}>
                {/* Topic */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: 8,
                  fontSize: 11,
                  color: '#c4b5fd',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  padding: '0 8px',
                }}>
                  {meeting.topic || 'Discussion in progress...'}
                </div>

                {/* Progress indicators */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 12,
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.4)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 8,
                    color: '#a78bfa',
                    fontFamily: '"Press Start 2P", monospace',
                  }}>
                    Round {meeting.currentRound}/{meeting.maxRounds}
                  </div>
                  <div style={{
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.4)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 8,
                    color: '#a78bfa',
                    fontFamily: '"Press Start 2P", monospace',
                  }}>
                    {(() => {
                      const elapsed = Date.now() - (meeting.startedAt || Date.now());
                      const mins = Math.floor(elapsed / 60000);
                      const secs = Math.floor((elapsed % 60000) / 1000);
                      return `${mins}:${secs.toString().padStart(2, '0')} elapsed`;
                    })()}
                  </div>
                </div>

                {/* Participants facing each other */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  gap: isMobile ? 24 : 40,
                  marginBottom: meeting.lastMessage ? 8 : 0,
                }}>
                  {meeting.participants && meeting.participants.length >= 2 && (() => {
                    const participant1 = agents.find(a => a.id === meeting.participants![0]);
                    const participant2 = agents.find(a => a.id === meeting.participants![1]);
                    
                    return (
                      <>
                        {participant1 && (
                          <NPC
                            agent={participant1}
                            size={npcSize * 0.85}
                            onClick={() => { sfx.play('click'); setSelectedAgent(participant1); }}
                            hasCelebration={celebrations.some(c => c.agentId === participant1.id)}
                          />
                        )}

                        {participant2 && (
                          <NPC
                            agent={participant2}
                            size={npcSize * 0.85}
                            onClick={() => { sfx.play('click'); setSelectedAgent(participant2); }}
                            flipped
                            hasCelebration={celebrations.some(c => c.agentId === participant2.id)}
                          />
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Last message below the participants */}
                {meeting.lastMessage && (
                  <div style={{
                    background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    color: '#c4b5fd',
                    padding: '6px 10px',
                    borderRadius: 8,
                    fontSize: isMobile ? 9 : 10,
                    textAlign: 'center',
                    lineHeight: 1.4,
                    marginTop: 4,
                  }}>
                    {meeting.lastMessage.length > 120 
                      ? meeting.lastMessage.slice(0, 117) + '...' 
                      : meeting.lastMessage}
                  </div>
                )}
              </div>
            </Room>
          )}

          {/* LOUNGE + QUEST LOG */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            flex: '0 0 auto',
          }}>
            <Room title="The Lounge" icon="☕" color="#1a150a" borderColor="#92400e">
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                justifyContent: 'center',
                padding: '16px 0 4px',
                minHeight: 140,
              }}>
                {idle.length > 0 ? (
                  idle.map(a => (
                    <div
                      key={a.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {a.isNew && (
                        <div style={{
                          background: 'rgba(34,197,94,0.15)',
                          border: '1px solid rgba(34,197,94,0.4)',
                          borderRadius: 6,
                          padding: '2px 8px',
                          fontSize: 8,
                          color: '#4ade80',
                          fontFamily: '"Press Start 2P", monospace',
                        }}>🆕 NEW</div>
                      )}
                      {a.nextTaskAt && !a.isNew && <CooldownTimer targetMs={a.nextTaskAt} />}
                      <NPC
                        agent={a}
                        size={npcSize}
                        onClick={() => { sfx.play('click'); setSelectedAgent(a); }}
                        forceThought={activeThought && activeThought.agentId === a.id ? activeThought.text : null}
                        hasCelebration={celebrations.some(c => c.agentId === a.id)}
                      />
                    </div>
                  ))
                ) : (
                  <div style={{
                    color: '#475569',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 7,
                    padding: 8,
                    textAlign: 'center',
                  }}>
                    {agents.length === 1 ? (
                      <div style={{ lineHeight: 1.8 }}>
                        👋 Solo mode!
                        <br />
                        <br />
                        Add more agents to openclaw.json to build a team.
                      </div>
                    ) : (
                      '* everyone is busy *'
                    )}
                  </div>
                )}
              </div>
            </Room>

            <Room title="Quest Log" icon="⚔️" color="#0a0a1f" borderColor="#4f46e5">
              <div style={{
                padding: '10px 4px 4px',
                minHeight: 80,
                maxHeight: 200,
                overflowY: 'auto',
              }}>
                {pendingActions.length > 0 ? (
                  pendingActions.slice(0, 5).map(action => {
                    const priorityColors: Record<string, string> = {
                      high: '#ef4444',
                      medium: '#f59e0b',
                      low: '#6366f1',
                    };
                    const priorityGlow: Record<string, string> = {
                      high: 'rgba(239,68,68,0.2)',
                      medium: 'rgba(245,158,11,0.1)',
                      low: 'rgba(99,102,241,0.1)',
                    };
                    return (
                      <div
                        key={action.id}
                        onClick={() => { sfx.play('open'); setExpandedAction(action.id); }}
                        style={{
                          background: priorityGlow[action.priority],
                          border: `1px solid ${priorityColors[action.priority]}44`,
                          borderLeft: `3px solid ${priorityColors[action.priority]}`,
                          borderRadius: 6,
                          padding: '6px 8px',
                          marginBottom: 4,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14 }}>{action.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#e2e8f0',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {action.title}
                            </div>
                            <div style={{
                              fontSize: 8,
                              color: '#64748b',
                              display: 'flex',
                              gap: 8,
                              marginTop: 1,
                            }}>
                              <span>from {action.from}</span>
                              <span style={{
                                color: priorityColors[action.priority],
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: 6,
                              }}>
                                {action.priority === 'high'
                                  ? '❗ URGENT'
                                  : action.priority === 'medium'
                                  ? '⚡ SOON'
                                  : '📋 WHEN FREE'}
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: 10, color: '#475569' }}>▶</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{
                    padding: 12,
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: 24,
                      marginBottom: 8,
                    }}>
                      ✨
                    </div>
                    <div style={{
                      color: '#e2e8f0',
                      fontSize: 10,
                      marginBottom: 6,
                      fontWeight: 600,
                    }}>
                      No pending decisions
                    </div>
                    <div style={{
                      color: '#64748b',
                      fontSize: 9,
                      lineHeight: 1.5,
                      marginBottom: 12,
                    }}>
                      Your agents will create quests when
                      <br />
                      they need your input.
                      <br />
                      <br />
                      <span style={{ fontSize: 8, fontStyle: 'italic' }}>
                        (Pulled from ~/.openclaw/.status/actions.json)
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTemplateGallery(true);
                      }}
                      style={{
                        background: '#6366f1',
                        border: 'none',
                        color: '#fff',
                        borderRadius: 6,
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: 10,
                        fontWeight: 600,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#4f46e5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#6366f1';
                      }}
                    >
                      Browse Quest Templates
                    </button>
                  </div>
                )}
              </div>
            </Room>
          </div>

          {/* ACCOMPLISHMENTS */}
          <div style={{
            background: '#0f172a',
            border: '2px solid #1e293b',
            borderRadius: 8,
            overflow: 'hidden',
            flex: '1 1 0',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              background: '#1e293b',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 12 }}>🏆</span>
              <span style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 7,
                textTransform: 'uppercase',
              }}>
                Accomplishments
              </span>
              <span style={{
                fontSize: 8,
                color: '#475569',
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                {accomplishments.length} recent
                {archiveTotal > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!showArchive) loadArchive(true); setShowArchive(!showArchive); }}
                    style={{
                      background: showArchive ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: 4,
                      color: '#818cf8',
                      fontSize: 7,
                      padding: '2px 5px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {showArchive ? 'Hide History' : `${archiveTotal} archived`}
                  </button>
                )}
              </span>
            </div>
            <div style={{
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              overflowY: 'auto',
              flex: 1,
            }}>
              {accomplishments.length > 0 ? (
                Object.entries(groupedAccomplishments).map(([dateLabel, accs]) => (
                  <div key={dateLabel}>
                    {/* Date Header */}
                    <div style={{
                      fontSize: 8,
                      fontFamily: '"Press Start 2P", monospace',
                      color: '#64748b',
                      padding: '8px 4px 4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {dateLabel}
                    </div>
                    {/* Accomplishments for this date */}
                    {accs.map((a, i) => {
                  const timeAgo = (() => {
                    const mins = Math.floor((Date.now() - a.timestamp) / 60000);
                    if (mins < 1) return 'just now';
                    if (mins < 60) return `${mins}m ago`;
                    const hours = Math.floor(mins / 60);
                    if (hours < 24) return `${hours}h ago`;
                    return `${Math.floor(hours / 24)}d ago`;
                  })();
                  const hasMedia = a.screenshot && (a.screenshot.endsWith('.mp4') || a.screenshot.endsWith('.webm') || a.screenshot.endsWith('.mov'));
                  const hasScreenshot = !!a.screenshot;
                  const isRecording = !hasScreenshot && (Date.now() - a.timestamp) < 30000;
                  return (
                    <div
                      key={a.id || i}
                      onClick={() => { sfx.play('click'); setSelectedAccomplishment(a); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '5px 8px',
                        background: 'rgba(16,185,129,0.04)',
                        border: '1px solid rgba(16,185,129,0.1)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        animation: i === 0 ? 'fadeSlideIn 0.5s ease-out' : undefined,
                      }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0 }}>
                        {a.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0' }}>
                          {a.title}
                        </span>
                      </div>
                      {hasMedia && (
                        <span style={{ fontSize: 10, flexShrink: 0 }} title="Loom recording attached">🎬</span>
                      )}
                      {isRecording && (
                        <span style={{ fontSize: 8, flexShrink: 0, color: '#f87171', animation: 'pulse 1s infinite' }} title="Recording loom...">🔴 REC</span>
                      )}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 2,
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 8, fontWeight: 600, color: '#6366f1' }}>
                          {a.who}
                        </span>
                        <span style={{ fontSize: 7, color: '#475569' }}>{timeAgo}</span>
                      </div>
                    </div>
                  );
                })}
                  </div>
                ))
              ) : (
                <div style={{
                  padding: 16,
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: 32,
                    marginBottom: 8,
                  }}>
                    🎯
                  </div>
                  <div style={{
                    color: '#e2e8f0',
                    fontSize: 10,
                    marginBottom: 6,
                    fontWeight: 600,
                  }}>
                    No accomplishments yet
                  </div>
                  <div style={{
                    color: '#64748b',
                    fontSize: 9,
                    lineHeight: 1.6,
                  }}>
                    Once your agents complete tasks,
                    <br />
                    they'll appear here!
                    <br />
                    <br />
                    <span style={{ fontSize: 8 }}>
                      Auto-detected from agent activity ✨
                    </span>
                  </div>
                </div>
              )}
              {showArchive && (
                <div style={{ marginTop: 8, borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: 8 }}>
                  <div style={{ fontSize: 8, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 6, fontFamily: '"Press Start 2P", monospace' }}>
                    History ({archiveTotal} archived)
                  </div>
                  {archivedAccomplishments.map((a, i) => {
                    const dateStr = new Date(a.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    return (
                      <div
                        key={`arch-${a.id || i}`}
                        onClick={() => setSelectedAccomplishment(a)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '4px 8px',
                          background: 'rgba(99,102,241,0.03)',
                          border: '1px solid rgba(99,102,241,0.08)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          marginBottom: 3,
                          opacity: 0.8,
                        }}
                      >
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{a.icon}</span>
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: '#cbd5e1' }}>{a.title}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
                          <span style={{ fontSize: 7, fontWeight: 600, color: '#6366f1' }}>{a.who}</span>
                          <span style={{ fontSize: 7, color: '#475569' }}>{dateStr}</span>
                        </div>
                      </div>
                    );
                  })}
                  {archivedAccomplishments.length < archiveTotal && (
                    <button
                      onClick={() => loadArchive()}
                      disabled={archiveLoading}
                      style={{
                        width: '100%',
                        marginTop: 4,
                        padding: '5px 0',
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.15)',
                        borderRadius: 6,
                        color: '#818cf8',
                        fontSize: 8,
                        cursor: archiveLoading ? 'wait' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {archiveLoading ? 'Loading...' : `Load more (${archiveTotal - archivedAccomplishments.length} remaining)`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Water Cooler Chat */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: roomGap,
          height: isMobile ? 'auto' : '100%',
          overflow: isMobile ? 'visible' : 'hidden',
          maxHeight: isMobile ? '400px' : undefined,
        }}>
          <div style={{
            background: '#0f172a',
            border: '2px solid #44320a',
            borderRadius: 12,
            flex: isMobile ? 'none' : 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxHeight: isMobile ? '400px' : undefined,
          }}>
            <div style={{
              background: '#1e293b',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 12 }}>💬</span>
              <span style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 7,
                textTransform: 'uppercase',
                color: '#f59e0b',
              }}>
                Water Cooler
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: 8,
                color: nextChatIn === -1 ? '#f59e0b' : '#475569',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {nextChatIn === -1
                  ? '✨ generating...'
                  : nextChatIn > 0
                    ? `next in ${nextChatIn >= 60 ? `${Math.floor(nextChatIn / 60)}:${String(nextChatIn % 60).padStart(2, '0')}` : `${nextChatIn}s`}`
                    : ''}
              </span>
            </div>
            <div
              ref={chatRef}
              style={{
                flex: 1,
                overflow: 'auto',
                padding: 10,
              }}
            >
              {chatLog.length === 0 && (
                <div style={{
                  padding: 16,
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: 28,
                    marginBottom: 8,
                  }}>
                    💬
                  </div>
                  <div style={{
                    color: '#e2e8f0',
                    fontSize: 10,
                    marginBottom: 6,
                    fontWeight: 600,
                  }}>
                    Water Cooler
                  </div>
                  <div style={{
                    fontSize: 9,
                    color: '#64748b',
                    lineHeight: 1.6,
                  }}>
                    No chat yet. Idle agents will start
                    <br />
                    chatting automatically!
                    <br />
                    <br />
                    Or broadcast a message below ↓
                  </div>
                </div>
              )}
              {chatLog.slice(-12).map((m, i) => {
                const isOwner = agents.find(a => a.id === '_owner' && a.name === m.from);
                return (
                  <div
                    key={`${i}-${m.text}`}
                    style={{
                      fontSize: 11,
                      padding: '4px 0',
                      animation: 'fadeSlideIn 0.3s ease-out',
                      ...(isOwner ? { background: 'rgba(245,158,11,0.06)', borderRadius: 4, padding: '4px 6px', margin: '2px -6px' } : {}),
                    }}
                  >
                    <span style={{
                      fontWeight: 700,
                      color: isOwner ? '#f59e0b' : (agents.find(a => a.name === m.from)?.color || '#94a3b8'),
                      fontSize: 10,
                    }}>
                      {isOwner ? `${m.from} (you)` : m.from}
                    </span>{' '}
                    <span style={{ color: isOwner ? '#fbbf24' : '#a1a1aa' }}>{m.text}</span>
                  </div>
                );
              })}
            </div>
            {/* Group Chat Input */}
            <div style={{
              borderTop: '1px solid #1e293b',
              padding: 8,
              flexShrink: 0,
            }}>
              <div style={{
                fontSize: 8,
                color: '#64748b',
                marginBottom: 6,
                fontFamily: '"Press Start 2P", monospace',
              }}>
                SAY SOMETHING ({agents.filter(a => a.id !== '_owner').length} listening)
              </div>
              {groupSent && (
                <div style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  marginBottom: 6,
                  fontSize: 9,
                  color: '#fbbf24',
                  animation: 'fadeSlideIn 0.3s ease-out',
                }}>
                  ✓ Sent to the team
                </div>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={groupMessage}
                  onChange={(e) => setGroupMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isDemoMode && sendGroupMessage()}
                  placeholder={isDemoMode ? "Demo mode: messaging disabled" : "Say something to the team..."}
                  disabled={sendingGroup || isDemoMode}
                  style={{
                    flex: 1,
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 6,
                    padding: '6px 8px',
                    color: '#e2e8f0',
                    fontSize: 11,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={sendGroupMessage}
                  disabled={sendingGroup || !groupMessage.trim()}
                  style={{
                    background: groupSent ? '#10b981' : '#f59e0b',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '6px 10px',
                    cursor: sendingGroup || !groupMessage.trim() ? 'not-allowed' : 'pointer',
                    fontSize: 11,
                    opacity: sendingGroup || !groupMessage.trim() ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {groupSent ? '✓' : sendingGroup ? '...' : '📢'}
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{
            background: '#0f172a',
            border: '2px solid #1e293b',
            borderRadius: 8,
            padding: '6px 10px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 10 }}>🏆</span>
            {[...agents]
              .sort((a, b) => b.xp - a.xp)
              .slice(0, 3)
              .map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 9,
                  }}
                >
                  <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <span style={{ fontWeight: 600, color: a.color }}>{a.name}</span>
                  <span style={{ color: '#6366f1' }}>{a.xp.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
      )}

      {/* Agent Detail Panel */}
      {/* Quest Detail Modal */}
      {expandedAction && (() => {
        const action = pendingActions.find(a => a.id === expandedAction);
        if (!action) return null;
        const priorityColors: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#6366f1' };
        const respondAction = async (response: string) => {
          await fetch('/api/office/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'respond_action', id: action.id, response }),
          });
          setPendingActions(prev => prev.filter(a => a.id !== action.id));
          setExpandedAction(null);
        };
        return (
          <div onClick={() => setExpandedAction(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: '#0f172a', border: `2px solid ${priorityColors[action.priority]}`,
              borderRadius: 12, padding: 20, maxWidth: 520, width: '100%',
              maxHeight: '80vh', overflowY: 'auto',
              boxShadow: `0 0 40px ${priorityColors[action.priority]}33, 0 20px 60px rgba(0,0,0,0.8)`,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{action.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{action.title}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                    from <span style={{ color: action.from === 'Scout' ? '#f59e0b' : action.from === 'Cipher' ? '#6366f1' : '#10b981' }}>{action.from}</span>
                    <span style={{ marginLeft: 8, color: priorityColors[action.priority], fontWeight: 600, textTransform: 'uppercase' as const, fontFamily: '"Press Start 2P", monospace', fontSize: 8 }}>
                      {action.priority === 'high' ? '❗ URGENT' : action.priority === 'medium' ? '⚡ SOON' : '📋 WHEN FREE'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setExpandedAction(null)} style={{
                  background: 'none', border: 'none', color: '#475569', fontSize: 18, cursor: 'pointer',
                }}>✕</button>
              </div>

              {/* Description */}
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 12 }}>{action.description}</div>

              {/* Email body */}
              {action.data?.body && (
                <div style={{
                  background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 12,
                  fontSize: 11, color: '#cbd5e1', whiteSpace: 'pre-wrap' as const, lineHeight: 1.6,
                  border: '1px solid #334155',
                }}>
                  {action.data.subject && <div style={{ fontWeight: 700, marginBottom: 4, color: '#e2e8f0', fontSize: 12 }}>Subject: {action.data.subject}</div>}
                  {action.data.to && <div style={{ color: '#64748b', marginBottom: 8 }}>To: {action.data.to}</div>}
                  {action.data.body}
                </div>
              )}

              {/* Options buttons */}
              {action.data?.options && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(action.data.options as string[]).map((opt: string, i: number) => (
                    <button key={i} onClick={() => respondAction(opt)} style={{
                      background: i === 0 ? '#166534' : '#1e293b',
                      border: `1px solid ${i === 0 ? '#22c55e' : '#334155'}`,
                      borderRadius: 6, padding: '8px 16px', fontSize: 11,
                      color: i === 0 ? '#4ade80' : '#94a3b8',
                      cursor: 'pointer', fontWeight: i === 0 ? 700 : 400,
                    }}>{opt}</button>
                  ))}
                </div>
              )}

              {/* Approve/Reject/Edit for emails */}
              {(action.type === 'approve_email' || action.type === 'approve_send') && !action.data?.options && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => respondAction('approved')} style={{
                    background: '#166534', border: '1px solid #22c55e', borderRadius: 6,
                    padding: '8px 20px', color: '#4ade80', cursor: 'pointer',
                    fontWeight: 700, fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                  }}>✅ APPROVE</button>
                  <button onClick={() => respondAction('rejected')} style={{
                    background: '#450a0a', border: '1px solid #ef4444', borderRadius: 6,
                    padding: '8px 20px', color: '#f87171', cursor: 'pointer',
                    fontWeight: 700, fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                  }}>❌ REJECT</button>
                  <button onClick={() => {
                    const edit = prompt('Edit instructions:');
                    if (edit) respondAction(`edit: ${edit}`);
                  }} style={{
                    background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
                    padding: '8px 20px', color: '#94a3b8', cursor: 'pointer',
                    fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                  }}>✏️ EDIT</button>
                </div>
              )}

              {/* Text input for decisions/input_needed without options */}
              {((action.type === 'input_needed' || action.type === 'decision') && !action.data?.options) && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    autoFocus
                    placeholder={action.type === 'decision' ? 'Your decision...' : 'Type your response...'}
                    id={`quest-input-${action.id}`}
                    style={{
                      flex: 1, background: '#1e293b', border: '1px solid #334155',
                      borderRadius: 6, padding: '8px 12px', color: '#e2e8f0',
                      fontSize: 12, outline: 'none',
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) respondAction(val);
                      }
                    }}
                  />
                  <button onClick={() => {
                    const input = document.getElementById(`quest-input-${action.id}`) as HTMLInputElement;
                    const val = input?.value.trim();
                    if (val) respondAction(val);
                  }} style={{
                    background: '#4f46e5', border: 'none', borderRadius: 6,
                    padding: '8px 16px', color: '#fff', cursor: 'pointer',
                    fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                  }}>SEND</button>
                </div>
              )}

              {/* Review — acknowledge + notes */}
              {(action.type === 'review_data' || action.type === 'review') && !action.data?.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={() => respondAction('acknowledged')} style={{
                    background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
                    padding: '8px 20px', color: '#94a3b8', cursor: 'pointer',
                    fontFamily: '"Press Start 2P", monospace', fontSize: 9, alignSelf: 'flex-start',
                  }}>👀 ACKNOWLEDGED</button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      placeholder="Or add notes..."
                      id={`quest-input-${action.id}`}
                      style={{
                        flex: 1, background: '#1e293b', border: '1px solid #334155',
                        borderRadius: 6, padding: '8px 12px', color: '#e2e8f0',
                        fontSize: 12, outline: 'none',
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) respondAction(val);
                        }
                      }}
                    />
                    <button onClick={() => {
                      const input = document.getElementById(`quest-input-${action.id}`) as HTMLInputElement;
                      const val = input?.value.trim();
                      if (val) respondAction(val);
                    }} style={{
                      background: '#4f46e5', border: 'none', borderRadius: 6,
                      padding: '8px 16px', color: '#fff', cursor: 'pointer',
                      fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                    }}>SEND</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {selectedAccomplishment && (
        <div
          onClick={() => setSelectedAccomplishment(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: 24,
              maxWidth: 500,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>{selectedAccomplishment.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>
                  {selectedAccomplishment.title}
                </div>
                <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>
                  {selectedAccomplishment.who} · {new Date(selectedAccomplishment.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            {selectedAccomplishment.detail && (
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
                {selectedAccomplishment.detail}
              </div>
            )}
            {selectedAccomplishment.screenshot && (
              <div>
                {selectedAccomplishment.screenshot.endsWith('.mp4') || selectedAccomplishment.screenshot.endsWith('.webm') || selectedAccomplishment.screenshot.endsWith('.mov') ? (
                  <video
                    src={`/api/office/screenshot?file=${encodeURIComponent(selectedAccomplishment.screenshot)}`}
                    controls
                    autoPlay
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      border: '1px solid #334155',
                      background: '#000',
                    }}
                  />
                ) : (
                  <img
                    src={`/api/office/screenshot?file=${encodeURIComponent(selectedAccomplishment.screenshot)}`}
                    alt={selectedAccomplishment.title}
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      border: '1px solid #334155',
                    }}
                  />
                )}
              </div>
            )}
            <button
              onClick={() => setSelectedAccomplishment(null)}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '8px 16px',
                background: '#334155',
                color: '#e2e8f0',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {selectedAgent && (
        <>
          <AgentPanel
            agent={selectedAgent}
            onClose={() => { sfx.play('close'); setSelectedAgent(null); }}
            autowork={autoworkPolicies[selectedAgent.id]}
            pendingChanges={pendingAutowork[selectedAgent.id]}
            onAutoworkUpdate={(agentId, patch) => {
              setPendingAutowork(prev => ({
                ...prev,
                [agentId]: { ...(prev[agentId] || {}), ...patch },
              }));
            }}
            onStop={(agentId) => {
              setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'idle' as AgentStatus, task: undefined } : a));
              setSelectedAgent(prev => prev && prev.id === agentId ? { ...prev, status: 'idle' as AgentStatus, task: undefined } : prev);
            }}
          />
          <div
            onClick={() => setSelectedAgent(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
            }}
          />
        </>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <>
          <SettingsPanel config={config} onConfigChange={setConfig} onClose={() => setShowSettings(false)} />
          <div onClick={() => setShowSettings(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
        </>
      )}

      {/* Pending Auto-Work Changes Banner */}
      {Object.keys(pendingAutowork).length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: 'linear-gradient(to right, #1e1b4b, #312e81)',
          borderTop: '2px solid #6366f1',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          animation: 'fadeSlideIn 0.3s ease-out',
          boxShadow: '0 -4px 20px rgba(99,102,241,0.3)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#e0e7ff',
              fontFamily: '"Press Start 2P", monospace',
              marginBottom: 4,
            }}>
              ⚠ WORKSPACE RESTART REQUIRED
            </div>
            <div style={{ fontSize: 11, color: '#a5b4fc', lineHeight: 1.5 }}>
              {Object.entries(pendingAutowork).map(([agentId, changes]) => {
                const agentName = agents.find(a => a.id === agentId)?.name || agentId;
                const parts: string[] = [];
                if (changes.enabled !== undefined) parts.push(changes.enabled ? 'enable auto-work' : 'disable auto-work');
                if (changes.intervalMs !== undefined) parts.push(`interval → ${formatInterval(changes.intervalMs)}`);
                if (changes.directive !== undefined) parts.push('updated directive');
                return `${agentName}: ${parts.join(', ')}`;
              }).join(' · ')}
            </div>
          </div>
          <button
            onClick={() => setPendingAutowork({})}
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              borderRadius: 8,
              padding: '8px 16px',
              color: '#94a3b8',
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: '"Press Start 2P", monospace',
            }}
          >
            DISCARD
          </button>
          <button
            onClick={async () => {
              const entries = Object.entries(pendingAutowork);
              try {
                for (const [agentId, changes] of entries) {
                  await fetch('/api/office/autowork', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ agentId, ...changes }),
                  });
                }
                // Merge into live policies
                setAutoworkPolicies(prev => {
                  const next = { ...prev };
                  for (const [agentId, changes] of entries) {
                    next[agentId] = { ...(next[agentId] || { enabled: false, intervalMs: 600_000, directive: '', lastSentAt: 0 }), ...changes };
                  }
                  return next;
                });
                setPendingAutowork({});
              } catch {
                alert('Failed to apply changes');
              }
            }}
            style={{
              background: '#6366f1',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              color: '#fff',
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: '"Press Start 2P", monospace',
              boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
            }}
          >
            APPLY & RESTART
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes npcBob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes plumbobSpin {
          0%,
          100% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1.1) translateY(-2px);
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(320px);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <TemplateGallery
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateGallery(false)}
        />
      )}

      {/* Call Meeting Modal */}
      {showCallMeeting && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowCallMeeting(false)}
        >
          <div
            style={{
              background: '#0f172a',
              border: '2px solid #1e293b',
              borderRadius: 12,
              padding: 24,
              maxWidth: 500,
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              margin: '0 0 16px 0',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 14,
              color: '#fff',
            }}>
              📞 Call Meeting
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              Start a discussion between all your agents. They'll gather in the Meeting Room to discuss the topic you provide.
            </p>
            <input
              type="text"
              placeholder="What should they discuss? (e.g., 'Should we refactor the API?')"
              value={meetingTopic}
              onChange={(e) => setMeetingTopic(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#e2e8f0',
                fontSize: 13,
                marginBottom: 16,
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCallMeeting(false)}
                style={{
                  padding: '8px 16px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!meetingTopic.trim()) return;
                  try {
                    const res = await fetch('/api/office/meeting/start', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ topic: meetingTopic }),
                    });
                    if (res.ok) {
                      setShowCallMeeting(false);
                      setMeetingTopic('');
                      // Refresh meeting status
                      const meetRes = await fetch(getApiPath('/api/office/meeting'));
                      const meetData = await meetRes.json();
                      setMeeting(meetData);
                    }
                  } catch (err) {
                    console.error('Failed to start meeting:', err);
                  }
                }}
                disabled={!meetingTopic.trim()}
                style={{
                  padding: '8px 16px',
                  background: meetingTopic.trim() ? '#8b5cf6' : '#334155',
                  border: 'none',
                  borderRadius: 6,
                  color: '#fff',
                  cursor: meetingTopic.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Start Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          agentCount={agents.length}
          workingCount={working.length}
        />
      )}
    </div>
  );
}

function Stat({ icon, n }: { icon: string; n: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      fontSize: 11,
      color: '#94a3b8',
    }}>
      <span>{icon}</span>
      <span style={{ fontWeight: 700 }}>{n}</span>
    </div>
  );
}
