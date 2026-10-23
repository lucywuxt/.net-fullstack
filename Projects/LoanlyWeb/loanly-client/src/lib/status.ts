export type BadgeTone = 'active' | 'pipeline' | 'info' | 'risk' | 'muted' | 'default';

export const PROJECT_STATUS_TONE: Record<string, BadgeTone> = {
  Active: 'active',
  BoardApproval: 'pipeline',
  Negotiation: 'pipeline',
  Appraisal: 'pipeline',
  Concept: 'muted',
  Closed: 'risk',
};

export const WITHDRAWAL_STATUS_TONE: Record<string, BadgeTone> = {
  Submitted: 'muted',
  UnderReview: 'pipeline',
  Approved: 'info',
  Disbursed: 'active',
  Rejected: 'risk',
};
