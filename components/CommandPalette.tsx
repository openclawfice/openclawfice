'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Agent } from './types';

/**
 * Command Palette — retro RPG-styled quick action menu.
 * Open with Ctrl+K (or Cmd+K on Mac) or `/` key.
 * Think: game console meets IDE command palette.
 * Fuzzy-matches commands and agent names for fast navigation.
 */

export interface CommandAction {
  id: string;
  icon: string;
  label: string;
  shortcut?: string;
  category: 'navigate' | 'agent' | 'action' | 'settings' | 'fun';
  onSelect: () => void;
  keywords?: string[];  // Extra search terms
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  onToggleDarkMode?: () => void;
  onToggleSFX?: () => void;
  onToggleMusic?: () => void;
  musicPlaying?: boolean;
  onOpenSettings?: () => void;
  onOpenShare?: () => void;
  onCallMeeting?: () => void;
  onOpenTemplates?: () => void;
  isDarkMode?: boolean;
  sfxEnabled?: boolean;
  /** Additional custom commands */
  extraCommands?: CommandAction[];
}

// Simple fuzzy match — checks if query chars appear in order within target
function fuzzyMatch(query: string, target: string): { match: boolean; score: number } {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (q.length === 0) return { match: true, score: 0 };
  if (t.includes(q)) return { match: true, score: 100 - t.indexOf(q) }; // Exact substring = high score

  let qi = 0;
  let score = 0;
  let consecutive = 0;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      consecutive++;
      score += consecutive * 2; // Reward consecutive matches
    } else {
      consecutive = 0;
    }
  }

  return { match: qi === q.length, score };
}

export function CommandPalette({
  open,
  onClose,
  agents,
  onSelectAgent,
  onToggleDarkMode,
  onToggleSFX,
  onToggleMusic,
  musicPlaying,
  onOpenSettings,
  onOpenShare,
  onCallMeeting,
  onOpenTemplates,
  isDarkMode,
  sfxEnabled,
  extraCommands = [],
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build command list
  const commands: CommandAction[] = [
    // Navigation
    {
      id: 'nav-stats',
      icon: '📊',
      label: 'View Stats Dashboard',
      category: 'navigate',
      keywords: ['analytics', 'statistics', 'xp', 'leaderboard'],
      onSelect: () => { window.location.href = '/stats'; },
    },
    {
      id: 'nav-showcase',
      icon: '🌟',
      label: 'View Showcase',
      category: 'navigate',
      keywords: ['gallery', 'examples'],
      onSelect: () => { window.location.href = '/showcase'; },
    },
    {
      id: 'nav-install',
      icon: '📥',
      label: 'Install Instructions',
      category: 'navigate',
      keywords: ['setup', 'download', 'getting started'],
      onSelect: () => { window.location.href = '/install'; },
    },
    {
      id: 'nav-home',
      icon: '🏠',
      label: 'Go to Office',
      category: 'navigate',
      keywords: ['home', 'dashboard', 'main'],
      onSelect: () => { window.location.href = '/'; },
    },

    // Actions
    ...(onCallMeeting ? [{
      id: 'action-meeting',
      icon: '📞',
      label: 'Call a Meeting',
      category: 'action' as const,
      keywords: ['meeting', 'standup', 'discuss', 'team'],
      onSelect: () => { onCallMeeting(); },
    }] : []),
    ...(onOpenShare ? [{
      id: 'action-share',
      icon: '🔗',
      label: 'Share Office',
      shortcut: '',
      category: 'action' as const,
      keywords: ['share', 'link', 'twitter', 'social'],
      onSelect: () => { onOpenShare(); },
    }] : []),
    ...(onOpenTemplates ? [{
      id: 'action-templates',
      icon: '📋',
      label: 'Browse Quest Templates',
      category: 'action' as const,
      keywords: ['templates', 'quests', 'tasks', 'assign'],
      onSelect: () => { onOpenTemplates(); },
    }] : []),

    // Settings
    ...(onToggleDarkMode ? [{
      id: 'settings-theme',
      icon: isDarkMode ? '☀️' : '🌙',
      label: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      shortcut: '',
      category: 'settings' as const,
      keywords: ['theme', 'dark', 'light', 'mode', 'toggle'],
      onSelect: () => { onToggleDarkMode(); },
    }] : []),
    ...(onToggleSFX ? [{
      id: 'settings-sfx',
      icon: sfxEnabled ? '🔇' : '🔊',
      label: sfxEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects',
      category: 'settings' as const,
      keywords: ['sound', 'audio', 'sfx', 'mute', 'volume'],
      onSelect: () => { onToggleSFX(); },
    }] : []),
    ...(onToggleMusic ? [{
      id: 'settings-music',
      icon: musicPlaying ? '⏹️' : '🎵',
      label: musicPlaying ? 'Stop Background Music' : 'Play Chiptune Music',
      category: 'settings' as const,
      keywords: ['music', 'chiptune', '8-bit', 'lo-fi', 'background', 'soundtrack', 'audio'],
      onSelect: () => { onToggleMusic(); },
    }] : []),
    ...(onOpenSettings ? [{
      id: 'settings-open',
      icon: '⚙️',
      label: 'Open Settings',
      category: 'settings' as const,
      keywords: ['settings', 'config', 'preferences'],
      onSelect: () => { onOpenSettings(); },
    }] : []),

    // Agent commands
    ...agents.map(agent => ({
      id: `agent-${agent.id}`,
      icon: agent.emoji || '🤖',
      label: `${agent.name}${agent.role ? ` — ${agent.role}` : ''}`,
      category: 'agent' as const,
      keywords: [agent.id, agent.name.toLowerCase(), agent.status, agent.role || ''],
      onSelect: () => { onSelectAgent(agent); },
    })),

    // Fun / Easter eggs
    {
      id: 'fun-konami',
      icon: '🎮',
      label: 'Enter the Konami Code',
      category: 'fun',
      keywords: ['konami', 'cheat', 'easter egg', 'party', 'secret'],
      onSelect: () => {
        // Simulate the konami code sequence
        const keys = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        keys.forEach((key, i) => {
          setTimeout(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key }));
          }, i * 50);
        });
      },
    },

    // Extra commands from parent
    ...extraCommands,
  ];

  // Filter and sort
  const filtered = query.trim()
    ? commands
        .map(cmd => {
          const labelMatch = fuzzyMatch(query, cmd.label);
          const keywordScore = (cmd.keywords || []).reduce((best, kw) => {
            const m = fuzzyMatch(query, kw);
            return m.match && m.score > best ? m.score : best;
          }, 0);
          return {
            cmd,
            match: labelMatch.match || keywordScore > 0,
            score: Math.max(labelMatch.score, keywordScore),
          };
        })
        .filter(r => r.match)
        .sort((a, b) => b.score - a.score)
        .map(r => r.cmd)
    : commands;

  // Reset selection when query changes
  useEffect(() => { setSelectedIndex(0); }, [query]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[selectedIndex]) {
      (items[selectedIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].onSelect();
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filtered, selectedIndex, onClose]);

  if (!open) return null;

  // Group by category
  const categoryLabels: Record<string, string> = {
    navigate: '🗺️ NAVIGATE',
    agent: '👥 AGENTS',
    action: '⚡ ACTIONS',
    settings: '⚙️ SETTINGS',
    fun: '🎮 SECRETS',
  };

  const categoryOrder = ['action', 'navigate', 'agent', 'settings', 'fun'];

  // Build grouped list with separators
  type ListItem = { type: 'header'; label: string } | { type: 'command'; cmd: CommandAction; globalIndex: number };
  const listItems: ListItem[] = [];
  let globalIndex = 0;

  if (query.trim()) {
    // When searching, show flat list
    filtered.forEach((cmd) => {
      listItems.push({ type: 'command', cmd, globalIndex: globalIndex++ });
    });
  } else {
    // When browsing, show grouped
    for (const cat of categoryOrder) {
      const cmds = filtered.filter(c => c.category === cat);
      if (cmds.length === 0) continue;
      listItems.push({ type: 'header', label: categoryLabels[cat] || cat.toUpperCase() });
      cmds.forEach(cmd => {
        listItems.push({ type: 'command', cmd, globalIndex: globalIndex++ });
      });
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          animation: 'cmdBackdropIn 0.15s ease-out',
        }}
      />

      {/* Palette */}
      <div
        onKeyDown={handleKeyDown}
        style={{
          position: 'fixed',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 520,
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: '60vh',
          background: 'linear-gradient(180deg, #0f172a 0%, #0a0f1e 100%)',
          border: '2px solid #334155',
          borderRadius: 16,
          boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 40px rgba(99,102,241,0.1)',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'cmdPaletteIn 0.2s ease-out',
        }}
      >
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 16px',
          borderBottom: '1px solid #1e293b',
        }}>
          <span style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 10,
            color: '#6366f1',
          }}>
            {'>'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#e2e8f0',
              fontSize: 14,
              fontFamily: 'inherit',
              caretColor: '#6366f1',
            }}
          />
          <kbd style={{
            padding: '2px 6px',
            borderRadius: 4,
            border: '1px solid #334155',
            background: '#1e293b',
            color: '#64748b',
            fontSize: 9,
            fontFamily: '"Press Start 2P", monospace',
          }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          style={{
            overflowY: 'auto',
            padding: '4px 0',
            flex: 1,
          }}
        >
          {listItems.length === 0 && (
            <div style={{
              padding: '24px 16px',
              textAlign: 'center',
              color: '#475569',
              fontSize: 12,
            }}>
              <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>🔍</span>
              No commands found for "{query}"
            </div>
          )}

          {listItems.map((item, i) => {
            if (item.type === 'header') {
              return (
                <div key={`header-${item.label}`} style={{
                  padding: '8px 16px 4px',
                  fontSize: 8,
                  fontFamily: '"Press Start 2P", monospace',
                  color: '#475569',
                  letterSpacing: 1,
                  marginTop: i > 0 ? 4 : 0,
                }}>
                  {item.label}
                </div>
              );
            }

            const isSelected = item.globalIndex === selectedIndex;

            return (
              <div
                key={item.cmd.id}
                onClick={() => { item.cmd.onSelect(); onClose(); }}
                onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(99,102,241,0.12)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                  transition: 'background 0.1s, border-left-color 0.1s',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0, width: 22, textAlign: 'center' }}>
                  {item.cmd.icon}
                </span>
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  color: isSelected ? '#e2e8f0' : '#94a3b8',
                  fontWeight: isSelected ? 600 : 400,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {item.cmd.label}
                </span>
                {item.cmd.shortcut && (
                  <kbd style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #334155',
                    background: '#0f172a',
                    color: '#475569',
                    fontSize: 9,
                    fontFamily: 'monospace',
                    flexShrink: 0,
                  }}>
                    {item.cmd.shortcut}
                  </kbd>
                )}
                {item.cmd.category === 'agent' && (
                  <span style={{
                    fontSize: 8,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: agents.find(a => a.id === item.cmd.id.replace('agent-', ''))?.status === 'working'
                      ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                    color: agents.find(a => a.id === item.cmd.id.replace('agent-', ''))?.status === 'working'
                      ? '#10b981' : '#f59e0b',
                    fontFamily: '"Press Start 2P", monospace',
                    flexShrink: 0,
                  }}>
                    {agents.find(a => a.id === item.cmd.id.replace('agent-', ''))?.status === 'working' ? '⚡ ACTIVE' : '💤 IDLE'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
          borderTop: '1px solid #1e293b',
          fontSize: 9,
          color: '#475569',
        }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
          <span style={{ marginLeft: 'auto', fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#334155' }}>
            OPENCLAWFICE CONSOLE
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes cmdBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cmdPaletteIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
