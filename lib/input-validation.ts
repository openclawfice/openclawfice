/**
 * Input validation utilities for API endpoints
 * Prevents injection attacks and validates user input
 */

/**
 * Sanitize message text to prevent injection attacks
 * Removes control characters and limits length
 */
export function sanitizeMessage(message: string): string {
  if (typeof message !== 'string') {
    throw new Error('Message must be a string');
  }
  
  // Remove control characters (except newlines and tabs)
  const cleaned = message.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limit length (prevent DoS)
  const MAX_LENGTH = 10000;
  if (cleaned.length > MAX_LENGTH) {
    throw new Error(`Message too long (max ${MAX_LENGTH} characters)`);
  }
  
  return cleaned.trim();
}

/**
 * Validate agent ID format
 * Ensures it's alphanumeric with hyphens/underscores only
 */
export function validateAgentId(agentId: string): boolean {
  if (typeof agentId !== 'string') {
    return false;
  }
  
  // Allow alphanumeric, hyphens, underscores (typical agent IDs)
  const AGENT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
  
  if (!AGENT_ID_PATTERN.test(agentId)) {
    return false;
  }
  
  // Reasonable length limits
  if (agentId.length < 1 || agentId.length > 100) {
    return false;
  }
  
  return true;
}

/**
 * Validate filename to prevent path traversal
 * Ensures no directory traversal or absolute paths
 */
export function validateFilename(filename: string): boolean {
  if (typeof filename !== 'string') {
    return false;
  }
  
  // Reject path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }
  
  // Reject absolute paths
  if (filename.startsWith('/') || filename.includes(':')) {
    return false;
  }
  
  // Allow alphanumeric, hyphens, underscores, dots
  const FILENAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;
  if (!FILENAME_PATTERN.test(filename)) {
    return false;
  }
  
  // Reasonable length
  if (filename.length < 1 || filename.length > 255) {
    return false;
  }
  
  return true;
}

/**
 * Sanitize JSON object for safe serialization
 * Removes functions and circular references
 */
export function sanitizeJSON(obj: any): any {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (err) {
    throw new Error('Invalid JSON object: contains circular references or functions');
  }
}

/**
 * Validate array of agent IDs
 */
export function validateAgentIdArray(agentIds: any): boolean {
  if (!Array.isArray(agentIds)) {
    return false;
  }
  
  // Limit array size to prevent DoS
  if (agentIds.length > 100) {
    return false;
  }
  
  // Validate each ID
  return agentIds.every(id => validateAgentId(id));
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production apps, use Redis or similar
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetAt) {
    // Start new window
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs
    });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
