/**
 * Quest Templates — Pre-built workflow examples for new users
 */

export interface QuestTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'development' | 'operations' | 'business' | 'team';
  template: {
    type: string;
    icon: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    from: string;
    data?: Record<string, any>;
  };
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'code-review',
    name: 'Code Review Request',
    icon: '👀',
    description: 'Dev finishes a feature, wants PM/founder to review',
    category: 'development',
    template: {
      type: 'review',
      icon: '👀',
      title: 'Review: [Feature Name]',
      description: 'Code review request from Dev. Feature is complete and tested. Ready for approval.',
      priority: 'high',
      from: 'Dev Agent',
      data: {
        files: ['app/feature.tsx', 'api/route.ts'],
        testStatus: 'All tests passing ✅',
        options: ['Approve', 'Request changes', 'Reject']
      }
    }
  },
  {
    id: 'tech-decision',
    name: 'Technical Decision',
    icon: '🤔',
    description: 'Team discussed options, needs your decision',
    category: 'development',
    template: {
      type: 'decision',
      icon: '🤔',
      title: 'Decision: [Technology Choice]',
      description: 'Team discussed options. Recommendation: [Option A] because [reasons]. Need your decision.',
      priority: 'medium',
      from: 'PM Agent',
      data: {
        options: ['Option A (recommended)', 'Option B', 'Option C', 'Need more info'],
        pros: ['Pro 1', 'Pro 2'],
        cons: ['Con 1', 'Con 2'],
        teamRecommendation: 'Option A'
      }
    }
  },
  {
    id: 'bug-triage',
    name: 'Bug Triage',
    icon: '🐛',
    description: 'QA found a bug, needs decision on priority',
    category: 'development',
    template: {
      type: 'decision',
      icon: '🐛',
      title: 'Bug: [Description]',
      description: 'QA found a critical bug. Dev estimates [X hours] to fix. Should we prioritize this?',
      priority: 'high',
      from: 'QA Agent',
      data: {
        severity: 'Critical',
        stepsToReproduce: ['Step 1', 'Step 2', 'Step 3'],
        impact: 'Blocks user login',
        estimatedFix: '2 hours',
        options: ['Fix immediately', 'Fix this week', "Won't fix"]
      }
    }
  },
  {
    id: 'feature-scope',
    name: 'Feature Scoping',
    icon: '📋',
    description: 'PM broke down a feature request, needs approval',
    category: 'business',
    template: {
      type: 'review',
      icon: '📋',
      title: 'Scope: [Feature Request]',
      description: 'PM broke down the feature request into tasks. Estimate: [X hours]. Approve to assign to Dev?',
      priority: 'medium',
      from: 'PM Agent',
      data: {
        tasks: ['Task 1', 'Task 2', 'Task 3'],
        estimatedHours: '8 hours',
        acceptanceCriteria: ['Criteria 1', 'Criteria 2'],
        options: ['Approve scope', 'Adjust scope', 'Defer']
      }
    }
  },
  {
    id: 'retro',
    name: 'Weekly Retrospective',
    icon: '📊',
    description: 'Team completed a retro, summary for review',
    category: 'team',
    template: {
      type: 'review',
      icon: '📊',
      title: 'Weekly Retrospective: [Week]',
      description: 'Team completed a retro. Highlights: [X wins], [Y challenges]. No action needed, just FYI.',
      priority: 'low',
      from: 'PM Agent',
      data: {
        wins: ['Win 1', 'Win 2', 'Win 3'],
        challenges: ['Challenge 1', 'Challenge 2'],
        nextWeekFocus: 'Focus area',
        options: ['Acknowledge']
      }
    }
  },
  {
    id: 'deploy',
    name: 'Deployment Approval',
    icon: '🚀',
    description: 'Everything tested, ready to ship to production',
    category: 'operations',
    template: {
      type: 'review',
      icon: '🚀',
      title: 'Deploy: [Version]',
      description: 'QA passed all tests. Ready to deploy to production. Approve to ship?',
      priority: 'high',
      from: 'Ops Agent',
      data: {
        version: 'v2.1.0',
        features: ['Feature 1', 'Feature 2'],
        bugFixes: ['Fix 1', 'Fix 2'],
        qaStatus: 'All tests passing ✅',
        options: ['Deploy now', 'Deploy later', 'Hold']
      }
    }
  },
  {
    id: 'budget',
    name: 'Budget Request',
    icon: '💰',
    description: 'Team needs a tool/service, asking for approval',
    category: 'business',
    template: {
      type: 'decision',
      icon: '💰',
      title: 'Budget Request: [Item]',
      description: 'Team needs [item] for [reason]. Cost: $X/month. Approve?',
      priority: 'medium',
      from: 'Ops Agent',
      data: {
        item: 'Tool/Service name',
        cost: '$99/month',
        reason: 'Why we need it',
        alternatives: ['Alternative 1 (free)', 'Alternative 2 ($50/month)'],
        options: ['Approve', 'Try alternative', 'Decline']
      }
    }
  },
  {
    id: 'email-draft',
    name: 'Email Draft Approval',
    icon: '📧',
    description: 'Agent drafted an email, needs approval before sending',
    category: 'business',
    template: {
      type: 'approve_email',
      icon: '📧',
      title: 'Approve Email: [Recipient]',
      description: 'Draft email to [recipient] ready for review. Send or edit?',
      priority: 'high',
      from: 'Outreach Agent',
      data: {
        to: 'recipient@example.com',
        subject: 'Email subject line',
        body: 'Full email body...',
        options: ['Send', 'Edit', "Don't send"]
      }
    }
  },
];

/**
 * Get template by ID
 */
export function getTemplate(id: string): QuestTemplate | undefined {
  return QUEST_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: QuestTemplate['category']): QuestTemplate[] {
  return QUEST_TEMPLATES.filter(t => t.category === category);
}

/**
 * Clone a template into a new quest
 */
export function cloneTemplate(template: QuestTemplate['template']): any {
  return {
    ...template,
    id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    isTemplate: true,
  };
}
