'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  char: string;
  color: string;
  size: number;
}

interface NPCParticlesProps {
  agentStatus: 'working' | 'idle';
  agentMood?: 'great' | 'good' | 'okay' | 'stressed';
  agentRole?: string;
  width: number;
  height: number;
}

/**
 * Animated particles that float around working NPCs.
 * Different particle types based on agent role:
 * - Developers: Code symbols (< > / { })
 * - Analysts: Chart/data symbols (▁ ▂ ▃ ▄)
 * - Designers: Design symbols (✦ ◆ ● ★)
 * - Default: Generic work symbols (• … —)
 */
export function NPCParticles({ agentStatus, agentMood, agentRole, width, height }: NPCParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Only show particles when working
    if (agentStatus !== 'working') {
      setParticles([]);
      return;
    }

    // Particle symbol sets by role
    const getParticleChars = (role?: string): string[] => {
      const roleLower = role?.toLowerCase() || '';
      
      if (roleLower.includes('dev') || roleLower.includes('engineer') || roleLower.includes('code')) {
        return ['<', '>', '/', '{', '}', '[', ']', '(', ')', ';'];
      }
      
      if (roleLower.includes('data') || roleLower.includes('analyst') || roleLower.includes('research')) {
        return ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', 'Σ', '%'];
      }
      
      if (roleLower.includes('design') || roleLower.includes('creative') || roleLower.includes('art')) {
        return ['✦', '◆', '●', '★', '◇', '○', '☆', '△', '✎'];
      }
      
      if (roleLower.includes('ops') || roleLower.includes('devops') || roleLower.includes('infra')) {
        return ['⚙', '⚡', '⬆', '⬇', '→', '←', '⟲', '⚠'];
      }
      
      // Default: generic work symbols
      return ['•', '…', '—', '·', '‧', '∙', '‒', '−'];
    };

    const particleChars = getParticleChars(agentRole);
    const roleLower = agentRole?.toLowerCase() || '';
    const colors = roleLower.includes('dev') || roleLower.includes('engineer') || roleLower.includes('code')
      ? ['#60a5fa', '#6366f1', '#818cf8']
      : roleLower.includes('data') || roleLower.includes('analyst') || roleLower.includes('research')
        ? ['#22c55e', '#10b981', '#84cc16']
        : roleLower.includes('design') || roleLower.includes('creative') || roleLower.includes('art')
          ? ['#f59e0b', '#ec4899', '#f97316']
          : ['#6366f1', '#8b5cf6', '#10b981'];

    const focusedBoost = agentStatus === 'working' && agentMood !== 'stressed';

    let particleId = 0;
    const createParticle = (): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.55 + Math.random() * 0.8) * (focusedBoost ? 1.15 : 1) * 0.3;
      
      return {
        id: particleId++,
        x: width / 2 + (Math.random() - 0.5) * width * 0.6,
        y: height / 2 + (Math.random() - 0.5) * height * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3, // Slight upward bias
        life: 0,
        maxLife: 14 + Math.random() * 10, // ~0.23-0.4 seconds at 60fps
        char: particleChars[Math.floor(Math.random() * particleChars.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 10.5 + Math.random() * 5.25,
      };
    };

    // Spawn initial particles
    const initialParticles: Particle[] = [];
    for (let i = 0; i < (focusedBoost ? 10 : 8); i++) {
      initialParticles.push(createParticle());
    }
    setParticles(initialParticles);

    // Animation loop
    const animate = () => {
      setParticles(prev => {
        // Update existing particles
        let updated = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life + 1,
        }));

        // Remove dead particles
        updated = updated.filter(p => p.life < p.maxLife);

        // Focused agents emit particles a bit more frequently.
        const spawnChance = focusedBoost ? 0.22 : 0.15;
        const maxParticles = focusedBoost ? 16 : 12;
        if (Math.random() < spawnChance && updated.length < maxParticles) {
          updated.push(createParticle());
        }

        return updated;
      });
    };

    const interval = setInterval(animate, 1000 / 60); // 60fps
    return () => clearInterval(interval);
  }, [agentStatus, agentMood, agentRole, width, height]);

  if (agentStatus !== 'working' || particles.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: '-12px',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {particles.map(p => {
        const opacity = 1 - (p.life / p.maxLife);
        const scale = 0.5 + (1 - p.life / p.maxLife) * 0.5;
        
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              fontSize: p.size,
              color: p.color,
              opacity: opacity * 0.6,
              transform: `translate(-50%, -50%) scale(${scale})`,
              fontFamily: '"Press Start 2P", monospace',
              textShadow: `0 0 ${p.size * 0.5}px ${p.color}`,
              transition: 'none',
            }}
          >
            {p.char}
          </div>
        );
      })}
    </div>
  );
}
