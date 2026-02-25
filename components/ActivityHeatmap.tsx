'use client';

import React, { useMemo } from 'react';
import type { Accomplishment } from './types';

interface ActivityHeatmapProps {
  accomplishments: Accomplishment[];
  theme?: {
    bg?: string;
    bgSecondary?: string;
    text?: string;
    textMuted?: string;
    textDim?: string;
    border?: string;
  };
}

export function ActivityHeatmap({ accomplishments, theme }: ActivityHeatmapProps) {
  const t = {
    bg: theme?.bgSecondary || 'rgba(15, 23, 42, 0.6)',
    border: theme?.border || 'rgba(51, 65, 85, 0.6)',
    textMuted: theme?.textMuted || '#94a3b8',
    textDim: theme?.textDim || '#64748b',
    cellEmpty: theme?.bgSecondary || '#1e293b',
    cellBorder: theme?.border || 'rgba(51, 65, 85, 0.4)',
  };
  const { grid, totalCount, currentStreak } = useMemo(() => {
    // Get last 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days: { date: Date; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({ date, count: 0 });
    }

    // Count accomplishments per day
    accomplishments.forEach(acc => {
      const accDate = new Date(acc.timestamp);
      accDate.setHours(0, 0, 0, 0);
      const dayData = days.find(d => d.date.getTime() === accDate.getTime());
      if (dayData) {
        dayData.count++;
      }
    });

    // Calculate current streak (consecutive days from today backwards)
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }

    // Organize into weeks (7 rows)
    const grid: { date: Date; count: number }[][] = [[], [], [], [], [], [], []];
    days.forEach((day, idx) => {
      const dayOfWeek = day.date.getDay(); // 0 = Sunday
      grid[dayOfWeek].push(day);
    });

    const totalCount = days.reduce((sum, day) => sum + day.count, 0);

    return { grid, totalCount, currentStreak: streak };
  }, [accomplishments]);

  const getColor = (count: number): string => {
    if (count === 0) return t.cellEmpty;
    if (count <= 2) return '#22c55e33'; // Light green (20% opacity)
    if (count <= 4) return '#22c55e66'; // Medium green (40% opacity)
    return '#22c55e'; // Bright green (full)
  };

  const getDayLabel = (dayIndex: number): string => {
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayIndex];
  };

  return (
    <div style={{
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: 8,
      padding: 12,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
      }}>
        <div style={{
          fontSize: 10,
          fontFamily: '"Press Start 2P", monospace',
          color: t.textMuted,
        }}>
          📊 ACTIVITY
        </div>
        <div style={{
          fontSize: 8,
          color: t.textDim,
        }}>
          Last 30 days
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 10,
      }}>
        <div style={{
          flex: 1,
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 6,
          padding: '6px 8px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#22c55e',
            fontFamily: '"Press Start 2P", monospace',
          }}>
            {totalCount}
          </div>
          <div style={{
            fontSize: 7,
            color: t.textDim,
            marginTop: 2,
          }}>
            total
          </div>
        </div>
        <div style={{
          flex: 1,
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 6,
          padding: '6px 8px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#8b5cf6',
            fontFamily: '"Press Start 2P", monospace',
          }}>
            {currentStreak}
          </div>
          <div style={{
            fontSize: 7,
            color: t.textDim,
            marginTop: 2,
          }}>
            streak
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{
        display: 'flex',
        gap: 3,
      }}>
        {/* Day labels */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          paddingTop: 12,
        }}>
          {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => (
            <div
              key={dayIdx}
              style={{
                width: 12,
                height: 12,
                fontSize: 7,
                color: t.textDim,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
              }}
            >
              {getDayLabel(dayIdx)}
            </div>
          ))}
        </div>

        {/* Grid columns */}
        <div style={{
          flex: 1,
          display: 'flex',
          gap: 3,
          overflowX: 'auto',
        }}>
          {grid[0].map((_, colIdx) => (
            <div
              key={colIdx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              {/* Column header (first day of each column) */}
              <div style={{
                height: 12,
                fontSize: 6,
                color: t.textDim,
                textAlign: 'center',
              }}>
                {colIdx === 0 || colIdx % 7 === 0 ? (
                  grid[0][colIdx].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).split(' ')[0]
                ) : ''}
              </div>
              {/* Week column */}
              {grid.map((week, dayIdx) => {
                const day = week[colIdx];
                if (!day) return null;
                
                return (
                  <div
                    key={`${dayIdx}-${colIdx}`}
                    style={{
                      width: 12,
                      height: 12,
                      background: getColor(day.count),
                      border: `1px solid ${t.cellBorder}`,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    title={`${day.date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}: ${day.count} accomplishment${day.count !== 1 ? 's' : ''}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.3)';
                      e.currentTarget.style.zIndex = '10';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.zIndex = '1';
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        fontSize: 7,
        color: t.textDim,
      }}>
        <span>Less</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {[0, 1, 3, 5].map(count => (
            <div
              key={count}
              style={{
                width: 10,
                height: 10,
                background: getColor(count),
                border: `1px solid ${t.cellBorder}`,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
