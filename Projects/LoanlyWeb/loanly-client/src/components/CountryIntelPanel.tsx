import React, { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Check, Globe2 } from 'lucide-react';
import { api } from '../services/api';
import type { CountryIndicatorSeries, PublicProjectSummary } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

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

const statusVariant: Record<string, 'active' | 'pipeline' | 'risk' | 'muted'> = {
  Active: 'active',
  BoardApproval: 'pipeline',
  Negotiation: 'pipeline',
  Appraisal: 'pipeline',
  Concept: 'muted',
  Closed: 'risk',
};

interface CountryIntelPanelProps {
  iso3: string | null;
  region: string | undefined;
  selectedCountrySeries: CountryIndicatorSeries | null;
  currentYearCountryVal: number | undefined;
  selectedYear: number;
  isInCompare: boolean;
  onToggleCompare: () => void;
}

export const CountryIntelPanel: React.FC<CountryIntelPanelProps> = ({
  iso3,
  region,
  selectedCountrySeries,
  currentYearCountryVal,
  selectedYear,
  isInCompare,
  onToggleCompare,
}) => {
  const [kpiValues, setKpiValues] = useState<Record<string, number | null>>({});
  const [projects, setProjects] = useState<PublicProjectSummary[]>([]);
  const [loadingKpis, setLoadingKpis] = useState(false);

  useEffect(() => {
    if (!iso3) {
      setKpiValues({});
      setProjects([]);
      return;
    }
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

    api.getPublicProjects(iso3).then(setProjects).catch(() => setProjects([]));
  }, [iso3]);

  const sparklineData = useMemo(
    () => selectedCountrySeries?.series.filter((s) => s.value !== null) ?? [],
    [selectedCountrySeries]
  );

  if (!iso3) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <Globe2 className="h-8 w-8 text-zinc-600" />
        <p className="max-w-[220px] text-sm text-zinc-500">
          Click any country on the globe to inspect its development metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Country header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-semibold tracking-tight text-zinc-50">{iso3}</span>
            {region && <Badge variant="muted">{region}</Badge>}
          </div>
          <h2 className="mt-0.5 text-sm text-zinc-400">
            {selectedCountrySeries?.countryName ?? '—'}
          </h2>
        </div>
        <Button size="sm" variant={isInCompare ? 'secondary' : 'default'} onClick={onToggleCompare}>
          {isInCompare ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {isInCompare ? 'Comparing' : 'Compare'}
        </Button>
      </div>

      {/* KPI 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {KPI_DEFS.map((k) => {
          const raw = kpiValues[k.code];
          return (
            <Card key={k.code} className="p-3">
              <div className="text-xs text-zinc-400">{k.label}</div>
              <div className="mt-1 font-mono text-lg text-zinc-50">
                {loadingKpis ? '…' : raw !== null && raw !== undefined ? k.format(raw) : 'N/A'}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active indicator + sparkline */}
      {selectedCountrySeries && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedCountrySeries.indicatorName}</CardTitle>
            <span className="font-mono text-sm text-emerald-400">
              {currentYearCountryVal !== undefined
                ? selectedCountrySeries.unit === 'USD'
                  ? `$${currentYearCountryVal.toLocaleString()}`
                  : `${currentYearCountryVal.toLocaleString()} ${selectedCountrySeries.unit}`
                : 'N/A'}
            </span>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mb-1 text-[11px] text-zinc-500">
              Selected year {selectedYear} · api.worldbank.org/v2
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#sparkGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Projects & loans */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Client Connection Engagement</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {projects.length === 0 ? (
            <p className="py-4 text-center text-xs text-zinc-500">
              No active Loanly Client Connection engagement for {iso3}.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Commitment</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.projectCode}>
                    <TableCell className="max-w-[150px]">
                      <div className="truncate" title={p.title}>
                        {p.title}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500">{p.financingInstrument}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${(p.approvedAmount / 1e6).toFixed(0)}M
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={statusVariant[p.status] ?? 'default'}>{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
