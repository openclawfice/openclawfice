'use client';

import React from 'react';

// Pixel-art room decorations — small ambient details for Sims vibe
function RoomDecor({ type }: { type: 'work' | 'lounge' | 'meeting' }) {
  const s = 3;
  const common: React.CSSProperties = { position: 'absolute', imageRendering: 'pixelated' as any, opacity: 0.4, zIndex: 0 };

  if (type === 'work') return (<>
    {/* Computer monitor */}
    <div style={{ ...common, bottom: 6, right: 10 }}>
      <div style={{ width: s*6, height: s*4, background: '#334155', borderRadius: 1, border: `${s*0.3}px solid #475569` }} />
      <div style={{ width: s*2, height: s*1.5, background: '#475569', margin: '0 auto' }} />
      <div style={{ width: s*4, height: s*0.5, background: '#475569', margin: '0 auto', borderRadius: 1 }} />
    </div>
    {/* Plant */}
    <div style={{ ...common, bottom: 8, left: 8 }}>
      <div style={{ width: s*2, height: s*3, background: '#065f46', borderRadius: `${s}px ${s}px 0 0` }} />
      <div style={{ width: s*3, height: s*2.5, background: '#059669', borderRadius: '50%', marginTop: -s*2, marginLeft: -s*0.5 }} />
      <div style={{ width: s*1.5, height: s*1.5, background: '#6b4226', margin: '0 auto', borderRadius: 1 }} />
    </div>
  </>);

  if (type === 'lounge') return (<>
    {/* Coffee cup */}
    <div style={{ ...common, bottom: 6, right: 12 }}>
      <div style={{ width: s*2.5, height: s*3, background: '#f5f5f4', borderRadius: `0 0 ${s*0.5}px ${s*0.5}px` }} />
      <div style={{ width: s*3, height: s*0.6, background: '#f5f5f4', borderRadius: s*0.3, marginTop: -s*3 }} />
      <div style={{ width: s*1, height: s*1.5, background: '#f5f5f4', borderRadius: `0 ${s}px ${s}px 0`, position: 'absolute' as any, right: -s*0.8, top: s*0.8 }} />
    </div>
    {/* Couch */}
    <div style={{ ...common, bottom: 4, left: 6 }}>
      <div style={{ width: s*8, height: s*3, background: '#7c3aed', borderRadius: `${s}px ${s}px ${s*0.5}px ${s*0.5}px` }} />
      <div style={{ width: s*1.5, height: s*1.5, background: '#6d28d9', borderRadius: `${s}px 0 0 0`, position: 'absolute' as any, left: 0, top: -s*1 }} />
      <div style={{ width: s*1.5, height: s*1.5, background: '#6d28d9', borderRadius: `0 ${s}px 0 0`, position: 'absolute' as any, right: 0, top: -s*1 }} />
    </div>
  </>);

  // meeting
  return (<>
    {/* Whiteboard */}
    <div style={{ ...common, top: 22, right: 8 }}>
      <div style={{ width: s*8, height: s*5, background: '#f1f5f9', borderRadius: 1, border: `${s*0.3}px solid #94a3b8` }} />
      <div style={{ width: s*0.5, height: s*2, background: '#94a3b8', margin: '0 auto' }} />
    </div>
  </>);
}

export function Room({
  title,
  icon,
  color,
  borderColor,
  children,
  roomType,
  style: extraStyle,
  dataTour,
}: {
  title: string;
  icon: string;
  color: string;
  borderColor: string;
  children: React.ReactNode;
  roomType?: 'work' | 'lounge' | 'meeting';
  style?: React.CSSProperties;
  dataTour?: string;
}) {
  return (
    <div data-tour={dataTour} style={{
      background: `linear-gradient(180deg, ${color} 0%, ${color}ee 100%)`,
      border: `3px solid ${borderColor}`,
      borderRadius: 16,
      overflow: roomType === 'lounge' ? 'visible' : 'hidden',
      position: 'relative',
      ...extraStyle,
    }}>
      <div style={{
        position: 'absolute',
        top: 4,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#0f172a',
        border: `1px solid ${borderColor}`,
        borderRadius: 6,
        padding: '3px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 8,
          color: '#fff',
          textTransform: 'uppercase',
        }}>
          {title}
        </span>
      </div>
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, ${borderColor} 39px, ${borderColor} 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, ${borderColor} 39px, ${borderColor} 40px)`,
      }} />
      {roomType && <RoomDecor type={roomType} />}
      <div style={{
        position: 'relative',
        padding: '24px 8px 6px',
        zIndex: 1,
      }}>
        {children}
      </div>
    </div>
  );
}
