import type {
  AuditLogEntry,
  AuthUser,
  ChatResponse,
  CountryIndicatorSeries,
  CountrySummary,
  DemoCredential,
  Disbursement,
  ExpenditureCategory,
  FinancingInstrument,
  GlobalIndicatorDataset,
  IndicatorOption,
  PortfolioAnalytics,
  Project,
  ProjectSector,
  ProjectStatus,
  PublicImpactSummary,
  PublicProjectSummary,
  ResultsIndicator,
  SupportingDocumentInput,
  WithdrawalApplication,
  WithdrawalStatus,
} from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getToken(): string | null {
  const raw = localStorage.getItem('loanly_auth_user');
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed.token;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Request failed (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.message) errorMsg = errJson.message;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  getDemoAccounts: () => request<DemoCredential[]>('/auth/demo-accounts'),
  login: (email: string, password: string, accountType: string) =>
    request<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, accountType }),
    }),

  // Public World Bank Open Data API Proxy
  getIndicators: () => request<IndicatorOption[]>('/public/worldbank/indicators'),
  getGlobalIndicator: (indicatorCode: string) =>
    request<GlobalIndicatorDataset>(`/public/worldbank/global/${encodeURIComponent(indicatorCode)}`),
  getCountrySeries: (countryCode: string, indicatorCode: string) =>
    request<CountryIndicatorSeries>(
      `/public/worldbank/country/${encodeURIComponent(countryCode)}/indicator/${encodeURIComponent(indicatorCode)}`
    ),
  getPublicProjects: (countryIso3: string) =>
    request<PublicProjectSummary[]>(`/public/worldbank/country/${encodeURIComponent(countryIso3)}/projects`),
  getImpactSummary: () => request<PublicImpactSummary>('/public/worldbank/impact-summary'),
  getSuccessStories: () => request<PublicProjectSummary[]>('/public/worldbank/success-stories'),

  // Projects & Portfolio
  getCountries: () => request<CountrySummary[]>('/projects/countries'),
  getProjects: (countryId?: number) =>
    request<Project[]>(countryId ? `/projects?countryId=${countryId}` : '/projects'),
  createProject: (payload: {
    title: string;
    countryId: number;
    sector: ProjectSector;
    financingInstrument: FinancingInstrument;
    approvedAmount: number;
    initialStatus: ProjectStatus;
    closingDate?: string;
    projectDevelopmentObjective: string;
  }) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProjectStatus: (projectId: number, newStatus: ProjectStatus) =>
    request<Project>(`/projects/${projectId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ newStatus }),
    }),
  upsertIndicator: (
    projectId: number,
    payload: {
      id?: number;
      indicatorName: string;
      unit: string;
      baselineValue: number;
      targetValue: number;
      currentValue: number;
    }
  ) =>
    request<ResultsIndicator>(`/projects/${projectId}/indicators`, {
      method: 'POST',
      body: JSON.stringify({ ...payload, projectId }),
    }),
  getPortfolioAnalytics: () => request<PortfolioAnalytics>('/projects/portfolio-analytics'),

  // Withdrawal Applications & Disbursements
  getWithdrawals: (countryId?: number) =>
    request<WithdrawalApplication[]>(countryId ? `/withdrawals?countryId=${countryId}` : '/withdrawals'),
  submitWithdrawal: (payload: {
    projectId: number;
    category: ExpenditureCategory;
    amountRequested: number;
    supportingDocumentsNote: string;
    documents?: SupportingDocumentInput[];
  }) =>
    request<WithdrawalApplication>('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  reviewWithdrawal: (
    withdrawalId: number,
    decisionStatus: WithdrawalStatus,
    reviewNotes?: string
  ) =>
    request<WithdrawalApplication>(`/withdrawals/${withdrawalId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ decisionStatus, reviewNotes }),
    }),
  recordDisbursement: (payload: {
    withdrawalApplicationId: number;
    amountDisbursed: number;
    transactionReference?: string;
  }) =>
    request<Disbursement>('/withdrawals/disbursements', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getDisbursements: (projectId?: number) =>
    request<Disbursement[]>(
      projectId ? `/withdrawals/disbursements?projectId=${projectId}` : '/withdrawals/disbursements'
    ),

  // Audit trail / activity feed
  getWithdrawalHistory: (withdrawalId: number) =>
    request<AuditLogEntry[]>(`/audit/withdrawal/${withdrawalId}`),
  getProjectHistory: (projectId: number) =>
    request<AuditLogEntry[]>(`/audit/project/${projectId}`),
  getRecentActivity: (take = 50) => request<AuditLogEntry[]>(`/audit/recent?take=${take}`),

  // Gemini 3.6 Flash Embedded AI Assistant
  sendChatMessage: (payload: {
    message: string;
    selectedProjectId?: number;
    selectedWithdrawalId?: number;
    history?: { role: string; content: string }[];
  }) =>
    request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
