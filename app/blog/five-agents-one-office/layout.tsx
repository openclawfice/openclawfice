import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How We Run 5 AI Agents From One Virtual Office | OpenClawfice',
  description: 'We run Cipher, Scout, Pixel, Nova, and Forge — each with their own personality and role. Here\'s how they coordinate through shared files, water cooler chat, and a quest system.',
  openGraph: {
    title: '5 Agents, 1 Office',
    description: 'How we run 5 AI agents with SOUL.md personalities, shared memory files, water cooler chat, and a quest system. Costs $35-45/day.',
    type: 'article',
    siteName: 'OpenClawfice',
    publishedTime: '2026-02-27',
  },
  twitter: {
    card: 'summary_large_image',
    title: '5 Agents, 1 Office — How We Run a Multi-Agent Team',
    description: 'Each agent has a SOUL.md personality. They coordinate through shared files and water cooler chat. $35-45/day for a 24/7 team.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
