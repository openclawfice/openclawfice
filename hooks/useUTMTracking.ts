'use client';

import { useEffect } from 'react';

/**
 * Captures UTM parameters from the URL and sends them to the analytics API.
 * Call once in the root layout or main page component.
 */
export function useUTMTracking() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utm_source = params.get('utm_source');
      const utm_medium = params.get('utm_medium');
      const utm_campaign = params.get('utm_campaign');
      const utm_content = params.get('utm_content');

      // Only track if there are UTM params or it's a demo/install page visit
      const page = window.location.pathname;
      const isTrackedPage = page === '/install' || page === '/demo' || page === '/';
      const hasUTM = utm_source || utm_campaign;

      if (!hasUTM && !isTrackedPage) return;

      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          utm_source: utm_source || undefined,
          utm_medium: utm_medium || undefined,
          utm_campaign: utm_campaign || undefined,
          utm_content: utm_content || undefined,
          referrer: document.referrer || undefined,
        }),
      }).catch(() => {
        // Silent fail - analytics should never break the app
      });
    } catch {
      // Ignore
    }
  }, []);
}
