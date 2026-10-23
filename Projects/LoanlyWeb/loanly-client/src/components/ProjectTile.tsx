import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { Project } from '../types/api';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ProgressBar } from './ui/progress';
import { PROJECT_STATUS_TONE } from '../lib/status';
import { SECTOR_BADGE_CLASSES, SECTOR_HEX } from '../lib/sector';

interface ProjectTileProps {
  project: Project;
  onClick: () => void;
}

export const ProjectTile: React.FC<ProjectTileProps> = ({ project: p, onClick }) => {
  const pct = p.approvedAmount > 0 ? Math.round((p.totalDisbursed / p.approvedAmount) * 100) : 0;

  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      <Card className="h-full p-4" style={{ borderTopColor: SECTOR_HEX[p.sector], borderTopWidth: 3 }}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="muted" className={SECTOR_BADGE_CLASSES[p.sector]}>{p.sector}</Badge>
            <Badge variant={PROJECT_STATUS_TONE[p.status] ?? 'default'}>{p.status}</Badge>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-bold leading-snug text-foreground">{p.title}</h3>
        <div className="mt-1 text-xs text-muted-foreground">{p.countryName} &middot; {p.financingInstrument}</div>

        <div className="mt-4 space-y-2">
          <div className="flex items-baseline justify-between font-mono text-sm">
            <span className="text-muted-foreground">${p.totalDisbursed.toLocaleString()} disbursed</span>
            <span className="text-foreground">${p.approvedAmount.toLocaleString()}</span>
          </div>
          <ProgressBar percent={pct} />
        </div>
      </Card>
    </button>
  );
};
