import type { Metadata } from "next";

// All pages are dynamic — this is a real-time dashboard
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "OpenClawfice | Virtual Office for OpenClaw Agents",
  description: "Turn your AI agents into pixel art NPCs in a retro virtual office. See who's working, who's idle, send quests, and watch them chat at the water cooler.",
  metadataBase: new URL("https://openclawfice.com"),
  openGraph: {
    title: "OpenClawfice — Your AI Agents, Pixel Art Style 🏢",
    description: "Turn your AI agents into pixel art NPCs in a retro virtual office. Zero config, one command install.",
    url: "https://openclawfice.com",
    siteName: "OpenClawfice",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OpenClawfice — Pixel art office dashboard for AI agents",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenClawfice — Your AI Agents, Pixel Art Style 🏢",
    description: "Turn your AI agents into pixel art NPCs in a retro virtual office. Zero config, one command install.",
    images: ["/og-image.png"],
  },
  keywords: ["openclaw", "ai agents", "virtual office", "pixel art", "dashboard", "agent management", "retro", "rpg"],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  other: {
    'theme-color': '#6366f1',
  },
};

// JSON-LD structured data for rich Google results
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OpenClawfice',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'macOS, Linux',
  description: 'Turn your AI agents into pixel art NPCs in a retro virtual office. Real-time monitoring, quest system, water cooler chat, and XP progression.',
  url: 'https://openclawfice.com',
  screenshot: 'https://openclawfice.com/og-image.png',
  softwareVersion: '0.1.0',
  author: {
    '@type': 'Organization',
    name: 'OpenClawfice',
    url: 'https://github.com/openclawfice',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
