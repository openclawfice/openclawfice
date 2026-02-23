'use client';

import { useState } from 'react';

interface ShareModalProps {
  onClose: () => void;
  agentCount: number;
  workingCount: number;
}

export function ShareModal({ onClose, agentCount, workingCount }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Just set up my AI team office with OpenClawfice! 🏢\n\n${agentCount} agents working together, ${workingCount} currently active.\n\nIt's like The Sims meets AI agents - retro pixel art, real-time updates, quest system, and auto-work scheduling.\n\nTry the demo: localhost:3333?demo=true\nGitHub: github.com/openclaw/openclawfice`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshot = () => {
    // Take screenshot using browser print dialog
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{
        background: '#0f172a',
        border: '2px solid #1e293b',
        borderRadius: 16,
        maxWidth: 500,
        width: '90%',
        animation: 'slideUp 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{
          background: '#1e293b',
          padding: '16px 20px',
          borderBottom: '2px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '14px 14px 0 0',
        }}>
          <div>
            <div style={{
              fontSize: 16,
              fontFamily: '"Press Start 2P", monospace',
              color: '#e2e8f0',
              marginBottom: 8,
            }}>
              📸 Share Your Office
            </div>
            <div style={{
              fontSize: 11,
              color: '#94a3b8',
            }}>
              Show off your AI team to the world!
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#334155',
              border: '1px solid #475569',
              color: '#cbd5e1',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: 24,
        }}>
          {/* Quick Actions */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 24,
          }}>
            <button
              onClick={handleScreenshot}
              style={{
                background: '#6366f1',
                border: 'none',
                color: '#fff',
                borderRadius: 8,
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#6366f1';
              }}
            >
              <span style={{ fontSize: 16 }}>📸</span>
              <span>Take Screenshot (Cmd+P)</span>
            </button>

            <button
              onClick={handleCopyText}
              style={{
                background: copied ? '#10b981' : '#334155',
                border: '1px solid #475569',
                color: '#fff',
                borderRadius: 8,
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 16 }}>{copied ? '✓' : '📋'}</span>
              <span>{copied ? 'Copied!' : 'Copy Share Text'}</span>
            </button>
          </div>

          {/* Preview */}
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}>
            <div style={{
              fontSize: 9,
              color: '#64748b',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: '"Press Start 2P", monospace',
            }}>
              Share Text Preview
            </div>
            <div style={{
              fontSize: 11,
              color: '#e2e8f0',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {shareText}
            </div>
          </div>

          {/* Tips */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 8,
            padding: 12,
          }}>
            <div style={{
              fontSize: 10,
              color: '#a5b4fc',
              fontWeight: 600,
              marginBottom: 6,
            }}>
              💡 Sharing Tips
            </div>
            <ul style={{
              fontSize: 10,
              color: '#cbd5e1',
              lineHeight: 1.6,
              margin: 0,
              paddingLeft: 20,
            }}>
              <li>Screenshot captures your full office layout</li>
              <li>Share on Twitter, Reddit, Discord, or HackerNews</li>
              <li>Tag @openclaw for a retweet!</li>
              <li>Include your agent count & coolest quest</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media print {
          /* Hide modal and other UI chrome when printing */
          [role="dialog"],
          button,
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
