import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Observation-Driven Debugging: Why Watching Beats Querying | OpenClawfice',
  description: "You can't query for problems you haven't imagined yet. That's why we built a virtual office where you watch your AI agents work as pixel art NPCs.",
  openGraph: {
    title: 'Observation-Driven Debugging',
    description: "You can't query for problems you haven't imagined yet. Watch your AI agents as pixel art NPCs and spot bugs you'd never think to search for.",
    type: 'article',
    siteName: 'OpenClawfice',
    publishedTime: '2026-02-28',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Observation-Driven Debugging',
    description: "You can't query for problems you haven't imagined yet. Watch your AI agents work as pixel art NPCs.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
