'use client';

import React, { useState, useEffect } from 'react';

export function CooldownTimer({ targetMs }: { targetMs: number }) {
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

// Linkify file references in text
export function linkifyFiles(text: string): (string | React.ReactElement)[] {
  const FILE_PATTERN = /(?:File:\s*)([A-Za-z0-9_\-\.]+\.[a-z]{1,10})|(?<![\/\w])([A-Z][A-Z0-9_\-]+\.[a-z]{1,10})(?![\/\w])/g;
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FILE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const filename = match[1] || match[2];
    const fullMatch = match[0];
    const prefix = fullMatch.startsWith('File:') ? 'File: ' : '';
    parts.push(
      <span key={match.index}>
        {prefix}
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              const res = await fetch(`/api/office/open-file`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: filename }),
              });
              if (!res.ok) {
                const data = await res.json();
                alert(`Could not find ${filename}:\n${data.error}`);
              }
            } catch {
              alert(`Failed to open ${filename}`);
            }
          }}
          style={{
            color: '#60a5fa',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted' as const,
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: 11,
            background: 'rgba(96,165,250,0.08)',
            padding: '1px 4px',
            borderRadius: 3,
          }}
          title={`Open ${filename} in editor`}
        >
          📄 {filename}
        </a>
      </span>
    );
    lastIndex = match.index + fullMatch.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

// Stat display for header
export function Stat({ icon, n }: { icon: string; n: number }) {
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
