import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { X, BarChart3 } from 'lucide-react';
import type { CountryIndicatorSeries } from '../types/api';

const COMPARE_COLORS = ['#38bdf8', '#facc15', '#34d399', '#f472b6', '#a78bfa'];

interface GlobeComparisonPanelProps {
  comparedSeries: CountryIndicatorSeries[];
  indicatorName: string;
  unit: string;
  onRemoveCountry: (iso3: string) => void;
  onClearAll: () => void;
}

export const GlobeComparisonPanel: React.FC<GlobeComparisonPanelProps> = ({
  comparedSeries,
  indicatorName,
  unit,
  onRemoveCountry,
  onClearAll,
}) => {
  if (comparedSeries.length === 0) return null;

  const yearSet = new Set<number>();
  comparedSeries.forEach((cs) => {
    cs.series.forEach((pt) => {
      if (pt.value !== null && pt.year >= 2005) yearSet.add(pt.year);
    });
  });

  const sortedYears = Array.from(yearSet).sort((a, b) => a - b);
  const chartData = sortedYears.map((yr) => {
    const row: Record<string, number | string | null> = { year: yr };
    comparedSeries.forEach((cs) => {
      const found = cs.series.find((p) => p.year === yr);
      row[cs.countryIso3] = found?.value ?? null;
    });
    return row;
  });

  return (
    <section className="comparison-panel-card">
      <div className="comparison-header">
        <div className="comparison-title-group">
          <BarChart3 size={20} className="text-sky" />
          <div>
            <h3>Multi-Country Historical Trajectory Comparison</h3>
            <p>
              Overlaying real World Bank indicator trends for <strong>{indicatorName}</strong> ({unit})
            </p>
          </div>
        </div>
        <div className="comparison-chips">
          {comparedSeries.map((cs, i) => (
            <span
              key={cs.countryIso3}
              className="compare-country-chip"
              style={{ borderColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
            >
              <span
                className="chip-dot"
                style={{ backgroundColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
              />
              {cs.countryName} ({cs.countryIso3})
              <button onClick={() => onRemoveCountry(cs.countryIso3)} title="Remove">
                <X size={13} />
              </button>
            </span>
          ))}
          <button className="btn btn-outline btn-xs" onClick={onClearAll}>
            Clear All
          </button>
        </div>
      </div>

      <div className="comparison-chart-box">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 24, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.14)" />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '10px',
              }}
            />
            <Legend />
            {comparedSeries.map((cs, i) => (
              <Line
                key={cs.countryIso3}
                type="monotone"
                dataKey={cs.countryIso3}
                name={`${cs.countryName} (${cs.countryIso3})`}
                stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
