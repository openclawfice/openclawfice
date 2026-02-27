'use client';

import React, { useState, useEffect } from 'react';

interface PendingApproval {
  id: string;
  type: 'creator' | 'decision' | 'outreach';
  title: string;
  detail: string;
  urgency: 'critical' | 'high' | 'medium';
  hoursLeft?: number;
  daysOld?: number;
  value?: string;
  who: string;
}

interface PendingApprovalsWidgetProps {
  theme: any;
}

export function PendingApprovalsWidget({ theme }: PendingApprovalsWidgetProps) {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load from API, fall back to mock data if not available
    const fetchApprovals = async () => {
      try {
        const res = await fetch('/api/office/pending-approvals');
        if (res.ok) {
          const data = await res.json();
          setApprovals(data.approvals || []);
        } else {
          // Use static data if API not available yet
          setApprovals(getMockApprovals());
        }
      } catch {
        setApprovals(getMockApprovals());
      }
      setLoading(false);
    };

    fetchApprovals();
    const interval = setInterval(fetchApprovals, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (approvals.length === 0) return null;

  const criticalCount = approvals.filter(a => a.urgency === 'critical').length;
  const highCount = approvals.filter(a => a.urgency === 'high').length;

  return (
    <div style={{
      background: 'rgba(239,68,68,0.1)',
      border: '2px solid #dc2626',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>⏰</span>
          <h3 style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 10,
            color: '#dc2626',
            margin: 0,
          }}>
            Pending Approvals
          </h3>
        </div>
        <div style={{
          display: 'flex',
          gap: 8,
          fontSize: 9,
          fontFamily: '"Press Start 2P", monospace',
        }}>
          {criticalCount > 0 && (
            <span style={{ color: '#dc2626' }}>
              {criticalCount} Critical
            </span>
          )}
          {highCount > 0 && (
            <span style={{ color: '#f97316' }}>
              {highCount} High
            </span>
          )}
        </div>
      </div>

      {/* Approvals List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {approvals.map(approval => (
          <ApprovalItem key={approval.id} approval={approval} theme={theme} />
        ))}
      </div>
    </div>
  );
}

function ApprovalItem({ approval, theme }: { approval: PendingApproval; theme: any }) {
  const urgencyColors = {
    critical: '#dc2626',
    high: '#f97316',
    medium: '#eab308',
  };

  const urgencyBg = {
    critical: 'rgba(220,38,38,0.15)',
    high: 'rgba(249,115,22,0.15)',
    medium: 'rgba(234,179,8,0.15)',
  };

  const getTimeDisplay = () => {
    if (approval.hoursLeft !== undefined) {
      if (approval.hoursLeft < 24) {
        return `${Math.floor(approval.hoursLeft)}h left`;
      }
      return `${Math.floor(approval.hoursLeft / 24)}d left`;
    }
    if (approval.daysOld !== undefined) {
      return `${approval.daysOld}d old`;
    }
    return null;
  };

  const timeDisplay = getTimeDisplay();

  return (
    <div style={{
      background: urgencyBg[approval.urgency],
      border: `1px solid ${urgencyColors[approval.urgency]}`,
      borderRadius: 6,
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      {/* Title Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          color: urgencyColors[approval.urgency],
          fontFamily: '"Press Start 2P", monospace',
          flex: 1,
        }}>
          {approval.title}
        </div>
        {timeDisplay && (
          <div style={{
            fontSize: 8,
            color: urgencyColors[approval.urgency],
            fontFamily: '"Press Start 2P", monospace',
            whiteSpace: 'nowrap',
            marginLeft: 8,
          }}>
            {timeDisplay}
          </div>
        )}
      </div>

      {/* Detail */}
      <div style={{
        fontSize: 8,
        color: theme.text,
        lineHeight: 1.4,
      }}>
        {approval.detail}
      </div>

      {/* Footer Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
      }}>
        <div style={{
          fontSize: 7,
          color: theme.textMuted,
          fontFamily: '"Press Start 2P", monospace',
        }}>
          From: {approval.who}
        </div>
        {approval.value && (
          <div style={{
            fontSize: 8,
            color: '#10b981',
            fontFamily: '"Press Start 2P", monospace',
            fontWeight: 700,
          }}>
            {approval.value}
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data function (replace with real API when ready)
function getMockApprovals(): PendingApproval[] {
  return [
    {
      id: 'reek-g',
      type: 'creator',
      title: 'Reek G - Ready to Sign',
      detail: 'Phone: 954-605-8368. Said "Let\'s do it!" Deal ready.',
      urgency: 'critical',
      hoursLeft: 14,
      value: '$1.8K/mo',
      who: 'Scout',
    },
    {
      id: 'jack',
      type: 'creator',
      title: 'Jack (@jackbanana) - Waiting',
      detail: 'Phone: (310) 695-8588. Gave number 6 days ago.',
      urgency: 'critical',
      hoursLeft: 23,
      value: '$3K',
      who: 'Scout',
    },
    {
      id: 'daniel-k',
      type: 'outreach',
      title: 'Daniel K - Missed Call',
      detail: 'Need apology text first. Scheduled call was missed.',
      urgency: 'high',
      daysOld: 3,
      value: '$1.4K',
      who: 'Scout',
    },
    {
      id: 'samspov',
      type: 'outreach',
      title: 'samspov - Email Waiting',
      detail: 'Outreach email ready for 8+ days. Needs approval.',
      urgency: 'high',
      daysOld: 8,
      who: 'Scout',
    },
  ];
}
