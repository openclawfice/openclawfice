import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomBytes } from 'crypto';

const TOKEN_FILE = path.join(os.homedir(), '.openclaw', '.openclawfice-token');

/**
 * Store token in file
 */
function storeInFile(token: string): boolean {
  try {
    fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
    fs.writeFileSync(TOKEN_FILE, token, { mode: 0o600 });
    return true;
  } catch (err) {
    console.error('Failed to store token in file:', err);
    return false;
  }
}

/**
 * Get token from file
 */
function getFromFile(): string | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return fs.readFileSync(TOKEN_FILE, 'utf-8').trim();
    }
  } catch (err) {
    console.debug('Failed to read token from file:', err);
  }
  return null;
}

/**
 * Generate or load the API auth token.
 * Simple file-based storage in ~/.openclaw/.openclawfice-token
 */
export function getOrCreateToken(): string {
  try {
    // Try to read existing token
    const fileToken = getFromFile();
    if (fileToken) {
      return fileToken;
    }

    // Generate new token
    const newToken = randomBytes(32).toString('hex');

    // Store in file
    if (storeInFile(newToken)) {
      return newToken;
    }

    // Last resort: ephemeral token (in-memory only)
    console.warn('⚠️  Could not persist auth token - using ephemeral token for this session');
    return newToken;
  } catch (err) {
    console.error('Failed to manage auth token:', err);
    // Fallback: generate ephemeral token for this session
    return randomBytes(32).toString('hex');
  }
}

/**
 * Verify the request has valid auth token.
 * Returns true if authorized, false otherwise.
 */
export function verifyToken(request: Request): boolean {
  const expectedToken = getOrCreateToken();
  const providedToken = request.headers.get('X-OpenClawfice-Token');
  
  if (!providedToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return constantTimeEqual(expectedToken, providedToken);
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Returns true if strings are equal, false otherwise.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Check if we're running in a serverless/hosted environment (e.g. Vercel)
 * where there's no persistent token file. Auth is only meaningful
 * on localhost where the token file exists.
 */
function isServerless(): boolean {
  return !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
}

/**
 * Middleware to require authentication on API routes.
 * Returns 401 response if token is missing or invalid.
 * Skips auth on serverless platforms (Vercel) where ephemeral tokens
 * would break cross-function auth (no shared filesystem).
 */
export function requireAuth(request: Request): Response | null {
  // Skip auth on serverless — no persistent token file means
  // each function invocation generates a different ephemeral token
  if (isServerless()) return null;

  if (!verifyToken(request)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - missing or invalid token' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  return null;
}
