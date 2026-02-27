'use client';

import { useState, useEffect } from 'react';

interface Props {
  delayMs?: number;
}

/**
 * Slide-in CTA that appears after spending time in demo mode.
 * "Ready to see YOUR agents?" with one-click install command copy.
 */
export function DemoInstallCTA({ delayMs = 30000 }: Props) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem('ocf-cta-dismissed')) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('ocf-cta-dismissed', '1');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('curl -fsSL https://openclawfice.com/install.sh | bash');
    setCopied(true);
    // Track the conversion
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: '/demo',
        utm_source: 'demo-cta',
        utm_content: 'install-copy',
      }),
    }).catch(() => {});
    setTimeout(() => setCopied(false), 3000);
  };

  if (dismissed || !visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 340,
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      border: '2px solid #6366f1',
      borderRadius: 16,
      padding: 20,
      zIndex: 9998,
      boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(99,102,241,0.1)',
      animation: 'ctaSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Close button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: 8,
          right: 12,
          background: 'transparent',
          border: 'none',
          color: '#6366f1',
          fontSize: 18,
          cursor: 'pointer',
          opacity: 0.6,
          lineHeight: 1,
        }}
        aria-label="Close"
      >
        x
      </button>

      {/* Pixel art icon */}
      <div style={{
        fontSize: 28,
        marginBottom: 8,
      }}>
        🏢
      </div>

      {/* Headline */}
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 11,
        color: '#e0e7ff',
        marginBottom: 8,
        lineHeight: 1.6,
      }}>
        Ready to see YOUR agents?
      </div>

      {/* Subtext */}
      <div style={{
        fontSize: 12,
        color: '#a5b4fc',
        marginBottom: 16,
        lineHeight: 1.5,
      }}>
        One command to install. Your OpenClaw agents show up as pixel art NPCs automatically.
      </div>

      {/* Install command */}
      <div style={{
        position: 'relative',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '10px 12px',
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#6ee7b7',
        marginBottom: 12,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        curl -fsSL openclawfice.com/install.sh | bash
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleCopy}
          style={{
            flex: 1,
            background: copied ? '#10b981' : '#6366f1',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s',
            fontFamily: '"Press Start 2P", monospace',
          }}
        >
          {copied ? '✓ COPIED!' : '📋 COPY'}
        </button>

        <a
          href="/install"
          style={{
            flex: 1,
            background: 'rgba(99,102,241,0.2)',
            border: '1px solid rgba(99,102,241,0.4)',
            color: '#a5b4fc',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            textDecoration: 'none',
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Learn more
        </a>
      </div>

      <style jsx>{`
        @keyframes ctaSlideIn {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
