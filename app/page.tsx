'use client';

import { useState, useEffect, useRef } from 'react';

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

function Plumbob({ mood }: { mood: Mood }) {
  const colors: Record<Mood, string> = {
    great: '#22c55e',
    good: '#84cc16',
    okay: '#eab308',
    stressed: '#ef4444',
  };
  const c = colors[mood];
  return (
    <div style={{
      width: 0,
      height: 0,
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderBottom: `10px solid ${c}`,
      filter: `drop-shadow(0 0 4px ${c})`,
      animation: 'plumbobSpin 3s ease-in-out infinite',
      position: 'relative',
      top: -2,
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

function NPC({ agent, size = 1, onClick, forceThought }: {
  agent: Agent;
  size?: number;
  onClick?: () => void;
  forceThought?: string | null;
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

  const skinColor = agent.skinColor || '#e8c4a0';
  const shirtColor = agent.shirtColor || agent.color || randomColor(agent.id);
  const hairColor = agent.hairColor || '#4a3728';

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
      <Plumbob mood={agent.mood} />
      <div style={{
        width: s * 8,
        height: s * 10,
        imageRendering: 'pixelated' as any,
        position: 'relative',
        animation: 'npcBob 2s ease-in-out infinite',
      }}>
        {/* Hair */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: s,
          width: s * 6,
          height: s * 2.5,
          background: hairColor,
          borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.3}px ${s * 0.3}px`,
        }} />
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
        {/* Legs */}
        <div style={{
          position: 'absolute',
          top: s * 8.5,
          left: s * 1,
          width: s * 2.2,
          height: s * 2,
          background: '#334155',
          borderRadius: `0 0 ${s * 0.4}px ${s * 0.4}px`,
        }} />
        <div style={{
          position: 'absolute',
          top: s * 8.5,
          left: s * 4.8,
          width: s * 2.2,
          height: s * 2,
          background: '#334155',
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

function AgentPanel({ agent, onClose, onCooldownUpdate }: { agent: Agent; onClose: () => void; onCooldownUpdate?: (agentId: string, patch: { intervalMs?: number; enabled?: boolean; nextRunAt?: number }) => void }) {
  const [cooldownSaving, setCooldownSaving] = useState(false);
  const [cooldownEnabled, setCooldownEnabled] = useState(agent.cooldown?.enabled ?? false);
  const [cooldownMs, setCooldownMs] = useState(agent.cooldown?.intervalMs ?? 600000);
  const [dmMessage, setDmMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentConfirm, setSentConfirm] = useState(false);
  const [lastSent, setLastSent] = useState('');

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

      {agent.task && (
        <div style={{
          background: '#1e293b',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          borderLeft: `3px solid ${agent.status === 'working' ? '#10b981' : '#6366f1'}`,
        }}>
          <div style={{
            fontSize: 9,
            color: '#64748b',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            🔨 Working On
          </div>
          <div style={{
            fontSize: 12,
            color: '#e2e8f0',
          }}>
            {agent.task}
          </div>
        </div>
      )}

      {/* Auto-Work Cooldown */}
      {agent.id !== '_owner' && (
        <div style={{
          background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 16,
          border: '1px solid #334155',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase' as const, fontFamily: '"Press Start 2P", monospace' }}>
              ⏰ Auto-Work
            </div>
            {agent.cooldown?.jobId ? (
              <button
                onClick={async () => {
                  setCooldownSaving(true);
                  try {
                    const res = await fetch('/api/office/cooldown', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ jobId: agent.cooldown!.jobId, enabled: !cooldownEnabled }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      const newEnabled = !cooldownEnabled;
                      setCooldownEnabled(newEnabled);
                      const nextRun = data.job?.state?.nextRunAtMs ?? (newEnabled ? Date.now() + cooldownMs : undefined);
                      onCooldownUpdate?.(agent.id, { enabled: newEnabled, nextRunAt: nextRun });
                    }
                  } catch {}
                  setCooldownSaving(false);
                }}
                disabled={cooldownSaving}
                style={{
                  background: cooldownEnabled ? '#10b981' : '#475569',
                  border: 'none', borderRadius: 12, padding: '3px 10px',
                  color: '#fff', fontSize: 9, cursor: 'pointer',
                  fontFamily: '"Press Start 2P", monospace',
                  opacity: cooldownSaving ? 0.5 : 1,
                  transition: 'background 0.2s',
                }}
              >
                {cooldownEnabled ? 'ON' : 'OFF'}
              </button>
            ) : (
              <span style={{ fontSize: 8, color: '#475569', fontStyle: 'italic' }}>no cron job</span>
            )}
          </div>

          <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5, marginBottom: 10 }}>
            When enabled, {agent.name} automatically gets sent to work on a recurring timer.
            {cooldownEnabled
              ? ` Currently running every ${formatInterval(cooldownMs)}.`
              : ` Currently paused — ${agent.name} will idle until manually tasked.`}
          </div>

          {agent.cooldown?.jobId && (
            <>
              <div style={{ fontSize: 8, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' as const }}>Interval</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {COOLDOWN_PRESETS.map(p => (
                  <button
                    key={p.ms}
                    onClick={async () => {
                      setCooldownSaving(true);
                      try {
                        const res = await fetch('/api/office/cooldown', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ jobId: agent.cooldown!.jobId, intervalMs: p.ms }),
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setCooldownMs(p.ms);
                          const nextRun = data.job?.state?.nextRunAtMs ?? (Date.now() + p.ms);
                          onCooldownUpdate?.(agent.id, { intervalMs: p.ms, nextRunAt: nextRun });
                        }
                      } catch {}
                      setCooldownSaving(false);
                    }}
                    disabled={cooldownSaving || !cooldownEnabled}
                    style={{
                      background: cooldownMs === p.ms ? '#6366f1' : '#0f172a',
                      border: `1px solid ${cooldownMs === p.ms ? '#6366f1' : '#334155'}`,
                      borderRadius: 6, padding: '4px 8px',
                      color: cooldownMs === p.ms ? '#fff' : (cooldownEnabled ? '#94a3b8' : '#475569'),
                      fontSize: 9, cursor: cooldownEnabled ? 'pointer' : 'default',
                      fontFamily: '"Press Start 2P", monospace',
                      opacity: cooldownSaving ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {agent.cooldown.jobName && (
                <div style={{ fontSize: 8, color: '#475569', marginTop: 8, fontStyle: 'italic' }}>
                  Job: {agent.cooldown.jobName}
                </div>
              )}
            </>
          )}
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

export default function HomePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [time, setTime] = useState(new Date());
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [selectedAccomplishment, setSelectedAccomplishment] = useState<Accomplishment | null>(null);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [activeThought, setActiveThought] = useState<{ agentId: string; text: string } | null>(null);
  const [lastSeenChatCount, setLastSeenChatCount] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const [groupMessage, setGroupMessage] = useState('');
  const [sendingGroup, setSendingGroup] = useState(false);
  const [groupSent, setGroupSent] = useState(false);
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
        const res = await fetch('/api/office/config');
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Poll API for live status every 3s
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/office');
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
        const res = await fetch('/api/office/meeting');
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
        const res = await fetch('/api/office/actions');
        const data = await res.json();
        if (data.actions) setPendingActions(data.actions);
        if (data.accomplishments) setAccomplishments(data.accomplishments);
      } catch {}
    };
    fetchActions();
    const i = setInterval(fetchActions, 5000);
    return () => clearInterval(i);
  }, []);

  // Poll chat from main office API (included in data.chatLog)
  useEffect(() => {
    const fetchOffice = async () => {
      try {
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
      } catch {}
    };
    fetchOffice();
    const i = setInterval(fetchOffice, 5000);
    return () => clearInterval(i);
  }, []);

  // Track new chat messages and sync thought bubbles
  useEffect(() => {
    if (chatLog.length > lastSeenChatCount) {
      setLastSeenChatCount(chatLog.length);
      const lastMsg = chatLog[chatLog.length - 1];
      if (lastMsg) {
        const agentId = lastMsg.from.toLowerCase();
        setActiveThought({ agentId, text: `💭 ${lastMsg.text}` });
        setTimeout(() => setActiveThought(null), 8000);
      }
    }
  }, [chatLog, lastSeenChatCount]);

  // Generate new chat message based on config frequency
  useEffect(() => {
    const waterCoolerConfig = config.waterCooler || {};
    
    // Check if water cooler is enabled
    if (waterCoolerConfig.enabled === false) return;
    
    const idleAgents = agents.filter(a => a.status === 'idle');
    if (idleAgents.length < 2) return;
    
    // Check quiet hours
    if (waterCoolerConfig.quiet?.enabled) {
      const now = new Date();
      const tz = waterCoolerConfig.quiet.timezone || 'America/New_York';
      const hour = parseInt(now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: tz }));
      const quietStart = parseInt(waterCoolerConfig.quiet.start?.split(':')[0] || '23');
      const quietEnd = parseInt(waterCoolerConfig.quiet.end?.split(':')[0] || '8');
      
      // Check if current hour is in quiet window
      if (hour >= quietStart || hour < quietEnd) {
        return; // Skip chat generation during quiet hours
      }
    }
    
    // Parse frequency interval
    const parseInterval = (str: string): number => {
      const match = str.match(/^(\d+)(s|m|h|d)$/);
      if (!match) return 45000; // default 45s
      const [, num, unit] = match;
      const n = parseInt(num, 10);
      const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
      return n * multipliers[unit];
    };
    
    const baseFreq = parseInterval(waterCoolerConfig.frequency || '45s');
    // Add jitter: ±25%
    const delay = baseFreq + (Math.random() - 0.5) * baseFreq * 0.5;
    
    const timer = setTimeout(async () => {
      try {
        await fetch('/api/office/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentNames: idleAgents.map(a => a.name) }),
        });
      } catch {}
    }, delay);
    return () => clearTimeout(timer);
  }, [agents, chatLog, config]);

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
    
    setSendingGroup(true);
    try {
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

  const agentsWithThoughts = agents.map(a => ({
    ...a,
    thought: activeThought && activeThought.agentId === a.id ? activeThought.text : a.thought,
  }));

  const working = agentsWithThoughts.filter(a => a.status === 'working');
  const idle = agentsWithThoughts.filter(a => a.status === 'idle');

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
          <a
            href="/install"
            style={{
              color: '#475569',
              textDecoration: 'none',
              fontSize: 11,
            }}
          >
            📦 Install
          </a>
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
                      onClick={() => setSelectedAgent(a)}
                      forceThought={activeThought && activeThought.agentId === a.id ? activeThought.text : null}
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
                padding: '16px 8px 8px',
                minHeight: 120,
              }}>
                {/* Topic */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: 12,
                  fontSize: 11,
                  color: '#c4b5fd',
                  fontWeight: 600,
                }}>
                  {meeting.topic || 'Discussion in progress...'}
                </div>

                {/* Progress indicators */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}>
                  <div style={{
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.4)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 9,
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
                    fontSize: 9,
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
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 40,
                }}>
                  {meeting.participants && meeting.participants.length >= 2 && (() => {
                    const participant1 = agents.find(a => a.id === meeting.participants![0]);
                    const participant2 = agents.find(a => a.id === meeting.participants![1]);
                    
                    return (
                      <>
                        {participant1 && (
                          <div style={{ position: 'relative' }}>
                            <NPC
                              agent={participant1}
                              size={npcSize * 0.94}
                              onClick={() => setSelectedAgent(participant1)}
                            />
                          </div>
                        )}
                        
                        {/* Thought bubble with lastMessage between participants */}
                        {meeting.lastMessage && (
                          <div style={{
                            position: 'absolute',
                            top: -10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(255,255,255,0.95)',
                            color: '#1a1a2e',
                            padding: '6px 12px',
                            borderRadius: 10,
                            fontSize: isMobile ? 9 : 10,
                            maxWidth: isMobile ? 200 : 300,
                            textAlign: 'center',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                            lineHeight: 1.3,
                            animation: 'fadeSlideIn 0.3s ease-out',
                            zIndex: 10,
                          }}>
                            {meeting.lastMessage.length > 100 
                              ? meeting.lastMessage.slice(0, 97) + '...' 
                              : meeting.lastMessage}
                          </div>
                        )}

                        {participant2 && (
                          <div style={{
                            position: 'relative',
                            transform: 'scaleX(-1)',
                          }}>
                            <NPC
                              agent={participant2}
                              size={npcSize * 0.94}
                              onClick={() => setSelectedAgent(participant2)}
                            />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
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
                        onClick={() => setSelectedAgent(a)}
                        forceThought={activeThought && activeThought.agentId === a.id ? activeThought.text : null}
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
                        onClick={() => setExpandedAction(action.id)}
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
              }}>
                {accomplishments.length} total
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
                accomplishments.map((a, i) => {
                  const timeAgo = (() => {
                    const mins = Math.floor((Date.now() - a.timestamp) / 60000);
                    if (mins < 1) return 'just now';
                    if (mins < 60) return `${mins}m ago`;
                    const hours = Math.floor(mins / 60);
                    if (hours < 24) return `${hours}h ago`;
                    return `${Math.floor(hours / 24)}d ago`;
                  })();
                  const hasMedia = a.screenshot && (a.screenshot.endsWith('.mp4') || a.screenshot.endsWith('.webm') || a.screenshot.endsWith('.mov'));
                  return (
                    <div
                      key={a.id || i}
                      onClick={() => setSelectedAccomplishment(a)}
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
                        <span style={{ fontSize: 10, flexShrink: 0 }}>🎬</span>
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
                })
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
              {chatLog.slice(-12).map((m, i) => (
                <div
                  key={`${i}-${m.text}`}
                  style={{
                    fontSize: 11,
                    padding: '4px 0',
                    animation: 'fadeSlideIn 0.3s ease-out',
                  }}
                >
                  <span style={{
                    fontWeight: 700,
                    color: agents.find(a => a.name === m.from)?.color || '#94a3b8',
                    fontSize: 10,
                  }}>
                    {m.from}
                  </span>{' '}
                  <span style={{ color: '#a1a1aa' }}>{m.text}</span>
                </div>
              ))}
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
                BROADCAST TO ALL ({agents.length} agents)
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
                  ✓ Broadcast sent to all agents
                </div>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={groupMessage}
                  onChange={(e) => setGroupMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendGroupMessage()}
                  placeholder="Message all agents..."
                  disabled={sendingGroup}
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
          <AgentPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} onCooldownUpdate={(agentId, patch) => {
            setAgents(prev => prev.map(a => {
              if (a.id !== agentId) return a;
              return {
                ...a,
                nextTaskAt: patch.nextRunAt ?? a.nextTaskAt,
                cooldown: a.cooldown ? {
                  ...a.cooldown,
                  intervalMs: patch.intervalMs ?? a.cooldown.intervalMs,
                  enabled: patch.enabled ?? a.cooldown.enabled,
                  nextRunAt: patch.nextRunAt ?? a.cooldown.nextRunAt,
                } : a.cooldown,
              };
            }));
            // Also update selectedAgent so panel reflects change
            setSelectedAgent(prev => prev && prev.id === agentId ? {
              ...prev,
              nextTaskAt: patch.nextRunAt ?? prev.nextTaskAt,
              cooldown: prev.cooldown ? {
                ...prev.cooldown,
                intervalMs: patch.intervalMs ?? prev.cooldown.intervalMs,
                enabled: patch.enabled ?? prev.cooldown.enabled,
                nextRunAt: patch.nextRunAt ?? prev.cooldown.nextRunAt,
              } : prev.cooldown,
            } : prev);
          }} />
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
      `}</style>
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
