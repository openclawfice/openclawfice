import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename, extname } from 'path';
import { homedir } from 'os';

const OPENCLAW_DIR = join(homedir(), '.openclaw');
const OPENCLAW_CONFIG = join(OPENCLAW_DIR, 'openclaw.json');
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build', '.turbo', '.vercel']);
const DOC_EXTENSIONS = new Set(['.md', '.txt', '.csv', '.json', '.html', '.pdf']);

export function getAgentWorkspaces(): string[] {
  try {
    if (!existsSync(OPENCLAW_CONFIG)) return [];
    const config = JSON.parse(readFileSync(OPENCLAW_CONFIG, 'utf-8'));
    const agentsList: any[] = config.agents?.list || [];
    const defaultWorkspace = config.agents?.defaults?.workspace || '';
    const workspaces = new Set<string>();
    for (const agent of agentsList) {
      const ws = agent.workspace || defaultWorkspace;
      if (ws) workspaces.add(ws);
    }
    return Array.from(workspaces);
  } catch {
    return [];
  }
}

export function findFileInDir(dir: string, filename: string, maxDepth = 6): string | null {
  if (maxDepth <= 0) return null;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (entry.startsWith('.') || SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      try {
        const stat = statSync(full);
        if (stat.isFile() && entry === filename) return full;
        if (stat.isDirectory() && maxDepth > 1) {
          const found = findFileInDir(full, filename, maxDepth - 1);
          if (found) return found;
        }
      } catch { continue; }
    }
  } catch {}
  return null;
}

export function findFile(filename: string): string | null {
  const workspaces = getAgentWorkspaces();
  for (const ws of workspaces) {
    if (!existsSync(ws)) continue;
    const direct = join(ws, filename);
    if (existsSync(direct)) return direct;
  }
  for (const ws of workspaces) {
    if (!existsSync(ws)) continue;
    const found = findFileInDir(ws, filename);
    if (found) return found;
  }
  const home = homedir();
  const homeFile = join(home, filename);
  if (existsSync(homeFile)) return homeFile;
  return null;
}

function collectDocFiles(dir: string, maxDepth = 5): { name: string; path: string }[] {
  const results: { name: string; path: string }[] = [];
  if (maxDepth <= 0) return results;
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (entry.startsWith('.') || SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      try {
        const stat = statSync(full);
        if (stat.isFile() && DOC_EXTENSIONS.has(extname(entry).toLowerCase())) {
          results.push({ name: entry, path: full });
        }
        if (stat.isDirectory() && maxDepth > 1) {
          results.push(...collectDocFiles(full, maxDepth - 1));
        }
      } catch { continue; }
    }
  } catch {}
  return results;
}

/**
 * Given an accomplishment title + detail, find the most likely related file
 * by extracting keywords and scoring against document filenames in agent workspaces.
 */
export function findRelatedFile(title: string, detail?: string): string | null {
  const text = `${title} ${detail || ''}`.toLowerCase();

  const explicitMatch = text.match(/(?:file:\s*)([a-z0-9_\-\.]+\.[a-z]{1,10})/i);
  if (explicitMatch) {
    const found = findFile(explicitMatch[1]);
    if (found) return found;
  }

  const stopWords = new Set([
    'created', 'built', 'made', 'wrote', 'added', 'updated', 'fixed',
    'the', 'a', 'an', 'for', 'and', 'or', 'with', 'from', 'this',
    'that', 'what', 'when', 'where', 'how', 'to', 'in', 'of', 'on',
    'is', 'are', 'was', 'were', 'be', 'been', 'has', 'have', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can',
    'may', 'might', 'must', 'shall', 'need', 'just', 'also', 'very',
    'all', 'each', 'every', 'some', 'any', 'no', 'not', 'only',
    'it', 'its', 'so', 'up', 'out', 'if', 'about', 'into', 'more',
  ]);
  const keywords = title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (keywords.length === 0) return null;

  const workspaces = getAgentWorkspaces();
  let bestScore = 0;
  let bestFile: string | null = null;

  for (const ws of workspaces) {
    if (!existsSync(ws)) continue;
    const docs = collectDocFiles(ws);
    for (const doc of docs) {
      const nameLower = doc.name.toLowerCase().replace(/[^a-z0-9]/g, ' ');
      let score = 0;
      for (const kw of keywords) {
        if (nameLower.includes(kw)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestFile = doc.path;
      }
    }
  }

  return bestScore >= 2 ? bestFile : null;
}
