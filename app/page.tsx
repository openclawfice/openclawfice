'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDemoMode } from '../hooks/useDemoMode';
import { useRetroSFX } from '../hooks/useRetroSFX';
import type { Agent, AgentStatus, Mood, PendingAction, Accomplishment, ChatMessage } from '../components/types';
import { randomColor, generateAgentDefaults, prettifyTask, formatInterval } from '../components/utils';
import { NPC } from '../components/NPC';
import { Room } from '../components/Room';
import { AgentPanel } from '../components/AgentPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { CooldownTimer, linkifyFiles, Stat } from '../components/CooldownTimer';
import { TemplateGallery } from '../components/TemplateGallery';
import { DemoBanner } from '../components/DemoBanner';
import { ShareCard } from '../components/ShareCard';
import { Celebration } from '../components/Celebration';
import { AchievementToastContainer, AchievementToastData } from '../components/AchievementToast';
import { DemoTour } from '../components/DemoTour';

export default function HomePage() {
  const { isDemoMode, getApiPath } = useDemoMode();
  const sfx = useRetroSFX();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [time, setTime] = useState(new Date());
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [selectedAccomplishment, setSelectedAccomplishment] = useState<Accomplishment | null>(null);
  const [archivedAccomplishments, setArchivedAccomplishments] = useState<Accomplishment[]>([]);
  const [archiveTotal, setArchiveTotal] = useState(0);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [activeThought, setActiveThought] = useState<{ agentId: string; text: string } | null>(null);
  const [lastSeenChatCount, setLastSeenChatCount] = useState(0);
  const [nextChatIn, setNextChatIn] = useState(0);
  const chatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatTargetRef = useRef(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const [groupMessage, setGroupMessage] = useState('');
  const [sendingGroup, setSendingGroup] = useState(false);
  const [groupSent, setGroupSent] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [celebrations, setCelebrations] = useState<{ agentId: string; timestamp: number }[]>([]);
  const [achievementToasts, setAchievementToasts] = useState<AchievementToastData[]>([]);
  const lastAccomplishmentCheck = useRef(0);
  const [showCallMeeting, setShowCallMeeting] = useState(false);
  const [meetingTopic, setMeetingTopic] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [meeting, setMeeting] = useState<{
    active: boolean;
    topic?: string;
    participants?: string[];
    currentRound?: number;
    maxRounds?: number;
    startedAt?: number;
    lastMessage?: string;
    transcript?: { agent: string; message: string; round: number; timestamp: number }[];
  }>({ active: false });
  const [config, setConfig] = useState<any>({});
  const [autoworkPolicies, setAutoworkPolicies] = useState<Record<string, { enabled: boolean; intervalMs: number; directive: string; lastSentAt: number }>>({});
  const [pendingAutowork, setPendingAutowork] = useState<Record<string, Partial<{ enabled: boolean; intervalMs: number; directive: string }>>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('openclawfice-sfx') === 'on' : false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Detect screen size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(getApiPath('/api/office/config'));
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Listen for demo triggers (from isolated recording script)
  useEffect(() => {
    const handleDemoTrigger = (event: MessageEvent) => {
      if (event.data?.type === 'demo_trigger') {
        const { action, agent, amount, agents: meetingAgents, topic } = event.data;
        
        switch (action) {
          case 'xp':
            // Trigger XP celebration
            if (agent) {
              setCelebrations(prev => [...prev, { agentId: agent, timestamp: Date.now() }]);
              sfx.play('achievement');
            }
            break;
          
          case 'meeting':
            // Show meeting room
            setMeeting({
              active: true,
              topic: topic || 'Demo Meeting',
              participants: meetingAgents || ['Cipher', 'Nova'],
              currentRound: 1,
              maxRounds: 3,
              startedAt: Date.now(),
            });
            break;
          
          case 'quest':
            // Open first pending action if available
            if (pendingActions.length > 0) {
              setExpandedAction(pendingActions[0].id);
            }
            break;
          
          case 'accomplishment':
            // Highlight accomplishments feed (scroll handled by CSS)
            if (accomplishments.length > 0) {
              setSelectedAccomplishment(accomplishments[0]);
            }
            break;
          
          case 'watercooler':
            // Scroll to chat (handled by ref)
            chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
        }
      }
    };
    
    window.addEventListener('message', handleDemoTrigger);
    return () => window.removeEventListener('message', handleDemoTrigger);
  }, [pendingActions, accomplishments, sfx]);

  // Load autowork policies every 15s
  useEffect(() => {
    const fetchAutowork = async () => {
      try {
        const res = await fetch(getApiPath('/api/office/autowork'));
        if (res.ok) {
          const data = await res.json();
          setAutoworkPolicies(data.policies || {});
        }
      } catch {}
    };
    fetchAutowork();
    const i = setInterval(fetchAutowork, 15_000);
    return () => clearInterval(i);
  }, []);

  // Auto-work tick: trigger sends for agents whose timer has elapsed
  useEffect(() => {
    const tick = async () => {
      const hasEnabled = Object.values(autoworkPolicies).some(p => p.enabled);
      if (!hasEnabled) return;
      try {
        const res = await fetch('/api/office/autowork', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.sent?.length > 0) {
            const polRes = await fetch(getApiPath('/api/office/autowork'));
            if (polRes.ok) {
              const polData = await polRes.json();
              setAutoworkPolicies(polData.policies || {});
            }
          }
        }
      } catch {}
    };
    const i = setInterval(tick, 15_000);
    return () => clearInterval(i);
  }, [autoworkPolicies]);

  // Poll API for live status every 3s
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(getApiPath('/api/office'));
        const data = await res.json();
        if (data.agents) {
          setAgents(prev => {
            const updated = data.agents.map((a: any) => {
              const defaults = generateAgentDefaults(a.id);
              const old = prev.find(p => p.id === a.id);
              return {
                ...a,
                color: a.color || old?.color || randomColor(a.id),
                mood: (a.mood || 'good') as Mood,
                needs: old?.needs || defaults.needs,
                skills: a.skills || defaults.skills,
                xp: a.xp || defaults.xp,
                level: a.level || defaults.level,
              };
            });
            return updated;
          });
        }
        // Update activity log if present
        if (data.activityLog && data.activityLog.length > 0) {
          setActivityLog(data.activityLog);
        }
      } catch (err) {
        console.error('Failed to fetch agent status:', err);
      }
    };
    fetchStatus();
    const i = setInterval(fetchStatus, 3000);
    return () => clearInterval(i);
  }, []);

  // Poll meeting status every 3s
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await fetch(getApiPath('/api/office/meeting'));
        const data = await res.json();
        setMeeting(data);
      } catch (err) {
        console.error('Failed to fetch meeting status:', err);
      }
    };
    fetchMeeting();
    const i = setInterval(fetchMeeting, 3000);
    return () => clearInterval(i);
  }, [getApiPath]);

  // Poll actions/accomplishments every 5s
  useEffect(() => {
    const fetchActions = async () => {
      try {
        const res = await fetch(getApiPath('/api/office/actions'));
        const data = await res.json();
        if (data.actions) setPendingActions(data.actions);
        if (data.accomplishments) setAccomplishments(data.accomplishments);
      } catch {}
      try {
        const ar = await fetch(getApiPath('/api/office/actions') + '?archiveOffset=0&limit=0');
        const ad = await ar.json();
        if (typeof ad.archiveTotal === 'number') setArchiveTotal(ad.archiveTotal);
      } catch {}
    };
    fetchActions();
    const i = setInterval(fetchActions, 5000);
    return () => clearInterval(i);
  }, []);

  // Celebrate new accomplishments
  useEffect(() => {
    // On first load, just record the high-water mark — don't celebrate old ones
    if (lastAccomplishmentCheck.current === 0 && accomplishments.length > 0) {
      const maxTs = Math.max(...accomplishments.map(a => a.timestamp || 0));
      lastAccomplishmentCheck.current = maxTs;
      return;
    }

    let playedSound = false;
    accomplishments.forEach(acc => {
      if (acc.timestamp > lastAccomplishmentCheck.current) {
        // New accomplishment! Trigger celebration
        if (!playedSound) {
          sfx.play('achievement', 2000);
          playedSound = true;
        }
        const agent = agents.find(a => a.name === acc.who);
        if (agent) {
          setCelebrations(prev => [...prev, {
            agentId: agent.id,
            timestamp: Date.now(),
          }]);
          
          // Auto-remove after 1.5 seconds
          setTimeout(() => {
            setCelebrations(prev => 
              prev.filter(c => c.agentId !== agent.id || Date.now() - c.timestamp > 1500)
            );
          }, 1500);

          // Show achievement toast notification
          const XP_AMOUNTS = [5, 10, 10, 15, 20, 25, 10, 10, 10, 50];
          setAchievementToasts(prev => [...prev.slice(-4), {
            id: `${agent.id}-${acc.timestamp}`,
            agentName: agent.name,
            agentColor: agent.color || '#6366f1',
            icon: acc.icon || '⭐',
            title: acc.title || 'Task completed',
            xp: XP_AMOUNTS[Math.floor(Math.random() * XP_AMOUNTS.length)],
          }]);
        }
      }
    });
    
    // Update high-water mark to the max timestamp seen
    if (accomplishments.length > 0) {
      const maxTs = Math.max(...accomplishments.map(a => a.timestamp || 0));
      if (maxTs > lastAccomplishmentCheck.current) {
        lastAccomplishmentCheck.current = maxTs;
      }
    }
  }, [accomplishments, agents]);

  // Keep a ref to agents for demo celebrations (avoids effect reset on every poll)
  const agentsRef = useRef(agents);
  agentsRef.current = agents;

  // Demo mode: trigger random celebrations periodically for visual delight
  useEffect(() => {
    if (!isDemoMode) return;
    const DEMO_TASKS = [
      'Shipped dashboard refactor',
      'Fixed auth module bug',
      'Deployed to staging',
      'Optimized database queries',
      'Wrote integration tests',
      'Updated API documentation',
      'Reviewed pull request',
      'Refactored login flow',
    ];
    const DEMO_ICONS = ['🚀', '🐛', '✅', '⚡', '📝', '🔧', '💡', '🎯'];
    const XP_AMOUNTS = [5, 10, 10, 15, 20, 25, 10, 10, 10, 50];
    const triggerRandomCelebration = () => {
      const currentAgents = agentsRef.current;
      if (currentAgents.length === 0) return;
      const randomAgent = currentAgents[Math.floor(Math.random() * currentAgents.length)];
      if (!randomAgent) return;
      setCelebrations(prev => {
        if (prev.length >= 2) return prev;
        return [...prev, { agentId: randomAgent.id, timestamp: Date.now() }];
      });
      setTimeout(() => {
        setCelebrations(prev =>
          prev.filter(c => c.agentId !== randomAgent.id || Date.now() - c.timestamp > 1500)
        );
      }, 1500);
      // Also show achievement toast in demo mode
      const idx = Math.floor(Math.random() * DEMO_TASKS.length);
      setAchievementToasts(prev => [...prev.slice(-4), {
        id: `demo-${randomAgent.id}-${Date.now()}`,
        agentName: randomAgent.name,
        agentColor: randomAgent.color || '#6366f1',
        icon: DEMO_ICONS[idx],
        title: DEMO_TASKS[idx],
        xp: XP_AMOUNTS[Math.floor(Math.random() * XP_AMOUNTS.length)],
      }]);
    };
    // First one after 8 seconds, then every 12-20 seconds
    const firstTimeout = setTimeout(triggerRandomCelebration, 8000);
    const interval = setInterval(triggerRandomCelebration, 15000);
    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [isDemoMode]);

  // Demo mode: ambient thought bubbles for NPC liveliness
  useEffect(() => {
    if (!isDemoMode) return;
    const AMBIENT_THOUGHTS: Record<string, string[]> = {
      nova: ['📊 Velocity looking good...', '🤔 Should we pivot?', '☕ Need more coffee', '📋 Sprint goal on track!', '💡 New feature idea...'],
      forge: ['🔧 This bug is sneaky...', '💻 Clean code = happy code', '⚡ Optimizing...', '🤓 Stack trace says...', '🎯 Almost got it!'],
      lens: ['🐛 Found another edge case', '✅ Tests passing!', '🔍 Investigating...', '🧪 Need more test data', '📝 Filing a ticket'],
      pixel: ['🎨 These colors pop!', '✨ Pixel perfect!', '🖌️ Needs more contrast', '💜 Love this palette', '🤩 This animation is 🔥'],
      cipher: ['🚀 Deploy looks clean', '📊 Metrics are healthy', '🔒 Security check done', '⚡ Response time: 42ms', '🛡️ All systems nominal'],
    };
    const triggerThought = () => {
      const currentAgents = agentsRef.current;
      if (currentAgents.length === 0) return;
      const agent = currentAgents[Math.floor(Math.random() * currentAgents.length)];
      if (!agent) return;
      const thoughts = AMBIENT_THOUGHTS[agent.id] || AMBIENT_THOUGHTS.nova;
      const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
      setActiveThought({ agentId: agent.id, text: thought });
      setTimeout(() => setActiveThought(null), 4000);
    };
    const firstTimeout = setTimeout(triggerThought, 3000);
    const interval = setInterval(triggerThought, 7000);
    return () => { clearTimeout(firstTimeout); clearInterval(interval); };
  }, [isDemoMode]);

  const loadArchive = async (reset = false) => {
    setArchiveLoading(true);
    try {
      const offset = reset ? 0 : archivedAccomplishments.length;
      const res = await fetch(`/api/office/actions?archiveOffset=${offset}&limit=50`);
      const data = await res.json();
      if (data.archive) {
        setArchivedAccomplishments(prev => reset ? data.archive : [...prev, ...data.archive]);
        setArchiveTotal(data.archiveTotal || 0);
      }
    } catch {}
    setArchiveLoading(false);
  };

  // Poll chat — uses demo chat API in demo mode, real office API otherwise
  useEffect(() => {
    const fetchChat = async () => {
      try {
        if (isDemoMode) {
          const res = await fetch(getApiPath('/api/office/chat'));
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages)) {
            setChatLog(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.messages)) {
                setTimeout(() => {
                  if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
                }, 100);
              }
              return data.messages;
            });
          }
        } else {
          const res = await fetch('/api/office');
          const data = await res.json();
          if (data.chatLog && Array.isArray(data.chatLog)) {
            setChatLog(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.chatLog)) {
                setTimeout(() => {
                  if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
                }, 100);
              }
              return data.chatLog;
            });
          }
        }
      } catch {}
    };
    fetchChat();
    const i = setInterval(fetchChat, isDemoMode ? 3000 : 5000);
    return () => clearInterval(i);
  }, [isDemoMode]);

  // Track new chat messages and sync thought bubbles
  useEffect(() => {
    if (chatLog.length > lastSeenChatCount) {
      // Only play message sound in real mode (not demo) to avoid constant chimes
      if (lastSeenChatCount > 0 && !isDemoMode) sfx.play('message', 5000);
      setLastSeenChatCount(chatLog.length);
      const lastMsg = chatLog[chatLog.length - 1];
      if (lastMsg) {
        const match = agents.find(a => a.name.toLowerCase() === lastMsg.from.toLowerCase());
        if (match) {
          setActiveThought({ agentId: match.id, text: `💭 ${lastMsg.text}` });
          setTimeout(() => setActiveThought(null), 8000);
        }
      }
    }
  }, [chatLog, lastSeenChatCount, agents]);

  // Schedule next chat message — only reschedule when chatLog length changes (new message arrived)
  const chatLogLen = chatLog.length;
  useEffect(() => {
    if (isDemoMode) return; // Demo mode has its own chat simulation
    const waterCoolerConfig = config.waterCooler || {};
    if (waterCoolerConfig.enabled === false) return;

    const npcAgents = agents.filter(a => a.id !== '_owner');
    if (npcAgents.length < 2) return;

    if (waterCoolerConfig.quiet?.enabled) {
      const now = new Date();
      const tz = waterCoolerConfig.quiet.timezone || 'America/New_York';
      const hour = parseInt(now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: tz }));
      const quietStart = parseInt(waterCoolerConfig.quiet.start?.split(':')[0] || '23');
      const quietEnd = parseInt(waterCoolerConfig.quiet.end?.split(':')[0] || '8');
      if (hour >= quietStart || hour < quietEnd) return;
    }

    // If a timer is already running and hasn't fired yet, don't reset
    if (chatTimerRef.current && chatTargetRef.current > Date.now()) return;

    const parseInterval = (str: string): number => {
      const match = str.match(/^(\d+)(s|m|h|d)$/);
      if (!match) return 45000;
      const [, num, unit] = match;
      const n = parseInt(num, 10);
      const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
      return n * multipliers[unit];
    };

    const baseFreq = parseInterval(waterCoolerConfig.frequency || '45s');
    const delay = baseFreq + (Math.random() - 0.5) * baseFreq * 0.5;
    chatTargetRef.current = Date.now() + delay;
    setNextChatIn(Math.round(delay / 1000));

    chatTimerRef.current = setTimeout(async () => {
      chatTimerRef.current = null;
      chatTargetRef.current = 0;
      setNextChatIn(-1);
      try {
        const allAgentData = agents
          .filter(a => a.id !== '_owner')
          .map(a => ({ id: a.id, name: a.name, role: a.role, status: a.status, task: a.task }));
        const res = await fetch('/api/office/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentNames: allAgentData.map(a => a.name),
            allAgents: allAgentData,
          }),
        });
        // Immediately fetch updated chat so we don't wait for the next poll cycle
        if (res.ok) {
          try {
            const chatRes = await fetch('/api/office/chat');
            const msgs = await chatRes.json();
            if (Array.isArray(msgs)) {
              setChatLog(msgs);
              setTimeout(() => {
                if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
              }, 100);
            }
          } catch {}
        }
      } catch {}
      // Trigger re-schedule by updating nextChatIn to 0 which will cause effect to re-run
      setNextChatIn(0);
      // Force re-trigger of the scheduling effect by touching chatLogLen dependency
      setChatLog(prev => [...prev]);
    }, delay);

    return () => {
      if (chatTimerRef.current) clearTimeout(chatTimerRef.current);
      chatTimerRef.current = null;
      chatTargetRef.current = 0;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatLogLen, config.waterCooler?.frequency, config.waterCooler?.enabled]);

  // Countdown tick
  useEffect(() => {
    const tick = setInterval(() => {
      if (chatTargetRef.current > 0) {
        const remaining = Math.max(0, Math.round((chatTargetRef.current - Date.now()) / 1000));
        setNextChatIn(prev => prev === -1 ? prev : remaining);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Fluctuate needs slightly
  useEffect(() => {
    const timer = setInterval(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        needs: {
          energy: Math.max(5, Math.min(100, a.needs.energy + (Math.random() > 0.5 ? 2 : -2))),
          output: Math.max(5, Math.min(100, a.needs.output + (Math.random() > 0.4 ? 1 : -1))),
          collab: Math.max(5, Math.min(100, a.needs.collab + (Math.random() > 0.5 ? 2 : -3))),
          queue: Math.max(5, Math.min(100, a.needs.queue + (Math.random() > 0.6 ? 2 : -1))),
          focus: Math.max(5, Math.min(100, a.needs.focus + (Math.random() > 0.5 ? 1 : -2))),
        },
      })));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const sendGroupMessage = async () => {
    if (!groupMessage.trim() || sendingGroup) return;
    sfx.play('send');
    setSendingGroup(true);
    try {
      const ownerName = agents.find(a => a.id === '_owner')?.name || 'You';

      // Add user message to water cooler chat so agents see it and respond
      fetch('/api/office/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user_message', from: ownerName, text: groupMessage }),
      }).catch(() => {});

      // Send to all agents (broadcast)
      const res = await fetch('/api/office/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          broadcast: true,
          agentIds: agents.map(a => a.id),
          message: groupMessage 
        }),
      });
      
      if (res.ok) {
        setGroupMessage('');
        setGroupSent(true);
        setTimeout(() => setGroupSent(false), 3000);
      } else {
        alert('Failed to send group message');
      }
    } catch (err) {
      alert('Failed to send group message');
    } finally {
      setSendingGroup(false);
    }
  };

  const handleTemplateSelect = async (quest: any) => {
    try {
      // Add the cloned quest to actions
      const res = await fetch('/api/office/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'add', action: quest }),
      });
      
      if (res.ok) {
        // Refresh actions
        const actionsRes = await fetch(getApiPath('/api/office/actions'));
        const data = await actionsRes.json();
        if (data.actions) setPendingActions(data.actions);
      }
    } catch (err) {
      console.error('Failed to add template quest:', err);
    }
  };

  const agentsWithThoughts = agents.map(a => ({
    ...a,
    thought: activeThought && activeThought.agentId === a.id ? activeThought.text : a.thought,
  }));

  const working = agentsWithThoughts.filter(a => a.status === 'working');
  const idle = agentsWithThoughts.filter(a => a.status === 'idle');

  // Group accomplishments by date (newest first)
  const sortedAccomplishments = [...accomplishments].sort((a, b) => b.timestamp - a.timestamp);
  const groupedAccomplishments = sortedAccomplishments.reduce((groups, acc) => {
    const date = new Date(acc.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let label: string;
    if (date.toDateString() === today.toDateString()) {
      label = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday';
    } else {
      const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo < 7) {
        label = `${daysAgo} days ago`;
      } else if (daysAgo < 30) {
        const weeksAgo = Math.floor(daysAgo / 7);
        label = weeksAgo === 1 ? '1 week ago' : `${weeksAgo} weeks ago`;
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }
    
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(acc);
    return groups;
  }, {} as Record<string, typeof accomplishments>);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = e.key.toLowerCase();
      if (key === 'escape') {
        setSelectedAgent(null);
        setShowTemplateGallery(false);
        setShowShareModal(false);
        setShowSettings(false);
        setShowCallMeeting(false);
        setSelectedAccomplishment(null);
      }
      if (key === '?' && !e.ctrlKey && !e.metaKey) {
        setShowSettings(prev => !prev);
      }
      if (key === 't' && !e.ctrlKey && !e.metaKey) {
        setShowTemplateGallery(prev => !prev);
      }
      if (key === 'm' && !e.ctrlKey && !e.metaKey) {
        setShowCallMeeting(prev => !prev);
      }
      // Number keys 1-9 to select agents
      if (key >= '1' && key <= '9' && !e.ctrlKey && !e.metaKey) {
        const idx = parseInt(key) - 1;
        const nonOwnerAgents = agents.filter(a => a.id !== '_owner');
        if (idx < nonOwnerAgents.length) {
          setSelectedAgent(prev => prev?.id === nonOwnerAgents[idx].id ? null : nonOwnerAgents[idx]);
          sfx.play('click');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [agents, sfx]);

  const hour = time.getHours();
  const bgGrad =
    hour >= 6 && hour < 18
      ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
      : 'linear-gradient(180deg, #020617 0%, #0f172a 100%)';

  // Responsive sizing
  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';
  const npcSize = isMobile ? 0.6 : isTablet ? 0.75 : 0.9;
  const roomGap = isMobile ? 6 : 8;
  const roomPadding = isMobile ? '16px 6px 4px' : '24px 8px 6px';
  const baseFontSize = isMobile ? 10 : isTablet ? 9 : 8;
  const headerFontSize = isMobile ? 12 : 14;

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: bgGrad,
      color: '#e2e8f0',
      fontFamily: 'system-ui',
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        rel="stylesheet"
      />

      {/* Demo Mode Banner */}
      {isDemoMode && <DemoBanner />}
      {/* Spacer for fixed demo banner */}
      {isDemoMode && <div style={{ height: isMobile ? 36 : 48, flexShrink: 0 }} />}

      {/* Header */}
      <div style={{
        background: '#0f172a',
        borderBottom: '2px solid #1e293b',
        padding: '6px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}>
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
            color: '#475569',
            marginLeft: isMobile ? 4 : 8,
          }}>
            {agents.length} {isMobile ? 'ag' : 'agents'}
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <Stat icon="🟢" n={working.length} />
          <Stat icon="☕" n={idle.length} />
          {pendingActions.length > 0 && <Stat icon="⚔️" n={pendingActions.length} />}
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 9,
            color: '#64748b',
          }}>
            {time.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'America/New_York',
            })}
          </div>
          <button
            onClick={() => { sfx.play('open'); setShowCallMeeting(true); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: 14,
              padding: '2px 4px',
            }}
            title="Call Meeting"
          >
            📞
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: 14,
              padding: '2px 4px',
            }}
            title="Share Your Office"
          >
            📸
          </button>
          <button
            onClick={() => { sfx.play('open'); setShowSettings(true); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              cursor: 'pointer',
              fontSize: 14,
              padding: '2px 4px',
            }}
            title="Settings"
          >
            ⚙️
          </button>
          <button
            onClick={() => {
              const next = !sfxEnabled;
              setSfxEnabled(next);
              sfx.setEnabled(next);
              if (next) sfx.play('click');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: sfxEnabled ? '#475569' : '#1e293b',
              cursor: 'pointer',
              fontSize: 14,
              padding: '2px 4px',
              opacity: sfxEnabled ? 1 : 0.5,
            }}
            title={sfxEnabled ? 'Mute SFX' : 'Unmute SFX'}
          >
            {sfxEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* No Agents Empty State */}
      {agents.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 100px)',
          textAlign: 'center',
          padding: '20px',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16, animation: 'npcBob 2s ease-in-out infinite' }}>🏢</div>
          <h2 style={{
            fontSize: isMobile ? 16 : 20,
            fontFamily: '"Press Start 2P", monospace',
            marginBottom: 12,
            color: '#e2e8f0',
          }}>
            Welcome to OpenClawfice!
          </h2>
          <div style={{
            fontSize: isMobile ? 12 : 14,
            color: '#94a3b8',
            maxWidth: 500,
            lineHeight: 1.8,
            marginBottom: 24,
          }}>
            Your virtual office is empty. Let&apos;s fix that.
          </div>
          <div style={{
            display: 'flex',
            gap: 12,
            marginBottom: 28,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <a href="/?demo=true" style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 11,
              fontFamily: '"Press Start 2P", monospace',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              transition: 'transform 0.2s',
            }}>
              ▶ Try Demo
            </a>
            <a href="/install" style={{
              background: 'rgba(99,102,241,0.15)',
              color: '#a5b4fc',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 11,
              fontFamily: '"Press Start 2P", monospace',
              textDecoration: 'none',
              border: '1px solid rgba(99,102,241,0.3)',
              transition: 'transform 0.2s',
            }}>
              📖 Setup Guide
            </a>
          </div>
          <div style={{
            fontSize: isMobile ? 11 : 12,
            color: '#475569',
            maxWidth: 400,
            lineHeight: 1.8,
          }}>
            <div style={{ marginBottom: 4 }}>✅ Make sure OpenClaw is running</div>
            <div style={{ marginBottom: 4 }}>✅ Agents appear automatically from <code style={{ background: '#1e293b', padding: '1px 4px', borderRadius: 3, fontSize: 10 }}>~/.openclaw/openclaw.json</code></div>
            <div>✅ Send a message in OpenClaw to wake them up</div>
          </div>
        </div>
      )}

      {/* Onboarding Banner — shown when all agents are new (never ran) */}
      {agents.length > 0 && agents.every(a => a.isNew) && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1))',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 8,
          padding: '10px 16px',
          margin: '8px 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'fadeSlideIn 0.5s ease-out',
        }}>
          <span style={{ fontSize: 20 }}>👋</span>
          <div>
            <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>Welcome to your office!</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
              Your agents will appear here once they start working. Send a message in OpenClaw to wake them up!
              {agents.some(a => !a.hasIdentity) && (
                <> 💡 Tip: Add <code style={{ background: '#1e293b', padding: '1px 4px', borderRadius: 3 }}>IDENTITY.md</code> to agent workspaces to customize their names.</>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Identity tip — shown when some agents lack IDENTITY.md but aren't all new */}
      {agents.length > 0 && !agents.every(a => a.isNew) && agents.some(a => !a.hasIdentity) && (
        <div style={{
          background: 'rgba(167,139,250,0.08)',
          border: '1px solid rgba(167,139,250,0.2)',
          borderRadius: 8,
          padding: '6px 12px',
          margin: '8px 12px 0',
          fontSize: 10,
          color: '#a78bfa',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span>💡</span>
          <span>Some agents are using default names. Add <code style={{ background: '#1e293b', padding: '1px 4px', borderRadius: 3 }}>IDENTITY.md</code> to their workspaces to customize!</span>
        </div>
      )}

      {/* Office Floor — only show if agents exist */}
      {agents.length > 0 && (
      <div style={{
        padding: isMobile ? '6px' : '8px 12px 16px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 240px' : '1fr 260px',
        gap: roomGap,
        maxWidth: isMobile ? '100%' : 1400,
        margin: '0 auto',
        height: isMobile ? 'auto' : 'calc(100vh - 56px)',
        overflow: isMobile ? 'auto' : 'hidden',
      }}>
        {/* LEFT COLUMN */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: roomGap,
          minHeight: 0,
          overflow: isMobile ? 'visible' : 'hidden',
        }}>
          {/* WORK ROOM — hide in single agent mode */}
          {agents.length > 1 && (
          <Room
            title="Work Room"
            icon="💻"
            color="#0a1a10"
            borderColor="#166534"
            roomType="work"
            dataTour="work-room"
            style={{ flex: '1 1 auto' }}
          >
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
              justifyContent: 'center',
              padding: '12px 0 4px',
              minHeight: 80,
            }}>
              {working.length > 0 ? (
                working.map((a, idx) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      animation: `npcEntrance 0.5s ease-out ${idx * 0.1}s both`,
                    }}
                  >
                    {a.task && (
                      <div style={{ position: 'relative' }}>
                        <div onClick={(e) => { e.stopPropagation(); setExpandedTask(expandedTask === a.id ? null : a.id); }} style={{
                          background: 'rgba(16,185,129,0.12)',
                          border: '1px solid rgba(16,185,129,0.25)',
                          borderRadius: 4,
                          padding: '2px 8px',
                          fontSize: 8,
                          color: '#6ee7b7',
                          maxWidth: 160,
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}>
                          {prettifyTask(a.task)}
                        </div>
                        {expandedTask === a.id && (
                          <div onClick={(e) => e.stopPropagation()} style={{
                            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                            marginTop: 4, zIndex: 100,
                            background: '#1e293b', border: '1px solid #334155',
                            borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#e2e8f0',
                            maxWidth: 320, minWidth: 180, whiteSpace: 'normal', wordBreak: 'break-word',
                            lineHeight: 1.4, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                            animation: 'fadeSlideIn 0.15s ease-out',
                          }}>
                            <div style={{ fontSize: 8, color: '#64748b', marginBottom: 4, fontFamily: '"Press Start 2P", monospace' }}>{a.name}</div>
                            {a.task}
                          </div>
                        )}
                      </div>
                    )}
                    <NPC
                      agent={a}
                      size={npcSize}
                      onClick={() => { sfx.play('click'); setSelectedAgent(a); }}
                      forceThought={activeThought && activeThought.agentId === a.id ? activeThought.text : null}
                      hasCelebration={celebrations.some(c => c.agentId === a.id)}
                    />
                  </div>
                ))
              ) : (
                <div style={{
                  color: '#475569',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 7,
                  padding: 12,
                }}>
                  * nobody working *
                </div>
              )}
            </div>
          </Room>
          )}

          {/* MEETING ROOM — only appears when meeting.active = true */}
          {meeting.active && (
            <Room
              title="Meeting Room"
              icon="🤝"
              color="#1a0a2e"
              borderColor="#7c3aed"
              roomType="meeting"
              style={{
                flex: '0 0 auto',
                animation: 'fadeSlideIn 0.5s ease-out',
              }}
            >
              <div style={{
                padding: '12px 12px 16px',
              }}>
                {/* Topic */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: 8,
                  fontSize: 11,
                  color: '#c4b5fd',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  padding: '0 8px',
                }}>
                  {meeting.topic || 'Discussion in progress...'}
                </div>

                {/* Progress indicators */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 12,
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.4)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 8,
                    color: '#a78bfa',
                    fontFamily: '"Press Start 2P", monospace',
                  }}>
                    Round {meeting.currentRound}/{meeting.maxRounds}
                  </div>
                  <div style={{
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.4)',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 8,
                    color: '#a78bfa',
                    fontFamily: '"Press Start 2P", monospace',
                  }}>
                    {(() => {
                      const elapsed = Date.now() - (meeting.startedAt || Date.now());
                      const mins = Math.floor(elapsed / 60000);
                      const secs = Math.floor((elapsed % 60000) / 1000);
                      return `${mins}:${secs.toString().padStart(2, '0')} elapsed`;
                    })()}
                  </div>
                </div>

                {/* Participants facing each other */}
                {/* Participants — face each other across the table */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  gap: isMobile ? 16 : 28,
                  flexWrap: 'wrap',
                  marginBottom: 8,
                }}>
                  {meeting.participants && meeting.participants.map((pId, idx) => {
                    const agent = agents.find(a => a.id === pId);
                    if (!agent) return null;
                    // Odd-indexed participants face left (flipped) for face-to-face effect
                    const flipped = idx % 2 === 1;
                    return (
                      <div key={pId} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        animation: `npcEntrance 0.5s ease-out ${idx * 0.12}s both`,
                      }}>
                        <NPC
                          agent={agent}
                          size={npcSize * 0.85}
                          onClick={() => { sfx.play('click'); setSelectedAgent(agent); }}
                          flipped={flipped}
                          hasCelebration={celebrations.some(c => c.agentId === agent.id)}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Live Discussion Transcript */}
                {(() => {
                  const transcript = meeting.transcript || [];
                  const hasTranscript = transcript.length > 0;
                  // Agent name color map — deterministic purple-family colors
                  const agentColors: Record<string, string> = {};
                  const colorPalette = ['#c4b5fd', '#a78bfa', '#f0abfc', '#67e8f9', '#86efac', '#fcd34d', '#fca5a5', '#fdba74'];
                  (meeting.participants || []).forEach((p, i) => {
                    agentColors[p.toLowerCase()] = colorPalette[i % colorPalette.length];
                  });
                  // Also map display names from agents list
                  agents.forEach((a) => {
                    if (!agentColors[a.name.toLowerCase()]) {
                      const idx = a.id.split('').reduce((s: number, c: string) => s + c.charCodeAt(0), 0) % colorPalette.length;
                      agentColors[a.name.toLowerCase()] = colorPalette[idx];
                    }
                    if (!agentColors[a.id.toLowerCase()]) {
                      agentColors[a.id.toLowerCase()] = agentColors[a.name.toLowerCase()];
                    }
                  });

                  return hasTranscript ? (
                    <div style={{
                      background: 'rgba(15,5,30,0.6)',
                      border: '1px solid rgba(124,58,237,0.2)',
                      borderRadius: 8,
                      padding: '8px',
                      maxHeight: isMobile ? 160 : 220,
                      overflowY: 'auto',
                      marginBottom: 8,
                    }}>
                      {/* Round separators + messages */}
                      {transcript.map((entry, idx) => {
                        const showRoundHeader = idx === 0 || entry.round !== transcript[idx - 1].round;
                        const agentKey = entry.agent.toLowerCase();
                        const agentColor = agentColors[agentKey] || '#c4b5fd';
                        // Resolve display name
                        const displayAgent = agents.find(a => a.id === agentKey || a.name.toLowerCase() === agentKey);
                        const agentName = displayAgent?.name || entry.agent;

                        return (
                          <React.Fragment key={idx}>
                            {showRoundHeader && (
                              <div style={{
                                textAlign: 'center',
                                fontSize: 7,
                                color: '#7c3aed',
                                fontFamily: '"Press Start 2P", monospace',
                                padding: '4px 0 6px',
                                opacity: 0.7,
                                borderTop: idx > 0 ? '1px solid rgba(124,58,237,0.15)' : 'none',
                                marginTop: idx > 0 ? 6 : 0,
                              }}>
                                — Round {entry.round} —
                              </div>
                            )}
                            <div style={{
                              display: 'flex',
                              gap: 6,
                              marginBottom: 6,
                              alignItems: 'flex-start',
                              animation: idx === transcript.length - 1 ? 'fadeSlideIn 0.3s ease-out' : undefined,
                            }}>
                              {/* Color pip */}
                              <div style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: agentColor,
                                flexShrink: 0,
                                marginTop: 4,
                                boxShadow: `0 0 4px ${agentColor}44`,
                              }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{
                                  fontFamily: '"Press Start 2P", monospace',
                                  fontSize: 7,
                                  color: agentColor,
                                  marginRight: 4,
                                }}>
                                  {agentName}
                                </span>
                                <span style={{
                                  fontSize: isMobile ? 9 : 10,
                                  color: '#e2d9f3',
                                  lineHeight: 1.4,
                                  wordBreak: 'break-word' as const,
                                }}>
                                  {entry.message}
                                </span>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ) : meeting.lastMessage ? (
                    /* Fallback: single lastMessage if no transcript */
                    <div style={{
                      background: 'rgba(124,58,237,0.1)',
                      border: '1px solid rgba(124,58,237,0.25)',
                      color: '#c4b5fd',
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: isMobile ? 9 : 10,
                      textAlign: 'center',
                      lineHeight: 1.4,
                      marginBottom: 8,
                    }}>
                      {meeting.lastMessage.length > 120 
                        ? meeting.lastMessage.slice(0, 117) + '...' 
                        : meeting.lastMessage}
                    </div>
                  ) : null;
                })()}

                {/* End Meeting Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 4,
                }}>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(getApiPath('/api/office/meeting'), {
                          method: 'DELETE',
                        });
                        if (res.ok) {
                          sfx.play('close');
                          setMeeting({ active: false });
                        }
                      } catch (err) {
                        console.error('Failed to end meeting:', err);
                      }
                    }}
                    style={{
                      background: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#fca5a5',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 10,
                      fontFamily: '"Press Start 2P", monospace',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                    }}
                  >
                    End Meeting
                  </button>
                </div>
              </div>
            </Room>
          )}

          {/* LOUNGE + QUEST LOG */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            flex: '0 0 auto',
          }}>
            <Room title="The Lounge" icon="☕" color="#1a150a" borderColor="#92400e" roomType="lounge">
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                justifyContent: 'center',
                padding: '16px 0 4px',
                minHeight: idle.length > 0 ? 140 : 80,
              }}>
                {idle.length > 0 ? (
                  idle.map((a, idx) => (
                    <div
                      key={a.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        animation: `npcEntrance 0.5s ease-out ${idx * 0.1}s both`,
                      }}
                    >
                      {a.isNew && (
                        <div style={{
                          background: 'rgba(34,197,94,0.15)',
                          border: '1px solid rgba(34,197,94,0.4)',
                          borderRadius: 6,
                          padding: '2px 8px',
                          fontSize: 8,
                          color: '#4ade80',
                          fontFamily: '"Press Start 2P", monospace',
                        }}>🆕 NEW</div>
                      )}
                      {a.nextTaskAt && !a.isNew && <CooldownTimer targetMs={a.nextTaskAt} />}
                      {!a.isNew && !a.nextTaskAt && (
                        <div style={{
                          background: 'rgba(146,64,14,0.15)',
                          border: '1px solid rgba(146,64,14,0.3)',
                          borderRadius: 4,
                          padding: '2px 6px',
                          fontSize: 7,
                          color: '#d97706',
                          textAlign: 'center',
                        }}>
                          {['☕ On break', '📖 Reading docs', '🎮 Taking 5', '💭 Thinking...', '🧹 Tidying up'][
                            a.id.split('').reduce((s: number, c: string) => s + c.charCodeAt(0), 0) % 5
                          ]}
                        </div>
                      )}
                      <NPC
                        agent={a}
                        size={npcSize}
                        onClick={() => { sfx.play('click'); setSelectedAgent(a); }}
                        forceThought={activeThought && activeThought.agentId === a.id ? activeThought.text : null}
                        hasCelebration={celebrations.some(c => c.agentId === a.id)}
                      />
                    </div>
                  ))
                ) : (
                  <div style={{
                    color: '#475569',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 7,
                    padding: '12px 8px',
                    textAlign: 'center',
                    lineHeight: 2,
                  }}>
                    {agents.length === 1 ? (
                      <>
                        👋 Solo mode!
                        <br />
                        Add more agents to build a team.
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>💼</span>
                        Everyone is hard at work!
                        <br />
                        <span style={{ color: '#334155', fontSize: 6 }}>
                          Idle agents hang out here
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Room>

            <Room title="Quest Log" icon="⚔️" color="#0a0a1f" borderColor="#4f46e5" dataTour="quest-log">
              <div style={{
                padding: '10px 4px 4px',
                minHeight: 80,
                maxHeight: 200,
                overflowY: 'auto',
              }}>
                {pendingActions.length > 0 ? (
                  pendingActions.slice(0, 5).map(action => {
                    const priorityColors: Record<string, string> = {
                      high: '#ef4444',
                      medium: '#f59e0b',
                      low: '#6366f1',
                    };
                    const priorityGlow: Record<string, string> = {
                      high: 'rgba(239,68,68,0.2)',
                      medium: 'rgba(245,158,11,0.1)',
                      low: 'rgba(99,102,241,0.1)',
                    };
                    return (
                      <div
                        key={action.id}
                        onClick={() => { sfx.play('open'); setExpandedAction(action.id); }}
                        style={{
                          background: priorityGlow[action.priority],
                          border: `1px solid ${priorityColors[action.priority]}44`,
                          borderLeft: `3px solid ${priorityColors[action.priority]}`,
                          borderRadius: 6,
                          padding: '6px 8px',
                          marginBottom: 4,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14 }}>{action.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#e2e8f0',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {action.title}
                            </div>
                            <div style={{
                              fontSize: 8,
                              color: '#64748b',
                              display: 'flex',
                              gap: 8,
                              marginTop: 1,
                            }}>
                              <span>from {action.from}</span>
                              <span style={{
                                color: priorityColors[action.priority],
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                fontFamily: '"Press Start 2P", monospace',
                                fontSize: 6,
                              }}>
                                {action.priority === 'high'
                                  ? '❗ URGENT'
                                  : action.priority === 'medium'
                                  ? '⚡ SOON'
                                  : '📋 WHEN FREE'}
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: 10, color: '#475569' }}>▶</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{
                    padding: 12,
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: 24,
                      marginBottom: 8,
                    }}>
                      ✨
                    </div>
                    <div style={{
                      color: '#e2e8f0',
                      fontSize: 10,
                      marginBottom: 6,
                      fontWeight: 600,
                    }}>
                      No pending decisions
                    </div>
                    <div style={{
                      color: '#64748b',
                      fontSize: 9,
                      lineHeight: 1.5,
                      marginBottom: 12,
                    }}>
                      Your agents will create quests when
                      <br />
                      they need your input.
                      <br />
                      <br />
                      <span style={{ fontSize: 8, fontStyle: 'italic' }}>
                        (Pulled from ~/.openclaw/.status/actions.json)
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTemplateGallery(true);
                      }}
                      style={{
                        background: '#6366f1',
                        border: 'none',
                        color: '#fff',
                        borderRadius: 6,
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: 10,
                        fontWeight: 600,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#4f46e5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#6366f1';
                      }}
                    >
                      Browse Quest Templates
                    </button>
                  </div>
                )}
              </div>
            </Room>
          </div>

          {/* ACCOMPLISHMENTS */}
          <div data-tour="accomplishments" style={{
            background: '#0f172a',
            border: '2px solid #1e293b',
            borderRadius: 8,
            overflow: 'hidden',
            flex: '1 1 0',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              background: '#1e293b',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 12 }}>🏆</span>
              <span style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 7,
                textTransform: 'uppercase',
              }}>
                Accomplishments
              </span>
              <span style={{
                fontSize: 8,
                color: '#475569',
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                {accomplishments.length} recent
                {archiveTotal > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!showArchive) loadArchive(true); setShowArchive(!showArchive); }}
                    style={{
                      background: showArchive ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: 4,
                      color: '#818cf8',
                      fontSize: 7,
                      padding: '2px 5px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {showArchive ? 'Hide History' : `${archiveTotal} archived`}
                  </button>
                )}
              </span>
            </div>
            <div style={{
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              overflowY: 'auto',
              flex: 1,
            }}>
              {accomplishments.length > 0 ? (
                Object.entries(groupedAccomplishments).map(([dateLabel, accs]) => (
                  <div key={dateLabel}>
                    {/* Date Header */}
                    <div style={{
                      fontSize: 8,
                      fontFamily: '"Press Start 2P", monospace',
                      color: '#64748b',
                      padding: '8px 4px 4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {dateLabel}
                    </div>
                    {/* Accomplishments for this date */}
                    {accs.map((a, i) => {
                  const timeAgo = (() => {
                    const mins = Math.floor((Date.now() - a.timestamp) / 60000);
                    if (mins < 1) return 'just now';
                    if (mins < 60) return `${mins}m ago`;
                    const hours = Math.floor(mins / 60);
                    if (hours < 24) return `${hours}h ago`;
                    return `${Math.floor(hours / 24)}d ago`;
                  })();
                  const hasMedia = a.screenshot && (a.screenshot.endsWith('.mp4') || a.screenshot.endsWith('.webm') || a.screenshot.endsWith('.mov'));
                  const hasScreenshot = !!a.screenshot;
                  const isRecording = !hasScreenshot && (Date.now() - a.timestamp) < 30000;
                  return (
                    <div
                      key={a.id || i}
                      onClick={() => { sfx.play('click'); setSelectedAccomplishment(a); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '5px 8px',
                        background: 'rgba(16,185,129,0.04)',
                        border: '1px solid rgba(16,185,129,0.1)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        animation: i === 0 ? 'fadeSlideIn 0.5s ease-out' : undefined,
                      }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0 }}>
                        {a.icon}
                      </span>
                      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0' }}>
                          {a.title}
                        </span>
                      </div>
                      {a.file && (
                        <span style={{ fontSize: 10, flexShrink: 0 }} title={`File: ${a.file.split('/').pop()}`}>📄</span>
                      )}
                      {hasMedia && !a.file && (
                        <span style={{ fontSize: 10, flexShrink: 0 }} title="Loom recording attached">🎬</span>
                      )}
                      {isRecording && (
                        <span style={{ fontSize: 8, flexShrink: 0, color: '#f87171', animation: 'pulse 1s infinite' }} title="Recording loom...">🔴 REC</span>
                      )}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 2,
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 8, fontWeight: 600, color: '#6366f1' }}>
                          {a.who}
                        </span>
                        <span style={{ fontSize: 7, color: '#475569' }}>{timeAgo}</span>
                      </div>
                    </div>
                  );
                })}
                  </div>
                ))
              ) : (
                <div style={{
                  padding: 16,
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: 32,
                    marginBottom: 8,
                  }}>
                    🎯
                  </div>
                  <div style={{
                    color: '#e2e8f0',
                    fontSize: 10,
                    marginBottom: 6,
                    fontWeight: 600,
                  }}>
                    No accomplishments yet
                  </div>
                  <div style={{
                    color: '#64748b',
                    fontSize: 9,
                    lineHeight: 1.6,
                  }}>
                    Once your agents complete tasks,
                    <br />
                    they'll appear here!
                    <br />
                    <br />
                    <span style={{ fontSize: 8 }}>
                      Auto-detected from agent activity ✨
                    </span>
                  </div>
                </div>
              )}
              {showArchive && (
                <div style={{ marginTop: 8, borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: 8 }}>
                  <div style={{ fontSize: 8, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 6, fontFamily: '"Press Start 2P", monospace' }}>
                    History ({archiveTotal} archived)
                  </div>
                  {archivedAccomplishments.map((a, i) => {
                    const dateStr = new Date(a.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    return (
                      <div
                        key={`arch-${a.id || i}`}
                        onClick={() => setSelectedAccomplishment(a)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '4px 8px',
                          background: 'rgba(99,102,241,0.03)',
                          border: '1px solid rgba(99,102,241,0.08)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          marginBottom: 3,
                          opacity: 0.8,
                        }}
                      >
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{a.icon}</span>
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: '#cbd5e1' }}>{a.title}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
                          <span style={{ fontSize: 7, fontWeight: 600, color: '#6366f1' }}>{a.who}</span>
                          <span style={{ fontSize: 7, color: '#475569' }}>{dateStr}</span>
                        </div>
                      </div>
                    );
                  })}
                  {archivedAccomplishments.length < archiveTotal && (
                    <button
                      onClick={() => loadArchive()}
                      disabled={archiveLoading}
                      style={{
                        width: '100%',
                        marginTop: 4,
                        padding: '5px 0',
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.15)',
                        borderRadius: 6,
                        color: '#818cf8',
                        fontSize: 8,
                        cursor: archiveLoading ? 'wait' : 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {archiveLoading ? 'Loading...' : `Load more (${archiveTotal - archivedAccomplishments.length} remaining)`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Water Cooler Chat */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: roomGap,
          height: isMobile ? 'auto' : '100%',
          overflow: isMobile ? 'visible' : 'hidden',
          maxHeight: isMobile ? '400px' : undefined,
        }}>
          <div data-tour="water-cooler" style={{
            background: '#0f172a',
            border: '2px solid #44320a',
            borderRadius: 12,
            flex: isMobile ? 'none' : 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            maxHeight: isMobile ? '400px' : undefined,
          }}>
            <div style={{
              background: '#1e293b',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 12 }}>💬</span>
              <span style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 7,
                textTransform: 'uppercase',
                color: '#f59e0b',
              }}>
                Water Cooler
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: 8,
                color: nextChatIn === -1 ? '#f59e0b' : '#475569',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {nextChatIn === -1
                  ? '✨ generating...'
                  : nextChatIn > 0
                    ? `next in ${nextChatIn >= 60 ? `${Math.floor(nextChatIn / 60)}:${String(nextChatIn % 60).padStart(2, '0')}` : `${nextChatIn}s`}`
                    : ''}
              </span>
            </div>
            <div
              ref={chatRef}
              style={{
                flex: 1,
                overflow: 'auto',
                padding: 10,
              }}
            >
              {chatLog.length === 0 && (
                <div style={{
                  padding: 16,
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: 28,
                    marginBottom: 8,
                  }}>
                    💬
                  </div>
                  <div style={{
                    color: '#e2e8f0',
                    fontSize: 10,
                    marginBottom: 6,
                    fontWeight: 600,
                  }}>
                    Water Cooler
                  </div>
                  <div style={{
                    fontSize: 9,
                    color: '#64748b',
                    lineHeight: 1.6,
                  }}>
                    No chat yet. Idle agents will start
                    <br />
                    chatting automatically!
                    <br />
                    <br />
                    Or broadcast a message below ↓
                  </div>
                </div>
              )}
              {chatLog.slice(-12).map((m, i) => {
                const isOwner = agents.find(a => a.id === '_owner' && a.name === m.from);
                const agentColor = isOwner ? '#f59e0b' : (agents.find(a => a.name === m.from)?.color || '#94a3b8');
                return (
                  <div
                    key={`${i}-${m.text}`}
                    style={{
                      display: 'flex',
                      gap: 8,
                      padding: '5px 6px',
                      marginBottom: 2,
                      borderRadius: 6,
                      animation: 'fadeSlideIn 0.3s ease-out',
                      background: isOwner ? 'rgba(245,158,11,0.06)' : (i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'),
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isOwner ? 'rgba(245,158,11,0.06)' : (i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'); }}
                  >
                    {/* Agent color pip */}
                    <div style={{
                      width: 3,
                      borderRadius: 2,
                      background: agentColor,
                      flexShrink: 0,
                      marginTop: 2,
                      marginBottom: 2,
                      opacity: 0.7,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{
                        fontWeight: 700,
                        color: agentColor,
                        fontSize: 9,
                        fontFamily: '"Press Start 2P", monospace',
                        letterSpacing: 0.5,
                      }}>
                        {isOwner ? `${m.from} ★` : m.from}
                      </span>
                      <div style={{
                        color: isOwner ? '#fbbf24' : '#b4b4bf',
                        fontSize: 11,
                        lineHeight: 1.45,
                        marginTop: 1,
                        wordBreak: 'break-word',
                      }}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Group Chat Input */}
            <div style={{
              borderTop: '1px solid #1e293b',
              padding: 8,
              flexShrink: 0,
            }}>
              <div style={{
                fontSize: 8,
                color: '#64748b',
                marginBottom: 6,
                fontFamily: '"Press Start 2P", monospace',
              }}>
                SAY SOMETHING ({agents.filter(a => a.id !== '_owner').length} listening)
              </div>
              {groupSent && (
                <div style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 6,
                  padding: '4px 8px',
                  marginBottom: 6,
                  fontSize: 9,
                  color: '#fbbf24',
                  animation: 'fadeSlideIn 0.3s ease-out',
                }}>
                  ✓ Sent to the team
                </div>
              )}
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={groupMessage}
                  onChange={(e) => setGroupMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isDemoMode && sendGroupMessage()}
                  placeholder={isDemoMode ? "Demo mode: messaging disabled" : "Say something to the team..."}
                  disabled={sendingGroup || isDemoMode}
                  style={{
                    flex: 1,
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 6,
                    padding: '6px 8px',
                    color: '#e2e8f0',
                    fontSize: 11,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={sendGroupMessage}
                  disabled={sendingGroup || !groupMessage.trim()}
                  style={{
                    background: groupSent ? '#10b981' : '#f59e0b',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 6,
                    padding: '6px 10px',
                    cursor: sendingGroup || !groupMessage.trim() ? 'not-allowed' : 'pointer',
                    fontSize: 11,
                    opacity: sendingGroup || !groupMessage.trim() ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {groupSent ? '✓' : sendingGroup ? '...' : '📢'}
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard removed — XP visible in agent panel */}
        </div>
      </div>
      )}

      {/* Agent Detail Panel */}
      {/* Quest Detail Modal */}
      {expandedAction && (() => {
        const action = pendingActions.find(a => a.id === expandedAction);
        if (!action) return null;
        const priorityColors: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#6366f1' };
        const respondAction = async (response: string) => {
          await fetch('/api/office/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'respond_action', id: action.id, response }),
          });
          setPendingActions(prev => prev.filter(a => a.id !== action.id));
          setExpandedAction(null);
        };
        return (
          <div onClick={() => setExpandedAction(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: '#0f172a', border: `2px solid ${priorityColors[action.priority]}`,
              borderRadius: 12, padding: 20, maxWidth: 520, width: '100%',
              maxHeight: '80vh', overflowY: 'auto',
              boxShadow: `0 0 40px ${priorityColors[action.priority]}33, 0 20px 60px rgba(0,0,0,0.8)`,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>{action.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{action.title}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                    from <span style={{ color: action.from === 'Scout' ? '#f59e0b' : action.from === 'Cipher' ? '#6366f1' : '#10b981' }}>{action.from}</span>
                    <span style={{ marginLeft: 8, color: priorityColors[action.priority], fontWeight: 600, textTransform: 'uppercase' as const, fontFamily: '"Press Start 2P", monospace', fontSize: 8 }}>
                      {action.priority === 'high' ? '❗ URGENT' : action.priority === 'medium' ? '⚡ SOON' : '📋 WHEN FREE'}
                    </span>
                  </div>
                </div>
                <button onClick={() => setExpandedAction(null)} style={{
                  background: 'none', border: 'none', color: '#475569', fontSize: 18, cursor: 'pointer',
                }}>✕</button>
              </div>

              {/* Description */}
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 12 }}>{linkifyFiles(action.description)}</div>

              {/* Structured file attachment */}
              {action.data?.file && (
                <a
                  href="#"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      const res = await fetch('/api/office/open-file', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: action.data!.file }),
                      });
                      if (!res.ok) {
                        const data = await res.json();
                        alert(`Could not find ${action.data!.file}:\n${data.error}`);
                      }
                    } catch {
                      alert(`Failed to open ${action.data!.file}`);
                    }
                  }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)',
                    borderRadius: 6, padding: '6px 12px', marginBottom: 12,
                    color: '#60a5fa', fontSize: 11, fontFamily: 'monospace',
                    cursor: 'pointer', textDecoration: 'none',
                  }}
                  title={`Open ${action.data.file} in editor`}
                >
                  📄 {action.data.file}
                  <span style={{ fontSize: 9, color: '#475569' }}>↗ open in editor</span>
                </a>
              )}

              {/* Email body */}
              {action.data?.body && (
                <div style={{
                  background: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 12,
                  fontSize: 11, color: '#cbd5e1', whiteSpace: 'pre-wrap' as const, lineHeight: 1.6,
                  border: '1px solid #334155',
                }}>
                  {action.data.subject && <div style={{ fontWeight: 700, marginBottom: 4, color: '#e2e8f0', fontSize: 12 }}>Subject: {action.data.subject}</div>}
                  {action.data.to && <div style={{ color: '#64748b', marginBottom: 8 }}>To: {action.data.to}</div>}
                  {action.data.body}
                </div>
              )}

              {/* Options buttons */}
              {action.data?.options && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(action.data.options as string[]).map((opt: string, i: number) => (
                    <button key={i} onClick={() => respondAction(opt)} style={{
                      background: i === 0 ? '#166534' : '#1e293b',
                      border: `1px solid ${i === 0 ? '#22c55e' : '#334155'}`,
                      borderRadius: 6, padding: '8px 16px', fontSize: 11,
                      color: i === 0 ? '#4ade80' : '#94a3b8',
                      cursor: 'pointer', fontWeight: i === 0 ? 700 : 400,
                    }}>{opt}</button>
                  ))}
                </div>
              )}

              {/* Approve/Reject/Edit for emails */}
              {(action.type === 'approve_email' || action.type === 'approve_send') && !action.data?.options && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => respondAction('approved')} style={{
                    background: '#166534', border: '1px solid #22c55e', borderRadius: 6,
                    padding: '8px 20px', color: '#4ade80', cursor: 'pointer',
                    fontWeight: 700, fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                  }}>✅ APPROVE</button>
                  <button onClick={() => respondAction('rejected')} style={{
                    background: '#450a0a', border: '1px solid #ef4444', borderRadius: 6,
                    padding: '8px 20px', color: '#f87171', cursor: 'pointer',
                    fontWeight: 700, fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                  }}>❌ REJECT</button>
                  <button onClick={() => {
                    const edit = prompt('Edit instructions:');
                    if (edit) respondAction(`edit: ${edit}`);
                  }} style={{
                    background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
                    padding: '8px 20px', color: '#94a3b8', cursor: 'pointer',
                    fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                  }}>✏️ EDIT</button>
                </div>
              )}

              {/* Text input for decisions/input_needed without options */}
              {((action.type === 'input_needed' || action.type === 'decision') && !action.data?.options) && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    autoFocus
                    placeholder={action.type === 'decision' ? 'Your decision...' : 'Type your response...'}
                    id={`quest-input-${action.id}`}
                    style={{
                      flex: 1, background: '#1e293b', border: '1px solid #334155',
                      borderRadius: 6, padding: '8px 12px', color: '#e2e8f0',
                      fontSize: 12, outline: 'none',
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) respondAction(val);
                      }
                    }}
                  />
                  <button onClick={() => {
                    const input = document.getElementById(`quest-input-${action.id}`) as HTMLInputElement;
                    const val = input?.value.trim();
                    if (val) respondAction(val);
                  }} style={{
                    background: '#4f46e5', border: 'none', borderRadius: 6,
                    padding: '8px 16px', color: '#fff', cursor: 'pointer',
                    fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                  }}>SEND</button>
                </div>
              )}

              {/* Review — acknowledge + notes */}
              {(action.type === 'review_data' || action.type === 'review') && !action.data?.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={() => respondAction('acknowledged')} style={{
                    background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
                    padding: '8px 20px', color: '#94a3b8', cursor: 'pointer',
                    fontFamily: '"Press Start 2P", monospace', fontSize: 9, alignSelf: 'flex-start',
                  }}>👀 ACKNOWLEDGED</button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      placeholder="Or add notes..."
                      id={`quest-input-${action.id}`}
                      style={{
                        flex: 1, background: '#1e293b', border: '1px solid #334155',
                        borderRadius: 6, padding: '8px 12px', color: '#e2e8f0',
                        fontSize: 12, outline: 'none',
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) respondAction(val);
                        }
                      }}
                    />
                    <button onClick={() => {
                      const input = document.getElementById(`quest-input-${action.id}`) as HTMLInputElement;
                      const val = input?.value.trim();
                      if (val) respondAction(val);
                    }} style={{
                      background: '#4f46e5', border: 'none', borderRadius: 6,
                      padding: '8px 16px', color: '#fff', cursor: 'pointer',
                      fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                    }}>SEND</button>
                  </div>
                </div>
              )}

              {/* Fallback — any quest type without specific handler or options gets approve/dismiss + notes */}
              {!action.data?.options
                && action.type !== 'approve_email' && action.type !== 'approve_send'
                && action.type !== 'input_needed' && action.type !== 'decision'
                && action.type !== 'review_data' && action.type !== 'review'
                && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={() => respondAction('approved')} style={{
                      background: '#166534', border: '1px solid #22c55e', borderRadius: 6,
                      padding: '8px 20px', color: '#4ade80', cursor: 'pointer',
                      fontWeight: 700, fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                    }}>✅ APPROVE</button>
                    <button onClick={() => respondAction('dismissed')} style={{
                      background: '#1e293b', border: '1px solid #334155', borderRadius: 6,
                      padding: '8px 20px', color: '#94a3b8', cursor: 'pointer',
                      fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                    }}>🗑️ DISMISS</button>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Or respond with notes..."
                      id={`quest-input-${action.id}`}
                      style={{
                        flex: 1, background: '#1e293b', border: '1px solid #334155',
                        borderRadius: 6, padding: '8px 12px', color: '#e2e8f0',
                        fontSize: 12, outline: 'none',
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) respondAction(val);
                        }
                      }}
                    />
                    <button onClick={() => {
                      const input = document.getElementById(`quest-input-${action.id}`) as HTMLInputElement;
                      const val = input?.value.trim();
                      if (val) respondAction(val);
                    }} style={{
                      background: '#4f46e5', border: 'none', borderRadius: 6,
                      padding: '8px 16px', color: '#fff', cursor: 'pointer',
                      fontFamily: '"Press Start 2P", monospace', fontSize: 9,
                    }}>SEND</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {selectedAccomplishment && (
        <div
          onClick={() => setSelectedAccomplishment(null)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 12,
              padding: 24,
              maxWidth: 500,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>{selectedAccomplishment.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>
                  {selectedAccomplishment.title}
                </div>
                <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>
                  {selectedAccomplishment.who} · {new Date(selectedAccomplishment.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            {selectedAccomplishment.detail && (
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
                {linkifyFiles(selectedAccomplishment.detail)}
              </div>
            )}
            {/* File link — prominent when available */}
            {selectedAccomplishment.file && (
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    const res = await fetch('/api/office/open-file', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: selectedAccomplishment.file!.split('/').pop() }),
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      alert(`Could not open file:\n${data.error}`);
                    }
                  } catch {
                    alert('Failed to open file');
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                  color: '#60a5fa', fontSize: 13, fontFamily: 'monospace',
                  cursor: 'pointer', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                title={`Open ${selectedAccomplishment.file.split('/').pop()} in editor`}
              >
                <span style={{ fontSize: 20 }}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>
                    {selectedAccomplishment.file.split('/').pop()}
                  </div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>
                    Click to open in editor ↗
                  </div>
                </div>
              </a>
            )}
            {selectedAccomplishment.screenshot && selectedAccomplishment.screenshot !== 'recording' && (
              <div>
                {selectedAccomplishment.file && (
                  <div style={{ fontSize: 10, color: '#475569', marginBottom: 6, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const el = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                      if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                    }}
                  >▶ Screen recording</div>
                )}
                <div style={selectedAccomplishment.file ? { display: 'none' } : undefined}>
                  {selectedAccomplishment.screenshot.endsWith('.mp4') || selectedAccomplishment.screenshot.endsWith('.webm') || selectedAccomplishment.screenshot.endsWith('.mov') ? (
                    <video
                      src={`/api/office/screenshot?file=${encodeURIComponent(selectedAccomplishment.screenshot)}`}
                      controls
                      autoPlay={!selectedAccomplishment.file}
                      style={{
                        width: '100%',
                        borderRadius: 8,
                        border: '1px solid #334155',
                        background: '#000',
                      }}
                    />
                  ) : (
                    <img
                      src={`/api/office/screenshot?file=${encodeURIComponent(selectedAccomplishment.screenshot)}`}
                      alt={selectedAccomplishment.title}
                      style={{
                        width: '100%',
                        borderRadius: 8,
                        border: '1px solid #334155',
                      }}
                    />
                  )}
                </div>
              </div>
            )}
            <button
              onClick={() => setSelectedAccomplishment(null)}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '8px 16px',
                background: '#334155',
                color: '#e2e8f0',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {selectedAgent && (
        <>
          <AgentPanel
            agent={selectedAgent}
            onClose={() => { sfx.play('close'); setSelectedAgent(null); }}
            autowork={autoworkPolicies[selectedAgent.id]}
            pendingChanges={pendingAutowork[selectedAgent.id]}
            onAutoworkUpdate={(agentId, patch) => {
              setPendingAutowork(prev => ({
                ...prev,
                [agentId]: { ...(prev[agentId] || {}), ...patch },
              }));
            }}
            onStop={(agentId) => {
              setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'idle' as AgentStatus, task: undefined } : a));
              setSelectedAgent(prev => prev && prev.id === agentId ? { ...prev, status: 'idle' as AgentStatus, task: undefined } : prev);
            }}
          />
          <div
            onClick={() => setSelectedAgent(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
            }}
          />
        </>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <>
          <SettingsPanel config={config} onConfigChange={setConfig} onClose={() => setShowSettings(false)} />
          <div onClick={() => setShowSettings(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
        </>
      )}

      {/* Pending Auto-Work Changes Banner */}
      {Object.keys(pendingAutowork).length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: 'linear-gradient(to right, #1e1b4b, #312e81)',
          borderTop: '2px solid #6366f1',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          animation: 'fadeSlideIn 0.3s ease-out',
          boxShadow: '0 -4px 20px rgba(99,102,241,0.3)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#e0e7ff',
              fontFamily: '"Press Start 2P", monospace',
              marginBottom: 4,
            }}>
              ⚠ WORKSPACE RESTART REQUIRED
            </div>
            <div style={{ fontSize: 11, color: '#a5b4fc', lineHeight: 1.5 }}>
              {Object.entries(pendingAutowork).map(([agentId, changes]) => {
                const agentName = agents.find(a => a.id === agentId)?.name || agentId;
                const parts: string[] = [];
                if (changes.enabled !== undefined) parts.push(changes.enabled ? 'enable auto-work' : 'disable auto-work');
                if (changes.intervalMs !== undefined) parts.push(`interval → ${formatInterval(changes.intervalMs)}`);
                if (changes.directive !== undefined) parts.push('updated directive');
                return `${agentName}: ${parts.join(', ')}`;
              }).join(' · ')}
            </div>
          </div>
          <button
            onClick={() => setPendingAutowork({})}
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              borderRadius: 8,
              padding: '8px 16px',
              color: '#94a3b8',
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: '"Press Start 2P", monospace',
            }}
          >
            DISCARD
          </button>
          <button
            onClick={async () => {
              const entries = Object.entries(pendingAutowork);
              try {
                for (const [agentId, changes] of entries) {
                  await fetch('/api/office/autowork', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ agentId, ...changes }),
                  });
                }
                // Merge into live policies
                setAutoworkPolicies(prev => {
                  const next = { ...prev };
                  for (const [agentId, changes] of entries) {
                    next[agentId] = { ...(next[agentId] || { enabled: false, intervalMs: 600_000, directive: '', lastSentAt: 0 }), ...changes };
                  }
                  return next;
                });
                setPendingAutowork({});
              } catch {
                alert('Failed to apply changes');
              }
            }}
            style={{
              background: '#6366f1',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              color: '#fff',
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: '"Press Start 2P", monospace',
              boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
            }}
          >
            APPLY & RESTART
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes npcBob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes plumbobSpin {
          0%,
          100% {
            transform: scale(1) translateY(0);
          }
          50% {
            transform: scale(1.1) translateY(-2px);
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(320px);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes statusFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes npcEntrance {
          0% { opacity: 0; transform: translateY(12px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes npcTypeLeft {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg) translateY(-1px); }
          75% { transform: rotate(4deg); }
        }
        @keyframes npcTypeRight {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(4deg); }
          75% { transform: rotate(-8deg) translateY(-1px); }
        }
        @keyframes npcBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
      `}</style>

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <TemplateGallery
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateGallery(false)}
        />
      )}

      {/* Call Meeting Modal */}
      {showCallMeeting && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowCallMeeting(false);
            setMeetingTopic('');
            setSelectedParticipants([]);
          }}
        >
          <div
            style={{
              background: '#0f172a',
              border: '2px solid #1e293b',
              borderRadius: 12,
              padding: 24,
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              margin: '0 0 16px 0',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 14,
              color: '#fff',
            }}>
              📞 Call Meeting
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              Select participants and a discussion topic. They'll gather in the Meeting Room to work through it together.
            </p>

            {/* Topic Input */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: 11,
                fontFamily: '"Press Start 2P", monospace',
                marginBottom: 8,
              }}>
                Meeting Topic
              </label>
              <input
                type="text"
                placeholder="What should they discuss? (e.g., 'Should we refactor the API?')"
                value={meetingTopic}
                onChange={(e) => setMeetingTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: '#e2e8f0',
                  fontSize: 13,
                }}
                autoFocus
              />
            </div>

            {/* Participant Selection */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                color: '#e2e8f0',
                fontSize: 11,
                fontFamily: '"Press Start 2P", monospace',
                marginBottom: 8,
              }}>
                Participants (select at least 2)
              </label>
              <div style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 8,
              }}>
                {agents.filter(a => a.id !== '_owner').map(agent => {
                  const isSelected = selectedParticipants.includes(agent.id);
                  return (
                    <div
                      key={agent.id}
                      onClick={() => {
                        sfx.play('click');
                        setSelectedParticipants(prev => {
                          if (isSelected) {
                            return prev.filter(id => id !== agent.id);
                          } else {
                            return [...prev, agent.id];
                          }
                        });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        background: isSelected ? 'rgba(124,58,237,0.25)' : 'transparent',
                        border: `2px solid ${isSelected ? '#8b5cf6' : '#334155'}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        background: isSelected ? '#8b5cf6' : '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        flexShrink: 0,
                      }}>
                        {isSelected && '✓'}
                      </div>
                      <span style={{ fontSize: 14 }}>{agent.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#e2e8f0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {agent.name}
                        </div>
                        <div style={{
                          fontSize: 10,
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {agent.role}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCallMeeting(false);
                  setMeetingTopic('');
                  setSelectedParticipants([]);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!meetingTopic.trim() || selectedParticipants.length < 2) return;
                  try {
                    const res = await fetch(getApiPath('/api/office/meeting/start'), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        topic: meetingTopic,
                        participants: selectedParticipants,
                      }),
                    });
                    if (res.ok) {
                      sfx.play('meetingStart');
                      setShowCallMeeting(false);
                      setMeetingTopic('');
                      setSelectedParticipants([]);
                      // Refresh meeting status
                      const meetRes = await fetch(getApiPath('/api/office/meeting'));
                      const meetData = await meetRes.json();
                      setMeeting(meetData);
                    }
                  } catch (err) {
                    console.error('Failed to start meeting:', err);
                  }
                }}
                disabled={!meetingTopic.trim() || selectedParticipants.length < 2}
                style={{
                  padding: '8px 16px',
                  background: (meetingTopic.trim() && selectedParticipants.length >= 2) ? '#8b5cf6' : '#334155',
                  border: 'none',
                  borderRadius: 6,
                  color: '#fff',
                  cursor: (meetingTopic.trim() && selectedParticipants.length >= 2) ? 'pointer' : 'not-allowed',
                  fontSize: 12,
                  fontWeight: 600,
                  opacity: (meetingTopic.trim() && selectedParticipants.length >= 2) ? 1 : 0.5,
                }}
              >
                Start Meeting ({selectedParticipants.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareCard
          onClose={() => setShowShareModal(false)}
          agents={agents}
          pendingActions={pendingActions}
          accomplishments={accomplishments}
          isDemoMode={isDemoMode}
        />
      )}
      <AchievementToastContainer
        toasts={achievementToasts}
        onDismiss={(id) => setAchievementToasts(prev => prev.filter(t => t.id !== id))}
      />
      <DemoTour isDemoMode={isDemoMode} />
    </div>
  );
}
