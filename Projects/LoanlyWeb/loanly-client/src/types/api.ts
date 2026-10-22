export type AccountType = 'Country' | 'Admin';

export type AdminRole = 'TaskTeam' | 'DisbursementOfficer';
export type ProjectSector = 'Infrastructure' | 'Health' | 'Education' | 'Climate';
export type FinancingInstrument = 'IBRDLoan' | 'IDACredit' | 'IDAGrant';
export type ProjectStatus = 'Concept' | 'Appraisal' | 'Negotiation' | 'BoardApproval' | 'Active' | 'Closed';
export type ExpenditureCategory = 'Works' | 'Goods' | 'ConsultingServices' | 'Training' | 'OperatingCosts';
export type WithdrawalStatus = 'Submitted' | 'UnderReview' | 'Approved' | 'Disbursed' | 'Rejected';

export interface AuthUser {
  token: string;
  accountType: AccountType;
  id: number;
  name: string;
  email: string;
  subRoleOrRegion?: string | null;
  isoAlpha3?: string | null;
  incomeLevel?: string | null;
}

export interface DemoCredential {
  accountType: AccountType;
  label: string;
  email: string;
  password: string;
  roleDescription: string;
}

export interface CountrySummary {
  id: number;
  name: string;
  isoAlpha3: string;
  region: string;
  incomeLevel: string;
  contactEmail: string;
  activeProjectCount: number;
  totalCommitted: number;
  totalDisbursed: number;
}

export interface ResultsIndicator {
  id: number;
  projectId: number;
  indicatorName: string;
  unit: string;
  baselineValue: number;
  targetValue: number;
  currentValue: number;
  progressPercent: number;
  measuredAt: string;
}

export interface Disbursement {
  id: number;
  withdrawalApplicationId: number;
  applicationNumber: string;
  projectId: number;
  projectCode: string;
  projectTitle: string;
  countryName: string;
  category: ExpenditureCategory;
  amountDisbursed: number;
  designatedAccountBalanceAfter: number;
  disbursedAt: string;
  transactionReference: string;
}

export interface WithdrawalApplication {
  id: number;
  applicationNumber: string;
  projectId: number;
  projectCode: string;
  projectTitle: string;
  countryId: number;
  countryName: string;
  category: ExpenditureCategory;
  amountRequested: number;
  supportingDocumentsNote: string;
  status: WithdrawalStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedByAdminId?: number | null;
  reviewedByAdminName?: string | null;
  reviewNotes?: string | null;
  disbursement?: Disbursement | null;
}

export interface Project {
  id: number;
  projectCode: string;
  title: string;
  countryId: number;
  countryName: string;
  countryIso3: string;
  region: string;
  sector: ProjectSector;
  financingInstrument: FinancingInstrument;
  approvedAmount: number;
  totalDisbursed: number;
  committedPendingDisbursement: number;
  remainingUndisbursedAmount: number;
  availableToRequestAmount: number;
  status: ProjectStatus;
  boardApprovalDate?: string | null;
  closingDate?: string | null;
  projectDevelopmentObjective: string;
  resultsIndicators: ResultsIndicator[];
  withdrawalApplications: WithdrawalApplication[];
}

export interface BreakdownItem {
  label: string;
  projectCount: number;
  committedAmount: number;
  disbursedAmount: number;
}

export interface PortfolioAnalytics {
  totalCommitted: number;
  totalDisbursed: number;
  totalUndisbursed: number;
  disbursementRatePercent: number;
  totalProjectsCount: number;
  activeProjectsCount: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsVolume: number;
  bySector: BreakdownItem[];
  byRegion: BreakdownItem[];
  byInstrument: BreakdownItem[];
  byStatus: BreakdownItem[];
}

export interface IndicatorOption {
  code: string;
  name: string;
  unit: string;
  description: string;
  colorScale: string;
}

export interface GlobalHighlightStat {
  label: string;
  formattedValue: string;
  subtext: string;
  trendDirection: string;
}

export interface CountryYearValue {
  countryIso3: string;
  countryName: string;
  region: string;
  year: number;
  value: number | null;
}

export interface GlobalIndicatorDataset {
  indicatorCode: string;
  indicatorName: string;
  unit: string;
  minYear: number;
  maxYear: number;
  highlights: GlobalHighlightStat[];
  dataPoints: CountryYearValue[];
}

export interface YearPoint {
  year: number;
  value: number | null;
}

export interface CountryIndicatorSeries {
  countryIso3: string;
  countryName: string;
  indicatorCode: string;
  indicatorName: string;
  unit: string;
  latestValue: number | null;
  latestYear: number | null;
  series: YearPoint[];
}

export interface PublicProjectSummary {
  projectCode: string;
  title: string;
  sector: ProjectSector;
  financingInstrument: FinancingInstrument;
  approvedAmount: number;
  status: ProjectStatus;
}

export interface ChatResponse {
  reply: string;
  modelUsed: string;
  suggestedFollowUps: string[];
  contextSummary: string;
}
