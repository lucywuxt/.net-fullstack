export type BadgeTone = 'active' | 'pipeline' | 'risk' | 'muted' | 'default';

export const PROJECT_STATUS_TONE: Record<string, BadgeTone> = {
  Active: 'active',
  BoardApproval: 'pipeline',
  Negotiation: 'pipeline',
  Appraisal: 'pipeline',
  Concept: 'muted',
  Closed: 'risk',
};

export const WITHDRAWAL_STATUS_TONE: Record<string, BadgeTone> = {
  Approved: 'active',
  Disbursed: 'active',
  UnderReview: 'pipeline',
  Submitted: 'pipeline',
  Rejected: 'risk',
};
