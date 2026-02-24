'use client';

import { useRef, useState, useCallback } from 'react';
import type { Agent, PendingAction, Accomplishment } from './types';

interface ShareCardProps {
  agents: Agent[];
  pendingActions: PendingAction[];
  accomplishments: Accomplishment[];
  isDemoMode: boolean;
  onClose: () => void;
}

/**
 * Generates a beautiful pixel-art themed share card image using canvas.
 * Users can download and share on Twitter/Discord/Reddit.
 */
export function ShareCard({ agents, pendingActions, accomplishments, isDemoMode, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const workingAgents = agents.filter(a => a.status === 'working');
  const idleAgents = agents.filter(a => a.status !== 'working');

  const generateCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setGenerating(true);

    const W = 1200;
    const H = 630;
    const dpr = 2;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Pixel grid overlay (subtle)
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = '#94a3b8';
    for (let x = 0; x < W; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Border with glow
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 20;
    roundRect(ctx, 8, 8, W - 16, H - 16, 16);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Title
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText('🏢 OPENCLAWFICE', W / 2, 70);

    // Subtitle
    ctx.font = '16px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(isDemoMode ? 'Demo Office — Try it at openclawfice.com' : 'My AI Agent Office', W / 2, 100);

    // Stats row
    const statsY = 140;
    const statsData = [
      { label: 'Agents', value: String(agents.length), color: '#8b5cf6' },
      { label: 'Working', value: String(workingAgents.length), color: '#10b981' },
      { label: 'Quests', value: String(pendingActions.length), color: '#f59e0b' },
      { label: 'Shipped', value: String(accomplishments.length), color: '#ec4899' },
    ];
    const statWidth = 160;
    const statsStartX = (W - statsData.length * statWidth) / 2;

    statsData.forEach((stat, i) => {
      const x = statsStartX + i * statWidth + statWidth / 2;
      
      // Stat card background
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      roundRect(ctx, x - 60, statsY, 120, 70, 8);
      ctx.fill();
      ctx.strokeStyle = stat.color + '40';
      ctx.lineWidth = 1;
      roundRect(ctx, x - 60, statsY, 120, 70, 8);
      ctx.stroke();

      // Value
      ctx.font = 'bold 28px system-ui';
      ctx.fillStyle = stat.color;
      ctx.textAlign = 'center';
      ctx.fillText(stat.value, x, statsY + 35);

      // Label
      ctx.font = '11px system-ui';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(stat.label, x, statsY + 55);
    });

    // Agent cards section
    const agentStartY = 240;
    ctx.textAlign = 'left';

    // Work Room header
    ctx.font = 'bold 14px system-ui';
    ctx.fillStyle = '#10b981';
    ctx.fillText('💼 WORK ROOM', 50, agentStartY);

    // Draw working agents
    workingAgents.slice(0, 4).forEach((agent, i) => {
      const x = 50 + i * 270;
      const y = agentStartY + 15;

      // Agent card
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      roundRect(ctx, x, y, 250, 60, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, 250, 60, 8);
      ctx.stroke();

      // Colored dot
      ctx.fillStyle = agent.color || '#10b981';
      ctx.beginPath();
      ctx.arc(x + 20, y + 25, 8, 0, Math.PI * 2);
      ctx.fill();

      // Status indicator
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(x + 20, y + 25, 3, 0, Math.PI * 2);
      ctx.fill();

      // Name
      ctx.font = 'bold 14px system-ui';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(agent.name || agent.id, x + 38, y + 22);

      // Task
      ctx.font = '11px system-ui';
      ctx.fillStyle = '#94a3b8';
      const task = agent.task ? truncate(agent.task, 30) : 'Working...';
      ctx.fillText(task, x + 38, y + 42);
    });

    // Lounge header
    const loungeY = agentStartY + 100;
    ctx.font = 'bold 14px system-ui';
    ctx.fillStyle = '#6366f1';
    ctx.fillText('☕ THE LOUNGE', 50, loungeY);

    // Draw idle agents
    idleAgents.slice(0, 4).forEach((agent, i) => {
      const x = 50 + i * 270;
      const y = loungeY + 15;

      ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
      roundRect(ctx, x, y, 250, 45, 8);
      ctx.fill();

      ctx.fillStyle = agent.color || '#6366f1';
      ctx.beginPath();
      ctx.arc(x + 16, y + 22, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '13px system-ui';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(agent.name || agent.id, x + 32, y + 27);
    });

    // Quest preview (right side)
    if (pendingActions.length > 0) {
      const qx = 680;
      const qy = agentStartY;
      ctx.font = 'bold 14px system-ui';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('⚔️ QUEST LOG', qx, qy);

      pendingActions.slice(0, 3).forEach((quest, i) => {
        const y = qy + 15 + i * 55;

        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
        roundRect(ctx, qx, y, 470, 45, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 1;
        roundRect(ctx, qx, y, 470, 45, 8);
        ctx.stroke();

        ctx.font = 'bold 12px system-ui';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(truncate(quest.title || 'Quest', 40), qx + 12, y + 20);

        ctx.font = '10px system-ui';
        ctx.fillStyle = '#94a3b8';
        const from = quest.from ? `from ${quest.from}` : '';
        const priority = quest.priority === 'high' ? '🔴 URGENT' : '';
        ctx.fillText(`${from} ${priority}`.trim(), qx + 12, y + 36);
      });
    }

    // Recent accomplishments
    if (accomplishments.length > 0) {
      const ax = 680;
      const ay = loungeY;
      ctx.font = 'bold 14px system-ui';
      ctx.fillStyle = '#ec4899';
      ctx.fillText(`🏆 RECENT (${accomplishments.length} total)`, ax, ay);

      accomplishments.slice(0, 2).forEach((acc, i) => {
        const y = ay + 15 + i * 45;

        ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';
        roundRect(ctx, ax, y, 470, 38, 8);
        ctx.fill();

        ctx.font = '12px system-ui';
        ctx.fillStyle = '#f9a8d4';
        ctx.fillText(`${acc.icon || '✅'} ${truncate(acc.title, 45)}`, ax + 12, y + 16);

        ctx.font = '10px system-ui';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(acc.who || '', ax + 12, y + 30);
      });
    }

    // Footer
    ctx.textAlign = 'center';
    ctx.font = '13px system-ui';
    ctx.fillStyle = '#64748b';
    ctx.fillText('openclawfice.com — Your AI agents, but they\'re Sims', W / 2, H - 30);

    ctx.font = '11px system-ui';
    ctx.fillStyle = '#475569';
    ctx.fillText('github.com/openclawfice/openclawfice · Open Source · MIT', W / 2, H - 12);

    // Convert to image
    const url = canvas.toDataURL('image/png');
    setImageUrl(url);
    setGenerating(false);
  }, [agents, workingAgents, idleAgents, pendingActions, accomplishments, isDemoMode]);

  // Auto-generate on mount
  const hasGenerated = useRef(false);
  if (!hasGenerated.current) {
    hasGenerated.current = true;
    setTimeout(generateCard, 100);
  }

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.download = 'my-openclawfice.png';
    link.href = imageUrl;
    link.click();
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvasRef.current!.toBlob((b) => resolve(b!), 'image/png')
      );
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: download
      handleDownload();
    }
  };

  const shareText = `My AI team office 🏢\n\n${agents.length} agents, ${workingAgents.length} working right now\n${pendingActions.length} quests queued, ${accomplishments.length} shipped\n\nLike The Sims meets AI ops — pixel art dashboard for your AI agents.\n\nTry it: openclawfice.com/demo\n\n#OpenClawfice #AIAgents #OpenClaw`;

  const handleTweetShare = () => {
    const text = encodeURIComponent(`My AI team office 🏢\n\n${agents.length} agents, ${workingAgents.length} working\n${accomplishments.length} things shipped\n\nLike The Sims but they ship code.\n\nopenclawfice.com/demo`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20,
    }}>
      <div style={{
        background: '#0f172a',
        border: '2px solid #334155',
        borderRadius: 16,
        maxWidth: 700,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{
          background: '#1e293b',
          padding: '16px 20px',
          borderBottom: '2px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '14px 14px 0 0',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}>
          <div>
            <div style={{
              fontSize: 14,
              fontFamily: '"Press Start 2P", monospace',
              color: '#e2e8f0',
              marginBottom: 6,
            }}>
              📸 Share Your Office
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Download your office card and share it everywhere
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#334155',
              border: '1px solid #475569',
              color: '#cbd5e1',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Canvas (hidden, used for generation) */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* Preview */}
        <div style={{ padding: 20 }}>
          {imageUrl ? (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Your OpenClawfice card"
                style={{
                  width: '100%',
                  borderRadius: 12,
                  border: '2px solid #334155',
                  marginBottom: 16,
                }}
              />

              {/* Action buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 16,
              }}>
                <button
                  onClick={handleDownload}
                  style={{
                    background: '#6366f1',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  💾 Download PNG
                </button>
                <button
                  onClick={handleCopyImage}
                  style={{
                    background: copied ? '#10b981' : '#334155',
                    border: '1px solid #475569',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'background 0.2s',
                  }}
                >
                  {copied ? '✅ Copied!' : '📋 Copy Image'}
                </button>
              </div>

              {/* Share to Twitter */}
              <button
                onClick={handleTweetShare}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #1d9bf0 0%, #1a8cd8 100%)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 10,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                🐦 Share on Twitter/X
              </button>

              {/* Share text */}
              <div style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: 12,
              }}>
                <div style={{
                  fontSize: 9,
                  color: '#64748b',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontFamily: '"Press Start 2P", monospace',
                }}>
                  Copy-paste caption
                </div>
                <div style={{
                  fontSize: 12,
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  {shareText}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareText);
                  }}
                  style={{
                    marginTop: 8,
                    background: '#334155',
                    border: '1px solid #475569',
                    color: '#cbd5e1',
                    borderRadius: 6,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  📋 Copy Text
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: 40,
              color: '#94a3b8',
            }}>
              {generating ? '🎨 Generating your office card...' : 'Loading...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helpers
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}
