'use client';

import React, { useEffect, useState } from 'react';

export function ChatBubble({ 
  message, 
  agentColor,
  onExpire 
}: { 
  message: string; 
  agentColor: string;
  onExpire?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onExpire?.();
    }, 8000); // Show for 8 seconds

    return () => clearTimeout(timer);
  }, [onExpire]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 8,
      background: 'rgba(255, 255, 255, 0.98)',
      color: '#1a1a2e',
      padding: '6px 12px',
      borderRadius: 12,
      fontSize: 9,
      maxWidth: 180,
      textAlign: 'center',
      boxShadow: `0 4px 16px rgba(0,0,0,0.3), 0 0 0 2px ${agentColor}40`,
      animation: 'chatBubbleAppear 0.3s ease-out',
      lineHeight: 1.4,
      wordBreak: 'break-word',
      fontWeight: 500,
      zIndex: 10,
    }}>
      {message}
      {/* Speech bubble tail */}
      <div style={{
        position: 'absolute',
        bottom: -6,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '6px solid rgba(255, 255, 255, 0.98)',
      }} />
    </div>
  );
}
