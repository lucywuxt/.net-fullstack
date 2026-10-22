import React, { useState } from 'react';
import { X, FileCheck2 } from 'lucide-react';
import type { ExpenditureCategory, Project } from '../types/api';
import { api } from '../services/api';

interface WithdrawalModalProps {
  project: Project;
  onClose: () => void;
  onSubmitted: () => void;
}

const CATEGORIES: { value: ExpenditureCategory; label: string; hint: string }[] = [
  { value: 'Works', label: 'Works (Civil Construction & Substations)', hint: 'Requires Interim Payment Certificates (IPCs) & Engineer verification.' },
  { value: 'Goods', label: 'Goods (Equipment, Vehicles & Solar Modules)', hint: 'Requires commercial invoices, Bill of Lading, and delivery receipts.' },
  { value: 'ConsultingServices', label: 'Consulting Services (Advisory, Audits & Consultant Travel)', hint: 'Requires contract milestone acceptance & reimbursable receipts.' },
  { value: 'Training', label: 'Training (Workshops, Capacity Building & Study Tours)', hint: 'Requires Statement of Expenditures (SOE) & participant logs.' },
  { value: 'OperatingCosts', label: 'Operating Costs (PIU Operations & Supervision)', hint: 'Requires quarterly Interim Unaudited Financial Report (IFR).' },
];

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  project,
  onClose,
  onSubmitted,
}) => {
  const [category, setCategory] = useState<ExpenditureCategory>('Goods');
  const [amount, setAmount] = useState<string>('2500000');
  const [docsNote, setDocsNote] = useState<string>(
    'Commercial Invoice #INV-2026-410 & Independent Engineer Inspection Certificate #IE-88 verified under STEP plan.'
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedCatMeta = CATEGORIES.find((c) => c.value === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.submitWithdrawal({
        projectId: project.id,
        category,
        amountRequested: Number(amount),
        supportingDocumentsNote: docsNote,
      });
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit Withdrawal Application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <span className="badge badge-country">{project.projectCode}</span>
            <h3>Submit Withdrawal Application (Client Connection)</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="ceiling-summary-banner">
          <div>
            <span>Approved Ceiling</span>
            <strong>${project.approvedAmount.toLocaleString()}</strong>
          </div>
          <div>
            <span>Remaining Undisbursed</span>
            <strong>${project.remainingUndisbursedAmount.toLocaleString()}</strong>
          </div>
          <div>
            <span>Uncommitted Available</span>
            <strong className="text-emerald">${project.availableToRequestAmount.toLocaleString()}</strong>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label>Expenditure Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenditureCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {selectedCatMeta && <small className="field-hint">{selectedCatMeta.hint}</small>}
          </div>

          <div className="form-field">
            <label>Amount Requested (USD)</label>
            <input
              type="number"
              step="1000"
              min="1"
              max={project.availableToRequestAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>Supporting Documentation &amp; Procurement Reference Note</label>
            <textarea
              rows={3}
              value={docsNote}
              onChange={(e) => setDocsNote(e.target.value)}
              placeholder="Reference IPCs, commercial invoices, SOE, or IFR numbers..."
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <FileCheck2 size={16} />
              <span>{submitting ? 'Submitting to WFACS...' : 'Submit Withdrawal Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
