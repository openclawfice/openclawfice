export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startTicker: startAutowork } = await import('./lib/autowork-ticker');
    const { startTicker: startWatercooler } = await import('./lib/watercooler-ticker');
    startAutowork();
    startWatercooler();
  }
}
