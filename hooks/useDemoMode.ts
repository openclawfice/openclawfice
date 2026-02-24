import { useSearchParams, usePathname } from 'next/navigation';

/**
 * Demo Mode Hook - Detects demo mode and returns appropriate API paths
 * Activates when ?demo=true OR when on the /demo route
 */
export function useDemoMode() {
  let searchParams;
  let pathname = '';
  try {
    searchParams = useSearchParams();
    pathname = usePathname() || '';
  } catch {
    searchParams = null;
  }
  const isDemoMode = searchParams?.get('demo') === 'true' || pathname === '/demo';

  const getApiPath = (path: string) => {
    if (!isDemoMode) return path;
    
    // Map real API paths to demo API paths
    const demoMap: Record<string, string> = {
      '/api/office': '/api/demo',
      '/api/office/actions': '/api/demo/actions',
      '/api/office/chat': '/api/demo/chat',
      '/api/office/meeting': '/api/demo/meeting',
      '/api/office/config': '/api/demo/config',
      '/api/office/autowork': '/api/demo/autowork',
      '/api/office/message': '/api/demo/message',
      '/api/office/stop': '/api/demo/stop',
      '/api/meeting': '/api/demo/meeting',
    };
    
    return demoMap[path] || path;
  };

  return {
    isDemoMode,
    getApiPath,
  };
}
