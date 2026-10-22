import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Check } from 'lucide-react';
import type { CountryIndicatorSeries } from '../types/api';

interface CountryDetailDrawerProps {
  selectedCountrySeries: CountryIndicatorSeries | null;
  currentYearCountryVal: number | undefined;
  selectedYear: number;
  isInCompare: boolean;
  onToggleCompare: () => void;
}

export const CountryDetailDrawer: React.FC<CountryDetailDrawerProps> = ({
  selectedCountrySeries,
  currentYearCountryVal,
  selectedYear,
  isInCompare,
  onToggleCompare,
}) => {
  if (!selectedCountrySeries) {
    return (
      <aside className="country-detail-drawer">
        <div className="empty-drawer">
          <p>Click any country polygon on the 3D globe to inspect its indicator history.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="country-detail-drawer">
      <div className="drawer-header">
        <div>
          <span className="iso-badge">{selectedCountrySeries.countryIso3}</span>
          <h2>{selectedCountrySeries.countryName}</h2>
        </div>
        <button
          className={`btn ${isInCompare ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          onClick={onToggleCompare}
        >
          {isInCompare ? <Check size={15} /> : <Plus size={15} />}
          <span>{isInCompare ? 'In Comparison' : 'Add to Compare'}</span>
        </button>
      </div>

      <div className="selected-metric-box">
        <div className="metric-title">{selectedCountrySeries.indicatorName}</div>
        <div className="metric-big-number">
          {currentYearCountryVal !== undefined
            ? selectedCountrySeries.unit === 'USD'
              ? `$${currentYearCountryVal.toLocaleString()}`
              : `${currentYearCountryVal.toLocaleString()} ${selectedCountrySeries.unit}`
            : selectedCountrySeries.latestValue !== null
            ? `${selectedCountrySeries.latestValue.toLocaleString()} (${selectedCountrySeries.latestYear})`
            : 'N/A'}
        </div>
        <div className="metric-caption">
          Selected Year ({selectedYear}) • Source: api.worldbank.org/v2
        </div>
      </div>

      <div className="sparkline-section">
        <h4>Historical Trend Sparkline (2000–2023)</h4>
        <div className="sparkline-box">
          <ResponsiveContainer width="100%" height={195}>
            <AreaChart data={selectedCountrySeries.series.filter((s) => s.value !== null)}>
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} width={48} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(56,189,248,0.4)',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#38bdf8"
                strokeWidth={2.2}
                fill="url(#sparkGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </aside>
  );
};
