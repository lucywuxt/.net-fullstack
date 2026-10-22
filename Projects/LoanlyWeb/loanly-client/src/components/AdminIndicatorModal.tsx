import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { api } from '../services/api';
import type { Project, ResultsIndicator } from '../types/api';

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
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <span className="badge badge-admin">{project.projectCode}</span>
            <h3>{existing ? 'Update Results Indicator' : 'Add PDO Results Indicator'}</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label>Indicator Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rural households connected to clean grid electricity"
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>Unit of Measure</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., %, MW, beneficiaries"
                required
              />
            </div>
            <div className="form-field">
              <label>Baseline Value</label>
              <input
                type="number"
                step="0.1"
                value={baseline}
                onChange={(e) => setBaseline(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>Current Measured Value</label>
              <input
                type="number"
                step="0.1"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Target Value</label>
              <input
                type="number"
                step="0.1"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Target size={16} />
              <span>{saving ? 'Saving...' : 'Save Results Indicator'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
