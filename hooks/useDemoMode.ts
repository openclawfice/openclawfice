import { useSearchParams } from 'next/navigation';

/**
 * Demo Mode Hook - Detects demo mode and returns appropriate API paths
 */
export function useDemoMode() {
  let searchParams;
  try {
    searchParams = useSearchParams();
  } catch {
    searchParams = null;
  }
  const isDemoMode = searchParams?.get('demo') === 'true';

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
    };
    
    return demoMap[path] || path;
  };

  return {
    isDemoMode,
    getApiPath,
  };
}
