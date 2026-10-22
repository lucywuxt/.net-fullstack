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
    <div className="portal-page">
      <section className="portal-header-banner">
        <div>
          <span className="eyebrow-pill">
            BORROWER CLIENT CONNECTION • {user?.isoAlpha3} ({user?.subRoleOrRegion})
          </span>
          <h1>{user?.name} — Sovereign Project Financing Portal</h1>
          <p>
            Manage approved World Bank IBRD/IDA project ceilings, submit Withdrawal Applications,
            and monitor Designated Account disbursements and PDO Results Indicators.
          </p>
        </div>
        {activeProjects.length > 0 && (
          <button className="btn btn-primary" onClick={() => setModalProject(activeProjects[0])}>
            <FilePlus2 size={16} />
            <span>New Withdrawal Application</span>
          </button>
        )}
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon sky"><Landmark size={20} /></div>
          <div>
            <div className="kpi-label">Approved Financing Ceiling</div>
            <div className="kpi-value">${totalApproved.toLocaleString()}</div>
            <div className="kpi-sub">{projects.length} Total Projects ({activeProjects.length} Active)</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon emerald"><CheckCircle2 size={20} /></div>
          <div>
            <div className="kpi-label">Cumulative Disbursed</div>
            <div className="kpi-value">${totalDisbursed.toLocaleString()}</div>
            <div className="kpi-sub">{disbursements.length} Recorded Tranches</div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon amber"><TrendingUp size={20} /></div>
          <div>
            <div className="kpi-label">Remaining Undisbursed Ceiling</div>
            <div className="kpi-value">${totalRemaining.toLocaleString()}</div>
            <div className="kpi-sub">Available for Drawdown on Active Projects</div>
          </div>
        </div>
      </section>

      <div className="portal-tabs">
        <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
          <Landmark size={15} /> Projects &amp; Ceilings ({projects.length})
        </button>
        <button className={`tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`} onClick={() => setActiveTab('withdrawals')}>
          <Clock size={15} /> Withdrawal Applications ({withdrawals.length})
        </button>
        <button className={`tab-btn ${activeTab === 'disbursements' ? 'active' : ''}`} onClick={() => setActiveTab('disbursements')}>
          <Receipt size={15} /> Disbursement Ledger ({disbursements.length})
        </button>
        <button className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
          <Target size={15} /> Results Indicators (PDO)
        </button>
      </div>

      {loading ? (
        <div className="loading-box">Loading borrower portfolio...</div>
      ) : activeTab === 'projects' ? (
        <div className="projects-stack">
          {projects.map((p) => {
            const pct = p.approvedAmount > 0 ? Math.round((p.totalDisbursed / p.approvedAmount) * 100) : 0;
            return (
              <div key={p.id} className="project-detail-card">
                <div className="project-top-row">
                  <div>
                    <div className="badge-cluster">
                      <span className="code-pill">{p.projectCode}</span>
                      <span className="instrument-pill">{p.financingInstrument}</span>
                      <span className="sector-pill">{p.sector}</span>
                      <span className={`status-pill status-${p.status.toLowerCase()}`}>{p.status}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p className="pdo-text"><strong>PDO:</strong> {p.projectDevelopmentObjective}</p>
                  </div>
                  {p.status === 'Active' && (
                    <button className="btn btn-primary btn-sm" onClick={() => setModalProject(p)}>
                      <FilePlus2 size={15} />
                      <span>Submit Withdrawal</span>
                    </button>
                  )}
                </div>

                <div className="lifecycle-stepper">
                  {LIFECYCLE_STAGES.map((stage, i) => {
                    const currentIdx = LIFECYCLE_STAGES.indexOf(p.status);
                    const done = i <= currentIdx;
                    return (
                      <div key={stage} className={`step-node ${done ? 'done' : ''} ${p.status === stage ? 'current' : ''}`}>
                        <span className="step-dot">{i + 1}</span>
                        <span className="step-label">{stage}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="financial-bar-block">
                  <div className="financial-metrics-row">
                    <span>Approved Ceiling: <strong>${p.approvedAmount.toLocaleString()}</strong></span>
                    <span>Disbursed: <strong className="text-emerald">${p.totalDisbursed.toLocaleString()} ({pct}%)</strong></span>
                    <span>Approved Pending Disb: <strong className="text-amber">${p.committedPendingDisbursement.toLocaleString()}</strong></span>
                    <span>Remaining Undisbursed: <strong className="text-sky">${p.remainingUndisbursedAmount.toLocaleString()}</strong></span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill emerald" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeTab === 'withdrawals' ? (
        <div className="table-card">
          <h3>Withdrawal Applications Status Tracker</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>WA Number</th>
                <th>Project</th>
                <th>Category</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Supporting Documents &amp; Reviewer Notes</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id}>
                  <td><strong>{w.applicationNumber}</strong></td>
                  <td>{w.projectCode} — {w.projectTitle}</td>
                  <td><span className="sector-pill">{w.category}</span></td>
                  <td><strong>${w.amountRequested.toLocaleString()}</strong></td>
                  <td><span className={`status-pill status-${w.status.toLowerCase()}`}>{w.status}</span></td>
                  <td>
                    <div>{w.supportingDocumentsNote}</div>
                    {w.reviewNotes && <small className="text-sky">Reviewer ({w.reviewedByAdminName}): {w.reviewNotes}</small>}
                  </td>
                  <td>{new Date(w.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      ) : activeTab === 'disbursements' ? (
        <div className="table-card">
          <h3>Designated Account Disbursement Running Ledger</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction Ref</th>
                <th>WA Number</th>
                <th>Project</th>
                <th>Category</th>
                <th>Amount Disbursed</th>
                <th>Remaining Ceiling Balance After</th>
                <th>Disbursed Date</th>
              </tr>
            </thead>
            <tbody>
              {disbursements.map((d) => (
                <tr key={d.id}>
                  <td><code>{d.transactionReference}</code></td>
                  <td>{d.applicationNumber}</td>
                  <td>{d.projectCode} — {d.projectTitle}</td>
                  <td>{d.category}</td>
                  <td className="text-emerald"><strong>+${d.amountDisbursed.toLocaleString()}</strong></td>
                  <td className="text-sky"><strong>${d.designatedAccountBalanceAfter.toLocaleString()}</strong></td>
                  <td>{new Date(d.disbursedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="indicators-grid">
          {projects.flatMap((p) =>
            p.resultsIndicators.map((ind) => (
              <div key={ind.id} className="indicator-card">
                <span className="code-pill">{p.projectCode} — {p.title}</span>
                <h4>{ind.indicatorName}</h4>
                <div className="indicator-values-row">
                  <div><span>Baseline</span><strong>{ind.baselineValue.toLocaleString()} {ind.unit}</strong></div>
                  <div><span>Current</span><strong className="text-sky">{ind.currentValue.toLocaleString()} {ind.unit}</strong></div>
                  <div><span>Target</span><strong className="text-emerald">{ind.targetValue.toLocaleString()} {ind.unit}</strong></div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill sky" style={{ width: `${ind.progressPercent}%` }} />
                </div>
                <small>{ind.progressPercent}% toward PDO target</small>
              </div>
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
