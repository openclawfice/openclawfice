'use client';

import { useState, useEffect } from 'react';

const GLITCH_CHARS = '█▓▒░╔╗╚╝║═╠╣╬┼';

function GlitchText({ text, interval = 100 }: { text: string; interval?: number }) {
  const [display, setDisplay] = useState(text);
  
  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      if (frame % 20 < 3) {
        // Glitch frames
        setDisplay(
          text
            .split('')
            .map((c) =>
              Math.random() < 0.3
                ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
                : c
            )
            .join('')
        );
      } else {
        setDisplay(text);
      }
    }, interval);
    return () => clearInterval(id);
  }, [text, interval]);
  
  return <span>{display}</span>;
}

const MESSAGES = [
  "You wandered into an uncharted sector.",
  "The office doesn't extend this far... yet.",
  "No NPC has been assigned to this room.",
  "This corridor leads nowhere. Turn back.",
  "You found a bug! Just kidding. It's a 404.",
  "The void stares back. It has no agents.",
];

export default function NotFound() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [typedText, setTypedText] = useState('');
  const [showActions, setShowActions] = useState(false);
  
  // Pick random message on mount
  useEffect(() => {
    setMsgIndex(Math.floor(Math.random() * MESSAGES.length));
  }, []);
  
  // Typewriter effect
  useEffect(() => {
    const msg = MESSAGES[msgIndex];
    let i = 0;
    setTypedText('');
    setShowActions(false);
    const id = setInterval(() => {
      i++;
      setTypedText(msg.slice(0, i));
      if (i >= msg.length) {
        clearInterval(id);
        setTimeout(() => setShowActions(true), 400);
      }
    }, 45);
    return () => clearInterval(id);
  }, [msgIndex]);
  
  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, []);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0a0e14',
      color: '#00ff41',
      fontFamily: '"Press Start 2P", monospace',
      textAlign: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, rgba(0,255,65,0.03) 0px, transparent 1px, transparent 2px, rgba(0,255,65,0.03) 3px)',
        pointerEvents: 'none',
      }} />
      
      {/* CRT vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none',
      }} />
      
      {/* Lost NPC */}
      <div style={{
        fontSize: 64,
        marginBottom: 24,
        filter: 'drop-shadow(0 0 20px rgba(0,255,65,0.4))',
        animation: 'npcBob 2s ease-in-out infinite',
      }}>
        👻
      </div>
      
      {/* 404 with glitch */}
      <div style={{
        fontSize: 48,
        marginBottom: 8,
        textShadow: '0 0 20px rgba(0,255,65,0.8), 2px 2px 0 #ff0040, -2px -2px 0 #00d4ff',
        letterSpacing: 8,
      }}>
        <GlitchText text="404" interval={80} />
      </div>
      
      <div style={{
        fontSize: 10,
        color: '#00ff41',
        opacity: 0.5,
        letterSpacing: 4,
        marginBottom: 32,
        textTransform: 'uppercase',
      }}>
        Room Not Found
      </div>
      
      {/* RPG dialogue box */}
      <div style={{
        border: '3px solid #00ff41',
        borderRadius: 4,
        padding: '20px 28px',
        maxWidth: 500,
        width: '90%',
        background: 'rgba(0,20,0,0.8)',
        boxShadow: '0 0 30px rgba(0,255,65,0.1), inset 0 0 30px rgba(0,255,65,0.05)',
        position: 'relative',
      }}>
        {/* Dialogue box corner decorations */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
          <div key={pos} style={{
            position: 'absolute',
            width: 8,
            height: 8,
            background: '#00ff41',
            ...(pos.includes('top') ? { top: -1 } : { bottom: -1 }),
            ...(pos.includes('left') ? { left: -1 } : { right: -1 }),
          }} />
        ))}
        
        <p style={{
          fontSize: 11,
          lineHeight: 2.2,
          margin: 0,
          textAlign: 'left',
          minHeight: 50,
          textShadow: '0 0 8px rgba(0,255,65,0.5)',
        }}>
          {typedText}
          <span style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}>▊</span>
        </p>
      </div>
      
      {/* RPG-style action menu */}
      <div style={{
        marginTop: 24,
        opacity: showActions ? 1 : 0,
        transform: showActions ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.4s, transform 0.4s',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
      }}>
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#00ff41',
            textDecoration: 'none',
            fontSize: 11,
            padding: '8px 20px',
            border: '2px solid #00ff41',
            borderRadius: 2,
            background: 'rgba(0,255,65,0.05)',
            cursor: 'pointer',
            letterSpacing: 1,
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,255,65,0.15)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,65,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,255,65,0.05)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: 9 }}>▶</span>
          Return to Office
        </a>
        
        <a
          href="/demo"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#00ff41',
            textDecoration: 'none',
            fontSize: 11,
            padding: '8px 20px',
            border: '2px solid rgba(0,255,65,0.3)',
            borderRadius: 2,
            background: 'transparent',
            cursor: 'pointer',
            letterSpacing: 1,
            opacity: 0.7,
            transition: 'opacity 0.2s, background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.background = 'rgba(0,255,65,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: 9 }}>▶</span>
          Try Demo Mode
        </a>
      </div>
      
      {/* Subtle floor coordinate */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        fontSize: 8,
        color: '#00ff41',
        opacity: 0.25,
        letterSpacing: 3,
      }}>
        SECTOR ??-?? · FLOOR NULL
      </div>
      
      <style>{`
        @keyframes npcBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
