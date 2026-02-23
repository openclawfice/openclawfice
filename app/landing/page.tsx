'use client';

/**
 * Landing Page - Viral-friendly marketing page
 * Optimized for social sharing and conversion
 */
export default function LandingPage() {
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
            href="/?demo=true"
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

      {/* Social Proof */}
      <div style={{
        background: 'rgba(139,92,246,0.1)',
        borderTop: '2px solid rgba(139,92,246,0.3)',
        borderBottom: '2px solid rgba(139,92,246,0.3)',
        padding: '60px 20px',
      }}>
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 18,
            fontStyle: 'italic',
            color: '#a5b4fc',
            marginBottom: 16,
            lineHeight: 1.8,
          }}>
            "This is the most delightful way to manage AI agents I've ever seen.
            It's like The Sims meets my terminal, and I'm here for it."
          </p>
          <p style={{
            fontSize: 14,
            color: '#64748b',
          }}>
            — OpenClaw User (probably)
          </p>
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
            href="/?demo=true"
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
            ⭐ Star on GitHub
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
