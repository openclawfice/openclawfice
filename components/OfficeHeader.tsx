'use client';

import React, { useState, useEffect } from 'react';
import type { Agent, PendingAction, Accomplishment } from './types';

interface OfficeHeaderProps {
  agents: Agent[];
  pendingActions: PendingAction[];
  accomplishments: Accomplishment[];
  working: Agent[];
  idle: Agent[];
  theme: any;
  isMobile: boolean;
  sfx: any;
  githubStars: number | null;
  onCallMeeting: () => void;
  onShareScreenshot: () => void;
  onShareWorkflow: () => void;
  onShowTemplates: () => void;
  onShowSettings: () => void;
  onToggleMusic: () => void;
  musicPlaying: boolean;
}

function Clock({ color }: { color: string }) {
  const [timeLabel, setTimeLabel] = useState('--:--');
  useEffect(() => {
    const format = () =>
      new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/New_York',
      });
    setTimeLabel(format());
    const i = setInterval(() => setTimeLabel(format()), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color }}>
      {timeLabel}
    </div>
  );
}

function Stat({ icon, n }: { icon: string; n: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
      <span>{icon}</span>
      <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9 }}>{n}</span>
    </div>
  );
}

export function OfficeHeader({
  agents,
  pendingActions,
  accomplishments,
  working,
  idle,
  theme,
  isMobile,
  sfx,
  githubStars,
  onCallMeeting,
  onShareScreenshot,
  onShareWorkflow,
  onShowTemplates,
  onShowSettings,
  onToggleMusic,
  musicPlaying,
}: OfficeHeaderProps) {
  const headerFontSize = isMobile ? 11 : 14;

  const handleTweet = () => {
    sfx.play('click');
    const topAgent = [...agents].filter(a => a.id !== '_owner').sort((a, b) => (b.level || 0) - (a.level || 0))[0];
    const totalAccomp = accomplishments.length;
    const topLevel = topAgent ? `Top agent: ${topAgent.name} (Lvl ${topAgent.level})` : '';
    const statLine = `${agents.filter(a => a.id !== '_owner').length} agents, ${totalAccomp} accomplishments${topLevel ? '. ' + topLevel : ''}`;
    const tweetText = encodeURIComponent(`My AI team just leveled up 🏢\n\n${statLine}\n\nOpenClawfice — your AI agents, but they're Sims`);
    const tweetUrl = encodeURIComponent('https://openclawfice.com/?demo=true');
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank', 'width=550,height=420');
  };

  return (
    <div style={{
      background: theme.bgSecondary,
      borderBottom: `2px solid ${theme.border}`,
      padding: '6px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    }}>
      {/* Left side: Logo + agent count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 6 : 10,
      }}>
        <span style={{ fontSize: isMobile ? 18 : 22 }}>🏢</span>
        <h1 style={{
          margin: 0,
          fontSize: headerFontSize,
          fontFamily: '"Press Start 2P", monospace',
        }}>
          {isMobile ? 'OCF' : 'OPENCLAWFICE'}
        </h1>
        <span style={{
          fontSize: isMobile ? 8 : 10,
          color: theme.textMuted,
          marginLeft: isMobile ? 4 : 8,
        }}>
          {agents.length} {isMobile ? 'ag' : 'agents'}
        </span>
      </div>

      {/* Right side: Stats + buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <Stat icon="🟢" n={working.length} />
        <Stat icon="☕" n={idle.length} />
        {pendingActions.length > 0 && <Stat icon="⚔️" n={pendingActions.length} />}
        <Clock color={theme.textDim} />

        {/* Call meeting */}
        <button
          onClick={() => { sfx.play('open'); onCallMeeting(); }}
          style={{
            background: 'none',
            border: 'none',
            color: theme.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            padding: '2px 4px',
          }}
          title="Call Meeting"
        >
          📞
        </button>

        {/* Leaderboard */}
        <a
          href="/leaderboard"
          style={{
            background: 'none',
            border: 'none',
            color: theme.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            padding: '2px 4px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
          title="Leaderboard"
        >
          🏆
        </a>

        {/* Stats */}
        <a
          href="/stats"
          style={{
            background: 'none',
            border: 'none',
            color: theme.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            padding: '2px 4px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
          title="Office Stats"
        >
          📊
        </a>

        {/* Share screenshot */}
        <button
          onClick={onShareScreenshot}
          style={{
            background: 'none',
            border: 'none',
            color: theme.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            padding: '2px 4px',
          }}
          title="Share Screenshot"
        >
          📸
        </button>

        {/* Share workflow */}
        <button
          onClick={() => {
            sfx.play('click');
            onShareWorkflow();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: theme.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            padding: '2px 4px',
          }}
          title="Share Workflow"
        >
          📤
        </button>

        {/* Tweet */}
        <button
          onClick={handleTweet}
          style={{
            background: 'rgba(29,161,242,0.1)',
            border: '1px solid rgba(29,161,242,0.2)',
            borderRadius: 6,
            color: '#1da1f2',
            cursor: 'pointer',
            fontSize: 14,
            padding: '4px 8px',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Share on Twitter/X"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(29,161,242,0.2)';
            e.currentTarget.style.borderColor = 'rgba(29,161,242,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(29,161,242,0.1)';
            e.currentTarget.style.borderColor = 'rgba(29,161,242,0.2)';
          }}
        >
          𝕏
        </button>

        {/* Viral templates */}
        <a
          href="/viral-templates.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'none',
            border: 'none',
            color: theme.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            padding: '2px 4px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
          title="Viral Post Templates"
        >
          📝
        </a>

        {/* GitHub stars */}
        <a
          href="https://github.com/openclawfice/openclawfice"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sfx.play('click')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 6,
            padding: '4px 8px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Star on GitHub"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
          }}
        >
          <span style={{ fontSize: 12 }}>⭐</span>
          {githubStars !== null && (
            <span style={{
              fontSize: 9,
              fontFamily: '"Press Start 2P", monospace',
              color: '#a5b4fc',
            }}>
              {githubStars}
            </span>
          )}
        </a>

        {/* Templates */}
        <button
          onClick={() => { sfx.play('click'); onShowTemplates(); }}
          style={{
            background: 'none',
            border: 'none',
            color: theme.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            padding: '2px 4px',
          }}
          title="Template Gallery"
        >
          🎨
        </button>

        {/* Music toggle */}
        <button
          onClick={() => { sfx.play('click'); onToggleMusic(); }}
          style={{
            background: 'none',
            border: 'none',
            color: theme.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            padding: '2px 4px',
          }}
          title={musicPlaying ? 'Stop Music' : 'Play Music'}
        >
          {musicPlaying ? '🔇' : '🎵'}
        </button>

        {/* Settings */}
        <button
          onClick={() => { sfx.play('click'); onShowSettings(); }}
          style={{
            background: 'none',
            border: 'none',
            color: theme.textMuted,
            cursor: 'pointer',
            fontSize: 14,
            padding: '2px 4px',
          }}
          title="Settings"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}
