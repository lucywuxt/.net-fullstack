import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { api } from '../services/api';
import type { Project, ResultsIndicator } from '../types/api';
import { Dialog, DialogHeader } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input, Label } from './ui/input';
import { Alert } from './ui/alert';

interface AdminIndicatorModalProps {
  project: Project;
  existing?: ResultsIndicator;
  onClose: () => void;
  onSaved: () => void;
}

export const AdminIndicatorModal: React.FC<AdminIndicatorModalProps> = ({
  project,
  existing,
  onClose,
  onSaved,
}) => {
  const [name, setName] = useState(existing?.indicatorName ?? '');
  const [unit, setUnit] = useState(existing?.unit ?? 'beneficiaries');
  const [baseline, setBaseline] = useState(String(existing?.baselineValue ?? 0));
  const [current, setCurrent] = useState(String(existing?.currentValue ?? 50));
  const [target, setTarget] = useState(String(existing?.targetValue ?? 100));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.upsertIndicator(project.id, {
        id: existing?.id,
        indicatorName: name,
        unit,
        baselineValue: Number(baseline),
        currentValue: Number(current),
        targetValue: Number(target),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save indicator');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog onClose={onClose}>
      <DialogHeader
        title={existing ? 'Update Results Indicator' : 'Add PDO Results Indicator'}
        badge={<Badge variant="pipeline">{project.projectCode}</Badge>}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="space-y-3 p-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <Label>Indicator Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Rural households connected to clean grid electricity"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Unit of Measure</Label>
            <Input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g., %, MW, beneficiaries"
              required
            />
          </div>
          <div>
            <Label>Baseline Value</Label>
            <Input type="number" step="0.1" value={baseline} onChange={(e) => setBaseline(e.target.value)} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Current Measured Value</Label>
            <Input type="number" step="0.1" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div>
            <Label>Target Value</Label>
            <Input type="number" step="0.1" value={target} onChange={(e) => setTarget(e.target.value)} required />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Target className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Results Indicator'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
