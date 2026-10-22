import React, { useRef, useState } from 'react';
import { FileCheck2, Paperclip, X } from 'lucide-react';
import type { ExpenditureCategory, Project, SupportingDocumentType } from '../types/api';
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

const DOCUMENT_TYPES: { value: SupportingDocumentType; label: string }[] = [
  { value: 'Invoice', label: 'Invoice' },
  { value: 'InterimPaymentCertificate', label: 'Interim Payment Certificate' },
  { value: 'StatementOfExpenditures', label: 'Statement of Expenditures' },
  { value: 'AuditReport', label: 'Audit Report' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Other', label: 'Other' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface PickedFile {
  file: File;
  documentType: SupportingDocumentType;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ project, onClose, onSubmitted }) => {
  const [category, setCategory] = useState<ExpenditureCategory>('Goods');
  const [amount, setAmount] = useState<string>('2500000');
  const [docsNote, setDocsNote] = useState<string>(
    'Commercial Invoice #INV-2026-410 & Independent Engineer Inspection Certificate #IE-88 verified under STEP plan.'
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCatMeta = CATEGORIES.find((c) => c.value === category);

  const handleFilesPicked = (fileList: FileList | null) => {
    if (!fileList) return;
    const picked = Array.from(fileList).map((file) => ({ file, documentType: 'Other' as SupportingDocumentType }));
    setFiles((prev) => [...prev, ...picked]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileTypeChange = (index: number, documentType: SupportingDocumentType) => {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, documentType } : f)));
  };

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
        documents: files.map((f) => ({
          fileName: f.file.name,
          fileSizeBytes: f.file.size,
          documentType: f.documentType,
        })),
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
        badge={<Badge variant="active">{project.title}</Badge>}
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
            step="1"
            min="0"
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

        <div>
          <Label>Attach Supporting Documents (optional)</Label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFilesPicked(e.target.files)}
            className="hidden"
            id="withdrawal-file-input"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border py-2 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Choose files…
          </button>

          {files.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {files.map((f, i) => (
                <li
                  key={`${f.file.name}-${i}`}
                  className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5 text-[11px]"
                >
                  <FileCheck2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  <span className="flex-1 truncate text-foreground">{f.file.name}</span>
                  <span className="flex-shrink-0 text-muted-foreground">{formatFileSize(f.file.size)}</span>
                  <select
                    value={f.documentType}
                    onChange={(e) => handleFileTypeChange(i, e.target.value as SupportingDocumentType)}
                    className="flex-shrink-0 rounded border border-border bg-background px-1 py-0.5 text-[11px] text-foreground"
                  >
                    {DOCUMENT_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value}>
                        {dt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="flex-shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            File metadata only (name, size, type) is recorded — files are not uploaded or stored.
          </p>
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
