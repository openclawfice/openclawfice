'use client';

import { Agent } from './types';

interface LeaderboardProps {
  agents: Agent[];
}

const MEDALS = ['🥇', '🥈', '🥉'];
const LEVEL_TITLES = [
  'Novice',      // 0-99
  'Apprentice',  // 100-299
  'Journeyman',  // 300-599
  'Expert',      // 600-999
  'Master',      // 1000-1999
  'Grandmaster', // 2000-4999
  'Legend',      // 5000+
];

function getLevelTitle(xp: number): string {
  if (xp >= 5000) return LEVEL_TITLES[6];
  if (xp >= 2000) return LEVEL_TITLES[5];
  if (xp >= 1000) return LEVEL_TITLES[4];
  if (xp >= 600) return LEVEL_TITLES[3];
  if (xp >= 300) return LEVEL_TITLES[2];
  if (xp >= 100) return LEVEL_TITLES[1];
  return LEVEL_TITLES[0];
}

export default function Leaderboard({ agents }: LeaderboardProps) {
  // Sort by XP descending
  const sorted = [...agents].sort((a, b) => (b.xp || 0) - (a.xp || 0));
  
  // Only show top 5 to keep it compact
  const topFive = sorted.slice(0, 5);

  if (topFive.length === 0) return null;

  return (
    <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🏆</span>
        <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
          Top Agents
        </h3>
      </div>

      <div className="space-y-2">
        {topFive.map((agent, index) => {
          const xp = agent.xp || 0;
          const level = agent.level || 1;
          const title = getLevelTitle(xp);
          const medal = MEDALS[index];

          return (
            <div
              key={agent.id}
              className={`
                flex items-center gap-3 p-2 rounded
                ${index === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : ''}
                ${index === 1 ? 'bg-gray-500/10 border border-gray-500/30' : ''}
                ${index === 2 ? 'bg-orange-500/10 border border-orange-500/30' : ''}
                ${index > 2 ? 'bg-gray-800/30' : ''}
              `}
            >
              {/* Rank */}
              <div className="text-2xl w-8 text-center">
                {medal || `#${index + 1}`}
              </div>

              {/* Agent info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white truncate">
                    {agent.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    Lv.{level}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {title}
                </div>
              </div>

              {/* XP */}
              <div className="text-right">
                <div className="text-sm font-bold text-yellow-400">
                  {xp.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fun stats */}
      {sorted.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Total XP earned:</span>
            <span className="text-yellow-400 font-medium">
              {sorted.reduce((sum, a) => sum + (a.xp || 0), 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Average level:</span>
            <span className="text-blue-400 font-medium">
              {(sorted.reduce((sum, a) => sum + (a.level || 1), 0) / sorted.length).toFixed(1)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
