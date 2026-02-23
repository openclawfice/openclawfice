'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InstallPage() {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText('curl -fsSL https://openclawfice.com/install.sh | bash');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      color: '#e2e8f0',
      fontFamily: 'system-ui',
      padding: '40px 20px',
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        textAlign: 'center',
        marginBottom: 60,
      }}>
        <div style={{
          fontSize: 64,
          marginBottom: 20,
          animation: 'float 3s ease-in-out infinite',
        }}>
          🏢
        </div>
        <h1 style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 32,
          marginBottom: 16,
          color: '#fff',
          lineHeight: 1.4,
        }}>
          OPENCLAWFICE
        </h1>
        <p style={{
          fontSize: 18,
          color: '#94a3b8',
          marginBottom: 40,
          lineHeight: 1.6,
        }}>
          Virtual office dashboard for OpenClaw agents
        </p>
        
        {/* Already installed? */}
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.4)',
            color: '#a5b4fc',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 12,
            textDecoration: 'none',
            marginBottom: 20,
          }}
        >
          Already installed? Open dashboard →
        </Link>
      </div>

      {/* Install Steps */}
      <div style={{
        maxWidth: 700,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        {/* Step 1 */}
        <div style={{
          background: '#0f172a',
          border: '2px solid #1e293b',
          borderRadius: 12,
          padding: 24,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: -12,
            left: 20,
            background: '#6366f1',
            color: '#fff',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 10,
            padding: '4px 12px',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
          }}>
            STEP 1
          </div>

          <h2 style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 14,
            marginBottom: 16,
            color: '#fff',
            marginTop: 8,
          }}>
            Install OpenClawfice
          </h2>

          <p style={{
            fontSize: 14,
            color: '#94a3b8',
            marginBottom: 16,
            lineHeight: 1.6,
          }}>
            Run this one-line installer in your terminal:
          </p>

          <div style={{
            position: 'relative',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: 16,
            fontFamily: 'monospace',
            fontSize: 13,
            color: '#6ee7b7',
            marginBottom: 12,
          }}>
            <button
              onClick={copyInstall}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: '#334155',
                border: 'none',
                color: '#94a3b8',
                padding: '6px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            curl -fsSL https://openclawfice.com/install.sh | bash
          </div>

          <p style={{
            fontSize: 12,
            color: '#64748b',
            lineHeight: 1.5,
          }}>
            This will clone the repo to <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 3 }}>~/openclawfice/</code>, install dependencies, and create the launcher.
          </p>
        </div>

        {/* Step 2 */}
        <div style={{
          background: '#0f172a',
          border: '2px solid #1e293b',
          borderRadius: 12,
          padding: 24,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: -12,
            left: 20,
            background: '#10b981',
            color: '#fff',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 10,
            padding: '4px 12px',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
          }}>
            STEP 2
          </div>

          <h2 style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 14,
            marginBottom: 16,
            color: '#fff',
            marginTop: 8,
          }}>
            Launch the Office
          </h2>

          <p style={{
            fontSize: 14,
            color: '#94a3b8',
            marginBottom: 16,
            lineHeight: 1.6,
          }}>
            After installation completes, run:
          </p>

          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: 16,
            fontFamily: 'monospace',
            fontSize: 13,
            color: '#6ee7b7',
            marginBottom: 12,
          }}>
            openclawfice
          </div>

          <p style={{
            fontSize: 12,
            color: '#64748b',
            lineHeight: 1.5,
          }}>
            Or visit{' '}
            <a
              href="http://localhost:3333"
              style={{ color: '#6366f1', textDecoration: 'none' }}
            >
              http://localhost:3333
            </a>
            {' '}in your browser.
          </p>
        </div>

        {/* Step 3 */}
        <div style={{
          background: '#0f172a',
          border: '2px solid #1e293b',
          borderRadius: 12,
          padding: 24,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: -12,
            left: 20,
            background: '#f59e0b',
            color: '#fff',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 10,
            padding: '4px 12px',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
          }}>
            STEP 3
          </div>

          <h2 style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 14,
            marginBottom: 16,
            color: '#fff',
            marginTop: 8,
          }}>
            See Your Agents
          </h2>

          <p style={{
            fontSize: 14,
            color: '#94a3b8',
            marginBottom: 16,
            lineHeight: 1.6,
          }}>
            OpenClawfice auto-discovers agents from your OpenClaw installation:
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {[
              { icon: '🎨', text: 'Pixel art NPCs with plumbobs' },
              { icon: '💻', text: 'Work Room for active agents' },
              { icon: '☕', text: 'Lounge for idle agents' },
              { icon: '⏱️', text: 'Cooldown timers for self-assign' },
              { icon: '⚔️', text: 'Quest log for pending decisions' },
              { icon: '💬', text: 'Water cooler chat between agents' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  background: '#1e293b',
                  borderRadius: 6,
                  fontSize: 13,
                  color: '#cbd5e1',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* OpenClaw Skill (Alternative) */}
        <div style={{
          background: 'rgba(99,102,241,0.1)',
          border: '2px solid rgba(99,102,241,0.3)',
          borderRadius: 12,
          padding: 24,
        }}>
          <h3 style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 12,
            marginBottom: 12,
            color: '#a5b4fc',
          }}>
            🤖 Install via OpenClaw Skill
          </h3>

          <p style={{
            fontSize: 13,
            color: '#94a3b8',
            marginBottom: 12,
            lineHeight: 1.6,
          }}>
            If you have OpenClaw running, you can also install via the skill:
          </p>

          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: 16,
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#6ee7b7',
          }}>
            "Install OpenClawfice"
          </div>

          <p style={{
            fontSize: 11,
            color: '#64748b',
            marginTop: 8,
            lineHeight: 1.5,
          }}>
            Tell your OpenClaw agent to install OpenClawfice, and it will run the installer for you.
          </p>
        </div>

        {/* Requirements */}
        <div style={{
          background: '#1e293b',
          borderRadius: 8,
          padding: 20,
          fontSize: 12,
          color: '#64748b',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: '#94a3b8' }}>Requirements:</strong>
          <ul style={{ marginTop: 8, marginLeft: 20 }}>
            <li>OpenClaw installed and configured (<code>~/.openclaw/openclaw.json</code>)</li>
            <li>Node.js 18+ and npm</li>
            <li>Git</li>
          </ul>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          paddingTop: 40,
          paddingBottom: 20,
        }}>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
            Open source • MIT licensed
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: 13 }}>
            <a href="https://github.com/openclawfice/openclawfice" style={{ color: '#6366f1', textDecoration: 'none' }}>
              GitHub
            </a>
            <a href="https://docs.openclaw.ai" style={{ color: '#6366f1', textDecoration: 'none' }}>
              Docs
            </a>
            <a href="https://openclaw.ai/discord" style={{ color: '#6366f1', textDecoration: 'none' }}>
              Discord
            </a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
