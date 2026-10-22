import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { api } from '../services/api';
import type {
  CountrySummary,
  FinancingInstrument,
  ProjectSector,
  ProjectStatus,
} from '../types/api';

interface AdminProjectModalProps {
  countries: CountrySummary[];
  onClose: () => void;
  onCreated: () => void;
}

export const AdminProjectModal: React.FC<AdminProjectModalProps> = ({
  countries,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [countryId, setCountryId] = useState<number>(countries[0]?.id ?? 1);
  const [sector, setSector] = useState<ProjectSector>('Infrastructure');
  const [instrument, setInstrument] = useState<FinancingInstrument>('IBRDLoan');
  const [approvedAmount, setApprovedAmount] = useState('125000000');
  const [initialStatus, setInitialStatus] = useState<ProjectStatus>('Concept');
  const [pdo, setPdo] = useState(
    'To expand climate-resilient regional transport corridors and strengthen institutional service delivery.'
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.createProject({
        title,
        countryId,
        sector,
        financingInstrument: instrument,
        approvedAmount: Number(approvedAmount),
        initialStatus,
        projectDevelopmentObjective: pdo,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <span className="badge badge-admin">TASK TEAM OPERATIONS</span>
            <h3>Create New Sovereign Financing Project</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label>Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., East Africa Regional Geothermal & Grid Interconnector"
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>Borrower Member Country</label>
              <select
                value={countryId}
                onChange={(e) => setCountryId(Number(e.target.value))}
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.isoAlpha3}) — {c.incomeLevel}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as ProjectSector)}
              >
                <option value="Infrastructure">Infrastructure</option>
                <option value="Climate">Climate</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-field">
              <label>Financing Instrument</label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value as FinancingInstrument)}
              >
                <option value="IBRDLoan">IBRD Loan</option>
                <option value="IDACredit">IDA Credit</option>
                <option value="IDAGrant">IDA Grant</option>
              </select>
            </div>

            <div className="form-field">
              <label>Approved Ceiling (USD)</label>
              <input
                type="number"
                min="100000"
                step="500000"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Initial Lifecycle Stage</label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as ProjectStatus)}
              >
                <option value="Concept">Concept</option>
                <option value="Appraisal">Appraisal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="BoardApproval">BoardApproval</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Project Development Objective (PDO)</label>
            <textarea
              rows={3}
              value={pdo}
              onChange={(e) => setPdo(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <FolderPlus size={16} />
              <span>{saving ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
