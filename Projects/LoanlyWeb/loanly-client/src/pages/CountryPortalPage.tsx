import React, { useEffect, useMemo, useState } from 'react';
import {
  Landmark,
  TrendingUp,
  CheckCircle2,
  Clock,
  Receipt,
  History,
  Paperclip,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Disbursement, Project, WithdrawalApplication, WithdrawalStatus } from '../types/api';
import { WithdrawalModal } from '../components/WithdrawalModal';
import { HistoryModal } from '../components/HistoryModal';
import { AiChatWidget } from '../components/AiChatWidget';
import { SidebarShell } from '../components/SidebarShell';
import { CountryFocusGlobe } from '../components/CountryFocusGlobe';
import { ProjectTile } from '../components/ProjectTile';
import { ProjectDetailView } from '../components/ProjectDetailView';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Alert } from '../components/ui/alert';
import { Input, Select } from '../components/ui/input';
import { StatCard } from '../components/ui/stat-card';
import { Pagination } from '../components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, SortableHead, TableHeader, TableRow } from '../components/ui/table';
import { usePagination } from '../hooks/usePagination';
import { WITHDRAWAL_STATUS_TONE } from '../lib/status';

type WaSortKey = 'submittedAt' | 'amountRequested' | 'status';
type DisbSortKey = 'disbursedAt' | 'amountDisbursed';

export const CountryPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalApplication[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'withdrawals' | 'disbursements'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [historyTarget, setHistoryTarget] = useState<WithdrawalApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  const [waSearch, setWaSearch] = useState('');
  const [waStatusFilter, setWaStatusFilter] = useState<WithdrawalStatus | 'All'>('All');
  const [waSort, setWaSort] = useState<{ key: WaSortKey; dir: 'asc' | 'desc' }>({ key: 'submittedAt', dir: 'desc' });

  const [disbSearch, setDisbSearch] = useState('');
  const [disbSort, setDisbSort] = useState<{ key: DisbSortKey; dir: 'asc' | 'desc' }>({ key: 'disbursedAt', dir: 'desc' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [projList, waList, disbList] = await Promise.all([
        api.getProjects(),
        api.getWithdrawals(),
        api.getDisbursements(),
      ]);
      setProjects(projList);
      setWithdrawals(waList);
      setDisbursements(disbList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Guards against a stale selection (e.g. a notification pointing at a project
  // that's no longer in the loaded list) leaving the detail view stuck blank.
  useEffect(() => {
    if (selectedProjectId != null && projects.length > 0 && !projects.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(null);
    }
  }, [projects, selectedProjectId]);

  const toggleWaSort = (key: WaSortKey) =>
    setWaSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));

  const toggleDisbSort = (key: DisbSortKey) =>
    setDisbSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));

  const filteredWithdrawals = useMemo(() => {
    const q = waSearch.trim().toLowerCase();
    let list = withdrawals.filter((w) => {
      if (waStatusFilter !== 'All' && w.status !== waStatusFilter) return false;
      if (!q) return true;
      return (
        w.applicationNumber.toLowerCase().includes(q) ||
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

  const filteredDisbursements = useMemo(() => {
    const q = disbSearch.trim().toLowerCase();
    let list = disbursements.filter((d) => {
      if (!q) return true;
      return (
        d.transactionReference.toLowerCase().includes(q) ||
        d.applicationNumber.toLowerCase().includes(q) ||
        d.projectCode.toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      const dir = disbSort.dir === 'asc' ? 1 : -1;
      if (disbSort.key === 'amountDisbursed') return (a.amountDisbursed - b.amountDisbursed) * dir;
      return (new Date(a.disbursedAt).getTime() - new Date(b.disbursedAt).getTime()) * dir;
    });
    return list;
  }, [disbursements, disbSearch, disbSort]);

  const disbPage = usePagination(filteredDisbursements, 8);

  const totalApproved = projects.reduce((acc, p) => acc + p.approvedAmount, 0);
  const totalDisbursed = projects.reduce((acc, p) => acc + p.totalDisbursed, 0);
  const totalRemaining = projects.reduce((acc, p) => acc + p.remainingUndisbursedAmount, 0);
  const activeProjects = projects.filter((p) => p.status === 'Active');

  return (
    <SidebarShell
      portalLabel="Borrower Portal"
      active={activeTab}
      onChange={(id) => setActiveTab(id as typeof activeTab)}
      onNotificationClick={(entry) => {
        const projectId =
          entry.entityType === 'Project'
            ? entry.entityId
            : entry.entityType === 'WithdrawalApplication'
            ? withdrawals.find((w) => w.id === entry.entityId)?.projectId
            : undefined;
        if (projectId == null) return;
        setActiveTab('projects');
        setSelectedProjectId(projectId);
      }}
      tabs={[
        { id: 'projects', label: 'My Projects', icon: <Landmark className="h-3.5 w-3.5" /> },
        { id: 'withdrawals', label: 'Withdrawal Applications', icon: <Clock className="h-3.5 w-3.5" /> },
        { id: 'disbursements', label: 'Disbursement Ledger', icon: <Receipt className="h-3.5 w-3.5" /> },
      ]}
    >
    <div className="space-y-6">
      {!(activeTab === 'projects' && selectedProjectId) && (
        <>
          <div>
            <Badge variant="pipeline" className="mb-2">
              BORROWER CLIENT CONNECTION • {user?.isoAlpha3} ({user?.subRoleOrRegion})
            </Badge>
            <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Sovereign project financing, Withdrawal Applications, and Designated Account disbursements.
            </p>
          </div>

          {activeTab !== 'projects' && (
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                icon={<Landmark className="h-4 w-4" />}
                tone="sky"
                label="Approved Financing Ceiling"
                value={`$${totalApproved.toLocaleString()}`}
                sub={`${projects.length} Total Projects (${activeProjects.length} Active)`}
              />
              <StatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                tone="emerald"
                label="Cumulative Disbursed"
                value={`$${totalDisbursed.toLocaleString()}`}
                sub={`${disbursements.length} Recorded Tranches`}
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                tone="amber"
                label="Remaining Undisbursed Ceiling"
                value={`$${totalRemaining.toLocaleString()}`}
                sub="Available for Drawdown on Active Projects"
              />
            </div>
          )}
        </>
      )}

      {actionBanner && <Alert variant="success">{actionBanner}</Alert>}

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading borrower portfolio…</div>
      ) : activeTab === 'projects' && selectedProjectId ? (
        (() => {
          const selected = projects.find((p) => p.id === selectedProjectId);
          if (!selected) return null;
          return (
            <ProjectDetailView
              project={selected}
              withdrawals={withdrawals.filter((w) => w.projectId === selectedProjectId)}
              disbursements={disbursements.filter((d) => d.projectId === selectedProjectId)}
              onBack={() => setSelectedProjectId(null)}
              onSubmitWithdrawal={() => setModalProject(selected)}
              onShowHistory={setHistoryTarget}
            />
          );
        })()
      ) : activeTab === 'projects' ? (
        <div className="space-y-5">
          <Card className="grid gap-6 p-5 lg:grid-cols-2 lg:items-center">
            <div className="grid gap-3">
              <StatCard
                icon={<Landmark className="h-4 w-4" />}
                tone="sky"
                label="Approved Financing Ceiling"
                value={`$${totalApproved.toLocaleString()}`}
                sub={`${projects.length} Total Projects (${activeProjects.length} Active)`}
              />
              <StatCard
                icon={<CheckCircle2 className="h-4 w-4" />}
                tone="emerald"
                label="Cumulative Disbursed"
                value={`$${totalDisbursed.toLocaleString()}`}
                sub={`${disbursements.length} Recorded Tranches`}
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                tone="amber"
                label="Remaining Undisbursed Ceiling"
                value={`$${totalRemaining.toLocaleString()}`}
                sub="Available for Drawdown on Active Projects"
              />
            </div>

            {user?.isoAlpha3 && (
              <div className="flex justify-center">
                <CountryFocusGlobe
                  isoAlpha3={user.isoAlpha3}
                  committed={totalApproved}
                  disbursed={totalDisbursed}
                  remaining={totalRemaining}
                />
              </div>
            )}
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <ProjectTile key={p.id} project={p} onClick={() => setSelectedProjectId(p.id)} />
            ))}
          </div>
        </div>
      ) : activeTab === 'withdrawals' ? (
        <Card>
          <CardContent className="overflow-x-auto p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search WA number or project…"
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
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <SortableHead active={waSort.key === 'amountRequested'} direction={waSort.dir} onSort={() => toggleWaSort('amountRequested')}>
                    Requested
                  </SortableHead>
                  <SortableHead active={waSort.key === 'status'} direction={waSort.dir} onSort={() => toggleWaSort('status')}>
                    Status
                  </SortableHead>
                  <TableHead>Documentation &amp; Notes</TableHead>
                  <SortableHead active={waSort.key === 'submittedAt'} direction={waSort.dir} onSort={() => toggleWaSort('submittedAt')}>
                    Submitted
                  </SortableHead>
                  <TableHead>History</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waPage.pageItems.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-foreground">{w.applicationNumber}</TableCell>
                    <TableCell>{w.projectTitle}</TableCell>
                    <TableCell><Badge variant="muted">{w.category}</Badge></TableCell>
                    <TableCell className="font-mono">${w.amountRequested.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={WITHDRAWAL_STATUS_TONE[w.status] ?? 'default'}>{w.status}</Badge></TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="truncate text-xs">{w.supportingDocumentsNote}</div>
                      {w.documents.length > 0 && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Paperclip className="h-3 w-3" /> {w.documents.length} file{w.documents.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {w.reviewNotes && (
                        <div className="mt-0.5 text-[11px] text-sky-400">
                          Reviewer ({w.reviewedByAdminName}): {w.reviewNotes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(w.submittedAt).toLocaleDateString()}</TableCell>
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
      ) : activeTab === 'disbursements' ? (
        <Card>
          <CardContent className="overflow-x-auto p-4">
            <div className="mb-3">
              <Input
                placeholder="Search transaction ref, WA number, or project…"
                value={disbSearch}
                onChange={(e) => setDisbSearch(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Ref</TableHead>
                  <TableHead>WA Number</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <SortableHead active={disbSort.key === 'amountDisbursed'} direction={disbSort.dir} onSort={() => toggleDisbSort('amountDisbursed')} className="text-right">
                    Amount
                  </SortableHead>
                  <TableHead className="text-right">Balance After</TableHead>
                  <SortableHead active={disbSort.key === 'disbursedAt'} direction={disbSort.dir} onSort={() => toggleDisbSort('disbursedAt')}>
                    Date
                  </SortableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disbPage.pageItems.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-muted-foreground">{d.transactionReference}</TableCell>
                    <TableCell>{d.applicationNumber}</TableCell>
                    <TableCell>{d.projectTitle}</TableCell>
                    <TableCell><Badge variant="muted">{d.category}</Badge></TableCell>
                    <TableCell className="text-right font-mono text-emerald-400">
                      +${d.amountDisbursed.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sky-400">
                      ${d.designatedAccountBalanceAfter.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(d.disbursedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {disbPage.pageItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No disbursements match the current search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Pagination
              page={disbPage.page}
              pageCount={disbPage.pageCount}
              totalItems={disbPage.totalItems}
              pageSize={disbPage.pageSize}
              onPageChange={disbPage.setPage}
            />
          </CardContent>
        </Card>
      ) : null}

      {modalProject && (
        <WithdrawalModal
          project={modalProject}
          onClose={() => setModalProject(null)}
          onSubmitted={() => {
            setModalProject(null);
            setActionBanner('Withdrawal Application submitted for review.');
            loadData();
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

      <AiChatWidget selectedProjectId={projects[0]?.id} />
    </div>
    </SidebarShell>
  );
};
