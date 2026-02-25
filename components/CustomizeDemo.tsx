'use client';

import { useState } from 'react';

/**
 * Customize Demo Modal — let demo visitors enter their agent names
 * to preview what their office would look like.
 * 
 * Appears as a floating button in demo mode.
 * Stores custom names in sessionStorage so they persist during the visit.
 */

interface CustomizeDemoProps {
  onCustomize: (names: string[]) => void;
  currentNames: string[];
}

const PLACEHOLDER_NAMES = ['Cipher', 'Scout', 'Nova', 'Forge', 'Pixel'];
const ROLES = ['Engineer', 'Researcher', 'Strategist', 'Builder', 'Designer', 'Analyst', 'Writer', 'Ops'];
const EMOJIS = ['⚡', '🔍', '✨', '🔧', '🎨', '📊', '✍️', '🚀', '🧠', '🎯', '🛡️', '💎'];

export function CustomizeDemo({ onCustomize, currentNames }: CustomizeDemoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [names, setNames] = useState<string[]>(
    currentNames.length > 0 ? currentNames : ['', '', '']
  );

  const addSlot = () => {
    if (names.length < 8) setNames([...names, '']);
  };

  const removeSlot = (idx: number) => {
    if (names.length > 1) setNames(names.filter((_, i) => i !== idx));
  };

  const apply = () => {
    const validNames = names.filter(n => n.trim());
    if (validNames.length > 0) {
      onCustomize(validNames);
      try { sessionStorage.setItem('ocf-custom-names', JSON.stringify(validNames)); } catch {}
    }
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '10px 16px',
          fontSize: 11,
          fontFamily: '"Press Start 2P", monospace',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          zIndex: 1000,
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        ✏️ Name Your Agents
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1e293b, #0f172a)',
        border: '2px solid #334155',
        borderRadius: 16,
        padding: 24,
        maxWidth: 420,
        width: '90%',
      }}>
        <h3 style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 12,
          color: '#f8fafc',
          marginBottom: 4,
          textAlign: 'center',
        }}>
          ✏️ Name Your Agents
        </h3>
        <p style={{
          color: '#94a3b8',
          fontSize: 11,
          textAlign: 'center',
          marginBottom: 16,
        }}>
          Preview what YOUR office would look like
        </p>

        <div style={{ display: 'grid', gap: 8 }}>
          {names.map((name, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>
                {EMOJIS[i % EMOJIS.length]}
              </span>
              <input
                value={name}
                onChange={e => {
                  const next = [...names];
                  next[i] = e.target.value;
                  setNames(next);
                }}
                placeholder={PLACEHOLDER_NAMES[i] || `Agent ${i + 1}`}
                style={{
                  flex: 1,
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  padding: '8px 10px',
                  color: '#e2e8f0',
                  fontSize: 12,
                  fontFamily: '"Press Start 2P", monospace',
                  outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#334155'; }}
              />
              {names.length > 1 && (
                <button
                  onClick={() => removeSlot(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: '0 4px',
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {names.length < 8 && (
          <button
            onClick={addSlot}
            style={{
              width: '100%',
              background: 'rgba(99,102,241,0.1)',
              border: '1px dashed #334155',
              borderRadius: 6,
              padding: '6px',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: 10,
              marginTop: 8,
            }}
          >
            + Add Agent
          </button>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              flex: 1,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '10px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: 10,
              fontFamily: '"Press Start 2P", monospace',
            }}
          >
            Cancel
          </button>
          <button
            onClick={apply}
            style={{
              flex: 2,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              border: 'none',
              borderRadius: 8,
              padding: '10px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 10,
              fontFamily: '"Press Start 2P", monospace',
            }}
          >
            🎮 Preview My Office
          </button>
        </div>

        <p style={{
          color: '#475569',
          fontSize: 9,
          textAlign: 'center',
          marginTop: 12,
          marginBottom: 0,
        }}>
          Install to use your real OpenClaw agents →{' '}
          <a href="/install" style={{ color: '#6366f1' }}>openclawfice.com/install</a>
        </p>
      </div>
    </div>
  );
}
