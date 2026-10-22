import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Search, ArrowUpRight, Globe2 } from 'lucide-react';
import { api } from '../services/api';
import type {
  CountryIndicatorSeries,
  GlobalIndicatorDataset,
  IndicatorOption,
} from '../types/api';
import { GlobeComparisonPanel } from '../components/GlobeComparisonPanel';
import { CountryIntelPanel } from '../components/CountryIntelPanel';
import { ImpactSections } from '../components/landing/ImpactSections';
import { WelcomeHero } from '../components/landing/WelcomeHero';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';

const LazyInteractiveGlobe = React.lazy(() => import('../components/InteractiveGlobe'));

const QUICK_COUNTRIES = ['KEN', 'IND', 'BRA', 'VNM', 'NGA', 'COL', 'USA', 'DEU'];

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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

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

  const selectedRegion = useMemo(
    () => dataset?.dataPoints.find((d) => d.countryIso3 === selectedIso3)?.region,
    [dataset, selectedIso3]
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

  const countryMatches = useMemo(() => {
    if (!searchTerm.trim() || !dataset) return [];
    const term = searchTerm.trim().toLowerCase();
    const seen = new Set<string>();
    const results: { iso3: string; name: string }[] = [];
    for (const d of dataset.dataPoints) {
      if (seen.has(d.countryIso3)) continue;
      if (d.countryName.toLowerCase().includes(term) || d.countryIso3.toLowerCase().includes(term)) {
        seen.add(d.countryIso3);
        results.push({ iso3: d.countryIso3, name: d.countryName });
      }
      if (results.length >= 6) break;
    }
    return results;
  }, [searchTerm, dataset]);

  const indicatorMatches = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.trim().toLowerCase();
    return indicators.filter((i) => i.name.toLowerCase().includes(term)).slice(0, 4);
  }, [searchTerm, indicators]);

  const showSearchDropdown = searchFocused && searchTerm.trim().length > 0;

  const scrollToDashboard = () => {
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHeroSelectCountry = (iso3: string) => {
    setSelectedIso3(iso3);
    scrollToDashboard();
  };

  return (
    <div className="flex flex-col bg-background text-foreground">
      {/* Slim header, persistent across the welcome + dashboard sections */}
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-emerald-500" />
          <span className="font-mono text-sm font-semibold tracking-tight">
            LOANLY
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link to="/login">
              Client Connection Sign In
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <WelcomeHero onExplore={scrollToDashboard} onSelectCountry={handleHeroSelectCountry} />

    <div id="dashboard" className="scroll-mt-14 flex flex-col md:h-[calc(100vh-56px)] md:overflow-hidden">
      {/* Main split */}
      <div className="flex flex-1 flex-col md:flex-row md:overflow-hidden">
        {/* Left: globe stage */}
        <div className="relative h-[55vh] w-full shrink-0 md:h-auto md:w-[65%] md:flex-1">
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                Initializing 3D WebGL choropleth globe…
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

          {/* Floating control bar */}
          <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex flex-col gap-2">
            <div className="liquid-glass pointer-events-auto flex flex-wrap items-center gap-3 rounded-xl p-2.5">
              <div className="relative min-w-[160px] flex-1">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 120)}
                  placeholder="Search countries or indicators…"
                  className="w-full rounded-md bg-transparent py-1 pl-7 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {showSearchDropdown && (countryMatches.length > 0 || indicatorMatches.length > 0) && (
                  <div className="liquid-glass absolute left-0 top-full mt-1 w-64 rounded-lg p-1 text-sm shadow-xl">
                    {countryMatches.map((c) => (
                      <button
                        key={c.iso3}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-foreground hover:bg-muted"
                        onClick={() => {
                          setSelectedIso3(c.iso3);
                          setSearchTerm('');
                        }}
                      >
                        <span>{c.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{c.iso3}</span>
                      </button>
                    ))}
                    {indicatorMatches.map((i) => (
                      <button
                        key={i.code}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-muted-foreground hover:bg-muted"
                        onClick={() => {
                          setSelectedIndicator(i.code);
                          setSearchTerm('');
                        }}
                      >
                        <span className="truncate">{i.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <select
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value)}
                className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                {indicators.map((ind) => (
                  <option key={ind.code} value={ind.code}>
                    {ind.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => setIsPlaying((p) => !p)}>
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
                <input
                  type="range"
                  min={dataset?.minYear ?? 2010}
                  max={dataset?.maxYear ?? 2023}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-28 accent-emerald-500"
                />
                <span className="w-10 font-mono text-xs text-muted-foreground">{selectedYear}</span>
              </div>
            </div>

            {/* Stat highlight chips */}
            {dataset && dataset.highlights.length > 0 && (
              <div className="pointer-events-auto flex gap-2 overflow-x-auto">
                {dataset.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="liquid-glass shrink-0 rounded-lg px-3 py-1.5"
                  >
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{h.label}</div>
                    <div className="font-mono text-sm text-foreground">{h.formattedValue}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick country pills */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
            {QUICK_COUNTRIES.map((iso) => (
              <button
                key={iso}
                onClick={() => setSelectedIso3(iso)}
                className={`pointer-events-auto rounded-md border px-2 py-1 font-mono text-[11px] backdrop-blur-md transition-colors ${
                  selectedIso3 === iso
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                    : 'border-border bg-card text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                {iso}
              </button>
            ))}
          </div>
        </div>

        {/* Right: country intel panel */}
        <aside className="w-full overflow-y-auto border-t border-border md:w-[380px] md:border-l md:border-t-0 lg:w-[35%]">
          <CountryIntelPanel
            iso3={selectedIso3}
            region={selectedRegion}
            selectedCountrySeries={selectedCountrySeries}
            currentYearCountryVal={selectedIso3 ? valueByIso3[selectedIso3] : undefined}
            selectedYear={selectedYear}
            isInCompare={isInCompare}
            onToggleCompare={handleToggleCompare}
          />
          {comparedSeries.length > 0 && (
            <div className="p-4 pt-0">
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
          )}
        </aside>
      </div>
    </div>

      <ImpactSections />
    </div>
  );
};
