'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * RPG-style achievement toast notification.
 * Slides in from the bottom when an agent completes a task.
 * Shows agent name, XP earned, and task description.
 * Auto-dismisses after 4 seconds with slide-out animation.
 */

export interface AchievementToastData {
  id: string;
  agentName: string;
  agentColor: string;
  icon: string;
  title: string;
  xp: number;
}

interface AchievementToastProps {
  toast: AchievementToastData;
  onDismiss: (id: string) => void;
}

function AchievementToastItem({ toast, onDismiss }: AchievementToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2800);
    const removeTimer = setTimeout(() => onDismiss(toast.id), 3300);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      onClick={() => {
        setExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 14px',
        background: 'linear-gradient(135deg, rgba(30,30,60,0.95), rgba(20,20,50,0.95))',
        border: '1px solid rgba(99,102,241,0.4)',
        borderLeft: `3px solid ${toast.agentColor}`,
        borderRadius: 8,
        cursor: 'pointer',
        animation: exiting ? 'toastSlideOut 0.3s ease-in forwards' : 'toastSlideIn 0.4s ease-out forwards',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 15px rgba(99,102,241,0.15)',
        maxWidth: '100%',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: 16 }}>{toast.icon || '⭐'}</span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 2,
        }}>
          <span style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 9,
            color: toast.agentColor,
            fontWeight: 700,
          }}>
            {toast.agentName}
          </span>
          <span style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 8,
            color: '#FFD700',
            textShadow: '0 0 6px rgba(255,215,0,0.4)',
          }}>
            +{toast.xp} XP
          </span>
        </div>
        <div style={{
          fontSize: 11,
          color: '#c4c9d4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {toast.title}
        </div>
      </div>

      <style jsx>{`
        @keyframes toastSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toastSlideOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}

interface AchievementToastContainerProps {
  toasts: AchievementToastData[];
  onDismiss: (id: string) => void;
}

export function AchievementToastContainer({ toasts, onDismiss }: AchievementToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="achievement-toast-container" style={{
      position: 'fixed',
      top: 64,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: 6,
      pointerEvents: 'none',
      maxWidth: 'min(360px, calc(100vw - 40px))',
    }}>
      {toasts.slice(-2).map(toast => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <AchievementToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
