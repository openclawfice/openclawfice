import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Agent demo data for card generation
const AGENTS: Record<string, { emoji: string; role: string; level: number; rarity: string; color: string }> = {
  cipher: { emoji: '⚡', role: 'Lead Engineer', level: 18, rarity: 'EPIC', color: '#a855f7' },
  scout: { emoji: '🔍', role: 'Outreach Lead', level: 14, rarity: 'RARE', color: '#3b82f6' },
  pixel: { emoji: '🎨', role: 'UI Designer', level: 11, rarity: 'RARE', color: '#3b82f6' },
  forge: { emoji: '🔧', role: 'Backend Dev', level: 12, rarity: 'RARE', color: '#3b82f6' },
  nova: { emoji: '✨', role: 'Product Lead', level: 13, rarity: 'RARE', color: '#3b82f6' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get('name') || '').toLowerCase();
  const agent = AGENTS[name];

  // If no specific agent, return the generic OG image
  if (!agent) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            fontFamily: 'system-ui',
          }}
        >
          <div style={{ fontSize: 120, marginBottom: 20 }}>🏢</div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 16,
            }}
          >
            OpenClawfice
          </div>
          <div style={{ fontSize: 28, color: '#94a3b8', marginBottom: 40 }}>
            Your AI agents, but they&apos;re Sims
          </div>
          <div
            style={{
              display: 'flex',
              gap: 24,
              fontSize: 20,
              color: '#64748b',
            }}
          >
            <span>🎮 Pixel Art NPCs</span>
            <span>💬 Water Cooler</span>
            <span>📋 Quest Log</span>
            <span>🎵 Chiptune</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          fontFamily: 'system-ui',
        }}
      >
        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px 64px',
            border: `4px solid ${agent.color}`,
            borderRadius: 24,
            background: 'rgba(15, 23, 42, 0.95)',
            boxShadow: `0 0 60px ${agent.color}40`,
            minWidth: 500,
          }}
        >
          {/* Rarity badge */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: agent.color,
              letterSpacing: 4,
              marginBottom: 20,
              textTransform: 'uppercase',
            }}
          >
            ◆ {agent.rarity}
          </div>

          {/* Agent emoji */}
          <div style={{ fontSize: 100, marginBottom: 16 }}>{agent.emoji}</div>

          {/* Name */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: '#e2e8f0',
              marginBottom: 8,
            }}
          >
            {displayName}
          </div>

          {/* Role */}
          <div style={{ fontSize: 22, color: '#94a3b8', marginBottom: 24 }}>
            {agent.role}
          </div>

          {/* Level bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 20,
              color: agent.color,
              fontWeight: 700,
            }}
          >
            <span>LV. {agent.level}</span>
            <div
              style={{
                width: 200,
                height: 12,
                background: '#1e293b',
                borderRadius: 6,
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: `${Math.min((agent.level / 20) * 100, 100)}%`,
                  height: '100%',
                  background: agent.color,
                  borderRadius: 6,
                }}
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            right: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#475569',
            fontSize: 18,
          }}
        >
          <span style={{ fontSize: 28 }}>🏢</span>
          <span>openclawfice.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
