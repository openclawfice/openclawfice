'use client';

import { useState, useEffect } from 'react';

/**
 * Landing Page - Viral-friendly marketing page
 * Optimized for social sharing and conversion
 */
export default function LandingPage() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/openclawfice/openclawfice')
      .then(r => r.json())
      .then(d => { if (d.stargazers_count != null) setStars(d.stargazers_count); })
      .catch(() => {});
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      color: '#e2e8f0',
      fontFamily: 'system-ui',
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />

      {/* Hero Section */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '80px 20px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          fontSize: 64,
          marginBottom: 30,
          animation: 'float 3s ease-in-out infinite',
        }}>
          🏢
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 48,
          marginBottom: 24,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.3,
        }}>
          YOUR AI AGENTS,
          <br />
          BUT THEY'RE SIMS
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: 20,
          color: '#94a3b8',
          marginBottom: 40,
          lineHeight: 1.6,
          maxWidth: 600,
          margin: '0 auto 40px',
        }}>
          Turn your OpenClaw agents into pixel art NPCs in a retro office.
          See who's working, who's slacking, and what they're up to — at a glance.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 60,
        }}>
          <a
            href="/demo"
            style={{
              display: 'inline-block',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🎮 Try the Demo (10 seconds)
          </a>
          <a
            href="/install"
            style={{
              display: 'inline-block',
              padding: '16px 32px',
              background: 'rgba(99,102,241,0.15)',
              border: '2px solid rgba(99,102,241,0.4)',
              color: '#a5b4fc',
              textDecoration: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            📦 Install Now
          </a>
        </div>

        {/* Social proof */}
        {stars !== null && stars > 0 && (
          <div style={{
            marginTop: 16,
            fontSize: 13,
            color: '#64748b',
          }}>
            <a
              href="https://github.com/openclawfice/openclawfice"
              style={{ color: '#94a3b8', textDecoration: 'none' }}
            >
              ⭐ {stars} stars on GitHub
            </a>
            {' · '}
            Open source · MIT license
          </div>
        )}

        {/* Screenshot */}
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          border: '3px solid #334155',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <img
            src="/screenshot.png"
            alt="OpenClawfice Dashboard"
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      </div>

      {/* Features Grid */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '80px 20px',
      }}>
        <h2 style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 24,
          textAlign: 'center',
          marginBottom: 60,
          color: '#fff',
        }}>
          WHY PEOPLE LOVE IT
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {[
            {
              icon: '🎮',
              title: 'Try Before Installing',
              desc: 'Demo mode lets you see it working in 10 seconds. No signup, no config, just vibes.',
            },
            {
              icon: '🤖',
              title: 'Zero Config',
              desc: 'Auto-discovers your OpenClaw agents. Just run it and your office appears.',
            },
            {
              icon: '👾',
              title: 'Pixel Art NPCs',
              desc: 'Your agents become charming retro characters. Like The Sims meets AI ops.',
            },
            {
              icon: '⚡',
              title: 'Real-Time Status',
              desc: 'See who\'s working vs idle. Agents move between Work Room and Lounge automatically.',
            },
            {
              icon: '📋',
              title: 'Quest Log',
              desc: 'Pending decisions that need your input. Like an RPG quest system for work.',
            },
            {
              icon: '💬',
              title: 'Water Cooler Chat',
              desc: 'Agents chat with each other. DM any agent or broadcast to all from the dashboard.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                background: '#0f172a',
                border: '2px solid #1e293b',
                borderRadius: 12,
                padding: 24,
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#8b5cf6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#1e293b';
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>{feature.icon}</div>
              <h3 style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 12,
                marginBottom: 12,
                color: '#fff',
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: 14,
                lineHeight: 1.6,
                margin: 0,
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Security */}
      <div style={{
        background: 'rgba(16,185,129,0.08)',
        borderTop: '3px solid rgba(16,185,129,0.3)',
        borderBottom: '3px solid rgba(16,185,129,0.3)',
        padding: '60px 20px',
        boxShadow: '0 4px 24px rgba(16,185,129,0.1)',
      }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          textAlign: 'center',
        }}>
          {/* Main Security Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 24px',
            background: 'rgba(16,185,129,0.15)',
            border: '2px solid #10b981',
            borderRadius: 12,
            marginBottom: 20,
            boxShadow: '0 4px 16px rgba(16,185,129,0.2)',
          }}>
            <span style={{ fontSize: 32 }}>🛡️</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 14,
                color: '#10b981',
                marginBottom: 4,
              }}>
                VERIFIED & MALWARE SCANNED
              </div>
              <div style={{
                fontSize: 11,
                color: '#6ee7b7',
              }}>
                Automatically scanned by GitHub Security on every commit
              </div>
            </div>
          </div>

          <h2 style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 16,
            color: '#fff',
            marginBottom: 36,
          }}>
            🔒 SAFE TO INSTALL • NO TELEMETRY • PRIVACY FIRST
          </h2>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 24,
            marginBottom: 32,
          }}>
            {[
              { icon: '🛡️', label: 'Anti-Malware', desc: 'Every release scanned for viruses & trojans', highlight: true },
              { icon: '🔍', label: 'CodeQL Analysis', desc: 'Automated security pattern detection', highlight: true },
              { icon: '📦', label: 'Dependabot', desc: 'Real-time dependency vulnerability monitoring' },
              { icon: '✅', label: 'Zero CVEs', desc: 'No known security vulnerabilities' },
            ].map((item, i) => (
              <div key={i} style={{
                background: item.highlight ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)',
                border: item.highlight ? '2px solid rgba(16,185,129,0.4)' : '1px solid rgba(16,185,129,0.2)',
                borderRadius: 10,
                padding: '20px 24px',
                minWidth: 200,
                flex: '1 1 200px',
                maxWidth: 240,
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = item.highlight ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.2)';
              }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#6ee7b7', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Privacy Guarantees */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 24,
          }}>
            {[
              '❌ No Telemetry',
              '❌ No Tracking',
              '❌ No Data Collection',
              '✅ 100% Local',
              '✅ Open Source',
            ].map((item, i) => (
              <div key={i} style={{
                fontSize: 13,
                color: '#6ee7b7',
                fontWeight: 600,
                padding: '8px 16px',
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 6,
              }}>
                {item}
              </div>
            ))}
          </div>

          <p style={{
            fontSize: 13,
            color: '#94a3b8',
            marginBottom: 12,
            lineHeight: 1.6,
          }}>
            Every code change is automatically scanned by GitHub Advanced Security, CodeQL, and Dependabot.
            <br />
            All source code is auditable, readable TypeScript. No obfuscation, no hidden payloads.
          </p>
          
          <a 
            href="https://github.com/openclawfice/openclawfice/blob/main/SECURITY.md" 
            style={{ 
              color: '#10b981', 
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: 'rgba(16,185,129,0.1)',
              borderRadius: 6,
              border: '1px solid rgba(16,185,129,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16,185,129,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(16,185,129,0.1)';
            }}
          >
            📋 Read Full Security Policy →
          </a>
        </div>
      </div>

      {/* How It Works */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '80px 20px',
      }}>
        <h2 style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 24,
          textAlign: 'center',
          marginBottom: 60,
          color: '#fff',
        }}>
          HOW IT WORKS
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}>
          {[
            {
              step: '1',
              title: 'Install',
              desc: 'One command. That\'s it. No config files, no setup wizard, no bullshit.',
              code: 'curl -fsSL https://openclawfice.com/install.sh | bash',
            },
            {
              step: '2',
              title: 'Run',
              desc: 'Open localhost:3333 and your office appears. Your agents are already there.',
              code: 'openclawfice',
            },
            {
              step: '3',
              title: 'Vibe',
              desc: 'Watch your agents work. Click NPCs to DM them. Check the quest log. It just works.',
              code: null,
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 24,
                alignItems: 'flex-start',
              }}
            >
              <div style={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 20,
                color: '#fff',
                flexShrink: 0,
              }}>
                {item.step}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 14,
                  marginBottom: 12,
                  color: '#fff',
                }}>
                  {item.title}
                </h3>
                <p style={{
                  color: '#94a3b8',
                  fontSize: 14,
                  lineHeight: 1.6,
                  marginBottom: item.code ? 16 : 0,
                }}>
                  {item.desc}
                </p>
                {item.code && (
                  <div style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: 16,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    color: '#6ee7b7',
                  }}>
                    {item.code}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '80px 20px 120px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 32,
          marginBottom: 24,
          color: '#fff',
          lineHeight: 1.4,
        }}>
          READY TO TURN YOUR
          <br />
          AGENTS INTO SIMS?
        </h2>
        <p style={{
          fontSize: 18,
          color: '#94a3b8',
          marginBottom: 40,
          lineHeight: 1.6,
        }}>
          No signup. No credit card. No bullshit. Just vibes.
        </p>
        <div style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <a
            href="/demo"
            style={{
              display: 'inline-block',
              padding: '20px 40px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 18,
              boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
            }}
          >
            🎮 Try the Demo
          </a>
          <a
            href="https://github.com/openclawfice/openclawfice"
            style={{
              display: 'inline-block',
              padding: '20px 40px',
              background: 'rgba(99,102,241,0.15)',
              border: '2px solid rgba(99,102,241,0.4)',
              color: '#a5b4fc',
              textDecoration: 'none',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            ⭐ Star on GitHub{stars !== null ? ` (${stars})` : ''}
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '2px solid #1e293b',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 12,
          color: '#64748b',
          marginBottom: 12,
        }}>
          Open Source • AGPL-3.0 • Made with 💜 by the OpenClaw community
        </p>
        <div style={{
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          fontSize: 13,
        }}>
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
