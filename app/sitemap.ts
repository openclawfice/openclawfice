import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://openclawfice.com';
  const now = new Date().toISOString();
  
  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/demo`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/landing`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/install`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/help`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/changelog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/blog/observation-driven-debugging`, lastModified: '2026-02-28', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/blog/five-agents-one-office`, lastModified: '2026-02-27', changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/card`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/leaderboard`, lastModified: now, changeFrequency: 'daily', priority: 0.5 },
    { url: `${base}/stats`, lastModified: now, changeFrequency: 'daily', priority: 0.4 },
    { url: `${base}/affiliate`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/showcase`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ];
}
