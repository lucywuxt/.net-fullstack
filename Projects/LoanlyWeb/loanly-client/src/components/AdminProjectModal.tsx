import React, { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { api } from '../services/api';
import type { CountrySummary, FinancingInstrument, ProjectSector, ProjectStatus } from '../types/api';
import { Dialog, DialogHeader } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input, Label, Select, Textarea } from './ui/input';
import { Alert } from './ui/alert';

interface AdminProjectModalProps {
  countries: CountrySummary[];
  onClose: () => void;
  onCreated: () => void;
}

export const AdminProjectModal: React.FC<AdminProjectModalProps> = ({ countries, onClose, onCreated }) => {
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
    <Dialog onClose={onClose} className="max-w-xl">
      <DialogHeader
        title="Create New Sovereign Financing Project"
        badge={<Badge variant="pipeline">TASK TEAM OPERATIONS</Badge>}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="space-y-3 p-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <Label>Project Title</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., East Africa Regional Geothermal & Grid Interconnector"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Borrower Member Country</Label>
            <Select value={countryId} onChange={(e) => setCountryId(Number(e.target.value))}>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.isoAlpha3}) — {c.incomeLevel}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Sector</Label>
            <Select value={sector} onChange={(e) => setSector(e.target.value as ProjectSector)}>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Climate">Climate</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Financing Instrument</Label>
            <Select value={instrument} onChange={(e) => setInstrument(e.target.value as FinancingInstrument)}>
              <option value="IBRDLoan">IBRD Loan</option>
              <option value="IDACredit">IDA Credit</option>
              <option value="IDAGrant">IDA Grant</option>
            </Select>
          </div>
          <div>
            <Label>Approved Ceiling (USD)</Label>
            <Input
              type="number"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Initial Lifecycle Stage</Label>
            <Select value={initialStatus} onChange={(e) => setInitialStatus(e.target.value as ProjectStatus)}>
              <option value="Concept">Concept</option>
              <option value="Appraisal">Appraisal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="BoardApproval">BoardApproval</option>
              <option value="Active">Active</option>
            </Select>
          </div>
        </div>

        <div>
          <Label>Project Development Objective (PDO)</Label>
          <Textarea rows={3} value={pdo} onChange={(e) => setPdo(e.target.value)} required />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <FolderPlus className="h-4 w-4" />
            {saving ? 'Creating…' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
