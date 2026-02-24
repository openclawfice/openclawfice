'use client';

import { useState, useEffect } from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  completed: boolean;
}

interface DailyChallengeProps {
  getApiPath: (path: string) => string;
  onCelebration?: () => void;
}

/**
 * Daily Challenge card - gives users a reason to come back every day.
 * Changes based on day-of-week for predictable variety.
 */
export function DailyChallenge({ getApiPath, onCelebration }: DailyChallengeProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  // Fetch today's challenge
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch(getApiPath('/api/office/challenges'));
        const data = await res.json();
        setChallenge(data.challenge);
        setStreak(data.streak);
        setXp(data.xp);
      } catch (err) {
        console.error('Failed to fetch challenge:', err);
      }
    };

    fetchChallenge();
    // Refresh every 5 minutes to catch progress updates
    const interval = setInterval(fetchChallenge, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [getApiPath]);

  if (!challenge) {
    return null;
  }

  const progress = Math.min(100, (challenge.current / challenge.target) * 100);
  const progressColor = challenge.completed ? '#10b981' : '#8b5cf6';

  return (
    <div
      style={{
        background: challenge.completed 
          ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
          : 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
        border: `2px solid ${challenge.completed ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{challenge.icon}</span>
          <div>
            <div
              style={{
                fontSize: 11,
                fontFamily: '"Press Start 2P", monospace',
                color: challenge.completed ? '#10b981' : '#8b5cf6',
                marginBottom: 4,
              }}
            >
              {challenge.completed ? '✓ COMPLETED' : 'DAILY CHALLENGE'}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#e2e8f0',
              }}
            >
              {challenge.title}
            </div>
          </div>
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <div
            style={{
              background: 'rgba(245,158,11,0.2)',
              border: '1px solid rgba(245,158,11,0.4)',
              borderRadius: 8,
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 16 }}>🔥</span>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#fbbf24',
                  lineHeight: 1,
                }}
              >
                {streak}
              </div>
              <div
                style={{
                  fontSize: 7,
                  color: '#fcd34d',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                day streak
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 12,
          color: '#94a3b8',
          marginBottom: 12,
          lineHeight: 1.5,
        }}
      >
        {challenge.description}
      </div>

      {/* Progress bar */}
      <div
        style={{
          background: '#1e293b',
          borderRadius: 8,
          height: 24,
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress}%`,
            background: progressColor,
            transition: 'width 0.5s ease-out',
            boxShadow: `0 0 10px ${progressColor}44`,
          }}
        />

        {/* Label */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: 10,
            fontWeight: 700,
            color: '#e2e8f0',
            fontFamily: '"Press Start 2P", monospace',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {challenge.current} / {challenge.target}
        </div>
      </div>

      {/* XP reward */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: '#64748b',
          }}
        >
          {challenge.completed ? (
            <span style={{ color: '#10b981' }}>✓ Challenge complete!</span>
          ) : (
            'New challenge in 24h'
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: '#fbbf24',
          }}
        >
          <span>⭐</span>
          <span>{xp} XP</span>
        </div>
      </div>

      {/* Completion celebration */}
      {celebrating && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(16,185,129,0.9)',
            animation: 'fadeOut 2s forwards',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 48,
              animation: 'bounce 0.5s ease-out',
            }}
          >
            🎉
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
