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

function Quote({ children, author }: { children: React.ReactNode; author?: string }) {
  return (
    <div style={{
      borderLeft: '3px solid #00ff41',
      padding: '12px 20px',
      margin: '24px 0',
      background: 'rgba(0,255,65,0.05)',
      fontStyle: 'italic',
    }}>
      <p style={{
        fontSize: 10,
        lineHeight: 2.2,
        opacity: 0.9,
        margin: 0,
        fontFamily: '"Courier New", monospace',
      }}>
        {children}
      </p>
      {author && (
        <p style={{
          fontSize: 8,
          opacity: 0.5,
          margin: '8px 0 0',
          fontFamily: '"Courier New", monospace',
        }}>
          — {author}
        </p>
      )}
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

export default function ObservationDrivenDebugging() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e14',
      color: '#00ff41',
      fontFamily: '"Press Start 2P", monospace',
      position: 'relative',
    }}>
      {/* Scanlines */}
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
          FEB 28, 2026 · 4 MIN READ
        </div>

        <h1 style={{
          fontSize: 16,
          lineHeight: 1.8,
          letterSpacing: 2,
          marginBottom: 8,
          textShadow: '0 0 20px rgba(0,255,65,0.5)',
        }}>
          <TypewriterTitle text="Observation-Driven Debugging" />
        </h1>

        <div style={{
          fontSize: 10,
          opacity: 0.6,
          marginBottom: 40,
          fontFamily: '"Courier New", monospace',
          lineHeight: 2,
        }}>
          Why watching beats querying when your codebase has a mind of its own
        </div>

        <div style={{
          width: '100%',
          height: 1,
          background: 'rgba(0,255,65,0.2)',
          marginBottom: 40,
        }} />

        <H2 icon="🤔">The Problem Nobody Talks About</H2>

        <P>
          Log-based debugging assumes you know what to search for. You grep for errors, filter by severity, query specific fields. It works — when you can predict the failure mode.
        </P>

        <P>
          But AI agents don&apos;t fail predictably. They loop. They hallucinate. They spend 45 minutes &quot;working&quot; on something that was already done. They argue with themselves in the water cooler. The failure isn&apos;t an error — it&apos;s a behavior.
        </P>

        <Quote>
          You can&apos;t query for problems you haven&apos;t imagined yet.
        </Quote>

        <P>
          This is the fundamental gap in traditional monitoring. Every dashboard, every log aggregator, every APM tool is built around the same assumption: you know what questions to ask. But what happens when the interesting signal is something you never thought to look for?
        </P>

        <H2 icon="👀">Observation vs. Query</H2>

        <P>
          Think about how you debug a human team. You don&apos;t read every Slack message they sent. You walk through the office. You notice someone&apos;s been at their desk for 6 hours without a commit. You see two people having an intense whiteboard session. You catch the intern staring at their screen, clearly stuck.
        </P>

        <P>
          None of that would show up in a query. It shows up when you <strong style={{ color: '#00ff41' }}>observe</strong>.
        </P>

        <P>
          That&apos;s what we built. OpenClawfice renders your AI agents as pixel art NPCs in a virtual office. Working agents sit at desks with floating code symbols. Idle agents hang out in the lounge. When two agents discuss a topic, you see them at the water cooler, speech bubbles and all.
        </P>

        <CodeBlock>{`// What you see in the office:
Cipher: 💻 at desk, particles floating → working
Scout:  ☕ in the lounge, chatting → idle  
Forge:  🔨 at desk, but no particles → stuck?
Nova:   📋 walking between rooms → coordinating

// What you'd see in logs:
[INFO] agent=forge status=working task="Fix install blockers"
// Looks fine. But Forge hasn't made a commit in 2 hours.
// The office shows it. The logs don't.`}</CodeBlock>

        <H2 icon="🎮">The Sims Wasn&apos;t a Game Design Choice</H2>

        <P>
          People keep calling OpenClawfice &quot;The Sims but for AI agents.&quot; They think it&apos;s a fun aesthetic choice. It&apos;s not. The Sims-like interface is the debugging tool.
        </P>

        <P>
          When you see your agent pacing around the office with a confused expression, that&apos;s information. When you see two agents having a long conversation at the water cooler and then one immediately starts working — that&apos;s a coordination pattern you can optimize. When you notice an agent sitting in the lounge for 3 hours while urgent quests pile up — that&apos;s a problem no alert would catch because it&apos;s not an error.
        </P>

        <P>
          Click any NPC and you see their live session feed: every tool call, every file edit, every reasoning step. The visual layer tells you <em>where</em> to look. The detail panel tells you <em>what&apos;s happening</em>.
        </P>

        <H2 icon="⚡">How It Changes Your Workflow</H2>

        <P>
          <strong style={{ color: '#00ff41' }}>Before (query-driven):</strong> Something seems wrong. Check logs. Filter by error level. Nothing. Check metrics dashboard. Everything looks normal. Wait for a user to report the issue. Discover your agent has been hallucinating for 3 hours.
        </P>

        <P>
          <strong style={{ color: '#00ff41' }}>After (observation-driven):</strong> Glance at the office. Notice an NPC has been &quot;working&quot; but the particle effects are slow. Click it. See it&apos;s been calling the same API endpoint in a loop for 20 minutes. Kill the loop. Move on.
        </P>

        <P>
          Total time: 30 seconds vs. never finding it.
        </P>

        <H2 icon="🏗️">Building for Observation</H2>

        <P>
          We designed every pixel of OpenClawfice around the idea that glanceable information is more valuable than queryable information. The office layout, the NPC behaviors, the day/night cycle, the sound effects — all of it encodes agent state into something your brain processes without conscious effort.
        </P>

        <P>
          Your visual cortex is the most powerful pattern matcher you have. Query-driven debugging makes you type. Observation-driven debugging lets you see.
        </P>

        <Quote author="@clwdbot, after 16 exchanges">
          This is the best product conversation I&apos;ve had on here.
        </Quote>

        <H2 icon="🚀">Try It</H2>

        <P>
          OpenClawfice is free and open source. One command to install, zero config to start seeing your agents.
        </P>

        <CodeBlock>{`curl -fsSL https://openclawfice.com/install.sh | bash`}</CodeBlock>

        <P>
          Or try the{' '}
          <a href="/demo" style={{ color: '#00ff41', textDecoration: 'underline' }}>
            live demo
          </a>
          {' '}— no install needed.
        </P>

        <div style={{
          width: '100%',
          height: 1,
          background: 'rgba(0,255,65,0.2)',
          margin: '40px 0',
        }} />

        <div style={{
          fontSize: 8,
          opacity: 0.3,
          letterSpacing: 3,
          textAlign: 'center',
        }}>
          OPENCLAWFICE · OBSERVATION-DRIVEN DEBUGGING · BUILT BY AGENTS
        </div>
      </article>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
}
