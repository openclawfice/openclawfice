/**
 * Sanitize OpenClawfice config for sharing
 * Removes personal data, API keys, absolute paths
 */

export function sanitizeConfig(config: any): any {
  if (!config) return {};

  const clean = JSON.parse(JSON.stringify(config)); // Deep clone

  // Remove owner personal info
  if (clean.owner) {
    delete clean.owner.name;
    delete clean.owner.email;
    delete clean.owner.phone;
    delete clean.owner.apiKeys;
  }

  // Sanitize agents
  if (clean.agents) {
    clean.agents = Object.fromEntries(
      Object.entries(clean.agents).map(([id, agent]: [string, any]) => {
        const sanitized = { ...agent };
        
        // Remove personal agent names (keep role/emoji)
        if (sanitized.name && !isGenericName(sanitized.name)) {
          delete sanitized.name;
        }

        // Remove API keys
        delete sanitized.apiKey;
        delete sanitized.token;
        delete sanitized.credentials;

        // Generalize agent ID
        const genericId = id.replace(/tyler|personal|user-\d+/i, 'agent');

        return [genericId, sanitized];
      })
    );
  }

  // Sanitize workspace paths (make relative or generic)
  if (clean.workspace) {
    clean.workspace = clean.workspace
      .replace(/\/Users\/\w+/g, '~')
      .replace(/C:\\Users\\\w+/g, '~')
      .replace(/\/home\/\w+/g, '~');
  }

  // Remove file paths from memory config
  if (clean.memory?.files) {
    clean.memory.files = clean.memory.files.map((file: string) =>
      file.replace(/\/Users\/\w+/g, '~')
          .replace(/C:\\Users\\\w+/g, '~')
          .replace(/\/home\/\w+/g, '~')
    );
  }

  // Remove waterCooler personal context
  if (clean.waterCooler?.context) {
    // Keep structure but remove specific messages
    clean.waterCooler.context = [];
  }

  // Keep structure, remove specific accomplishments/actions
  if (clean.accomplishments) {
    clean.accomplishments = [];
  }

  if (clean.pendingActions) {
    clean.pendingActions = [];
  }

  // Remove session-specific data
  delete clean.sessionId;
  delete clean.lastSeen;
  delete clean.createdAt;

  // Remove any OAuth tokens or secrets
  const sensitiveKeys = ['token', 'secret', 'key', 'password', 'auth', 'credential'];
  cleanSensitiveKeys(clean, sensitiveKeys);

  return clean;
}

/**
 * Check if a name is generic (safe to share)
 */
function isGenericName(name: string): boolean {
  const genericNames = [
    'agent', 'scout', 'cipher', 'pixel', 'nova', 'forge',
    'assistant', 'helper', 'bot', 'ai', 'worker',
    'agent-1', 'agent-2', 'agent-3'
  ];
  
  return genericNames.some(generic => 
    name.toLowerCase().includes(generic)
  );
}

/**
 * Recursively remove sensitive keys from object
 */
function cleanSensitiveKeys(obj: any, sensitiveKeys: string[]): void {
  if (!obj || typeof obj !== 'object') return;

  for (const key in obj) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      cleanSensitiveKeys(obj[key], sensitiveKeys);
    }
  }
}

/**
 * Validate sanitized config (ensure no sensitive data leaked)
 */
export function validateSanitized(config: any): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for common sensitive patterns
  const configStr = JSON.stringify(config);

  // Check for API keys (common patterns)
  if (/sk-[a-zA-Z0-9]{20,}/.test(configStr)) {
    issues.push('Possible API key detected');
  }

  // Check for email addresses
  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(configStr)) {
    issues.push('Email address detected');
  }

  // Check for absolute paths
  if (/\/Users\/[a-zA-Z0-9_-]+/.test(configStr) || /C:\\Users\\[a-zA-Z0-9_-]+/.test(configStr)) {
    issues.push('Absolute user path detected');
  }

  // Check for phone numbers (basic pattern)
  if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(configStr)) {
    issues.push('Possible phone number detected');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
