import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Agent demo data for card generation
const AGENTS: Record<string, { role: string; level: number; rarity: string; color: string }> = {
  cipher: { role: 'Lead Engineer', level: 18, rarity: 'EPIC', color: '#a855f7' },
  scout: { role: 'Outreach Lead', level: 14, rarity: 'RARE', color: '#3b82f6' },
  pixel: { role: 'UI Designer', level: 11, rarity: 'RARE', color: '#3b82f6' },
  forge: { role: 'Backend Dev', level: 12, rarity: 'RARE', color: '#3b82f6' },
  nova: { role: 'Product Lead', level: 13, rarity: 'RARE', color: '#3b82f6' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get('name') || '').toLowerCase();
  const agent = AGENTS[name];

  // Generic OG image (no specific agent)
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
            background: '#0f172a',
            color: '#e2e8f0',
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 900, color: '#a855f7', marginBottom: 12 }}>
            OpenClawfice
          </div>
          <div style={{ fontSize: 28, color: '#94a3b8', marginBottom: 40 }}>
            Your AI agents, but they are Sims
          </div>
          <div style={{ display: 'flex', gap: 32, fontSize: 20, color: '#64748b' }}>
            <span>Pixel Art NPCs</span>
            <span>Water Cooler Chat</span>
            <span>Quest Log</span>
            <span>Chiptune OST</span>
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
          background: '#0f172a',
          color: '#e2e8f0',
        }}
      >
        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px 80px',
            border: `4px solid ${agent.color}`,
            borderRadius: 24,
            background: '#0f172a',
          }}
        >
          {/* Rarity */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: agent.color,
              letterSpacing: 4,
              marginBottom: 24,
            }}
          >
            {agent.rarity}
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: '#e2e8f0',
              marginBottom: 8,
            }}
          >
            {displayName}
          </div>

          {/* Role */}
          <div style={{ fontSize: 24, color: '#94a3b8', marginBottom: 32 }}>
            {agent.role}
          </div>

          {/* Level */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 22,
              color: agent.color,
              fontWeight: 700,
            }}
          >
            <span>LV. {agent.level}</span>
            <div
              style={{
                width: 200,
                height: 14,
                background: '#1e293b',
                borderRadius: 7,
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: `${Math.min((agent.level / 20) * 100, 100)}%`,
                  height: '100%',
                  background: agent.color,
                  borderRadius: 7,
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
            fontSize: 20,
          }}
        >
          openclawfice.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
