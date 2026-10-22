import React, { useEffect, useState } from 'react';
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
import { AiChatWidget } from '../components/AiChatWidget';

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

  return (
    <div className="portal-page">
      <section className="portal-header-banner">
        <div>
          <span className="eyebrow-pill">
            WORLD BANK INTERNAL OPERATIONS • {user?.subRoleOrRegion?.toUpperCase()}
          </span>
          <h1>Task Team &amp; WFACS Disbursement Control Center</h1>
          <p>
            Manage sovereign project lifecycles, enforce financing ceilings on Withdrawal Applications,
            record Designated Account disbursements, and track PDO Results Indicators.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateProject(true)}>
          <FolderPlus size={16} />
          <span>Create New Project</span>
        </button>
      </section>

      {actionError && <div className="alert-error">{actionError}</div>}
      {actionBanner && <div className="alert-success">{actionBanner}</div>}

      {analytics && (
        <section className="kpi-grid kpi-grid-4">
          <div className="kpi-card">
            <div className="kpi-icon sky"><Landmark size={20} /></div>
            <div>
              <div className="kpi-label">Total Portfolio Committed</div>
              <div className="kpi-value">${analytics.totalCommitted.toLocaleString()}</div>
              <div className="kpi-sub">{analytics.totalProjectsCount} Projects ({analytics.activeProjectsCount} Active)</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon emerald"><CheckCircle2 size={20} /></div>
            <div>
              <div className="kpi-label">Total Disbursed</div>
              <div className="kpi-value">${analytics.totalDisbursed.toLocaleString()}</div>
              <div className="kpi-sub">{analytics.disbursementRatePercent}% Portfolio Disbursement Rate</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon amber"><Banknote size={20} /></div>
            <div>
              <div className="kpi-label">Total Undisbursed Ceiling</div>
              <div className="kpi-value">${analytics.totalUndisbursed.toLocaleString()}</div>
              <div className="kpi-sub">Available Across Approved Portfolio</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon violet"><Clock size={20} /></div>
            <div>
              <div className="kpi-label">Actionable Withdrawal Queue</div>
              <div className="kpi-value">{analytics.pendingWithdrawalsCount} WAs</div>
              <div className="kpi-sub">${analytics.pendingWithdrawalsVolume.toLocaleString()} Pending Volume</div>
            </div>
          </div>
        </section>
      )}

      <div className="portal-tabs">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <PieChartIcon size={15} /> Portfolio Analytics
        </button>
        <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
          <Landmark size={15} /> Project Lifecycle ({projects.length})
        </button>
        <button className={`tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`} onClick={() => setActiveTab('withdrawals')}>
          <Banknote size={15} /> Withdrawal Review &amp; Disbursements ({withdrawals.length})
        </button>
        <button className={`tab-btn ${activeTab === 'indicators' ? 'active' : ''}`} onClick={() => setActiveTab('indicators')}>
          <Target size={15} /> Results Indicators (PDO)
        </button>
      </div>

      {activeTab === 'dashboard' && analytics && (
        <AdminPortfolioCharts analytics={analytics} />
      )}

      {activeTab === 'projects' && (
        <div className="projects-stack">
          {projects.map((p) => {
            const nextStage = NEXT_STAGE_MAP[p.status];
            return (
              <div key={p.id} className="project-detail-card">
                <div className="project-top-row">
                  <div>
                    <div className="badge-cluster">
                      <span className="code-pill">{p.projectCode}</span>
                      <span className="iso-badge">{p.countryName} ({p.countryIso3})</span>
                      <span className="instrument-pill">{p.financingInstrument}</span>
                      <span className="sector-pill">{p.sector}</span>
                      <span className={`status-pill status-${p.status.toLowerCase()}`}>{p.status}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p className="pdo-text">{p.projectDevelopmentObjective}</p>
                  </div>
                  <div className="admin-card-actions">
                    {nextStage && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleAdvanceLifecycle(p)}>
                        <span>Advance to {nextStage}</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setIndicatorModal({ project: p })}
                    >
                      <Target size={14} />
                      <span>+ Indicator</span>
                    </button>
                  </div>
                </div>
                <div className="financial-metrics-row">
                  <span>Ceiling: <strong>${p.approvedAmount.toLocaleString()}</strong></span>
                  <span>Disbursed: <strong className="text-emerald">${p.totalDisbursed.toLocaleString()}</strong></span>
                  <span>Approved Pending: <strong className="text-amber">${p.committedPendingDisbursement.toLocaleString()}</strong></span>
                  <span>Remaining Undisbursed: <strong className="text-sky">${p.remainingUndisbursedAmount.toLocaleString()}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="table-card">
          <h3>Withdrawal Application Review &amp; Disbursement Execution Desk</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>WA Number</th>
                <th>Country / Project</th>
                <th>Category</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Supporting Documentation</th>
                <th>WFACS / TTL Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id}>
                  <td><strong>{w.applicationNumber}</strong></td>
                  <td>
                    <div><strong>{w.countryName}</strong></div>
                    <small>{w.projectCode} — {w.projectTitle}</small>
                  </td>
                  <td><span className="sector-pill">{w.category}</span></td>
                  <td><strong>${w.amountRequested.toLocaleString()}</strong></td>
                  <td><span className={`status-pill status-${w.status.toLowerCase()}`}>{w.status}</span></td>
                  <td>
                    <div>{w.supportingDocumentsNote}</div>
                    {w.disbursement && (
                      <small className="text-emerald">
                        Disbursed Ref: {w.disbursement.transactionReference} (Bal After: ${w.disbursement.designatedAccountBalanceAfter.toLocaleString()})
                      </small>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      {w.status === 'Submitted' && (
                        <button className="btn btn-outline btn-xs" onClick={() => handleReviewWA(w, 'UnderReview')}>
                          Mark Under Review
                        </button>
                      )}
                      {(w.status === 'Submitted' || w.status === 'UnderReview') && (
                        <>
                          <button className="btn btn-primary btn-xs" onClick={() => handleReviewWA(w, 'Approved')}>
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button className="btn btn-danger btn-xs" onClick={() => handleReviewWA(w, 'Rejected')}>
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}
                      {w.status === 'Approved' && !w.disbursement && (
                        <button className="btn btn-emerald btn-xs" onClick={() => handleRecordDisbursement(w)}>
                          <Banknote size={13} /> Record Disbursement
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {activeTab === 'indicators' && (
        <div className="indicators-grid">
          {projects.flatMap((p) =>
            p.resultsIndicators.map((ind) => (
              <div key={ind.id} className="indicator-card">
                <div className="indicator-card-top">
                  <span className="code-pill">{p.projectCode} ({p.countryName})</span>
                  <button
                    className="btn btn-outline btn-xs"
                    onClick={() => setIndicatorModal({ project: p, existing: ind })}
                  >
                    Update Value
                  </button>
                </div>
                <h4>{ind.indicatorName}</h4>
                <div className="indicator-values-row">
                  <div><span>Baseline</span><strong>{ind.baselineValue.toLocaleString()} {ind.unit}</strong></div>
                  <div><span>Current</span><strong className="text-sky">{ind.currentValue.toLocaleString()} {ind.unit}</strong></div>
                  <div><span>Target</span><strong className="text-emerald">{ind.targetValue.toLocaleString()} {ind.unit}</strong></div>
                </div>
                <div className="progress-track">
                  <div className="progress-fill sky" style={{ width: `${ind.progressPercent}%` }} />
                </div>
                <small>{ind.progressPercent}% of PDO target achieved ({disbursements.filter(d => d.projectId === p.id).length} disbursements)</small>
              </div>
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

      <AiChatWidget />
    </div>
  );
};
