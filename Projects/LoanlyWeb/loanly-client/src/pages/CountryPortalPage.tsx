import React, { useEffect, useState } from 'react';
import {
  FilePlus2,
  Landmark,
  TrendingUp,
  CheckCircle2,
  Clock,
  Receipt,
  Target,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Disbursement, Project, ProjectStatus, WithdrawalApplication } from '../types/api';
import { WithdrawalModal } from '../components/WithdrawalModal';
import { AiChatWidget } from '../components/AiChatWidget';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { StatCard } from '../components/ui/stat-card';
import { ProgressBar } from '../components/ui/progress';
import { Stepper } from '../components/ui/stepper';
import { TabBar } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { PROJECT_STATUS_TONE, WITHDRAWAL_STATUS_TONE } from '../lib/status';
import { SECTOR_BADGE_CLASSES } from '../lib/sector';

const LIFECYCLE_STAGES: ProjectStatus[] = [
  'Concept',
  'Appraisal',
  'Negotiation',
  'BoardApproval',
  'Active',
  'Closed',
];

export const CountryPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalApplication[]>([]);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'withdrawals' | 'disbursements' | 'results'>('projects');
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

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

  const totalApproved = projects.reduce((acc, p) => acc + p.approvedAmount, 0);
  const totalDisbursed = projects.reduce((acc, p) => acc + p.totalDisbursed, 0);
  const totalRemaining = projects.reduce((acc, p) => acc + p.remainingUndisbursedAmount, 0);
  const activeProjects = projects.filter((p) => p.status === 'Active');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="pipeline" className="mb-2">
            BORROWER CLIENT CONNECTION • {user?.isoAlpha3} ({user?.subRoleOrRegion})
          </Badge>
          <h1 className="text-xl font-semibold text-foreground">{user?.name} — Sovereign Project Financing Portal</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage approved World Bank IBRD/IDA project ceilings, submit Withdrawal Applications, and monitor
            Designated Account disbursements and PDO Results Indicators.
          </p>
        </div>
        {activeProjects.length > 0 && (
          <Button onClick={() => setModalProject(activeProjects[0])}>
            <FilePlus2 className="h-4 w-4" />
            New Withdrawal Application
          </Button>
        )}
      </div>

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

      <TabBar
        active={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
        tabs={[
          { id: 'projects', label: `Projects & Ceilings (${projects.length})`, icon: <Landmark className="h-3.5 w-3.5" /> },
          { id: 'withdrawals', label: `Withdrawal Applications (${withdrawals.length})`, icon: <Clock className="h-3.5 w-3.5" /> },
          { id: 'disbursements', label: `Disbursement Ledger (${disbursements.length})`, icon: <Receipt className="h-3.5 w-3.5" /> },
          { id: 'results', label: 'Results Indicators (PDO)', icon: <Target className="h-3.5 w-3.5" /> },
        ]}
      />

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading borrower portfolio…</div>
      ) : activeTab === 'projects' ? (
        <div className="space-y-3">
          {projects.map((p) => {
            const pct = p.approvedAmount > 0 ? Math.round((p.totalDisbursed / p.approvedAmount) * 100) : 0;
            return (
              <Card key={p.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge>{p.projectCode}</Badge>
                      <Badge variant="muted">{p.financingInstrument}</Badge>
                      <Badge variant="muted" className={SECTOR_BADGE_CLASSES[p.sector]}>{p.sector}</Badge>
                      <Badge variant={PROJECT_STATUS_TONE[p.status] ?? 'default'}>{p.status}</Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                    <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
                      <strong className="text-muted-foreground">PDO:</strong> {p.projectDevelopmentObjective}
                    </p>
                  </div>
                  {p.status === 'Active' && (
                    <Button size="sm" onClick={() => setModalProject(p)}>
                      <FilePlus2 className="h-3.5 w-3.5" />
                      Submit Withdrawal
                    </Button>
                  )}
                </div>

                <div className="my-4 overflow-x-auto">
                  <Stepper stages={LIFECYCLE_STAGES} currentIndex={LIFECYCLE_STAGES.indexOf(p.status)} />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
                    <span>Ceiling: <strong className="text-foreground">${p.approvedAmount.toLocaleString()}</strong></span>
                    <span>Disbursed: <strong className="text-emerald-400">${p.totalDisbursed.toLocaleString()} ({pct}%)</strong></span>
                    <span>Pending: <strong className="text-amber-400">${p.committedPendingDisbursement.toLocaleString()}</strong></span>
                    <span>Remaining: <strong className="text-sky-400">${p.remainingUndisbursedAmount.toLocaleString()}</strong></span>
                  </div>
                  <ProgressBar percent={pct} />
                </div>
              </Card>
            );
          })}
        </div>
      ) : activeTab === 'withdrawals' ? (
        <Card>
          <CardContent className="overflow-x-auto p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WA Number</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documentation &amp; Notes</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-foreground">{w.applicationNumber}</TableCell>
                    <TableCell>{w.projectCode} — {w.projectTitle}</TableCell>
                    <TableCell><Badge variant="muted">{w.category}</Badge></TableCell>
                    <TableCell className="font-mono">${w.amountRequested.toLocaleString()}</TableCell>
                    <TableCell><Badge variant={WITHDRAWAL_STATUS_TONE[w.status] ?? 'default'}>{w.status}</Badge></TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="truncate text-xs">{w.supportingDocumentsNote}</div>
                      {w.reviewNotes && (
                        <div className="mt-0.5 text-[11px] text-sky-400">
                          Reviewer ({w.reviewedByAdminName}): {w.reviewNotes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(w.submittedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : activeTab === 'disbursements' ? (
        <Card>
          <CardContent className="overflow-x-auto p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Ref</TableHead>
                  <TableHead>WA Number</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance After</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disbursements.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-muted-foreground">{d.transactionReference}</TableCell>
                    <TableCell>{d.applicationNumber}</TableCell>
                    <TableCell>{d.projectCode} — {d.projectTitle}</TableCell>
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
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.flatMap((p) =>
            p.resultsIndicators.map((ind) => (
              <Card key={ind.id} className="p-4">
                <Badge variant="muted" className="mb-2">{p.projectCode} — {p.title}</Badge>
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
                <div className="mt-1.5 text-[11px] text-muted-foreground">{ind.progressPercent}% toward PDO target</div>
              </Card>
            ))
          )}
        </div>
      )}

      {modalProject && (
        <WithdrawalModal
          project={modalProject}
          onClose={() => setModalProject(null)}
          onSubmitted={() => {
            setModalProject(null);
            loadData();
          }}
        />
      )}

      <AiChatWidget selectedProjectId={projects[0]?.id} />
    </div>
  );
};
