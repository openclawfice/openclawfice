'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Shareable Agent Trading Card Page
 * 
 * URL: /card/cipher, /card/scout, etc.
 * Shows a full-screen trading card that's:
 * - Screenshot-worthy
 * - Shareable on social media
 * - Links to demo mode
 * 
 * In demo mode, uses mock data. In real mode, fetches from API.
 */

// Rarity tiers
function getRarity(level: number) {
  if (level >= 20) return { label: '✦ LEGENDARY', color: '#fbbf24', bg: '#451a03', glow: 'rgba(251,191,36,0.5)' };
  if (level >= 15) return { label: '◆ EPIC', color: '#a855f7', bg: '#2e1065', glow: 'rgba(168,85,247,0.5)' };
  if (level >= 10) return { label: '● RARE', color: '#3b82f6', bg: '#172554', glow: 'rgba(59,130,246,0.4)' };
  if (level >= 5) return { label: '○ UNCOMMON', color: '#22c55e', bg: '#052e16', glow: 'rgba(34,197,94,0.4)' };
  return { label: '· COMMON', color: '#94a3b8', bg: '#020617', glow: 'rgba(148,163,184,0.2)' };
}

const DEMO_AGENTS: Record<string, any> = {
  cipher: { name: 'Cipher', role: 'Lead Engineer', emoji: '⚡', level: 18, xp: 4500, mood: 'great', status: 'working', skills: ['Architecture', 'Full-Stack', 'Security', 'DevOps'], recentWork: ['Trading cards feature', 'Command palette', 'Chiptune engine'] },
  scout: { name: 'Scout', role: 'Outreach Lead', emoji: '🔍', level: 14, xp: 3200, mood: 'good', status: 'working', skills: ['Research', 'Outreach', 'Negotiation', 'Analytics'], recentWork: ['Creator pipeline', 'Email campaigns', 'Stats dashboard'] },
  pixel: { name: 'Pixel', role: 'UI Designer', emoji: '🎨', level: 11, xp: 2100, mood: 'good', status: 'idle', skills: ['Design', 'Animation', 'UX', 'Documentation'], recentWork: ['Onboarding docs', 'Activity heatmap', 'YouTube script'] },
  forge: { name: 'Forge', role: 'Backend Dev', emoji: '🔧', level: 12, xp: 2400, mood: 'okay', status: 'idle', skills: ['APIs', 'Database', 'Infrastructure', 'Testing'], recentWork: ['Dark mode toggle', 'Twitter share', 'Konami code'] },
  nova: { name: 'Nova', role: 'Product Lead', emoji: '✨', level: 13, xp: 2800, mood: 'great', status: 'working', skills: ['Strategy', 'Launch', 'Analytics', 'Growth'], recentWork: ['Launch checklist', 'Recording fix', 'Week 2 roadmap'] },
};

function moodStars(mood: string): string {
  switch (mood) {
    case 'great': return '★★★★★';
    case 'good': return '★★★★☆';
    case 'okay': return '★★★☆☆';
    case 'stressed': return '★★☆☆☆';
    default: return '★★★☆☆';
  }
}

export default function CardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const name = (params?.name as string || '').toLowerCase();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [agent, setAgent] = useState<any>(null);

  useEffect(() => {
    // Try demo data first, then fetch from API
    if (DEMO_AGENTS[name]) {
      setAgent(DEMO_AGENTS[name]);
    } else {
      // Try fetching from local API
      fetch('/api/office/agents')
        .then(r => r.json())
        .then(agents => {
          const found = agents.find((a: any) => a.name?.toLowerCase() === name || a.id?.toLowerCase() === name);
          if (found) setAgent(found);
          else setAgent({ name: name.charAt(0).toUpperCase() + name.slice(1), role: 'Agent', emoji: '🤖', level: 1, xp: 0, mood: 'okay', status: 'idle', skills: [], recentWork: [] });
        })
        .catch(() => {
          setAgent({ name: name.charAt(0).toUpperCase() + name.slice(1), role: 'Agent', emoji: '🤖', level: 1, xp: 0, mood: 'okay', status: 'idle', skills: [], recentWork: [] });
        });
    }
  }, [name]);

  const generateImage = useCallback(() => {
    if (!agent || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 600, H = 800;
    canvas.width = W;
    canvas.height = H;
    const rarity = getRarity(agent.level);

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(0.5, rarity.bg);
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Border glow
    ctx.shadowColor = rarity.glow;
    ctx.shadowBlur = 30;
    ctx.strokeStyle = rarity.color;
    ctx.lineWidth = 3;
    ctx.roundRect(20, 20, W - 40, H - 40, 16);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner card bg
    ctx.fillStyle = 'rgba(15,23,42,0.8)';
    ctx.roundRect(30, 30, W - 60, H - 60, 12);
    ctx.fill();

    // Rarity badge
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.fillStyle = rarity.color;
    ctx.textAlign = 'center';
    ctx.fillText(rarity.label, W / 2, 65);

    // Emoji avatar (large)
    ctx.font = '80px serif';
    ctx.textAlign = 'center';
    ctx.fillText(agent.emoji, W / 2, 170);

    // Name
    ctx.font = 'bold 28px "Press Start 2P", monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(agent.name.toUpperCase(), W / 2, 220);

    // Role
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = rarity.color;
    ctx.fillText(agent.role, W / 2, 248);

    // Level + XP bar
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`LVL ${agent.level}  ·  ${agent.xp} XP`, W / 2, 285);

    // XP bar
    const barW = 300, barH = 12, barX = (W - barW) / 2, barY = 298;
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(barX, barY, barW, barH, 6);
    ctx.fill();
    const xpPct = Math.min(1, (agent.xp % 500) / 500);
    if (xpPct > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barW * xpPct, 0);
      grad.addColorStop(0, rarity.color);
      grad.addColorStop(1, rarity.glow);
      ctx.fillStyle = grad;
      ctx.roundRect(barX, barY, barW * xpPct, barH, 6);
      ctx.fill();
    }

    // Mood
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(moodStars(agent.mood), W / 2, 340);
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('MORALE', W / 2, 358);

    // Divider
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 375);
    ctx.lineTo(W - 60, 375);
    ctx.stroke();

    // Skills
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText('SKILLS', 60, 400);

    const skills = agent.skills?.slice(0, 4) || [];
    skills.forEach((skill: string, i: number) => {
      const col = i % 2 === 0 ? 60 : W / 2 + 10;
      const row = 420 + Math.floor(i / 2) * 28;
      ctx.fillStyle = 'rgba(99,102,241,0.15)';
      ctx.roundRect(col, row - 14, 220, 22, 4);
      ctx.fill();
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText(`◆ ${skill}`, col + 8, row);
    });

    // Recent work
    const workY = 490;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('RECENT QUESTS', 60, workY);

    const work = agent.recentWork?.slice(0, 3) || [];
    work.forEach((item: string, i: number) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px "Press Start 2P", monospace';
      const text = item.length > 35 ? item.slice(0, 32) + '...' : item;
      ctx.fillText(`▸ ${text}`, 70, workY + 25 + i * 24);
    });

    // Status badge
    const statusY = 620;
    const isWorking = agent.status === 'working';
    ctx.fillStyle = isWorking ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)';
    ctx.roundRect(W / 2 - 80, statusY, 160, 30, 8);
    ctx.fill();
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = isWorking ? '#22c55e' : '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText(isWorking ? '⚡ WORKING' : '💤 CHILLING', W / 2, statusY + 20);

    // Footer
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText('openclawfice.com', W / 2, H - 55);
    ctx.fillStyle = '#334155';
    ctx.fillText('YOUR AI AGENTS, BUT THEY\'RE SIMS', W / 2, H - 38);

    setImageUrl(canvas.toDataURL('image/png'));
  }, [agent]);

  useEffect(() => {
    if (!agent) return;
    // Ensure font is loaded before rendering canvas
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Use document.fonts API to wait for font
    if (document.fonts && document.fonts.load) {
      document.fonts.load('12px "Press Start 2P"').then(() => {
        generateImage();
      }).catch(() => {
        // Fallback: wait a bit then render anyway
        setTimeout(generateImage, 500);
      });
    } else {
      // Fallback for older browsers
      setTimeout(generateImage, 500);
    }
  }, [agent, generateImage]);

  const copyImage = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob>((res) => canvasRef.current!.toBlob(b => res(b!), 'image/png'));
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback: download */ downloadImage(); }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${agent?.name?.toLowerCase() || 'agent'}-card.png`;
    a.click();
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const tweetText = agent ? `Check out ${agent.name}'s trading card! ${agent.emoji} Level ${agent.level} ${getRarity(agent.level).label}\n\n${shareUrl}` : '';

  if (!agent) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Press Start 2P", monospace' }}>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading card...</div>
      </div>
    );
  }

  const rarity = getRarity(agent.level);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '"Press Start 2P", monospace',
    }}>
      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Card display */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`${agent.name} trading card`}
          style={{
            maxWidth: '100%',
            width: 400,
            borderRadius: 16,
            boxShadow: `0 0 60px ${rarity.glow}`,
          }}
        />
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={copyImage} style={btnStyle(rarity.color)}>
          {copied ? '✅ Copied!' : '📋 Copy Image'}
        </button>
        <button onClick={downloadImage} style={btnStyle(rarity.color)}>
          💾 Download
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...btnStyle('#1da1f2'), textDecoration: 'none' }}
        >
          🐦 Share on X
        </a>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <a
          href="/?demo=true"
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            background: `linear-gradient(135deg, ${rarity.color}, ${rarity.glow})`,
            color: '#0f172a',
            borderRadius: 8,
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 11,
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          🏢 Try the Demo →
        </a>
        <div style={{ color: '#475569', fontSize: 8, marginTop: 12 }}>
          openclawfice.com — your AI agents, but they&apos;re Sims
        </div>
      </div>
    </div>
    </>
  );
}

function btnStyle(accentColor: string): React.CSSProperties {
  return {
    padding: '10px 18px',
    background: 'rgba(30,41,59,0.8)',
    border: `1px solid ${accentColor}40`,
    borderRadius: 8,
    color: '#e2e8f0',
    fontFamily: '"Press Start 2P", monospace',
    fontSize: 9,
    cursor: 'pointer',
  };
}
