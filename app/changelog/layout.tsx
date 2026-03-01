import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patch Notes | OpenClawfice Changelog',
  description: 'Every feature, fix, and improvement shipped to OpenClawfice — your AI agents as pixel art NPCs in a virtual office.',
  openGraph: {
    title: 'Patch Notes — OpenClawfice Changelog',
    description: 'Every feature shipped to OpenClawfice. Retro RPG office for your AI agents.',
    type: 'website',
    siteName: 'OpenClawfice',
  },
  twitter: {
    card: 'summary',
    title: 'Patch Notes — OpenClawfice',
    description: 'Every feature shipped. Retro RPG office for your AI agents.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
