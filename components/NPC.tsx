'use client';

import React, { useState, useEffect } from 'react';
import type { Agent, Mood } from './types';
import { Celebration } from './Celebration';
import { NPCParticles } from './NPCParticles';
import { randomColor, getQuirkyMoodMessage } from './utils';

// === NPC Visual Trait System ===

type HairStyle = 'classic' | 'spiky' | 'long' | 'bald' | 'afro' | 'bob' | 'ponytail' | 'mohawk';
type Accessory = 'none' | 'glasses' | 'headphones' | 'cap' | 'earring';

// Generate unique NPC visual traits from agent ID (deterministic)
function getNpcTraits(id: string) {
  // Different deterministic mix to produce a fresh trait distribution.
  let seed = 2166136261;
  for (let i = 0; i < id.length; i++) {
    seed ^= id.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  const next = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };

  const pick = <T,>(list: T[]) => list[next() % list.length];

  const skinTones = ['#f3d6bf', '#e8c1a0', '#d8a67f', '#bf875d', '#9f6947', '#7f4e34', '#f1cdb6', '#c7906a'];
  const hairColors = ['#111827', '#2b2a28', '#6b3f2a', '#84563c', '#b37a4c', '#b91c1c', '#1d4ed8', '#334155', '#cbd5e1'];
  const hairStyles: HairStyle[] = ['classic', 'spiky', 'long', 'bald', 'afro', 'bob', 'ponytail', 'mohawk'];
  const accessories: Accessory[] = ['none', 'none', 'glasses', 'headphones', 'cap', 'earring'];
  const pantsColors = ['#1f2937', '#0f172a', '#334155', '#374151', '#3f3f46', '#1e3a8a', '#14532d', '#4c1d95'];

  return {
    skinColor: pick(skinTones),
    hairColor: pick(hairColors),
    hairStyle: pick(hairStyles),
    accessory: pick(accessories),
    pantsColor: pick(pantsColors),
  };
}

function NpcHair({ style, s, hairColor }: { style: HairStyle; s: number; hairColor: string }) {
  switch (style) {
    case 'spiky':
      return (<>
        <div style={{ position: 'absolute', top: -s * 0.5, left: s * 1.5, width: s * 5, height: s * 2.5, background: hairColor, borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.3}px ${s * 0.3}px` }} />
        <div style={{ position: 'absolute', top: -s * 1.2, left: s * 2, width: s * 1.2, height: s * 1.5, background: hairColor, borderRadius: `${s}px ${s}px 0 0`, transform: 'rotate(-15deg)' }} />
        <div style={{ position: 'absolute', top: -s * 1.5, left: s * 3.5, width: s * 1.2, height: s * 1.8, background: hairColor, borderRadius: `${s}px ${s}px 0 0` }} />
        <div style={{ position: 'absolute', top: -s * 1.2, left: s * 5, width: s * 1.2, height: s * 1.5, background: hairColor, borderRadius: `${s}px ${s}px 0 0`, transform: 'rotate(15deg)' }} />
      </>);
    case 'long':
      return (<>
        <div style={{ position: 'absolute', top: 0, left: s * 0.5, width: s * 7, height: s * 2.5, background: hairColor, borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.3}px ${s * 0.3}px` }} />
        <div style={{ position: 'absolute', top: s * 1.5, left: s * 0.2, width: s * 1.2, height: s * 4, background: hairColor, borderRadius: `0 0 ${s * 0.5}px ${s * 0.5}px` }} />
        <div style={{ position: 'absolute', top: s * 1.5, left: s * 6.6, width: s * 1.2, height: s * 4, background: hairColor, borderRadius: `0 0 ${s * 0.5}px ${s * 0.5}px` }} />
      </>);
    case 'mohawk':
      return (<>
        <div style={{ position: 'absolute', top: -s * 0.6, left: s * 3.1, width: s * 1.8, height: s * 2.8, background: hairColor, borderRadius: `${s * 0.9}px ${s * 0.9}px ${s * 0.2}px ${s * 0.2}px` }} />
        <div style={{ position: 'absolute', top: s * 0.2, left: s * 2.7, width: s * 2.6, height: s * 1.1, background: hairColor, borderRadius: `${s * 0.6}px ${s * 0.6}px ${s * 0.25}px ${s * 0.25}px`, opacity: 0.9 }} />
      </>);
    case 'bald':
      return (
        <div style={{ position: 'absolute', top: s * 0.8, left: s * 1.2, width: s * 5.6, height: s * 1, background: hairColor, opacity: 0.3, borderRadius: `${s * 1}px ${s * 1}px 0 0` }} />
      );
    case 'afro':
      return (
        <div style={{ position: 'absolute', top: -s * 1.5, left: s * 0.2, width: s * 7.6, height: s * 4.5, background: hairColor, borderRadius: '50%' }} />
      );
    case 'bob':
      return (<>
        <div style={{ position: 'absolute', top: 0, left: s * 0.5, width: s * 7, height: s * 2.5, background: hairColor, borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.5}px ${s * 0.5}px` }} />
        <div style={{ position: 'absolute', top: s * 1.5, left: s * 0.3, width: s * 1.5, height: s * 2.5, background: hairColor, borderRadius: `0 0 ${s * 0.8}px ${s * 0.8}px` }} />
        <div style={{ position: 'absolute', top: s * 1.5, left: s * 6.2, width: s * 1.5, height: s * 2.5, background: hairColor, borderRadius: `0 0 ${s * 0.8}px ${s * 0.8}px` }} />
      </>);
    case 'ponytail':
      return (<>
        <div style={{ position: 'absolute', top: 0, left: s, width: s * 6, height: s * 2.5, background: hairColor, borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.3}px ${s * 0.3}px` }} />
        <div style={{ position: 'absolute', top: s * 1, left: s * 6.5, width: s * 1.5, height: s * 3.5, background: hairColor, borderRadius: `0 ${s}px ${s * 0.5}px 0` }} />
      </>);
    default: // classic
      return (
        <div style={{ position: 'absolute', top: 0, left: s, width: s * 6, height: s * 2.5, background: hairColor, borderRadius: `${s * 1.5}px ${s * 1.5}px ${s * 0.3}px ${s * 0.3}px` }} />
      );
  }
}

function NpcAccessory({ accessory, s, shirtColor }: { accessory: Accessory; s: number; shirtColor: string }) {
  switch (accessory) {
    case 'glasses':
      return (<>
        <div style={{ position: 'absolute', top: s * 2.3, left: s * 1.5, width: s * 2, height: s * 1.2, border: `${s * 0.25}px solid #94a3b8`, borderRadius: s * 0.3, background: 'rgba(148,163,184,0.15)' }} />
        <div style={{ position: 'absolute', top: s * 2.3, left: s * 4.5, width: s * 2, height: s * 1.2, border: `${s * 0.25}px solid #94a3b8`, borderRadius: s * 0.3, background: 'rgba(148,163,184,0.15)' }} />
        <div style={{ position: 'absolute', top: s * 2.7, left: s * 3.5, width: s * 1, height: s * 0.25, background: '#94a3b8' }} />
      </>);
    case 'headphones':
      return (<>
        <div style={{ position: 'absolute', top: -s * 0.3, left: s * 0.3, width: s * 7.4, height: s * 3, border: `${s * 0.35}px solid #475569`, borderRadius: `${s * 4}px ${s * 4}px 0 0`, borderBottom: 'none' }} />
        <div style={{ position: 'absolute', top: s * 2, left: s * 0, width: s * 1.2, height: s * 1.5, background: '#475569', borderRadius: s * 0.4 }} />
        <div style={{ position: 'absolute', top: s * 2, left: s * 6.8, width: s * 1.2, height: s * 1.5, background: '#475569', borderRadius: s * 0.4 }} />
      </>);
    case 'cap':
      return (<>
        <div style={{ position: 'absolute', top: -s * 0.3, left: s * 0.5, width: s * 7, height: s * 1.8, background: shirtColor, borderRadius: `${s * 1}px ${s * 1}px ${s * 0.2}px ${s * 0.2}px`, filter: 'brightness(0.8)' }} />
        <div style={{ position: 'absolute', top: s * 1, left: -s * 0.3, width: s * 4, height: s * 0.6, background: shirtColor, borderRadius: `${s * 0.3}px 0 0 ${s * 0.3}px`, filter: 'brightness(0.7)' }} />
      </>);
    case 'earring':
      return (
        <div style={{ position: 'absolute', top: s * 3.5, left: s * 6.8, width: s * 0.5, height: s * 0.5, background: '#fbbf24', borderRadius: '50%', boxShadow: `0 0 ${s * 0.3}px #fbbf24` }} />
      );
    default:
      return null;
  }
}

// === Plumbob (Mood Diamond) ===

function Plumbob({ mood, agent }: { mood: Mood; agent?: Agent }) {
  const colors: Record<Mood, string> = {
    great: '#22c55e',
    good: '#84cc16',
    okay: '#eab308',
    stressed: '#ef4444',
  };
  const c = colors[mood];
  const message = agent ? getQuirkyMoodMessage(agent) : `Mood: ${mood}`;
  return (
    <div
      title={message}
      style={{
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderBottom: `10px solid ${c}`,
        filter: `drop-shadow(0 0 4px ${c})`,
        animation: 'plumbobSpin 3s ease-in-out infinite',
        position: 'relative',
        top: -2,
        cursor: 'help',
      }}>
      <div style={{
        position: 'absolute',
        top: 10,
        left: -6,
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: `10px solid ${c}`,
      }} />
    </div>
  );
}

// === Main NPC Component ===

export function NPC({ agent, size = 1, onClick, forceThought, flipped, hasCelebration, partyMode }: {
  agent: Agent;
  size?: number;
  onClick?: () => void;
  forceThought?: string | null;
  flipped?: boolean;
  hasCelebration?: boolean;
  partyMode?: boolean;
}) {
  const s = 4 * size;
  const displayThought = forceThought || agent.thought;
  const [showThought, setShowThought] = useState(!!displayThought);

  useEffect(() => {
    if (!displayThought) {
      setShowThought(false);
      return;
    }
    setShowThought(true);
    const hideTimer = setTimeout(() => setShowThought(false), 6000);
    return () => clearTimeout(hideTimer);
  }, [displayThought]);

  const traits = getNpcTraits(agent.id);
  const skinColor = agent.skinColor || traits.skinColor;
  const shirtColor = agent.shirtColor || agent.color || randomColor(agent.id);
  const hairColor = agent.hairColor || traits.hairColor;
  const pantsColor = traits.pantsColor;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => {
        if (onClick) (e.currentTarget.style.transform = 'scale(1.1)');
      }}
      onMouseLeave={e => {
        (e.currentTarget.style.transform = 'scale(1)');
      }}
    >
      {showThought && displayThought && (
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          color: '#1a1a2e',
          padding: '4px 10px',
          borderRadius: 10,
          fontSize: 9 * size,
          maxWidth: 180 * size,
          textAlign: 'center',
          animation: 'fadeSlideIn 0.3s ease-out',
          marginBottom: 4,
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          lineHeight: 1.3,
        }}>
          {displayThought}
        </div>
      )}
      {hasCelebration && <Celebration />}
      <Plumbob mood={agent.mood} agent={agent} />
      <div style={{ position: 'relative', width: s * 8, height: s * 10 }}>
        <NPCParticles
          agentStatus={agent.status}
          agentMood={agent.mood}
          agentRole={agent.role}
          width={s * 8}
          height={s * 10}
        />
        <div style={{
          width: s * 8,
          height: s * 10,
          imageRendering: 'pixelated' as any,
          position: 'relative',
          animation: partyMode ? 'npcPartyJump 0.5s ease-in-out infinite' : 'npcBob 2s ease-in-out infinite',
          ...(flipped ? { transform: 'scaleX(-1)' } : {}),
        }}>
        {/* Hair */}
        <NpcHair style={traits.hairStyle} s={s} hairColor={hairColor} />
        {/* Head */}
        <div style={{
          position: 'absolute',
          top: s * 1.5,
          left: s,
          width: s * 6,
          height: s * 3,
          background: skinColor,
          borderRadius: s * 0.5,
        }} />
        {/* Accessory */}
        <NpcAccessory accessory={traits.accessory} s={s} shirtColor={shirtColor} />
        {/* Eyes - Dynamic based on status/mood */}
        {(() => {
          // Determine expression based on status and mood
          const isHappy = agent.status === 'working' && agent.mood === 'great';
          const isFocused = agent.status === 'working' && agent.mood !== 'stressed';
          const isStressed = agent.mood === 'stressed';
          const isChill = agent.status !== 'working';

          // Happy eyes: Wide and bright (^_^)
          if (isHappy) {
            return (<>
              <div style={{
                position: 'absolute',
                top: s * 2.7,
                left: s * 1.8,
                width: s * 1.2,
                height: s * 0.3,
                background: '#1a1a2e',
                borderRadius: '50%',
                transform: 'rotate(-15deg)',
              }} />
              <div style={{
                position: 'absolute',
                top: s * 2.7,
                left: s * 5,
                width: s * 1.2,
                height: s * 0.3,
                background: '#1a1a2e',
                borderRadius: '50%',
                transform: 'rotate(15deg)',
              }} />
            </>);
          }

          // Focused eyes: Narrowed and determined (o_o)
          if (isFocused) {
            return (<>
              <div style={{
                position: 'absolute',
                top: s * 2.5,
                left: s * 2,
                width: s * 0.8,
                height: s * 0.6,
                background: '#1a1a2e',
                borderRadius: s * 0.3,
              }} />
              <div style={{
                position: 'absolute',
                top: s * 2.5,
                left: s * 5.2,
                width: s * 0.8,
                height: s * 0.6,
                background: '#1a1a2e',
                borderRadius: s * 0.3,
              }} />
            </>);
          }

          // Stressed eyes: Wide and worried (O_O)
          if (isStressed) {
            return (<>
              <div style={{
                position: 'absolute',
                top: s * 2.3,
                left: s * 2,
                width: s * 1,
                height: s * 1,
                background: '#1a1a2e',
                borderRadius: '50%',
              }} />
              <div style={{
                position: 'absolute',
                top: s * 2.3,
                left: s * 5,
                width: s * 1,
                height: s * 1,
                background: '#1a1a2e',
                borderRadius: '50%',
              }} />
              {/* Stress sweat drops */}
              <div style={{
                position: 'absolute',
                top: s * 3,
                left: s * 1.5,
                width: s * 0.4,
                height: s * 0.6,
                background: '#3b82f6',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(45deg)',
                opacity: 0.7,
              }} />
            </>);
          }

          // Chill eyes: Half-closed and relaxed (-_-)
          if (isChill) {
            return (<>
              <div style={{
                position: 'absolute',
                top: s * 2.6,
                left: s * 2,
                width: s * 0.8,
                height: s * 0.4,
                background: '#1a1a2e',
                borderRadius: s * 0.2,
                animation: 'npcBlink 4s ease-in-out infinite',
              }} />
              <div style={{
                position: 'absolute',
                top: s * 2.6,
                left: s * 5.2,
                width: s * 0.8,
                height: s * 0.4,
                background: '#1a1a2e',
                borderRadius: s * 0.2,
                animation: 'npcBlink 4s ease-in-out infinite',
              }} />
            </>);
          }

          // Default: Normal round eyes
          return (<>
            <div style={{
              position: 'absolute',
              top: s * 2.5,
              left: s * 2,
              width: s * 0.8,
              height: s * 0.8,
              background: '#1a1a2e',
              borderRadius: '50%',
              animation: 'npcBlink 4s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute',
              top: s * 2.5,
              left: s * 5.2,
              width: s * 0.8,
              height: s * 0.8,
              background: '#1a1a2e',
              borderRadius: '50%',
              animation: 'npcBlink 4s ease-in-out infinite',
            }} />
          </>);
        })()}

        {/* Mouth - Dynamic based on status/mood */}
        {(() => {
          const isHappy = agent.status === 'working' && agent.mood === 'great';
          const isFocused = agent.status === 'working' && agent.mood !== 'stressed';
          const isStressed = agent.mood === 'stressed';
          const isChill = agent.status !== 'working';

          // Happy: Big smile
          if (isHappy) {
            return (
              <div style={{
                position: 'absolute',
                top: s * 3.2,
                left: s * 2,
                width: s * 4,
                height: s * 1.2,
                borderBottom: `${s * 0.5}px solid #1a1a2e`,
                borderRadius: '0 0 60% 60%',
              }} />
            );
          }

          // Focused: Determined line
          if (isFocused) {
            return (
              <div style={{
                position: 'absolute',
                top: s * 3.5,
                left: s * 2.5,
                width: s * 3,
                height: s * 0.4,
                background: '#1a1a2e',
                borderRadius: s * 0.2,
              }} />
            );
          }

          // Stressed: Worried frown
          if (isStressed) {
            return (
              <div style={{
                position: 'absolute',
                top: s * 3.8,
                left: s * 2.5,
                width: s * 3,
                height: s * 0.6,
                borderTop: `${s * 0.5}px solid #1a1a2e`,
                borderRadius: '50% 50% 0 0',
              }} />
            );
          }

          // Chill: Content smile
          if (isChill) {
            return (
              <div style={{
                position: 'absolute',
                top: s * 3.4,
                left: s * 2.5,
                width: s * 3,
                height: s * 0.6,
                borderBottom: `${s * 0.4}px solid #1a1a2e`,
                borderRadius: '0 0 40% 40%',
              }} />
            );
          }

          // Default: Neutral smile
          return (
            <div style={{
              position: 'absolute',
              top: s * 3.3,
              left: s * 2.5,
              width: s * 3,
              height: s * 0.8,
              borderBottom: `${s * 0.4}px solid #1a1a2e`,
              borderRadius: '0 0 50% 50%',
            }} />
          );
        })()}
        {/* Body */}
        <div style={{
          position: 'absolute',
          top: s * 4.5,
          left: 0,
          width: s * 8,
          height: s * 4,
          background: shirtColor,
          borderRadius: `${s * 0.5}px ${s * 0.5}px ${s}px ${s}px`,
        }} />
        {/* Arms */}
        <div style={{
          position: 'absolute',
          top: s * 5,
          left: -s * 0.8,
          width: s * 1.2,
          height: s * 2.5,
          background: shirtColor,
          borderRadius: s * 0.5,
          transformOrigin: 'top center',
          ...(agent.status === 'working' ? { animation: 'npcTypeLeft 0.8s ease-in-out infinite' } : {}),
        }} />
        <div style={{
          position: 'absolute',
          top: s * 5,
          left: s * 7.6,
          width: s * 1.2,
          height: s * 2.5,
          background: shirtColor,
          borderRadius: s * 0.5,
          transformOrigin: 'top center',
          ...(agent.status === 'working' ? { animation: 'npcTypeRight 0.8s ease-in-out infinite' } : {}),
        }} />
        {/* Legs */}
        <div style={{
          position: 'absolute',
          top: s * 8.5,
          left: s * 1,
          width: s * 2.2,
          height: s * 2,
          background: pantsColor,
          borderRadius: `0 0 ${s * 0.4}px ${s * 0.4}px`,
        }} />
        <div style={{
          position: 'absolute',
          top: s * 8.5,
          left: s * 4.8,
          width: s * 2.2,
          height: s * 2,
          background: pantsColor,
          borderRadius: `0 0 ${s * 0.4}px ${s * 0.4}px`,
        }} />
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          fontSize: 9 * size,
          fontWeight: 700,
          padding: `${1 * size}px ${5 * size}px`,
          borderRadius: 4 * size,
          fontFamily: '"Press Start 2P", monospace, system-ui',
        }}>
          {agent.name}
        </div>
        <div style={{
          background: agent.color,
          color: '#fff',
          fontSize: 7 * size,
          fontWeight: 700,
          padding: `${1 * size}px ${3 * size}px`,
          borderRadius: 3 * size,
          fontFamily: '"Press Start 2P", monospace',
        }}>
          {agent.level}
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        <span style={{
          fontSize: 8 * size,
          color: '#64748b',
          fontFamily: '"Press Start 2P", monospace',
        }}>
          {agent.role}
        </span>
        {/* Status activity indicator */}
        {agent.status === 'working' ? (
          <span style={{
            fontSize: 7 * size,
            animation: 'statusPulse 1.5s ease-in-out infinite',
            display: 'inline-block',
          }}>
            ⚡
          </span>
        ) : (
          <span style={{
            fontSize: 7 * size,
            opacity: 0.5,
            animation: 'statusFloat 3s ease-in-out infinite',
            display: 'inline-block',
          }}>
            💤
          </span>
        )}
      </div>
    </div>
  );
}
