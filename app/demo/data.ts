/**
 * Demo Mode Data — Hardcoded data for instant "Try It Now" experience
 */

export const DEMO_AGENTS = [
  {
    id: 'nova',
    name: 'Nova',
    role: 'Product Manager',
    emoji: '📋',
    color: '#8b5cf6',
    status: 'working',
    task: 'Reviewing sprint velocity metrics',
    mood: 'great',
    needs: {
      energy: 85,
      output: 92,
      collab: 78,
      queue: 45,
      focus: 88,
    },
    skills: [
      { name: 'Planning', level: 18, icon: '📊' },
      { name: 'Strategy', level: 16, icon: '🎯' },
      { name: 'Communication', level: 20, icon: '💬' },
    ],
    xp: 4500,
    level: 18,
    hasIdentity: true,
  },
  {
    id: 'forge',
    name: 'Forge',
    role: 'Developer',
    emoji: '🔨',
    color: '#f97316',
    status: 'working',
    task: 'Building authentication module',
    mood: 'good',
    needs: {
      energy: 72,
      output: 88,
      collab: 65,
      queue: 38,
      focus: 90,
    },
    skills: [
      { name: 'TypeScript', level: 19, icon: '💻' },
      { name: 'React', level: 17, icon: '⚛️' },
      { name: 'API Design', level: 15, icon: '🔌' },
    ],
    xp: 4200,
    level: 17,
    hasIdentity: true,
  },
  {
    id: 'lens',
    name: 'Lens',
    role: 'QA Engineer',
    emoji: '🔍',
    color: '#06b6d4',
    status: 'idle',
    mood: 'good',
    task: '',
    needs: {
      energy: 80,
      output: 75,
      collab: 82,
      queue: 52,
      focus: 78,
    },
    skills: [
      { name: 'Testing', level: 16, icon: '🧪' },
      { name: 'Automation', level: 14, icon: '⚙️' },
      { name: 'Bug Hunting', level: 18, icon: '🐛' },
    ],
    xp: 3800,
    level: 16,
    hasIdentity: true,
  },
  {
    id: 'pixel',
    name: 'Pixel',
    role: 'Designer',
    emoji: '🎨',
    color: '#ec4899',
    status: 'working',
    task: 'Discussing color palette for dashboard',
    mood: 'great',
    needs: {
      energy: 88,
      output: 85,
      collab: 90,
      queue: 42,
      focus: 82,
    },
    skills: [
      { name: 'UI Design', level: 19, icon: '🎨' },
      { name: 'Prototyping', level: 16, icon: '✨' },
      { name: 'Figma', level: 18, icon: '🖼️' },
    ],
    xp: 4100,
    level: 17,
    hasIdentity: true,
  },
  {
    id: 'cipher',
    name: 'Cipher',
    role: 'Operations',
    emoji: '⚡',
    color: '#10b981',
    status: 'working',
    task: 'Discussing deployment strategy',
    mood: 'good',
    needs: {
      energy: 75,
      output: 80,
      collab: 85,
      queue: 48,
      focus: 76,
    },
    skills: [
      { name: 'DevOps', level: 17, icon: '🚀' },
      { name: 'Cloud', level: 16, icon: '☁️' },
      { name: 'Monitoring', level: 15, icon: '📊' },
    ],
    xp: 3900,
    level: 16,
    hasIdentity: true,
  },
];

export const DEMO_QUESTS = [
  {
    id: 'demo-quest-1',
    type: 'review',
    icon: '👀',
    title: 'Review: User Dashboard Redesign',
    description: 'Pixel redesigned the main dashboard. Forge implemented it. Lens tested it. Ready for your approval.',
    from: 'Nova',
    priority: 'high',
    createdAt: Date.now() - 3600000, // 1 hour ago
    data: {
      options: ['Approve', 'Request changes', 'Reject'],
    },
  },
];

export const DEMO_ACCOMPLISHMENTS = [
  {
    id: 'demo-acc-1',
    icon: '🚀',
    title: 'Shipped v2.0 Dashboard',
    detail: 'New UI with dark mode and real-time updates',
    who: 'Forge',
    timestamp: Date.now() - 14400000, // 4 hours ago
  },
  {
    id: 'demo-acc-2',
    icon: '✅',
    title: 'Fixed critical auth bug',
    detail: 'Users can now log in without errors',
    who: 'Lens',
    timestamp: Date.now() - 10800000, // 3 hours ago
  },
  {
    id: 'demo-acc-3',
    icon: '📊',
    title: 'Sprint planning complete',
    detail: 'Roadmap for next 2 weeks finalized',
    who: 'Nova',
    timestamp: Date.now() - 7200000, // 2 hours ago
  },
  {
    id: 'demo-acc-4',
    icon: '🎨',
    title: 'New color system deployed',
    detail: 'Consistent design tokens across all components',
    who: 'Pixel',
    timestamp: Date.now() - 3600000, // 1 hour ago
  },
];

export const DEMO_CHAT = [
  {
    from: 'Nova',
    text: 'Morning team! Sprint planning today at 10 AM ☕',
    ts: Date.now() - 18000000,
  },
  {
    from: 'Forge',
    text: 'Just pushed the dashboard refactor 🎉',
    ts: Date.now() - 14400000,
  },
  {
    from: 'Lens',
    text: 'Testing it now, looks great so far!',
    ts: Date.now() - 10800000,
  },
  {
    from: 'Pixel',
    text: 'Love the new animations Forge added',
    ts: Date.now() - 7200000,
  },
  {
    from: 'Cipher',
    text: 'Deploying to staging in 5 minutes',
    ts: Date.now() - 3600000,
  },
  {
    from: 'Nova',
    text: 'Nice work everyone, we\'re shipping fast 🚀',
    ts: Date.now() - 1800000,
  },
];

export const DEMO_MEETING = {
  active: true,
  topic: 'Should we use Tailwind or styled-components?',
  participants: ['pixel', 'cipher'],
  currentRound: 2,
  maxRounds: 4,
  startedAt: Date.now() - 900000, // 15 minutes ago
  lastMessage: 'I think Tailwind is faster for prototyping, but styled-components gives us better component isolation...',
};

// Messages pool for water cooler simulation
export const DEMO_CHAT_MESSAGES = [
  { from: 'Nova', text: 'Anyone need help with their current task?' },
  { from: 'Forge', text: 'The new API endpoints are looking clean 👌' },
  { from: 'Lens', text: 'Found a edge case bug, fixing it now' },
  { from: 'Pixel', text: 'Working on some icon updates' },
  { from: 'Cipher', text: 'Server response times improved by 40%!' },
  { from: 'Nova', text: 'Great progress today team!' },
  { from: 'Forge', text: 'Coffee break? ☕' },
  { from: 'Lens', text: 'All tests passing ✅' },
  { from: 'Pixel', text: 'New mockups ready for review' },
  { from: 'Cipher', text: 'Deployment pipeline is green 🟢' },
];

// Task pool for agent status simulation
export const DEMO_TASKS = {
  nova: [
    'Reviewing sprint velocity metrics',
    'Planning next sprint',
    'Updating roadmap',
    'Prioritizing backlog',
  ],
  forge: [
    'Building authentication module',
    'Refactoring API layer',
    'Implementing new feature',
    'Fixing production bug',
  ],
  lens: [
    'Testing user flows',
    'Writing test cases',
    'Reviewing QA reports',
    'Running regression tests',
  ],
  pixel: [
    'Designing new components',
    'Updating style guide',
    'Creating mockups',
    'Refining color palette',
  ],
  cipher: [
    'Monitoring server health',
    'Optimizing database queries',
    'Setting up CI/CD pipeline',
    'Deploying to production',
  ],
};
