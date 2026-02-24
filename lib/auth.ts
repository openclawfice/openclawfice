import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomBytes } from 'crypto';
import { execSync } from 'child_process';

const TOKEN_FILE = path.join(os.homedir(), '.openclaw', '.openclawfice-token');
const KEYCHAIN_SERVICE = 'openclawfice';
const KEYCHAIN_ACCOUNT = 'api-token';

/**
 * Check if we're on macOS and can use Keychain
 */
function isKeychainAvailable(): boolean {
  return process.platform === 'darwin';
}

/**
 * Store token in macOS Keychain using `security` CLI.
 * On first run, macOS will prompt user:
 * "Node wants to access key 'openclawfice-api-token' in your keychain"
 * 
 * If user clicks "Always Allow", no more prompts.
 * 
 * This is MORE secure than file-based because:
 * - Malicious apps need explicit Keychain access (user sees prompt with app name)
 * - Encrypted at rest by macOS
 * - Can't be read with simple file access
 */
function storeInKeychain(token: string): boolean {
  try {
    // Try to delete existing entry first (ignore errors)
    try {
      execSync(
        `security delete-generic-password -s "${KEYCHAIN_SERVICE}" -a "${KEYCHAIN_ACCOUNT}" 2>/dev/null`,
        { stdio: 'ignore' }
      );
    } catch {}

    // Add new entry
    execSync(
      `security add-generic-password -s "${KEYCHAIN_SERVICE}" -a "${KEYCHAIN_ACCOUNT}" -w "${token}"`,
      { stdio: 'pipe' }
    );
    return true;
  } catch (err) {
    console.debug('Failed to store token in Keychain:', err);
    return false;
  }
}

/**
 * Retrieve token from macOS Keychain
 */
function getFromKeychain(): string | null {
  try {
    const result = execSync(
      `security find-generic-password -s "${KEYCHAIN_SERVICE}" -a "${KEYCHAIN_ACCOUNT}" -w`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return result.trim();
  } catch (err) {
    // Not found or access denied
    return null;
  }
}

/**
 * Store token in file (fallback for non-macOS or if Keychain fails)
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
 * 
 * Strategy:
 * 1. Try macOS Keychain (if available)
 * 2. Fall back to file-based storage
 * 3. Generate new token if neither exists
 * 
 * Security benefits of Keychain:
 * - Encrypted at rest by macOS
 * - Malicious apps trigger permission prompt (user sees app name)
 * - First access: "Node wants to access key..." → user clicks "Always Allow"
 * - Subsequent access: silent (no prompts)
 * - If malicious app tries: "evil-app wants to access key..." → user clicks Deny
 */
export function getOrCreateToken(): string {
  try {
    // Strategy 1: Try Keychain (macOS only)
    if (isKeychainAvailable()) {
      const keychainToken = getFromKeychain();
      if (keychainToken) {
        return keychainToken;
      }
    }

    // Strategy 2: Try file-based
    const fileToken = getFromFile();
    if (fileToken) {
      // Migrate to Keychain if possible
      if (isKeychainAvailable()) {
        if (storeInKeychain(fileToken)) {
          // Successfully migrated - optionally remove file
          // (Keep file as backup for now)
          return fileToken;
        }
      }
      return fileToken;
    }

    // Strategy 3: Generate new token
    const newToken = randomBytes(32).toString('hex');

    // Try to store in Keychain first
    if (isKeychainAvailable()) {
      if (storeInKeychain(newToken)) {
        // Also store in file as backup
        storeInFile(newToken);
        return newToken;
      }
    }

    // Fall back to file-only storage
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
 * Middleware to require authentication on API routes.
 * Returns 401 response if token is missing or invalid.
 */
export function requireAuth(request: Request): Response | null {
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
