import React, { useEffect, useMemo, useState } from 'react';
import {
  FolderPlus,
  PieChart as PieChartIcon,
  Landmark,
  CheckCircle2,
  XCircle,
  Banknote,
  Target,
  ArrowRight,
  Clock,
  History,
  Paperclip,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type {
  CountrySummary,
  Disbursement,
  PortfolioAnalytics,
  Project,
  ProjectStatus,
  ResultsIndicator,
  WithdrawalApplication,
  WithdrawalStatus,
} from '../types/api';
import { AdminPortfolioCharts } from '../components/AdminPortfolioCharts';
import { AdminProjectModal } from '../components/AdminProjectModal';
import { AdminIndicatorModal } from '../components/AdminIndicatorModal';
import { HistoryModal } from '../components/HistoryModal';
import { AiChatWidget } from '../components/AiChatWidget';
import { SidebarShell } from '../components/SidebarShell';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { StatCard } from '../components/ui/stat-card';
import { ProgressBar } from '../components/ui/progress';
import { Alert } from '../components/ui/alert';
import { Input, Select } from '../components/ui/input';
import { Pagination } from '../components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, SortableHead, TableHeader, TableRow } from '../components/ui/table';
import { usePagination } from '../hooks/usePagination';
import { PROJECT_STATUS_TONE, WITHDRAWAL_STATUS_TONE } from '../lib/status';
import { SECTOR_BADGE_CLASSES } from '../lib/sector';

type WaSortKey = 'submittedAt' | 'amountRequested' | 'status';

const NEXT_STAGE_MAP: Partial<Record<ProjectStatus, ProjectStatus>> = {
  Concept: 'Appraisal',
  Appraisal: 'Negotiation',
  Negotiation: 'BoardApproval',
  BoardApproval: 'Active',
  Active: 'Closed',
};

export const AdminPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalApplication[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'withdrawals' | 'indicators'>('dashboard');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [indicatorModal, setIndicatorModal] = useState<{ project: Project; existing?: ResultsIndicator } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [historyTarget, setHistoryTarget] = useState<WithdrawalApplication | null>(null);
  const [projectHistoryTarget, setProjectHistoryTarget] = useState<Project | null>(null);

  const [waSearch, setWaSearch] = useState('');
  const [waStatusFilter, setWaStatusFilter] = useState<WithdrawalStatus | 'All'>('All');
  const [waSort, setWaSort] = useState<{ key: WaSortKey; dir: 'asc' | 'desc' }>({ key: 'submittedAt', dir: 'desc' });

  const loadPortfolio = async () => {
    try {
      const [ana, cnt, prj, wa, disb] = await Promise.all([
        api.getPortfolioAnalytics(),
        api.getCountries(),
        api.getProjects(),
        api.getWithdrawals(),
        api.getDisbursements(),
      ]);
      setAnalytics(ana);
      setCountries(cnt);
      setProjects(prj);
      setWithdrawals(wa);
      setDisbursements(disb);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to load portfolio');
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleAdvanceLifecycle = async (project: Project) => {
    const next = NEXT_STAGE_MAP[project.status];
    if (!next) return;
    setActionError(null);
    setActionBanner(null);
    try {
      await api.updateProjectStatus(project.id, next);
      setActionBanner(`Advanced ${project.projectCode} from ${project.status} → ${next}.`);
      await loadPortfolio();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Status transition failed');
    }
  };

  const handleReviewWA = async (wa: WithdrawalApplication, status: WithdrawalStatus) => {
    setActionError(null);
    setActionBanner(null);
    const note =
      status === 'Approved'
        ? 'Cleared by Task Team & WFACS; verified against project ceiling and STEP plan.'
        : status === 'UnderReview'
        ? 'Currently undergoing WFACS fiduciary and procurement verification.'
        : 'Returned/Rejected due to incomplete supporting documentation.';
    try {
      await api.reviewWithdrawal(wa.id, status, note);
      setActionBanner(`Withdrawal Application ${wa.applicationNumber} marked as ${status}.`);
      await loadPortfolio();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Review action failed');
    }
  };

  const handleRecordDisbursement = async (wa: WithdrawalApplication) => {
    setActionError(null);
    setActionBanner(null);
    try {
      const disb = await api.recordDisbursement({
        withdrawalApplicationId: wa.id,
        amountDisbursed: wa.amountRequested,
      });
      setActionBanner(
        `Recorded Disbursement ${disb.transactionReference} ($${disb.amountDisbursed.toLocaleString()}). Remaining Project Ceiling: $${disb.designatedAccountBalanceAfter.toLocaleString()}.`
      );
      await loadPortfolio();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Disbursement failed');
    }
  };

  const toggleWaSort = (key: WaSortKey) =>
    setWaSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));

  const filteredWithdrawals = useMemo(() => {
    const q = waSearch.trim().toLowerCase();
    let list = withdrawals.filter((w) => {
      if (waStatusFilter !== 'All' && w.status !== waStatusFilter) return false;
      if (!q) return true;
      return (
        w.applicationNumber.toLowerCase().includes(q) ||
        w.countryName.toLowerCase().includes(q) ||
        w.projectCode.toLowerCase().includes(q) ||
        w.projectTitle.toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      const dir = waSort.dir === 'asc' ? 1 : -1;
      if (waSort.key === 'amountRequested') return (a.amountRequested - b.amountRequested) * dir;
      if (waSort.key === 'status') return a.status.localeCompare(b.status) * dir;
      return (new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()) * dir;
    });
    return list;
  }, [withdrawals, waSearch, waStatusFilter, waSort]);

  const waPage = usePagination(filteredWithdrawals, 8);

  return (
    <SidebarShell
      portalLabel="Task Team Portal"
      active={activeTab}
      onChange={(id) => setActiveTab(id as typeof activeTab)}
      tabs={[
        { id: 'dashboard', label: 'Portfolio Analytics', icon: <PieChartIcon className="h-3.5 w-3.5" /> },
        { id: 'projects', label: `Project Lifecycle (${projects.length})`, icon: <Landmark className="h-3.5 w-3.5" /> },
        { id: 'withdrawals', label: `Withdrawal Review & Disbursements (${withdrawals.length})`, icon: <Banknote className="h-3.5 w-3.5" /> },
        { id: 'indicators', label: 'Results Indicators (PDO)', icon: <Target className="h-3.5 w-3.5" /> },
      ]}
    >
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="pipeline" className="mb-2">
            WORLD BANK INTERNAL OPERATIONS • {user?.subRoleOrRegion?.toUpperCase()}
          </Badge>
          <h1 className="text-xl font-semibold text-foreground">Task Team &amp; WFACS Disbursement Control Center</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage sovereign project lifecycles, enforce financing ceilings on Withdrawal Applications, record
            Designated Account disbursements, and track PDO Results Indicators.
          </p>
        </div>
        <Button onClick={() => setShowCreateProject(true)}>
          <FolderPlus className="h-4 w-4" />
          Create New Project
        </Button>
      </div>

      {actionError && <Alert variant="error">{actionError}</Alert>}
      {actionBanner && <Alert variant="success">{actionBanner}</Alert>}

      {analytics && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Landmark className="h-4 w-4" />}
            tone="sky"
            label="Total Portfolio Committed"
            value={`$${analytics.totalCommitted.toLocaleString()}`}
            sub={`${analytics.totalProjectsCount} Projects (${analytics.activeProjectsCount} Active)`}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="emerald"
            label="Total Disbursed"
            value={`$${analytics.totalDisbursed.toLocaleString()}`}
            sub={`${analytics.disbursementRatePercent}% Portfolio Disbursement Rate`}
          />
          <StatCard
            icon={<Banknote className="h-4 w-4" />}
            tone="amber"
            label="Total Undisbursed Ceiling"
            value={`$${analytics.totalUndisbursed.toLocaleString()}`}
            sub="Available Across Approved Portfolio"
          />
          <StatCard
            icon={<Clock className="h-4 w-4" />}
            tone="violet"
            label="Actionable Withdrawal Queue"
            value={`${analytics.pendingWithdrawalsCount} WAs`}
            sub={`$${analytics.pendingWithdrawalsVolume.toLocaleString()} Pending Volume`}
          />
        </div>
      )}

      {activeTab === 'dashboard' && analytics && <AdminPortfolioCharts analytics={analytics} />}

      {activeTab === 'projects' && (
        <div className="space-y-3">
          {projects.map((p) => {
            const nextStage = NEXT_STAGE_MAP[p.status];
            return (
              <Card key={p.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge>{p.projectCode}</Badge>
                      <Badge variant="muted">{p.countryName} ({p.countryIso3})</Badge>
                      <Badge variant="muted">{p.financingInstrument}</Badge>
                      <Badge variant="muted" className={SECTOR_BADGE_CLASSES[p.sector]}>{p.sector}</Badge>
                      <Badge variant={PROJECT_STATUS_TONE[p.status] ?? 'default'}>{p.status}</Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                    <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{p.projectDevelopmentObjective}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {nextStage && (
                      <Button size="sm" onClick={() => handleAdvanceLifecycle(p)}>
                        Advance to {nextStage}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setIndicatorModal({ project: p })}>
                      <Target className="h-3.5 w-3.5" />
                      Indicator
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setProjectHistoryTarget(p)}>
                      <History className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
                  <span>Ceiling: <strong className="text-foreground">${p.approvedAmount.toLocaleString()}</strong></span>
                  <span>Disbursed: <strong className="text-emerald-400">${p.totalDisbursed.toLocaleString()}</strong></span>
                  <span>Pending: <strong className="text-amber-400">${p.committedPendingDisbursement.toLocaleString()}</strong></span>
                  <span>Remaining: <strong className="text-sky-400">${p.remainingUndisbursedAmount.toLocaleString()}</strong></span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <Card>
          <CardContent className="overflow-x-auto p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search WA number, country, or project…"
                value={waSearch}
                onChange={(e) => setWaSearch(e.target.value)}
                className="max-w-xs"
              />
              <Select
                value={waStatusFilter}
                onChange={(e) => setWaStatusFilter(e.target.value as WithdrawalStatus | 'All')}
                className="w-auto"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="UnderReview">UnderReview</option>
                <option value="Approved">Approved</option>
                <option value="Disbursed">Disbursed</option>
                <option value="Rejected">Rejected</option>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WA Number</TableHead>
                  <TableHead>Country / Project</TableHead>
                  <TableHead>Category</TableHead>
                  <SortableHead active={waSort.key === 'amountRequested'} direction={waSort.dir} onSort={() => toggleWaSort('amountRequested')}>
                    Requested
                  </SortableHead>
                  <SortableHead active={waSort.key === 'status'} direction={waSort.dir} onSort={() => toggleWaSort('status')}>
                    Status
                  </SortableHead>
                  <TableHead>Documentation</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>History</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waPage.pageItems.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-foreground">{w.applicationNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{w.countryName}</div>
                      <div className="text-[11px] text-muted-foreground">{w.projectCode} — {w.projectTitle}</div>
                    </TableCell>
                    <TableCell><Badge variant="muted">{w.category}</Badge></TableCell>
                    <TableCell className="font-mono">${w.amountRequested.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={WITHDRAWAL_STATUS_TONE[w.status] ?? 'default'}>{w.status}</Badge></TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate text-xs">{w.supportingDocumentsNote}</div>
                      {w.documents.length > 0 && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Paperclip className="h-3 w-3" /> {w.documents.length} file{w.documents.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {w.disbursement && (
                        <div className="mt-0.5 text-[11px] text-emerald-400">
                          Ref: {w.disbursement.transactionReference} (Bal: ${w.disbursement.designatedAccountBalanceAfter.toLocaleString()})
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {w.status === 'Submitted' && (
                          <Button size="sm" variant="outline" onClick={() => handleReviewWA(w, 'UnderReview')}>
                            Under Review
                          </Button>
                        )}
                        {(w.status === 'Submitted' || w.status === 'UnderReview') && (
                          <>
                            <Button size="sm" onClick={() => handleReviewWA(w, 'Approved')}>
                              <CheckCircle2 className="h-3 w-3" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                              onClick={() => handleReviewWA(w, 'Rejected')}
                            >
                              <XCircle className="h-3 w-3" /> Reject
                            </Button>
                          </>
                        )}
                        {w.status === 'Approved' && !w.disbursement && (
                          <Button
                            size="sm"
                            className="bg-sky-500 text-zinc-950 hover:bg-sky-400"
                            onClick={() => handleRecordDisbursement(w)}
                          >
                            <Banknote className="h-3 w-3" /> Disburse
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setHistoryTarget(w)}>
                        <History className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {waPage.pageItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No Withdrawal Applications match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Pagination
              page={waPage.page}
              pageCount={waPage.pageCount}
              totalItems={waPage.totalItems}
              pageSize={waPage.pageSize}
              onPageChange={waPage.setPage}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'indicators' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.flatMap((p) =>
            p.resultsIndicators.map((ind) => (
              <Card key={ind.id} className="p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge variant="muted">{p.projectCode} ({p.countryName})</Badge>
                  <Button size="sm" variant="outline" onClick={() => setIndicatorModal({ project: p, existing: ind })}>
                    Update
                  </Button>
                </div>
                <h4 className="text-sm font-semibold text-foreground">{ind.indicatorName}</h4>
                <div className="my-3 grid grid-cols-3 gap-2 font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Baseline</div>
                    <div className="text-foreground">{ind.baselineValue.toLocaleString()} {ind.unit}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Current</div>
                    <div className="text-sky-400">{ind.currentValue.toLocaleString()} {ind.unit}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Target</div>
                    <div className="text-emerald-400">{ind.targetValue.toLocaleString()} {ind.unit}</div>
                  </div>
                </div>
                <ProgressBar percent={ind.progressPercent} tone="sky" />
                <div className="mt-1.5 text-[11px] text-muted-foreground">
                  {ind.progressPercent}% of PDO target ({disbursements.filter((d) => d.projectId === p.id).length} disbursements)
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {showCreateProject && (
        <AdminProjectModal
          countries={countries}
          onClose={() => setShowCreateProject(false)}
          onCreated={() => {
            setShowCreateProject(false);
            setActionBanner('Created new project in portfolio.');
            loadPortfolio();
          }}
        />
      )}

      {indicatorModal && (
        <AdminIndicatorModal
          project={indicatorModal.project}
          existing={indicatorModal.existing}
          onClose={() => setIndicatorModal(null)}
          onSaved={() => {
            setIndicatorModal(null);
            setActionBanner('Updated PDO Results Indicator.');
            loadPortfolio();
          }}
        />
      )}

      {historyTarget && (
        <HistoryModal
          entityType="WithdrawalApplication"
          entityId={historyTarget.id}
          title={`History — ${historyTarget.applicationNumber}`}
          documents={historyTarget.documents}
          onClose={() => setHistoryTarget(null)}
        />
      )}

      {projectHistoryTarget && (
        <HistoryModal
          entityType="Project"
          entityId={projectHistoryTarget.id}
          title={`History — ${projectHistoryTarget.projectCode}`}
          onClose={() => setProjectHistoryTarget(null)}
        />
      )}

      <AiChatWidget />
    </div>
    </SidebarShell>
  );
};
