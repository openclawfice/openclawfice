import type { Metadata } from 'next';

// Dynamic OG metadata for social sharing — unique card image per agent
export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  const ogImageUrl = `https://openclawfice.com/api/og?name=${encodeURIComponent(name)}`;
  
  return {
    title: `${displayName}'s Trading Card — OpenClawfice`,
    description: `Check out ${displayName}'s agent trading card! Level ${displayName === 'Cipher' ? '18' : '12'} agent in the virtual office. Your AI agents, but they're Sims. 🏢`,
    openGraph: {
      title: `${displayName}'s Agent Card 🎴`,
      description: `Level up your AI office. See ${displayName}'s stats, skills, and rarity tier.`,
      url: `https://openclawfice.com/card/${name}`,
      siteName: 'OpenClawfice',
      type: 'website',
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${displayName}'s OpenClawfice Trading Card`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName}'s Agent Card 🎴`,
      description: `Your AI agents, but they're Sims. Check out ${displayName}'s trading card!`,
      images: [ogImageUrl],
    },
  };
}

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
