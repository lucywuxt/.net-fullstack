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
import type { PortfolioAnalytics } from '../types/api';

const PIE_COLORS = ['#38bdf8', '#34d399', '#facc15', '#a78bfa', '#f472b6'];

export const AdminPortfolioCharts: React.FC<{ analytics: PortfolioAnalytics }> = ({
  analytics,
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
    <div className="analytics-charts-grid">
      <div className="chart-panel">
        <h4>Committed vs. Disbursed by Sector ($ Millions)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sectorData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(56,189,248,0.35)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="Committed" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Disbursed" fill="#34d399" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-panel">
        <h4>Portfolio Breakdown by World Bank Region ($ Millions)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={regionData} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
            <XAxis type="number" stroke="#94a3b8" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={115} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(56,189,248,0.35)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="Committed" fill="#a78bfa" radius={[0, 4, 4, 0]} />
            <Bar dataKey="Disbursed" fill="#38bdf8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-panel">
        <h4>Commitments by Financing Instrument ($ Millions)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={instrumentData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.name}: $${entry.value}M`}
            >
              {instrumentData.map((_, idx) => (
                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(56,189,248,0.35)',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
