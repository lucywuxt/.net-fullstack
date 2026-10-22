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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const COMPARE_COLORS = ['#38bdf8', '#facc15', '#10b981', '#f472b6', '#a78bfa'];

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
    <Card>
      <CardHeader className="flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-sky-400" />
          <CardTitle className="normal-case text-sm text-foreground">
            Comparing {indicatorName} ({unit})
          </CardTitle>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {comparedSeries.map((cs, i) => (
            <span
              key={cs.countryIso3}
              className="flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground"
              style={{ borderColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: COMPARE_COLORS[i % COMPARE_COLORS.length] }}
              />
              {cs.countryIso3}
              <button onClick={() => onRemoveCountry(cs.countryIso3)} title="Remove">
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </span>
          ))}
          <Button size="sm" variant="outline" onClick={onClearAll}>
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} width={48} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--foreground)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {comparedSeries.map((cs, i) => (
              <Line
                key={cs.countryIso3}
                type="monotone"
                dataKey={cs.countryIso3}
                name={`${cs.countryName} (${cs.countryIso3})`}
                stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 2.5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
