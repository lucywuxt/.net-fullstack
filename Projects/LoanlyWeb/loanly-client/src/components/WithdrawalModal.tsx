import React, { useState } from 'react';
import { FileCheck2 } from 'lucide-react';
import type { ExpenditureCategory, Project } from '../types/api';
import { api } from '../services/api';
import { Dialog, DialogHeader } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input, Label, Select, Textarea } from './ui/input';
import { Alert } from './ui/alert';

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

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ project, onClose, onSubmitted }) => {
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
    <Dialog onClose={onClose}>
      <DialogHeader
        title="Submit Withdrawal Application"
        badge={<Badge variant="active">{project.projectCode}</Badge>}
        onClose={onClose}
      />

      <div className="grid grid-cols-3 gap-3 border-b border-border p-4">
        <div>
          <div className="text-[11px] text-muted-foreground">Approved Ceiling</div>
          <div className="font-mono text-sm text-foreground">${project.approvedAmount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground">Remaining Undisbursed</div>
          <div className="font-mono text-sm text-foreground">${project.remainingUndisbursedAmount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-[11px] text-muted-foreground">Uncommitted Available</div>
          <div className="font-mono text-sm text-emerald-400">${project.availableToRequestAmount.toLocaleString()}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 p-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <Label>Expenditure Category</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value as ExpenditureCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          {selectedCatMeta && <p className="mt-1 text-[11px] text-muted-foreground">{selectedCatMeta.hint}</p>}
        </div>

        <div>
          <Label>Amount Requested (USD)</Label>
          <Input
            type="number"
            step="1000"
            min="1"
            max={project.availableToRequestAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Supporting Documentation &amp; Procurement Reference Note</Label>
          <Textarea
            rows={3}
            value={docsNote}
            onChange={(e) => setDocsNote(e.target.value)}
            placeholder="Reference IPCs, commercial invoices, SOE, or IFR numbers..."
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            <FileCheck2 className="h-4 w-4" />
            {submitting ? 'Submitting to WFACS…' : 'Submit Withdrawal Application'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
