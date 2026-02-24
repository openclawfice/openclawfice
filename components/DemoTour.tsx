'use client';

import React, { useState, useEffect } from 'react';

const TOUR_STEPS = [
  {
    title: '🏠 Your AI Office',
    body: 'This is your team of AI agents. Each one has a role, personality, and mood — just like The Sims, but they actually get work done.',
    target: 'work-room',
    position: 'bottom' as const,
  },
  {
    title: '⚔️ Quest Log',
    body: 'Agents raise quests when they need your decision. Review, respond, and watch them execute. You\'re the boss.',
    target: 'quest-log',
    position: 'top' as const,
  },
  {
    title: '💬 Water Cooler',
    body: 'Your agents chat, debate, and collaborate here. Send group messages or just watch the banter.',
    target: 'water-cooler',
    position: 'left' as const,
  },
  {
    title: '🏆 Accomplishments',
    body: 'Every completed task gets logged with a video replay. Track your team\'s progress like a leaderboard.',
    target: 'accomplishments',
    position: 'top' as const,
  },
  {
    title: '🎮 Click an Agent!',
    body: 'Click any NPC to see their stats, send them a DM, set auto-work schedules, or stop them. Try it now!',
    target: 'work-room',
    position: 'bottom' as const,
  },
];

const STORAGE_KEY = 'openclawfice-tour-seen';

export function DemoTour({ isDemoMode }: { isDemoMode: boolean }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isDemoMode) return;
    // Only show tour once per browser
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) return;
    // Delay start so the page has time to render
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [isDemoMode]);

  useEffect(() => {
    if (!visible) return;
    const current = TOUR_STEPS[step];
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pos = { top: 0, left: 0 };

    switch (current.position) {
      case 'bottom':
        pos.top = rect.bottom + 12;
        pos.left = rect.left + rect.width / 2;
        break;
      case 'top':
        pos.top = rect.top - 12;
        pos.left = rect.left + rect.width / 2;
        break;
      case 'left':
        pos.top = rect.top + rect.height / 2;
        pos.left = rect.left - 12;
        break;
    }

    setPosition(pos);
  }, [step, visible]);

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
    }
  };

  // Transform based on position direction
  const getTransform = () => {
    switch (current.position) {
      case 'bottom': return 'translateX(-50%)';
      case 'top': return 'translateX(-50%) translateY(-100%)';
      case 'left': return 'translateX(-100%) translateY(-50%)';
      default: return 'translateX(-50%)';
    }
  };

  // Arrow direction
  const getArrow = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
    };
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

  return (
    <>
      {/* Spotlight overlay */}
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

      {/* Tooltip */}
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
          boxShadow: '0 8px 32px rgba(99,102,241,0.3), 0 0 0 1px rgba(99,102,241,0.1)',
          animation: 'fadeSlideIn 0.3s ease-out',
        }}
      >
        {/* Arrow */}
        <div style={getArrow()} />

        {/* Step counter */}
        <div style={{
          display: 'flex',
          gap: 4,
          marginBottom: 10,
        }}>
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

        {/* Title */}
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 10,
          color: '#e2e8f0',
          marginBottom: 8,
        }}>
          {current.title}
        </div>

        {/* Body */}
        <div style={{
          fontSize: 12,
          color: '#94a3b8',
          lineHeight: 1.5,
          marginBottom: 14,
        }}>
          {current.body}
        </div>

        {/* Actions */}
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
              fontSize: 10,
              cursor: 'pointer',
              padding: '4px 8px',
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
              padding: '6px 14px',
              fontSize: 10,
              fontFamily: '"Press Start 2P", monospace',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isLast ? '🎮 Got it!' : 'Next →'}
          </button>
        </div>
      </div>
    </>
  );
}
