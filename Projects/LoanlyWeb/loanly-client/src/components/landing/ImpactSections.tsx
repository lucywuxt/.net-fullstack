import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Globe2,
  HandCoins,
  Lightbulb,
  LineChart as LineChartIcon,
  Network,
  ArrowUpRight,
  Landmark,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import type { PublicImpactSummary, PublicProjectSummary } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { StatCard } from '../ui/stat-card';
import { ProgressBar } from '../ui/progress';
import { PROJECT_STATUS_TONE } from '../../lib/status';
import { SECTOR_BADGE_CLASSES, SECTOR_HEX } from '../../lib/sector';

const ICON_TONE_CLASSES = {
  emerald: 'bg-emerald-500/10 text-emerald-400',
  sky: 'bg-sky-500/10 text-sky-400',
  amber: 'bg-amber-500/10 text-amber-400',
  violet: 'bg-violet-500/10 text-violet-400',
} as const;

const WHY_PARTNER = [
  {
    icon: HandCoins,
    tone: 'emerald' as const,
    title: 'Concessional Financing',
    body: 'Below-market IBRD/IDA rates.',
  },
  {
    icon: Lightbulb,
    tone: 'sky' as const,
    title: 'Global Technical Expertise',
    body: 'Decades of cross-sector delivery.',
  },
  {
    icon: LineChartIcon,
    tone: 'amber' as const,
    title: 'Transparent Results Tracking',
    body: 'Baseline-to-target, in real time.',
  },
  {
    icon: Network,
    tone: 'violet' as const,
    title: 'Global Convening Network',
    body: 'Shared challenges, shared solutions.',
  },
];

const tooltipStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'var(--foreground)',
};

function formatCompactUsd(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

export const ImpactSections: React.FC = () => {
  const [summary, setSummary] = useState<PublicImpactSummary | null>(null);
  const [stories, setStories] = useState<PublicProjectSummary[]>([]);

  useEffect(() => {
    api.getImpactSummary().then(setSummary).catch(() => {});
    api.getSuccessStories().then(setStories).catch(() => {});
  }, []);

  const sectorData = (summary?.bySector ?? []).map((s) => ({
    name: s.label,
    'Committed ($M)': Math.round(s.committedAmount / 1e6),
  }));
  const regionData = (summary?.byRegion ?? []).map((r) => ({
    name: r.label,
    'Committed ($M)': Math.round(r.committedAmount / 1e6),
  }));

  return (
    <div className="mx-auto max-w-[1440px] space-y-16 px-4 py-16">
      {/* Impact stats strip */}
      <section>
        <div className="mb-6 text-center">
          <Badge variant="pipeline" className="mb-3">GLOBAL IMPACT</Badge>
          <h2 className="text-2xl font-semibold text-foreground">Financing Development at Scale</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Globe2 className="h-4 w-4" />}
            tone="sky"
            label="Member Countries Served"
            value={summary ? String(summary.countriesServedCount) : '—'}
          />
          <StatCard
            icon={<Landmark className="h-4 w-4" />}
            tone="emerald"
            label="Total Portfolio Committed"
            value={summary ? formatCompactUsd(summary.totalCommitted) : '—'}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="amber"
            label="Total Disbursed"
            value={summary ? formatCompactUsd(summary.totalDisbursed) : '—'}
          />
          <StatCard
            icon={<LineChartIcon className="h-4 w-4" />}
            tone="violet"
            label="Active Projects"
            value={summary ? String(summary.activeProjectsCount) : '—'}
            sub={summary ? `${summary.totalProjectsCount} total in portfolio` : undefined}
          />
        </div>
      </section>

      {/* Why partner */}
      <section>
        <div className="mb-6 text-center">
          <Badge variant="active" className="mb-3">WHY PARTNER</Badge>
          <h2 className="text-2xl font-semibold text-foreground">Why Member Countries Choose World Bank Financing</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_PARTNER.map((item) => (
            <Card key={item.title} className="p-5">
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${ICON_TONE_CLASSES[item.tone]}`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Success stories */}
      {stories.length > 0 && (
        <section>
          <div className="mb-6 text-center">
            <Badge variant="pipeline" className="mb-3">SUCCESS STORIES</Badge>
            <h2 className="text-2xl font-semibold text-foreground">Results From Member Countries</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((s) => (
              <Card key={s.projectCode} className="flex flex-col p-5">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <Badge variant="muted">{s.countryIso3}</Badge>
                  <Badge variant="muted" className={SECTOR_BADGE_CLASSES[s.sector]}>{s.sector}</Badge>
                  <Badge variant={PROJECT_STATUS_TONE[s.status] ?? 'default'}>{s.status}</Badge>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.countryName}</p>
                <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {s.projectDevelopmentObjective}
                </p>
                {s.topIndicator && (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">{s.topIndicator.indicatorName}</span>
                      <span className="font-mono text-emerald-400">{s.topIndicator.progressPercent}%</span>
                    </div>
                    <ProgressBar percent={s.topIndicator.progressPercent} />
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{s.financingInstrument}</span>
                  <span className="font-mono">{formatCompactUsd(s.approvedAmount)}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Sector & region breakdown */}
      {summary && (
        <section>
          <div className="mb-6 text-center">
            <Badge variant="muted" className="mb-3">PORTFOLIO BREAKDOWN</Badge>
            <h2 className="text-2xl font-semibold text-foreground">Where the Portfolio Is Invested</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Committed by Sector ($M)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sectorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="Committed ($M)" radius={[4, 4, 0, 0]}>
                      {sectorData.map((d, i) => (
                        <Cell key={i} fill={SECTOR_HEX[d.name] ?? '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Committed by Region ($M)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={regionData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={10} width={110} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="Committed ($M)" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section>
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <Badge variant="active">JOIN CLIENT CONNECTION</Badge>
          <h2 className="max-w-2xl text-2xl font-semibold text-foreground">
            Ready to finance your country's next development priority?
          </h2>
          <Button asChild size="default">
            <Link to="/login">
              Access Client Connection Portal
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </section>
    </div>
  );
};
