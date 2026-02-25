'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Agent, Skill } from './types';
import { formatInterval } from './utils';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

const COOLDOWN_PRESETS = [
  { label: '1m', ms: 60000 },
  { label: '5m', ms: 300000 },
  { label: '10m', ms: 600000 },
  { label: '15m', ms: 900000 },
  { label: '30m', ms: 1800000 },
  { label: '1h', ms: 3600000 },
];

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

export function AgentPanel({ agent, onClose, autowork, onAutoworkUpdate, onStop, pendingChanges }: {
  agent: Agent;
  onClose: () => void;
  autowork?: { enabled: boolean; intervalMs: number; directive: string; lastSentAt: number };
  onAutoworkUpdate?: (agentId: string, patch: Partial<{ enabled: boolean; intervalMs: number; directive: string }>) => void;
  onStop?: (agentId: string) => void;
  pendingChanges?: Partial<{ enabled: boolean; intervalMs: number; directive: string }>;
}) {
  const secureFetch = useAuthenticatedFetch();
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
        const res = await secureFetch(`/api/office/logs?agentId=${encodeURIComponent(agent.id)}&limit=80`);
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
      const res = await secureFetch('/api/office/message', {
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{
          color: agent.color,
          fontSize: 11,
        }}>
          {agent.emoji} {agent.role}
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(agent.id);
            // Show brief feedback
            const btn = document.activeElement as HTMLButtonElement;
            if (btn) {
              const orig = btn.textContent;
              btn.textContent = '✓';
              setTimeout(() => { btn.textContent = orig; }, 1500);
            }
          }}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 6,
            padding: '4px 8px',
            color: '#94a3b8',
            fontSize: 9,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title={`Copy agent ID: ${agent.id}`}
        >
          📋 Copy ID
        </button>
      </div>

      {/* Stop Button */}
      {agent.id !== '_owner' && agent.status === 'working' && (
        <button
          onClick={async () => {
            setStopping(true);
            try {
              const res = await secureFetch('/api/office/stop', {
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
            ✓ Sent: &ldquo;{lastSent.length > 40 ? lastSent.slice(0, 37) + '...' : lastSent}&rdquo;
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
                    const res = await secureFetch('/api/office/autowork', {
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
