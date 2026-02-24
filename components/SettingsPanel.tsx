'use client';

import React, { useState } from 'react';

const CHAT_FREQ_PRESETS = [
  { label: '5s', value: '5s' },
  { label: '15s', value: '15s' },
  { label: '30s', value: '30s' },
  { label: '45s', value: '45s' },
  { label: '1m', value: '1m' },
  { label: '2m', value: '2m' },
  { label: '5m', value: '5m' },
];

export function SettingsPanel({ config, onConfigChange, onClose }: {
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
