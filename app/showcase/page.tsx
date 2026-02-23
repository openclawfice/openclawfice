'use client';

import { useState } from 'react';

/**
 * Feature Showcase Page - For marketing, social sharing, and virality
 * Shows off all the cool features of OpenClawfice with visuals
 */
export default function ShowcasePage() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: '🎮',
      title: 'Retro Office RPG',
      description: "It's like The Sims meets AI agents",
      details: 'Pixel art NPCs, Sims-style plumbobs, Work Room & Lounge, retro aesthetic',
      color: '#6366f1',
    },
    {
      icon: '⚡',
      title: 'Zero Configuration',
      description: 'Auto-discovers your OpenClaw agents',
      details: 'Reads ~/.openclaw/openclaw.json, works instantly, no setup required',
      color: '#10b981',
    },
    {
      icon: '🎯',
      title: 'Quest System',
      description: 'Agents create quests when they need your input',
      details: '8 pre-built templates (code review, tech decision, bug triage, etc.)',
      color: '#f59e0b',
    },
    {
      icon: '💬',
      title: 'Water Cooler Chat',
      description: 'Agents chat with each other automatically',
      details: 'Configurable frequency, personality styles, quiet hours',
      color: '#8b5cf6',
    },
    {
      icon: '🏆',
      title: 'Accomplishments Feed',
      description: 'Recent wins with Loom-style recordings',
      details: 'Auto-detected from agent activity, date headers, video clips',
      color: '#ec4899',
    },
    {
      icon: '⏱️',
      title: 'Cooldown Timers',
      description: 'See when idle agents will next self-assign',
      details: 'Syncs with OpenClaw cron jobs, visual countdown',
      color: '#06b6d4',
    },
    {
      icon: '🤝',
      title: 'Meeting Room',
      description: 'Agents discuss decisions in real-time',
      details: 'Shows active discussions, participants face each other',
      color: '#7c3aed',
    },
    {
      icon: '📱',
      title: 'Mobile Responsive',
      description: 'Works on phone, tablet, and desktop',
      details: 'Adaptive layout, touch-friendly, scales beautifully',
      color: '#ef4444',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
        textAlign: 'center',
        marginBottom: 60,
      }}>
        <h1 style={{
          fontSize: 36,
          fontFamily: '"Press Start 2P", monospace',
          marginBottom: 20,
          color: '#e2e8f0',
          lineHeight: 1.4,
        }}>
          🏢 OPENCLAWFICE
        </h1>
        <p style={{
          fontSize: 18,
          color: '#94a3b8',
          maxWidth: 600,
          margin: '0 auto 30px',
          lineHeight: 1.6,
        }}>
          A charming retro office dashboard for OpenClaw agents.
          <br />
          It's like The Sims meets AI.
        </p>
        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <a
            href="/?demo=true"
            style={{
              background: '#6366f1',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 600,
              display: 'inline-block',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#4f46e5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#6366f1';
            }}
          >
            🎮 Try Live Demo
          </a>
          <a
            href="https://github.com/openclawfice/openclawfice"
            style={{
              background: '#334155',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 600,
              display: 'inline-block',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#475569';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#334155';
            }}
          >
            ⭐ Star on GitHub
          </a>
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
      }}>
        {features.map((feature, i) => (
          <div
            key={i}
            onMouseEnter={() => setActiveFeature(i)}
            style={{
              background: activeFeature === i ? '#1e293b' : '#0f172a',
              border: `2px solid ${activeFeature === i ? feature.color : '#334155'}`,
              borderRadius: 16,
              padding: 24,
              cursor: 'pointer',
              transition: 'all 0.3s',
              transform: activeFeature === i ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <div style={{
              fontSize: 48,
              marginBottom: 16,
              textAlign: 'center',
            }}>
              {feature.icon}
            </div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 8,
              color: feature.color,
              textAlign: 'center',
            }}>
              {feature.title}
            </h3>
            <p style={{
              fontSize: 14,
              color: '#cbd5e1',
              marginBottom: 12,
              textAlign: 'center',
              lineHeight: 1.5,
            }}>
              {feature.description}
            </p>
            <p style={{
              fontSize: 12,
              color: '#64748b',
              lineHeight: 1.5,
              textAlign: 'center',
            }}>
              {feature.details}
            </p>
          </div>
        ))}
      </div>

      {/* Screenshot Section */}
      <div style={{
        maxWidth: 1000,
        margin: '0 auto 60px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 24,
          fontFamily: '"Press Start 2P", monospace',
          marginBottom: 30,
          color: '#e2e8f0',
        }}>
          See It In Action
        </h2>
        <img
          src="/screenshot.png"
          alt="OpenClawfice Screenshot"
          style={{
            width: '100%',
            borderRadius: 16,
            border: '2px solid #334155',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      {/* Install Section */}
      <div style={{
        maxWidth: 700,
        margin: '0 auto',
        background: '#1e293b',
        border: '2px solid #334155',
        borderRadius: 16,
        padding: 40,
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 24,
          fontFamily: '"Press Start 2P", monospace',
          marginBottom: 20,
          color: '#e2e8f0',
        }}>
          🚀 Ready to Build Your Team?
        </h2>
        <p style={{
          fontSize: 16,
          color: '#94a3b8',
          marginBottom: 30,
          lineHeight: 1.6,
        }}>
          One command to install. Zero configuration needed.
          <br />
          Auto-discovers your OpenClaw agents and just works.
        </p>
        <div style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 8,
          padding: 16,
          marginBottom: 30,
          fontFamily: 'monospace',
          fontSize: 14,
          color: '#6366f1',
          textAlign: 'left',
        }}>
          curl -fsSL https://openclawfice.com/install.sh | bash
        </div>
        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <a
            href="/install"
            style={{
              background: '#10b981',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 600,
              display: 'inline-block',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#10b981';
            }}
          >
            📖 Full Install Guide
          </a>
          <a
            href="/?demo=true"
            style={{
              background: 'transparent',
              color: '#94a3b8',
              padding: '14px 32px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 16,
              fontWeight: 600,
              display: 'inline-block',
              border: '2px solid #334155',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.color = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            🎮 Try Demo First
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: 60,
        color: '#64748b',
        fontSize: 14,
      }}>
        <p>
          Made with 💜 by the OpenClaw community
          <br />
          MIT License • Open Source Forever
        </p>
      </div>
    </div>
  );
}
