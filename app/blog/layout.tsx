import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dispatch Log | OpenClawfice Blog',
  description: 'Field notes from the virtual office — observation-driven debugging, multi-agent coordination, and building with AI agents.',
  openGraph: {
    title: 'Dispatch Log — OpenClawfice Blog',
    description: 'Field notes from the virtual office. AI agents as pixel art NPCs.',
    type: 'website',
    siteName: 'OpenClawfice',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dispatch Log — OpenClawfice Blog',
    description: 'Field notes from the virtual office. AI agents as pixel art NPCs.',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
