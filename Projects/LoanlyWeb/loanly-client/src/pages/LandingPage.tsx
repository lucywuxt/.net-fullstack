import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, SlidersHorizontal, ArrowUpRight, Layers } from 'lucide-react';
import { api } from '../services/api';
import type {
  CountryIndicatorSeries,
  GlobalIndicatorDataset,
  IndicatorOption,
} from '../types/api';
import { GlobeComparisonPanel } from '../components/GlobeComparisonPanel';
import { CountryDetailDrawer } from '../components/CountryDetailDrawer';

const LazyInteractiveGlobe = React.lazy(() => import('../components/InteractiveGlobe'));

export const LandingPage: React.FC = () => {
  const [indicators, setIndicators] = useState<IndicatorOption[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<string>('NY.GDP.PCAP.CD');
  const [dataset, setDataset] = useState<GlobalIndicatorDataset | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedIso3, setSelectedIso3] = useState<string | null>('KEN');
  const [selectedCountrySeries, setSelectedCountrySeries] = useState<CountryIndicatorSeries | null>(null);
  const [comparedSeries, setComparedSeries] = useState<CountryIndicatorSeries[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    api.getIndicators().then((list) => {
      setIndicators(list);
      if (list.length > 0) setSelectedIndicator(list[0].code);
    });
  }, []);

  useEffect(() => {
    if (!selectedIndicator) return;
    api.getGlobalIndicator(selectedIndicator).then((data) => {
      setDataset(data);
      setSelectedYear((prev) => (prev < data.minYear || prev > data.maxYear ? data.maxYear : prev));
    });
  }, [selectedIndicator]);

  useEffect(() => {
    if (!selectedIso3 || !selectedIndicator) return;
    api.getCountrySeries(selectedIso3, selectedIndicator).then(setSelectedCountrySeries);
  }, [selectedIso3, selectedIndicator]);

  useEffect(() => {
    if (comparedSeries.length === 0) return;
    Promise.all(comparedSeries.map((c) => api.getCountrySeries(c.countryIso3, selectedIndicator))).then(
      setComparedSeries
    );
  }, [selectedIndicator]);

  useEffect(() => {
    if (!isPlaying || !dataset) return;
    const timer = window.setInterval(() => {
      setSelectedYear((yr) => (yr >= dataset.maxYear ? dataset.minYear : yr + 1));
    }, 900);
    return () => window.clearInterval(timer);
  }, [isPlaying, dataset]);

  const { valueByIso3, minVal, maxVal } = useMemo(() => {
    const map: Record<string, number> = {};
    if (!dataset) return { valueByIso3: map, minVal: 0, maxVal: 100 };
    const pts = dataset.dataPoints.filter((d) => d.year === selectedYear && d.value !== null);
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const pt of pts) {
      const v = pt.value as number;
      map[pt.countryIso3] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return {
      valueByIso3: map,
      minVal: Number.isFinite(min) ? min : 0,
      maxVal: Number.isFinite(max) ? max : 100,
    };
  }, [dataset, selectedYear]);

  const activeIndicatorMeta = useMemo(
    () => indicators.find((i) => i.code === selectedIndicator) || indicators[0],
    [indicators, selectedIndicator]
  );

  const isInCompare = comparedSeries.some((c) => c.countryIso3 === selectedIso3);

  const handleToggleCompare = () => {
    if (!selectedCountrySeries) return;
    if (isInCompare) {
      setComparedSeries((prev) => prev.filter((c) => c.countryIso3 !== selectedIso3));
    } else {
      setComparedSeries((prev) => [...prev.slice(-4), selectedCountrySeries]);
    }
  };

  return (
    <div className="landing-page">
      <section className="hero-banner">
        <div className="hero-copy">
          <div className="eyebrow-pill">
            <Layers size={14} />
            <span>WORLD BANK OPEN DATA API v2 • REAL-TIME SOVEREIGN OBSERVATORY</span>
          </div>
          <h1>Global Development Indicators &amp; Sovereign Financing Lifecycle</h1>
          <p>
            Explore real World Bank Open Data indicators across member economies on an interactive 3D
            choropleth globe, or sign in to <strong>Client Connection</strong> to manage IBRD/IDA project
            lifecycles, Withdrawal Applications, and disbursements.
          </p>
        </div>
        <div className="hero-cta-box">
          <Link to="/login" className="btn btn-primary">
            <span>Launch Client Connection Portal</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

      {dataset && dataset.highlights.length > 0 && (
        <section className="stat-highlights-grid">
          {dataset.highlights.map((h, i) => (
            <div key={i} className="stat-highlight-card">
              <div className="stat-label">{h.label}</div>
              <div className="stat-value">{h.formattedValue}</div>
              <div className="stat-subtext">{h.subtext}</div>
            </div>
          ))}
        </section>
      )}

      <section className="globe-workstation">
        <div className="globe-stage-card">
          <div className={`globe-controls-bar ${isMobile ? 'mobile-bottom-sheet' : ''}`}>
            <div className="control-group">
              <label htmlFor="indicator-select">
                <SlidersHorizontal size={14} /> Development Indicator
              </label>
              <select
                id="indicator-select"
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value)}
              >
                {indicators.map((ind) => (
                  <option key={ind.code} value={ind.code}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group year-slider-group">
              <div className="year-header">
                <span>
                  Observation Year: <strong>{selectedYear}</strong>
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={() => setIsPlaying((p) => !p)}
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying ? 'Pause' : 'Animate'}</span>
                </button>
              </div>
              <input
                type="range"
                min={dataset?.minYear ?? 2010}
                max={dataset?.maxYear ?? 2023}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              />
            </div>
          </div>

          <Suspense
            fallback={
              <div className="globe-skeleton">
                <div className="spinner-ring" />
                <p>Initializing 3D WebGL Choropleth Globe (react-globe.gl)...</p>
              </div>
            }
          >
            <LazyInteractiveGlobe
              valueByIso3={valueByIso3}
              minVal={minVal}
              maxVal={maxVal}
              unit={dataset?.unit ?? 'USD'}
              colorScale={activeIndicatorMeta?.colorScale ?? 'emerald'}
              selectedIso3={selectedIso3}
              compareIso3List={comparedSeries.map((c) => c.countryIso3)}
              isMobile={isMobile}
              onSelectCountry={(iso3) => setSelectedIso3(iso3)}
            />
          </Suspense>

          <div className="quick-country-bar">
            <span>Quick Focus Member Countries:</span>
            {['KEN', 'IND', 'BRA', 'VNM', 'NGA', 'COL', 'USA', 'DEU'].map((iso) => (
              <button
                key={iso}
                className={`country-pill ${selectedIso3 === iso ? 'active' : ''}`}
                onClick={() => setSelectedIso3(iso)}
              >
                {iso}
              </button>
            ))}
          </div>
        </div>

        <CountryDetailDrawer
          selectedCountrySeries={selectedCountrySeries}
          currentYearCountryVal={selectedIso3 ? valueByIso3[selectedIso3] : undefined}
          selectedYear={selectedYear}
          isInCompare={isInCompare}
          onToggleCompare={handleToggleCompare}
        />
      </section>

      <GlobeComparisonPanel
        comparedSeries={comparedSeries}
        indicatorName={dataset?.indicatorName ?? 'Development Indicator'}
        unit={dataset?.unit ?? ''}
        onRemoveCountry={(iso) =>
          setComparedSeries((prev) => prev.filter((c) => c.countryIso3 !== iso))
        }
        onClearAll={() => setComparedSeries([])}
      />
    </div>
  );
};
