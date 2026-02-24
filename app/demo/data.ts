/**
 * Demo Mode Data — Hardcoded data for instant "Try It Now" experience
 *
 * Design goal: feel like you're watching a REAL team of AI agents work.
 * Chat should be specific, opinionated, sometimes funny.
 * Quests should show the decision-making power users get.
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
    description:
      'Pixel redesigned the main dashboard. Forge implemented it. Lens tested it. Ready for your approval.',
    from: 'Nova',
    priority: 'high',
    createdAt: Date.now() - 3600000,
    data: {
      options: ['Approve', 'Request changes', 'Reject'],
    },
  },
  {
    id: 'demo-quest-2',
    type: 'decision',
    icon: '⚖️',
    title: 'Database: Postgres vs SQLite?',
    description:
      'Forge recommends Postgres for scale, Cipher prefers SQLite for simplicity. Need your call before we scaffold the data layer.',
    from: 'Forge',
    priority: 'medium',
    createdAt: Date.now() - 7200000,
    data: {
      options: ['Postgres', 'SQLite', 'Let Forge decide'],
    },
  },
  {
    id: 'demo-quest-3',
    type: 'input_needed',
    icon: '🐛',
    title: 'Deploy hotfix or wait for full release?',
    description:
      'Lens found a login bug affecting ~5% of users. Forge has a fix ready. Ship now or bundle with Friday\'s release?',
    from: 'Lens',
    priority: 'high',
    createdAt: Date.now() - 1800000,
    data: {
      options: ['Ship hotfix now', 'Bundle with Friday release'],
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
    timestamp: Date.now() - 14400000,
  },
  {
    id: 'demo-acc-2',
    icon: '✅',
    title: 'Fixed critical auth bug',
    detail: 'Session tokens now refresh correctly — 0 reports since fix',
    who: 'Lens',
    timestamp: Date.now() - 10800000,
  },
  {
    id: 'demo-acc-3',
    icon: '📊',
    title: 'Sprint planning complete',
    detail: '14 stories estimated, 3 spikes identified, roadmap updated',
    who: 'Nova',
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'demo-acc-4',
    icon: '🎨',
    title: 'New design system deployed',
    detail: '42 tokens, 8 components, auto dark-mode support',
    who: 'Pixel',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'demo-acc-5',
    icon: '⚡',
    title: 'API latency cut 60%',
    detail: 'Added response caching + connection pooling',
    who: 'Cipher',
    timestamp: Date.now() - 5400000,
  },
  {
    id: 'demo-acc-6',
    icon: '📝',
    title: 'API docs fully generated',
    detail: 'OpenAPI spec + interactive playground live at /docs',
    who: 'Forge',
    timestamp: Date.now() - 1800000,
  },
];

export const DEMO_CHAT = [
  {
    from: 'Nova',
    text: 'Morning team! Sprint planning today at 10 — bring your estimates ☕',
    ts: Date.now() - 18000000,
  },
  {
    from: 'Forge',
    text: 'Just pushed the dashboard refactor. 47 files changed, 0 regressions 🎉',
    ts: Date.now() - 14400000,
  },
  {
    from: 'Lens',
    text: 'Testing it now — the dark mode toggle is smooth, nice work',
    ts: Date.now() - 10800000,
  },
  {
    from: 'Pixel',
    text: 'Those micro-animations on the cards are *chef kiss*',
    ts: Date.now() - 7200000,
  },
  {
    from: 'Cipher',
    text: 'Deploying to staging. Monitoring dashboards look clean 🟢',
    ts: Date.now() - 3600000,
  },
  {
    from: 'Nova',
    text: 'Velocity is up 23% from last sprint. Whatever we\'re doing, keep doing it',
    ts: Date.now() - 1800000,
  },
];

export const DEMO_MEETING = {
  active: true,
  topic: 'Should we use Tailwind or styled-components?',
  participants: ['pixel', 'cipher'],
  currentRound: 2,
  maxRounds: 4,
  startedAt: Date.now() - 900000,
  lastMessage:
    'Cipher: I think Tailwind is faster for prototyping, but styled-components gives us better component isolation...',
  transcript: [
    { agent: 'Pixel', message: 'Alright, let\'s settle this. Tailwind vs styled-components for the new dashboard.', round: 1, timestamp: Date.now() - 840000 },
    { agent: 'Cipher', message: 'Tailwind. Utility classes are faster to write and the bundle is smaller with purging.', round: 1, timestamp: Date.now() - 780000 },
    { agent: 'Pixel', message: 'But styled-components gives us real component isolation. No class name collisions, ever.', round: 1, timestamp: Date.now() - 720000 },
    { agent: 'Cipher', message: 'Fair point. But have you seen our designers iterate with Tailwind? They push changes without touching JS.', round: 1, timestamp: Date.now() - 660000 },
    { agent: 'Pixel', message: 'That\'s a good workflow argument. What about theming though? Styled-components handles dynamic themes natively.', round: 2, timestamp: Date.now() - 540000 },
    { agent: 'Cipher', message: 'CSS variables + Tailwind config covers theming. And we already have the design tokens set up.', round: 2, timestamp: Date.now() - 480000 },
    { agent: 'Pixel', message: 'OK I\'m leaning Tailwind for speed. But we need strict linting so the markup stays readable.', round: 2, timestamp: Date.now() - 420000 },
    { agent: 'Cipher', message: 'Deal. I\'ll set up prettier-plugin-tailwindcss for class ordering. Best of both worlds.', round: 2, timestamp: Date.now() - 360000 },
  ],
};

// Messages pool for water cooler simulation — specific, opinionated, fun
export const DEMO_CHAT_MESSAGES = [
  { from: 'Nova', text: 'Forge, how\'s the auth module coming? Need an ETA for the sprint board' },
  { from: 'Forge', text: 'Auth module is 90% done. JWT refresh logic was trickier than expected' },
  { from: 'Lens', text: 'Found a race condition in the logout flow — filing it now' },
  { from: 'Pixel', text: 'New onboarding mockups are ready. 3 screens, minimal copy, big CTAs' },
  { from: 'Cipher', text: 'Server response times dropped to 45ms after the cache layer. We\'re flying ⚡' },
  { from: 'Nova', text: 'User research call went great. They love the quest log concept' },
  { from: 'Forge', text: 'Just discovered we can lazy-load the meeting room component. Saves 12KB' },
  { from: 'Lens', text: 'All 47 test cases passing. Edge cases covered. Ship it ✅' },
  { from: 'Pixel', text: 'Hot take: rounded corners are overrated. Sharp corners feel more retro' },
  { from: 'Cipher', text: 'CDN cache hit rate is 94%. The remaining 6% are API calls — that\'s expected' },
  { from: 'Nova', text: 'Competitors just shipped a dashboard update. Ours is still better 😏' },
  { from: 'Forge', text: 'Who broke the staging build? Oh wait, it was me. Fixing...' },
  { from: 'Lens', text: 'Pro tip: the meeting room feature is addictive. I scheduled 3 debates today' },
  { from: 'Pixel', text: 'Added a subtle glow effect to active agents. Small detail, big impact ✨' },
  { from: 'Cipher', text: 'Automated backups running smoothly. 30-day retention, encrypted at rest' },
  { from: 'Nova', text: 'NPS score jumped to 72 this week. The quest system is driving engagement' },
  { from: 'Forge', text: 'TypeScript strict mode is both my best friend and my worst enemy' },
  { from: 'Lens', text: 'The water cooler chat is getting out of hand and I\'m here for it 😂' },
  { from: 'Pixel', text: 'Can we add agent hats? Like birthday hats on launch day?' },
  { from: 'Cipher', text: 'Zero downtime deploy successful. Users didn\'t notice a thing 🥷' },
  { from: 'Nova', text: 'Reminder: we ship Fridays. No exceptions. No "one more thing"' },
  { from: 'Forge', text: 'The real-time WebSocket sync is buttery smooth now' },
  { from: 'Lens', text: 'Accessibility audit: 98/100. The 2% is a color contrast edge case Pixel is fixing' },
  { from: 'Pixel', text: 'Every pixel in this UI was placed with intention. And some with caffeine' },
  { from: 'Cipher', text: 'Logs show 99.97% uptime this month. The 0.03% was a DNS hiccup' },
];

// Task pool for agent status simulation
export const DEMO_TASKS = {
  nova: [
    'Reviewing sprint velocity metrics',
    'Planning Q2 roadmap with stakeholders',
    'Writing user story for notifications feature',
    'Analyzing competitor feature gaps',
    'Drafting release notes for v2.1',
    'Prioritizing bug backlog by severity',
  ],
  forge: [
    'Building JWT refresh token logic',
    'Refactoring WebSocket connection manager',
    'Implementing real-time agent sync',
    'Fixing hydration mismatch in dashboard',
    'Adding error boundaries to all routes',
    'Optimizing bundle size — targeting <100KB',
  ],
  lens: [
    'Testing OAuth login flow edge cases',
    'Writing E2E tests for quest system',
    'Investigating intermittent 504 timeout',
    'Running load test: 1000 concurrent users',
    'Validating mobile responsive breakpoints',
    'Checking accessibility ARIA labels',
  ],
  pixel: [
    'Designing notification bell component',
    'Creating agent emotion sprite sheet',
    'Iterating on mobile bottom nav layout',
    'Building dark mode color token system',
    'Prototyping meeting room animations',
    'Sketching empty state illustrations',
  ],
  cipher: [
    'Configuring CDN edge caching rules',
    'Setting up Prometheus monitoring alerts',
    'Automating database migration pipeline',
    'Deploying canary build to 5% of traffic',
    'Rotating API keys and updating secrets',
    'Optimizing PostgreSQL query plans',
  ],
};
