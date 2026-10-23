import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { PortfolioAnalytics, Project } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AdminActiveProjectsGlobe } from './AdminActiveProjectsGlobe';

const PIE_COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#a78bfa', '#f472b6'];

const tooltipStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
  color: 'var(--foreground)',
};

export const AdminPortfolioCharts: React.FC<{
  analytics: PortfolioAnalytics;
  projects: Project[];
  onSelectCountry?: (iso3: string) => void;
}> = ({
  analytics,
  projects,
  onSelectCountry,
}) => {
  const sectorData = analytics.bySector.map((s) => ({
    name: s.label,
    Committed: Math.round(s.committedAmount / 1_000_000),
    Disbursed: Math.round(s.disbursedAmount / 1_000_000),
  }));

  const regionData = analytics.byRegion.map((r) => ({
    name: r.label,
    Committed: Math.round(r.committedAmount / 1_000_000),
    Disbursed: Math.round(r.disbursedAmount / 1_000_000),
  }));

  const instrumentData = analytics.byInstrument.map((inst) => ({
    name: inst.label,
    value: Math.round(inst.committedAmount / 1_000_000),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Committed vs. Disbursed by Sector ($M)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sectorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Committed" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Disbursed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio by World Bank Region ($M)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={regionData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={10} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Committed" fill="#a78bfa" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Disbursed" fill="#38bdf8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commitments by Financing Instrument ($M)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={instrumentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {instrumentData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `$${value}M`} />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)' }}
                formatter={(value) => <span style={{ color: 'var(--foreground)' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global Footprint — Active Projects</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <AdminActiveProjectsGlobe projects={projects} onSelectCountry={onSelectCountry} />
        </CardContent>
      </Card>
    </div>
  );
};
