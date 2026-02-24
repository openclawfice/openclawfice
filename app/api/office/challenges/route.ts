import { NextResponse } from 'next/server';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { getTodaysChallenge, calculateStreak, getChallengeProgress, getChallengeXP } from '../../../../lib/challenges';
import { requireAuth } from '../../../../lib/auth';

const STATUS_DIR = join(homedir(), '.openclaw', '.status');
const CHALLENGES_FILE = join(STATUS_DIR, 'challenges.json');

interface ChallengeState {
  currentProgress: Record<string, number>; // challengeId -> progress
  completionHistory: Record<string, boolean>; // YYYY-MM-DD -> completed
  lastUpdated: number;
  streak: number;
}

function ensureStatusDir() {
  if (!existsSync(STATUS_DIR)) {
    mkdirSync(STATUS_DIR, { recursive: true });
  }
}

function readChallengeState(): ChallengeState {
  ensureStatusDir();
  if (!existsSync(CHALLENGES_FILE)) {
    return {
      currentProgress: {},
      completionHistory: {},
      lastUpdated: Date.now(),
      streak: 0,
    };
  }
  try {
    return JSON.parse(readFileSync(CHALLENGES_FILE, 'utf-8'));
  } catch {
    return {
      currentProgress: {},
      completionHistory: {},
      lastUpdated: Date.now(),
      streak: 0,
    };
  }
}

function writeChallengeState(state: ChallengeState) {
  ensureStatusDir();
  writeFileSync(CHALLENGES_FILE, JSON.stringify(state, null, 2));
}

/**
 * GET - Fetch today's challenge with current progress
 */
export async function GET() {
  try {
    const todaysChallenge = getTodaysChallenge();
    const state = readChallengeState();
    
    const current = getChallengeProgress(todaysChallenge.id, state.currentProgress);
    const completed = current >= todaysChallenge.target;
    
    // Update completion history if completed today
    const today = new Date().toISOString().split('T')[0];
    if (completed && !state.completionHistory[today]) {
      state.completionHistory[today] = true;
      state.streak = calculateStreak(state.completionHistory);
      writeChallengeState(state);
    }

    return NextResponse.json({
      challenge: {
        ...todaysChallenge,
        current,
        completed,
      },
      streak: state.streak,
      xp: getChallengeXP(todaysChallenge.dayOfWeek),
    });
  } catch (err: any) {
    console.error('Failed to get challenge:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to get challenge' },
      { status: 500 }
    );
  }
}

/**
 * POST - Update challenge progress
 * Body: { action: 'increment' | 'set', amount?: number }
 */
export async function POST(request: Request) {
  // Require auth for POST
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action, amount = 1 } = body;

    const todaysChallenge = getTodaysChallenge();
    const state = readChallengeState();

    if (action === 'increment') {
      state.currentProgress[todaysChallenge.id] = 
        (state.currentProgress[todaysChallenge.id] || 0) + amount;
    } else if (action === 'set') {
      state.currentProgress[todaysChallenge.id] = amount;
    }

    // Check if just completed
    const current = state.currentProgress[todaysChallenge.id];
    const justCompleted = current >= todaysChallenge.target && current - amount < todaysChallenge.target;
    
    if (justCompleted) {
      const today = new Date().toISOString().split('T')[0];
      state.completionHistory[today] = true;
      state.streak = calculateStreak(state.completionHistory);
    }

    state.lastUpdated = Date.now();
    writeChallengeState(state);

    return NextResponse.json({
      success: true,
      current,
      completed: current >= todaysChallenge.target,
      justCompleted,
      streak: state.streak,
      xp: justCompleted ? getChallengeXP(todaysChallenge.dayOfWeek) : 0,
    });
  } catch (err: any) {
    console.error('Failed to update challenge:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update challenge' },
      { status: 500 }
    );
  }
}
