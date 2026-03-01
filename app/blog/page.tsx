'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  icon: string;
  readTime: string;
}

const POSTS: Post[] = [
  {
    slug: 'observation-driven-debugging',
    title: 'Observation-Driven Debugging: Why Watching Beats Querying',
    date: 'Feb 28, 2026',
    excerpt: 'You can\'t query for problems you haven\'t imagined yet. That\'s why we built a virtual office where you watch your AI agents work as pixel art NPCs — and spot the bugs you\'d never think to search for.',
    icon: '🔍',
    readTime: '4 min',
  },
  {
    slug: 'five-agents-one-office',
    title: 'How We Run 5 AI Agents From One Virtual Office',
    date: 'Feb 27, 2026',
    excerpt: 'We run Cipher, Scout, Pixel, Nova, and Forge — each with their own personality and role. Here\'s how they coordinate through shared files, water cooler chat, and a quest system.',
    icon: '🏢',
    readTime: '6 min',
  },
];

function TypewriterTitle({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [text]);
  return <>{displayed}<span style={{ opacity: displayed.length < text.length ? 1 : 0 }}>▊</span></>;
}

export default function BlogIndex() {
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

      <div style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '40px 20px 60px',
        position: 'relative',
        zIndex: 2,
      }}>
        <Link href="/" style={{
          color: '#00ff41',
          opacity: 0.5,
          textDecoration: 'none',
          fontSize: 9,
          letterSpacing: 2,
          display: 'inline-block',
          marginBottom: 32,
        }}>
          ← BACK TO OFFICE
        </Link>

        <h1 style={{
          fontSize: 20,
          letterSpacing: 4,
          marginBottom: 8,
          textShadow: '0 0 20px rgba(0,255,65,0.5)',
        }}>
          <TypewriterTitle text="DISPATCH LOG" />
        </h1>

        <p style={{
          fontSize: 8,
          opacity: 0.4,
          letterSpacing: 3,
          marginBottom: 48,
        }}>
          FIELD NOTES FROM THE OFFICE
        </p>

        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{
              display: 'block',
              padding: '20px 24px',
              marginBottom: 16,
              border: '2px solid rgba(0,255,65,0.2)',
              borderRadius: 4,
              background: 'rgba(0,255,65,0.03)',
              textDecoration: 'none',
              color: '#00ff41',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00ff41';
              e.currentTarget.style.background = 'rgba(0,255,65,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)';
              e.currentTarget.style.background = 'rgba(0,255,65,0.03)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
            }}>
              <span style={{ fontSize: 28, flexShrink: 0, marginTop: 4 }}>
                {post.icon}
              </span>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: 11,
                  lineHeight: 1.8,
                  marginBottom: 8,
                  textShadow: '0 0 8px rgba(0,255,65,0.3)',
                }}>
                  {post.title}
                </h2>
                <p style={{
                  fontSize: 9,
                  lineHeight: 2,
                  opacity: 0.6,
                  margin: 0,
                  marginBottom: 8,
                }}>
                  {post.excerpt}
                </p>
                <div style={{
                  fontSize: 8,
                  opacity: 0.35,
                  display: 'flex',
                  gap: 16,
                }}>
                  <span>{post.date}</span>
                  <span>{post.readTime} read</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
    </div>
  );
}
