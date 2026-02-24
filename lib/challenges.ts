/**
 * Daily Challenges System
 * 
 * Gives users a reason to come back every day.
 * Challenges change based on day-of-week for predictable variety.
 */

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  completed: boolean;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
}

/**
 * Get the challenge for today based on day-of-week.
 * Each day has a different theme to keep it fresh.
 */
export function getTodaysChallenge(date: Date = new Date()): Omit<Challenge, 'current' | 'completed'> {
  const dayOfWeek = date.getDay();
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  const challenges = [
    // Sunday - Rest day (lighter challenge)
    {
      id: `sunday-${dayOfYear}`,
      title: 'Sunday Vibes',
      description: 'Check in on your agents - view 3 agent panels',
      icon: '☕',
      target: 3,
      dayOfWeek: 0,
    },
    // Monday - Status updates
    {
      id: `monday-${dayOfYear}`,
      title: 'Monday Standup',
      description: 'Have all working agents report their status',
      icon: '📊',
      target: 1, // Just need to check that all are accounted for
      dayOfWeek: 1,
    },
    // Tuesday - Shipping day
    {
      id: `tuesday-${dayOfYear}`,
      title: 'Ship It Tuesday',
      description: 'Complete 5 accomplishments today',
      icon: '🚀',
      target: 5,
      dayOfWeek: 2,
    },
    // Wednesday - Collaboration
    {
      id: `wednesday-${dayOfYear}`,
      title: 'Collab Wednesday',
      description: 'Hold a meeting with 2+ agents',
      icon: '🤝',
      target: 1,
      dayOfWeek: 3,
    },
    // Thursday - Communication
    {
      id: `thursday-${dayOfYear}`,
      title: 'Teamwork Thursday',
      description: 'Send 3 messages to your agents',
      icon: '💬',
      target: 3,
      dayOfWeek: 4,
    },
    // Friday - Quest completion
    {
      id: `friday-${dayOfYear}`,
      title: 'Finish Strong Friday',
      description: 'Resolve 3 pending quests',
      icon: '⚔️',
      target: 3,
      dayOfWeek: 5,
    },
    // Saturday - Exploration
    {
      id: `saturday-${dayOfYear}`,
      title: 'Saturday Showcase',
      description: 'Share your office screenshot',
      icon: '📸',
      target: 1,
      dayOfWeek: 6,
    },
  ];

  return challenges[dayOfWeek];
}

/**
 * Calculate streak (how many days in a row user completed challenges)
 */
export function calculateStreak(completionHistory: Record<string, boolean>): number {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateKey = checkDate.toISOString().split('T')[0];
    
    if (completionHistory[dateKey]) {
      streak++;
    } else if (i > 0) {
      // First day (today) can be incomplete, but any gap breaks streak
      break;
    }
  }
  
  return streak;
}

/**
 * Get progress towards current challenge
 */
export function getChallengeProgress(
  challengeId: string,
  progressData: Record<string, number>
): number {
  return progressData[challengeId] || 0;
}

/**
 * Award XP for completing a challenge
 */
export function getChallengeXP(dayOfWeek: number): number {
  // Tuesday (Ship It) and Friday (Finish Strong) give more XP
  if (dayOfWeek === 2 || dayOfWeek === 5) {
    return 50;
  }
  // Wednesday (Collab) gives bonus
  if (dayOfWeek === 3) {
    return 40;
  }
  // Rest give 25
  return 25;
}
