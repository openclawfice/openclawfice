'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { Agent, Accomplishment } from './types';

/**
 * Pokemon/Trading Card-style agent card.
 * Generates a beautiful shareable image for a single agent.
 * Shows: name, role, level, XP, mood, skills, stats, recent work.
 * 
 * Designed to be screenshot-worthy and viral on social media.
 */

interface AgentCardProps {
  agent: Agent;
  accomplishments: Accomplishment[];
  onClose: () => void;
}

// Rarity based on level
function getRarity(level: number): { label: string; color: string; glow: string; gradient: string[] } {
  if (level >= 20) return {
    label: '✦ LEGENDARY',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.4)',
    gradient: ['#92400e', '#78350f', '#451a03'],
  };
  if (level >= 15) return {
    label: '◆ EPIC',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.4)',
    gradient: ['#3b0764', '#4c1d95', '#2e1065'],
  };
  if (level >= 10) return {
    label: '● RARE',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.3)',
    gradient: ['#1e3a8a', '#1e40af', '#172554'],
  };
  if (level >= 5) return {
    label: '○ UNCOMMON',
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.3)',
    gradient: ['#14532d', '#166534', '#052e16'],
  };
  return {
    label: '· COMMON',
    color: '#94a3b8',
    glow: 'rgba(148,163,184,0.2)',
    gradient: ['#1e293b', '#0f172a', '#020617'],
  };
}

// Mood to stars
function moodStars(mood: string): string {
  switch (mood) {
    case 'great': return '★★★★★';
    case 'good': return '★★★★☆';
    case 'okay': return '★★★☆☆';
    case 'stressed': return '★★☆☆☆';
    default: return '★★★☆☆';
  }
}

export function AgentCard({ agent, accomplishments, onClose }: AgentCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rarity = getRarity(agent.level);
  const agentAccomplishments = accomplishments.filter(a => 
    a.who?.toLowerCase() === agent.name?.toLowerCase()
  ).slice(0, 3);

  const xpToNextLevel = (agent.level + 1) * 500;
  const xpInLevel = agent.xp % 500;
  const xpPercent = Math.min(100, (xpInLevel / 500) * 100);

  const generateImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = 600;
    const H = 900;
    const dpr = 2;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, rarity.gradient[0]);
    bg.addColorStop(0.5, rarity.gradient[1]);
    bg.addColorStop(1, rarity.gradient[2]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Card border with rarity glow
    ctx.strokeStyle = rarity.color;
    ctx.lineWidth = 3;
    ctx.shadowColor = rarity.glow;
    ctx.shadowBlur = 20;
    roundRect(ctx, 16, 16, W - 32, H - 32, 16);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner card background
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    roundRect(ctx, 20, 20, W - 40, H - 40, 14);
    ctx.fill();

    // === HEADER ===
    // Rarity label
    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.fillStyle = rarity.color;
    ctx.textAlign = 'left';
    ctx.fillText(rarity.label, 40, 52);

    // Agent emoji (big)
    ctx.font = '64px serif';
    ctx.textAlign = 'center';
    ctx.fillText(agent.emoji || '🤖', W / 2, 140);

    // Name
    ctx.font = 'bold 28px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(agent.name.toUpperCase(), W / 2, 190);

    // Role
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = rarity.color;
    ctx.fillText(agent.role || 'Agent', W / 2, 215);

    // Divider line
    ctx.strokeStyle = rarity.color + '40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 235);
    ctx.lineTo(W - 60, 235);
    ctx.stroke();

    // === STATS SECTION ===
    const statsY = 265;

    // Level badge
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'left';
    ctx.fillText(`LV.${agent.level}`, 50, statsY);

    // XP bar
    const barX = 160;
    const barW = W - 210;
    const barH = 16;
    // Bar background
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roundRect(ctx, barX, statsY - 12, barW, barH, 4);
    ctx.fill();
    // Bar fill
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    fillGrad.addColorStop(0, '#6366f1');
    fillGrad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = fillGrad;
    roundRect(ctx, barX, statsY - 12, barW * (xpPercent / 100), barH, 4);
    ctx.fill();
    // XP text
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'right';
    ctx.fillText(`${agent.xp} XP`, W - 50, statsY);

    // Mood
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('MOOD', 50, statsY + 40);
    ctx.fillStyle = agent.mood === 'great' ? '#22c55e' : agent.mood === 'good' ? '#84cc16' : agent.mood === 'okay' ? '#eab308' : '#ef4444';
    ctx.textAlign = 'right';
    ctx.fillText(moodStars(agent.mood), W - 50, statsY + 40);

    // Status
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('STATUS', 50, statsY + 65);
    ctx.fillStyle = agent.status === 'working' ? '#10b981' : '#f59e0b';
    ctx.textAlign = 'right';
    ctx.fillText(agent.status === 'working' ? '⚡ WORKING' : '💤 IDLE', W - 50, statsY + 65);

    // === SKILLS ===
    const skillsY = statsY + 100;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = rarity.color;
    ctx.textAlign = 'left';
    ctx.fillText('— SKILLS —', 50, skillsY);

    agent.skills.forEach((skill, i) => {
      const y = skillsY + 30 + i * 28;
      // Skill name
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText(`${skill.icon} ${skill.name}`, 50, y);
      // Skill level bar
      const skBarX = 300;
      const skBarW = 180;
      const skBarH = 10;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRect(ctx, skBarX, y - 9, skBarW, skBarH, 3);
      ctx.fill();
      ctx.fillStyle = rarity.color + 'cc';
      roundRect(ctx, skBarX, y - 9, skBarW * (skill.level / 20), skBarH, 3);
      ctx.fill();
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'right';
      ctx.fillText(`Lv.${skill.level}`, W - 50, y);
    });

    // === RECENT WORK ===
    const workY = skillsY + 30 + agent.skills.length * 28 + 20;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = rarity.color;
    ctx.textAlign = 'left';
    ctx.fillText('— RECENT WORK —', 50, workY);

    if (agentAccomplishments.length > 0) {
      agentAccomplishments.forEach((acc, i) => {
        const y = workY + 28 + i * 24;
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'left';
        const text = `${acc.icon} ${acc.title}`;
        ctx.fillText(text.length > 50 ? text.slice(0, 47) + '...' : text, 50, y);
      });
    } else {
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'left';
      ctx.fillText('No recent accomplishments', 50, workY + 28);
    }

    // === FOOTER ===
    // Decorative bottom border
    ctx.strokeStyle = rarity.color + '30';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, H - 70);
    ctx.lineTo(W - 60, H - 70);
    ctx.stroke();

    // Footer text
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText('OPENCLAWFICE  ·  YOUR AI AGENTS BUT THEY\'RE SIMS', W / 2, H - 45);
    ctx.fillText('openclawfice.com', W / 2, H - 30);

    // Generate image URL
    const url = canvas.toDataURL('image/png');
    setImageUrl(url);
  }, [agent, rarity, xpPercent, agentAccomplishments]);

  useEffect(() => {
    generateImage();
  }, [generateImage]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${agent.name.toLowerCase()}-card.png`;
    a.click();
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob | null>(resolve =>
        canvasRef.current!.toBlob(resolve, 'image/png')
      );
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback: just download
      handleDownload();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 10000,
          animation: 'cardBackdropIn 0.2s ease-out',
        }}
      />

      {/* Card modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001,
        animation: 'cardModalIn 0.3s ease-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}>
        {/* Canvas preview */}
        <div style={{
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: `0 0 40px ${rarity.glow}, 0 20px 60px rgba(0,0,0,0.5)`,
          border: `2px solid ${rarity.color}44`,
          maxHeight: '70vh',
        }}>
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              maxHeight: '70vh',
              width: 'auto',
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleDownload}
            style={{
              background: rarity.color,
              border: 'none',
              color: '#000',
              borderRadius: 8,
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            💾 Download Card
          </button>
          <button
            onClick={handleCopy}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#e2e8f0',
              borderRadius: 8,
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {copied ? '✅ Copied!' : '📋 Copy Image'}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              borderRadius: 8,
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes cardBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cardModalIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9) rotateY(15deg);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotateY(0deg);
          }
        }
      `}</style>
    </>
  );
}

// Helper: rounded rectangle
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
