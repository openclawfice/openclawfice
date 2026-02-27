'use client';

import React, { useEffect, useState } from 'react';

export function ChatBubble({ 
  message, 
  agentColor,
  size = 1,
  onExpire 
}: { 
  message: string; 
  agentColor: string;
  size?: number;
  onExpire?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true); // Reset visibility when message changes
    const timer = setTimeout(() => {
      setIsVisible(false);
      onExpire?.();
    }, 8000); // Show for 8 seconds

    return () => clearTimeout(timer);
  }, [message, onExpire]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 8 * size,
      background: 'rgba(255, 255, 255, 0.98)',
      color: '#1a1a2e',
      padding: `${6 * size}px ${12 * size}px`,
      borderRadius: 12 * size,
      fontSize: Math.max(9 * size, 8), // Minimum 8px for readability
      maxWidth: 240 * size, // Increased from 180 to allow longer messages
      minWidth: 100 * size, // Prevent too-narrow bubbles
      textAlign: 'center',
      boxShadow: `0 ${4 * size}px ${16 * size}px rgba(0,0,0,0.3), 0 0 0 ${2 * size}px ${agentColor}40`,
      animation: 'chatBubbleAppear 0.3s ease-out',
      lineHeight: 1.4,
      wordBreak: 'break-word',
      fontWeight: 500,
      zIndex: 100,
      whiteSpace: 'normal', // Allow wrapping
    }}>
      {message}
      {/* Speech bubble tail */}
      <div style={{
        position: 'absolute',
        bottom: -6 * size,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: `${6 * size}px solid transparent`,
        borderRight: `${6 * size}px solid transparent`,
        borderTop: `${6 * size}px solid rgba(255, 255, 255, 0.98)`,
      }} />
    </div>
  );
}
