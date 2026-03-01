'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DiscoveryAnimationProps {
  agents: any[];
  onComplete: () => void;
}

export function DiscoveryAnimation({ agents, onComplete }: DiscoveryAnimationProps) {
  const [stage, setStage] = useState<'loading' | 'discovery' | 'complete'>('loading');
  const [visibleAgents, setVisibleAgents] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const hasSeenDiscovery = localStorage.getItem('openclawfice_discovery_seen');
    
    if (hasSeenDiscovery || agents.length === 0) {
      onCompleteRef.current();
      return;
    }

    const loadingTimer = setTimeout(() => {
      setStage('discovery');
      
      // Play discovery sound with graceful degradation
      // Animation continues regardless of audio state
      try {
        const audio = new Audio('/sounds/discovery.mp3');
        audio.volume = 0.3;
        
        // Handle load errors silently (file missing/corrupted)
        audio.addEventListener('error', () => {
          // Silent fallback - animation continues without sound
        });
        
        // Catch play() promise rejection silently (autoplay blocked, etc.)
        audio.play().catch(() => {
          // Silent fallback - no console errors
        });
      } catch {
        // Silent fallback for any other errors
      }
    }, 1000);

    return () => clearTimeout(loadingTimer);
  }, [agents.length]);

  useEffect(() => {
    if (stage !== 'discovery') return;

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleAgents(count);
      
      if (count >= agents.length) {
        clearInterval(interval);
        
        setTimeout(() => {
          setIsComplete(true);
          localStorage.setItem('openclawfice_discovery_seen', 'true');
          setTimeout(() => onCompleteRef.current(), 800);
        }, 1500);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [stage, agents.length]);

  if (isComplete || (stage === 'loading' && agents.length === 0)) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: isComplete ? 'fadeOut 0.8s ease-out' : 'none',
      }}
    >
      <style>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,255,65,0.5), 0 0 40px rgba(0,255,65,0.3); }
          50% { box-shadow: 0 0 40px rgba(0,255,65,0.8), 0 0 80px rgba(0,255,65,0.5); }
        }
      `}</style>

      {/* Scanline effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(transparent, rgba(0,255,65,0.5), transparent)',
        animation: 'scanline 3s linear infinite',
        pointerEvents: 'none',
      }} />

      {stage === 'loading' && (
        <div style={{
          textAlign: 'center',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <div style={{
            fontSize: 48,
            marginBottom: 24,
          }}>
            🏢
          </div>
          <div style={{
            fontSize: 20,
            color: '#00ff41',
            fontFamily: '"Press Start 2P", monospace',
            textShadow: '0 0 10px #00ff41',
          }}>
            Initializing Office...
          </div>
        </div>
      )}

      {stage === 'discovery' && (
        <div style={{
          textAlign: 'center',
          maxWidth: 600,
          padding: 40,
        }}>
          {/* Header */}
          <div style={{
            fontSize: 16,
            color: '#00ff41',
            fontFamily: '"Press Start 2P", monospace',
            marginBottom: 40,
            textShadow: '0 0 15px #00ff41',
            animation: 'glow 2s ease-in-out infinite',
          }}>
            🎉 Agents Discovered!
          </div>

          {/* Agent Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(agents.length, 4)}, 1fr)`,
            gap: 24,
            marginBottom: 40,
          }}>
            {agents.map((agent, idx) => (
              <div
                key={agent.id}
                style={{
                  opacity: idx < visibleAgents ? 1 : 0,
                  animation: idx < visibleAgents ? 'fadeIn 0.5s ease-out' : 'none',
                  transition: 'opacity 0.5s',
                }}
              >
                <div style={{
                  fontSize: 40,
                  marginBottom: 8,
                  filter: idx < visibleAgents ? 'none' : 'blur(4px)',
                  transition: 'filter 0.5s',
                }}>
                  {agent.emoji || '⚡'}
                </div>
                <div style={{
                  fontSize: 10,
                  color: '#94a3b8',
                  fontFamily: '"Press Start 2P", monospace',
                  wordBreak: 'break-word',
                }}>
                  {agent.name || agent.id}
                </div>
              </div>
            ))}
          </div>

          {/* Subtitle */}
          {visibleAgents === agents.length && (
            <div style={{
              fontSize: 11,
              color: '#64748b',
              fontFamily: '"Courier New", monospace',
              animation: 'fadeIn 0.8s ease-out',
              lineHeight: 1.6,
            }}>
              Your office is now open!<br />
              Click any agent to see their stats and send DMs.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
