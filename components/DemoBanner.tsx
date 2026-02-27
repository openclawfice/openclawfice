'use client';

import { useState, useEffect } from 'react';

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (dismissed) return null;

  if (isMobile) {
    // Slim single-line banner on mobile
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: '#fff',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 9999,
        boxShadow: '0 2px 12px rgba(99, 102, 241, 0.3)',
        animation: 'slideDown 0.3s ease-out',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ fontSize: 14 }}>🎮</span>
          <span style={{ fontSize: 11, fontWeight: 700 }}>Demo Mode</span>
        </div>
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}>
          <a
            href="/install"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create yours →
          </a>
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 16,
              cursor: 'pointer',
              padding: 2,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <style jsx>{`
          @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Full banner on desktop
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: '#fff',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 9999,
      boxShadow: '0 2px 12px rgba(99, 102, 241, 0.3)',
      animation: 'slideDown 0.3s ease-out',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flex: 1,
      }}>
        <span style={{ fontSize: 20 }}>🎮</span>
        <div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 1,
          }}>
            Demo Mode — See OpenClawfice in Action!
          </div>
          <div style={{
            fontSize: 10,
            opacity: 0.9,
          }}>
            Watch AI agents work as pixel art NPCs. Click any to inspect live.
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
      }}>
        <a
          href="/install"
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
            padding: '6px 16px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          }}
        >
          Create Your AI Team →
        </a>

        <a
          href="/?demo=false"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.8)',
            padding: '6px 12px',
            fontSize: 10,
            fontWeight: 600,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Exit Demo
        </a>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 16,
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
