export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';

/**
 * Demo mode challenges endpoint — returns a sample challenge with partial progress
 */
export async function GET() {
  const dayOfWeek = new Date().getDay();
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  const challenges: Record<number, { title: string; icon: string; target: number; current: number }> = {
    0: { title: 'Sunday Vibes', icon: '☕', target: 3, current: 2 },
    1: { title: 'Monday Standup', icon: '📊', target: 1, current: 0 },
    2: { title: 'Ship It Tuesday', icon: '🚀', target: 5, current: 3 },
    3: { title: 'Collab Wednesday', icon: '🤝', target: 1, current: 0 },
    4: { title: 'Teamwork Thursday', icon: '💬', target: 3, current: 1 },
    5: { title: 'Finish Strong Friday', icon: '⚔️', target: 3, current: 2 },
    6: { title: 'Saturday Showcase', icon: '📸', target: 1, current: 0 },
  };

  const ch = challenges[dayOfWeek] || challenges[2];

  return NextResponse.json({
    challenge: {
      id: `demo-${dayOfWeek}-${dayOfYear}`,
      ...ch,
      completed: false,
    },
    streak: 4,
    xp: 25,
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    current: 1,
    completed: false,
    justCompleted: false,
    streak: 4,
    xp: 0,
  });
}
