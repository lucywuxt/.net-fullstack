import React, { useEffect, useState } from 'react';
import { ChevronDown, Globe2, Landmark } from 'lucide-react';
import { api } from '../services/api';
import type { PublicProjectSummary } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ProgressBar } from './ui/progress';
import { PROJECT_STATUS_TONE } from '../lib/status';
import { SECTOR_BADGE_CLASSES } from '../lib/sector';
import { cn } from '@/lib/utils';

interface KpiDef {
  label: string;
  code: string;
  format: (v: number) => string;
}

const KPI_DEFS: KpiDef[] = [
  { label: 'GDP', code: 'NY.GDP.MKTP.CD', format: (v) => `$${(v / 1e9).toFixed(1)}B` },
  { label: 'Population', code: 'SP.POP.TOTL', format: (v) => formatCount(v) },
  { label: 'Life Expectancy', code: 'SP.DYN.LE00.IN', format: (v) => `${v.toFixed(1)} yrs` },
  { label: 'Poverty Headcount', code: 'SI.POV.DDAY', format: (v) => `${v.toFixed(1)}%` },
];

function formatCount(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return v.toFixed(0);
}

interface CountryIntelPanelProps {
  iso3: string | null;
  countryName: string | undefined;
}

export const CountryIntelPanel: React.FC<CountryIntelPanelProps> = ({ iso3, countryName }) => {
  const [projects, setProjects] = useState<PublicProjectSummary[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [kpiValues, setKpiValues] = useState<Record<string, number | null>>({});
  const [loadingKpis, setLoadingKpis] = useState(false);
  const [snapshotOpen, setSnapshotOpen] = useState(false);

  useEffect(() => {
    setSnapshotOpen(false);
    if (!iso3) {
      setProjects([]);
      setProjectsLoaded(false);
      setKpiValues({});
      return;
    }

    setProjectsLoaded(false);
    api
      .getPublicProjects(iso3)
      .then((p) => setProjects(p))
      .catch(() => setProjects([]))
      .finally(() => setProjectsLoaded(true));

    setLoadingKpis(true);
    Promise.all(KPI_DEFS.map((k) => api.getCountrySeries(iso3, k.code)))
      .then((results) => {
        const next: Record<string, number | null> = {};
        results.forEach((r, i) => {
          next[KPI_DEFS[i].code] = r.latestValue;
        });
        setKpiValues(next);
      })
      .finally(() => setLoadingKpis(false));
  }, [iso3]);

  if (!iso3) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <Globe2 className="h-8 w-8 text-muted-foreground" />
        <p className="max-w-[220px] text-sm text-muted-foreground">
          Click a highlighted country on the globe to see its World Bank engagement.
        </p>
      </div>
    );
  }

  const totalApproved = projects.reduce((acc, p) => acc + p.approvedAmount, 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Country header */}
      <div>
        <span className="font-mono text-2xl font-semibold tracking-tight text-foreground">{iso3}</span>
        <h2 className="mt-0.5 text-sm text-muted-foreground">{countryName ?? projects[0]?.countryName ?? '—'}</h2>
      </div>

      {/* Primary: World Bank engagement */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Landmark className="h-4 w-4" /> World Bank Client Connection Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {!projectsLoaded ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Loading engagement…</p>
          ) : projects.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No active World Bank Client Connection engagement with {countryName ?? iso3} yet.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Active Projects</div>
                  <div className="mt-1 font-mono text-lg text-foreground">{projects.length}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground">Total Approved</div>
                  <div className="mt-1 font-mono text-lg text-emerald-400">${(totalApproved / 1e6).toFixed(0)}M</div>
                </Card>
              </div>

              <div className="space-y-3">
                {projects.map((p) => (
                  <Card key={p.projectCode} className="p-4">
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge variant="muted" className={SECTOR_BADGE_CLASSES[p.sector]}>{p.sector}</Badge>
                      <Badge variant={PROJECT_STATUS_TONE[p.status] ?? 'default'}>{p.status}</Badge>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug text-foreground">{p.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {p.projectDevelopmentObjective}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{p.financingInstrument}</span>
                      <span className="font-mono text-foreground">${(p.approvedAmount / 1e6).toFixed(0)}M</span>
                    </div>
                    {p.topIndicator && (
                      <div className="mt-2.5">
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">{p.topIndicator.indicatorName}</span>
                          <span className="font-mono text-emerald-400">{p.topIndicator.progressPercent}%</span>
                        </div>
                        <ProgressBar percent={p.topIndicator.progressPercent} />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Secondary: demoted macro snapshot, collapsed by default */}
      <Card>
        <button
          type="button"
          onClick={() => setSnapshotOpen((o) => !o)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Country Snapshot &middot; World Bank Open Data
          </span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', snapshotOpen && 'rotate-180')} />
        </button>
        {snapshotOpen && (
          <CardContent className="grid grid-cols-2 gap-2 pt-0">
            {KPI_DEFS.map((k) => {
              const raw = kpiValues[k.code];
              return (
                <Card key={k.code} className="p-3">
                  <div className="text-xs text-muted-foreground">{k.label}</div>
                  <div className="mt-1 font-mono text-lg text-foreground">
                    {loadingKpis ? '…' : raw !== null && raw !== undefined ? k.format(raw) : 'N/A'}
                  </div>
                </Card>
              );
            })}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
