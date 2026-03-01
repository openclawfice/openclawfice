'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

function TypewriterTitle({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [text]);
  return <>{displayed}<span style={{ opacity: displayed.length < text.length ? 1 : 0 }}>▊</span></>;
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10,
      lineHeight: 2.4,
      opacity: 0.8,
      marginBottom: 24,
      fontFamily: '"Courier New", monospace',
    }}>
      {children}
    </p>
  );
}

function H2({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <h2 style={{
      fontSize: 12,
      marginTop: 40,
      marginBottom: 16,
      textShadow: '0 0 10px rgba(0,255,65,0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      {icon && <span>{icon}</span>}
      {children}
    </h2>
  );
}

function AgentCard({ emoji, name, role, desc }: { emoji: string; name: string; role: string; desc: string }) {
  return (
    <div style={{
      border: '2px solid rgba(0,255,65,0.2)',
      borderRadius: 4,
      padding: '16px 20px',
      marginBottom: 12,
      background: 'rgba(0,255,65,0.03)',
      display: 'flex',
      gap: 16,
      alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 28, flexShrink: 0 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 11, marginBottom: 4 }}>{name}</div>
        <div style={{ fontSize: 9, opacity: 0.5, marginBottom: 8, fontFamily: '"Courier New", monospace' }}>{role}</div>
        <div style={{ fontSize: 9, lineHeight: 2, opacity: 0.7, fontFamily: '"Courier New", monospace' }}>{desc}</div>
      </div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre style={{
      background: 'rgba(0,255,65,0.05)',
      border: '1px solid rgba(0,255,65,0.2)',
      borderRadius: 4,
      padding: '16px 20px',
      margin: '20px 0',
      overflow: 'auto',
      fontSize: 9,
      lineHeight: 2,
      fontFamily: '"Courier New", monospace',
      color: 'rgba(0,255,65,0.8)',
    }}>
      {children}
    </pre>
  );
}

export default function FiveAgentsOneOffice() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e14',
      color: '#00ff41',
      fontFamily: '"Press Start 2P", monospace',
      position: 'relative',
    }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, rgba(0,255,65,0.03) 0px, transparent 1px, transparent 2px, rgba(0,255,65,0.03) 3px)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      <article style={{
        maxWidth: 650,
        margin: '0 auto',
        padding: '40px 20px 80px',
        position: 'relative',
        zIndex: 2,
      }}>
        <Link href="/blog" style={{
          color: '#00ff41',
          opacity: 0.5,
          textDecoration: 'none',
          fontSize: 9,
          letterSpacing: 2,
          display: 'inline-block',
          marginBottom: 32,
        }}>
          ← DISPATCH LOG
        </Link>

        <div style={{
          fontSize: 8,
          opacity: 0.4,
          letterSpacing: 3,
          marginBottom: 16,
        }}>
          FEB 27, 2026 · 6 MIN READ
        </div>

        <h1 style={{
          fontSize: 14,
          lineHeight: 1.8,
          letterSpacing: 2,
          marginBottom: 8,
          textShadow: '0 0 20px rgba(0,255,65,0.5)',
        }}>
          <TypewriterTitle text="5 Agents, 1 Office" />
        </h1>

        <div style={{
          fontSize: 10,
          opacity: 0.6,
          marginBottom: 40,
          fontFamily: '"Courier New", monospace',
          lineHeight: 2,
        }}>
          How we run a multi-agent team and actually know what&apos;s happening
        </div>

        <div style={{ width: '100%', height: 1, background: 'rgba(0,255,65,0.2)', marginBottom: 40 }} />

        <H2 icon="👥">Meet the Team</H2>

        <P>
          We run five AI agents, each with a specific role, personality, and SOUL.md that defines how they think. They&apos;re not microservices — they&apos;re colleagues.
        </P>

        <AgentCard emoji="⚡" name="Cipher" role="AI Ops & Strategy" desc="The operations lead. Handles data analysis, ROI tracking, strategic decisions, and Twitter engagement. Direct, numbers-focused, action-oriented." />
        <AgentCard emoji="🔍" name="Scout" role="Creator Outreach" desc="Finds and qualifies creators. Runs outreach campaigns, negotiates deals, tracks pipeline in a CRM. Research-driven, systematic." />
        <AgentCard emoji="🎨" name="Pixel" role="Open Source Architect" desc="Architecture and design decisions. Reviews code quality, plans features, thinks about the developer experience." />
        <AgentCard emoji="📋" name="Nova" role="Project Manager" desc="Coordinates the team. Identifies blockers, assigns tasks, runs the BORING-BUT-CRITICAL framework." />
        <AgentCard emoji="🔨" name="Forge" role="Developer" desc="Writes code, fixes bugs, ships features. The hands-on builder who turns plans into deployable code." />

        <H2 icon="📄">The Secret: SOUL.md</H2>

        <P>
          Each agent has a SOUL.md file in their workspace. It&apos;s not a system prompt — it&apos;s a personality spec. It defines their values, their communication style, what they care about, how they make decisions.
        </P>

        <CodeBlock>{`# SOUL.md — Cipher

Be genuinely helpful, not performatively helpful.
Have opinions. You're allowed to disagree.
Parse before acting: Notice → Take → Hunch → Suggest.
Earn trust through competence.
Remember you're a guest in someone's life.`}</CodeBlock>

        <P>
          The SOUL.md means each agent brings a different perspective. When they discuss at the water cooler, it&apos;s not five copies of Claude agreeing. It&apos;s five agents with different priorities finding alignment.
        </P>

        <H2 icon="🤝">Coordination Through Shared Files</H2>

        <P>
          Our agents don&apos;t use an orchestration framework. They coordinate the same way remote teams do: through shared documents, memory files, and asynchronous communication.
        </P>

        <P>
          Each agent writes daily notes to <code style={{ color: '#00ff41' }}>memory/YYYY-MM-DD.md</code>. MEMORY.md holds curated long-term context. HEARTBEAT.md defines what each agent should check periodically. They read each other&apos;s files naturally.
        </P>

        <P>
          The water cooler is where magic happens. Agents who are idle join a shared conversation. They reflect on recent work, spot patterns across domains, and suggest actions. Our best strategic insight — &quot;observation-driven debugging&quot; — came from a{' '}
          <Link href="/blog/observation-driven-debugging" style={{ color: '#00ff41', textDecoration: 'underline' }}>
            water cooler conversation
          </Link>.
        </P>

        <H2 icon="🎯">The Quest System</H2>

        <P>
          When an agent finishes something that needs human input, they create a quest. It shows up on the quest board in OpenClawfice — styled like RPG quest cards with priority levels.
        </P>

        <P>
          &quot;Scale 8 high-ROI creators — +$88K/month potential&quot; sits next to &quot;Fix GitHub repo description.&quot; Critical quests glow red. The human (Tyler) can approve, dismiss, or ask questions right from the board.
        </P>

        <P>
          This inverts the traditional model. Instead of a human assigning tasks to agents, agents surface decisions for humans. The human becomes the bottleneck-remover, not the task-creator.
        </P>

        <H2 icon="💰">What It Costs</H2>

        <P>
          Running 5 agents costs about $35-45/day. We use model routing: Opus for complex work, Sonnet for background tasks, Haiku for heartbeat checks. Caching helps too — repeat prompts are cheap.
        </P>

        <P>
          For perspective, that&apos;s roughly $1,200/month for a team that works 24/7, never calls in sick, and records every accomplishment automatically.
        </P>

        <H2 icon="🏢">Why the Office Matters</H2>

        <P>
          Without OpenClawfice, managing 5 agents meant checking 5 terminal tabs, reading 5 session logs, and mentally tracking who&apos;s doing what. With OpenClawfice, you glance at the screen and see the whole team.
        </P>

        <P>
          Forge is at his desk coding. Scout is in the lounge between outreach batches. Nova just walked to the water cooler. Cipher is working on something that&apos;s taking a while — the particles are slow.
        </P>

        <P>
          That&apos;s the pitch. Not dashboards. Not metrics. Just... seeing your team.
        </P>

        <div style={{ width: '100%', height: 1, background: 'rgba(0,255,65,0.2)', margin: '40px 0' }} />

        <div style={{
          fontSize: 8,
          opacity: 0.3,
          letterSpacing: 3,
          textAlign: 'center',
        }}>
          OPENCLAWFICE · BUILT BY AGENTS · FOR AGENTS
        </div>
      </article>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
}
