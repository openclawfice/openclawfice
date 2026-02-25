'use client';

import React, { useState, useEffect } from 'react';

const TOUR_STEPS = [
  {
    title: '🏠 Your AI Office',
    body: 'Your AI agents are pixel-art NPCs with moods, XP levels, and unique looks — like The Sims, but they ship code.',
    target: 'work-room',
    position: 'bottom' as const,
  },
  {
    title: '⚔️ Quest Log',
    body: 'Agents raise quests when they need your decision. Approve, reject, or pick an option — you\'re the boss.',
    target: 'quest-log',
    position: 'top' as const,
  },
  {
    title: '📡 Office Feed',
    body: 'Random events happen in the office — funny moments, milestones, and chaos. Watch the drama unfold!',
    target: 'office-events',
    position: 'left' as const,
  },
  {
    title: '💬 Water Cooler',
    body: 'Agents chat, debate, and collaborate in real-time. Send group messages or just watch the banter.',
    target: 'water-cooler',
    position: 'left' as const,
  },
  {
    title: '🏆 Accomplishments',
    body: 'Every completed task gets logged with a video replay. Your team\'s highlight reel, with XP rewards.',
    target: 'accomplishments',
    position: 'top' as const,
  },
  {
    title: '🎮 Pro Tips!',
    body: 'Press ⌘K to open the command palette. Try the Konami Code for a surprise. Click any agent for stats + DMs!',
    target: 'work-room',
    position: 'bottom' as const,
  },
];

const STORAGE_KEY = 'openclawfice-tour-seen';

export function DemoTour({ isDemoMode }: { isDemoMode: boolean }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isDemoMode) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) return;
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [isDemoMode]);

  useEffect(() => {
    if (!visible || isMobile) return;
    const current = TOUR_STEPS[step];
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pos = { top: 0, left: 0 };

    switch (current.position) {
      case 'bottom':
        pos.top = rect.bottom + 12;
        pos.left = Math.min(Math.max(rect.left + rect.width / 2, 160), window.innerWidth - 160);
        break;
      case 'top':
        pos.top = rect.top - 12;
        pos.left = Math.min(Math.max(rect.left + rect.width / 2, 160), window.innerWidth - 160);
        break;
      case 'left':
        pos.top = rect.top + rect.height / 2;
        pos.left = Math.max(rect.left - 12, 160);
        break;
    }

    setPosition(pos);
  }, [step, visible, isMobile]);

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const next = () => {
    if (isLast) {
      dismiss();
    } else {
      setStep(s => s + 1);
      // On mobile, scroll the target into view
      if (isMobile) {
        const nextTarget = TOUR_STEPS[step + 1]?.target;
        if (nextTarget) {
          const el = document.querySelector(`[data-tour="${nextTarget}"]`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const getTransform = () => {
    switch (current.position) {
      case 'bottom': return 'translateX(-50%)';
      case 'top': return 'translateX(-50%) translateY(-100%)';
      case 'left': return 'translateX(-100%) translateY(-50%)';
      default: return 'translateX(-50%)';
    }
  };

  const getArrow = (): React.CSSProperties => {
    const base: React.CSSProperties = { position: 'absolute', width: 0, height: 0 };
    switch (current.position) {
      case 'bottom':
        return { ...base, top: -8, left: '50%', transform: 'translateX(-50%)',
          borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
          borderBottom: '8px solid #1e293b' };
      case 'top':
        return { ...base, bottom: -8, left: '50%', transform: 'translateX(-50%)',
          borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
          borderTop: '8px solid #1e293b' };
      case 'left':
        return { ...base, right: -8, top: '50%', transform: 'translateY(-50%)',
          borderTop: '8px solid transparent', borderBottom: '8px solid transparent',
          borderLeft: '8px solid #1e293b' };
      default:
        return base;
    }
  };

  // Step counter dots
  const stepDots = (
    <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
      {TOUR_STEPS.map((_, i) => (
        <div key={i} style={{
          width: i === step ? 16 : 6,
          height: 6,
          borderRadius: 3,
          background: i === step ? '#6366f1' : i < step ? '#818cf8' : '#334155',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  );

  const actions = (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <button
        onClick={dismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#475569',
          fontSize: 11,
          cursor: 'pointer',
          padding: '6px 8px',
        }}
      >
        Skip tour
      </button>
      <button
        onClick={next}
        style={{
          background: '#6366f1',
          border: 'none',
          color: '#fff',
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: 10,
          fontFamily: '"Press Start 2P", monospace',
          cursor: 'pointer',
          minHeight: 36,
        }}
      >
        {isLast ? '🎮 Got it!' : 'Next →'}
      </button>
    </div>
  );

  // MOBILE: bottom sheet style
  if (isMobile) {
    return (
      <>
        <div
          onClick={dismiss}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9998,
          }}
        />
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: '#1e293b',
          borderTop: '2px solid #6366f1',
          borderRadius: '16px 16px 0 0',
          padding: '16px 20px 24px',
          boxShadow: '0 -8px 32px rgba(99,102,241,0.3)',
          animation: 'slideUp 0.3s ease-out',
        }}>
          {stepDots}
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 11,
            color: '#e2e8f0',
            marginBottom: 8,
          }}>
            {current.title}
          </div>
          <div style={{
            fontSize: 13,
            color: '#94a3b8',
            lineHeight: 1.5,
            marginBottom: 14,
          }}>
            {current.body}
          </div>
          {actions}
          <style jsx>{`
            @keyframes slideUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      </>
    );
  }

  // DESKTOP: anchored tooltip
  return (
    <>
      <div
        onClick={dismiss}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9998,
          cursor: 'pointer',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          transform: getTransform(),
          zIndex: 9999,
          width: 280,
          background: '#1e293b',
          border: '2px solid #6366f1',
          borderRadius: 12,
          padding: 16,
          boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          animation: 'fadeSlideIn 0.3s ease-out',
        }}
      >
        <div style={getArrow()} />
        {stepDots}
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 10,
          color: '#e2e8f0',
          marginBottom: 8,
        }}>
          {current.title}
        </div>
        <div style={{
          fontSize: 12,
          color: '#94a3b8',
          lineHeight: 1.5,
          marginBottom: 14,
        }}>
          {current.body}
        </div>
        {actions}
      </div>
    </>
  );
}
