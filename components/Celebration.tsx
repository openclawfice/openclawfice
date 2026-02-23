'use client';

/**
 * XP Celebration Animation
 * Shows when an agent completes a task
 */
export function Celebration() {
  return (
    <div style={{
      position: 'absolute',
      top: -40,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      pointerEvents: 'none',
    }}>
      {/* XP Text */}
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 12,
        color: '#FFD700',
        textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
        animation: 'floatUp 1s ease-out forwards',
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}>
        +10 XP ✨
      </div>
      
      {/* Sparkles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 1,
        height: 1,
      }}>
        {['✨', '⭐', '✨', '⭐'].map((emoji, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              fontSize: 16,
              animation: `sparkle${i} 0.6s ease-out forwards`,
              willChange: 'transform, opacity',
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-25px) scale(1.2);
          }
        }

        @keyframes sparkle0 {
          0% { 
            opacity: 0; 
            transform: translate(0, 0) scale(0) rotate(0deg); 
          }
          20% { 
            opacity: 1; 
          }
          100% { 
            opacity: 0; 
            transform: translate(-20px, -15px) scale(1) rotate(-45deg); 
          }
        }

        @keyframes sparkle1 {
          0% { 
            opacity: 0; 
            transform: translate(0, 0) scale(0) rotate(0deg); 
          }
          20% { 
            opacity: 1; 
          }
          100% { 
            opacity: 0; 
            transform: translate(20px, -15px) scale(1) rotate(45deg); 
          }
        }

        @keyframes sparkle2 {
          0% { 
            opacity: 0; 
            transform: translate(0, 0) scale(0) rotate(0deg); 
          }
          20% { 
            opacity: 1; 
          }
          100% { 
            opacity: 0; 
            transform: translate(-15px, 15px) scale(1) rotate(-90deg); 
          }
        }

        @keyframes sparkle3 {
          0% { 
            opacity: 0; 
            transform: translate(0, 0) scale(0) rotate(0deg); 
          }
          20% { 
            opacity: 1; 
          }
          100% { 
            opacity: 0; 
            transform: translate(15px, 15px) scale(1) rotate(90deg); 
          }
        }
      `}</style>
    </div>
  );
}
