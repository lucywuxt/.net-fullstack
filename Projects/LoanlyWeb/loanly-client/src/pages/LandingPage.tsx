import React, { Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Globe2 } from 'lucide-react';
import { api } from '../services/api';
import { CountryIntelPanel } from '../components/CountryIntelPanel';
import { ImpactSections } from '../components/landing/ImpactSections';
import { WelcomeHero } from '../components/landing/WelcomeHero';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { COUNTRY_COORDS } from '../lib/countryGeo';
import type { EngagementInfo } from '../components/InteractiveGlobe';

const LazyInteractiveGlobe = React.lazy(() => import('../components/InteractiveGlobe'));

const ENGAGED_ISO3 = Object.keys(COUNTRY_COORDS);

export const LandingPage: React.FC = () => {
  const [selectedIso3, setSelectedIso3] = useState<string | null>('KEN');
  const [selectedCountryName, setSelectedCountryName] = useState<string | undefined>(COUNTRY_COORDS.KEN?.name);
  const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < 768);
  const [engagementByIso3, setEngagementByIso3] = useState<Record<string, EngagementInfo>>({});

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    Promise.all(
      ENGAGED_ISO3.map((iso) =>
        api
          .getPublicProjects(iso)
          .then(
            (projects) =>
              [iso, { projectCount: projects.length, totalApproved: projects.reduce((acc, p) => acc + p.approvedAmount, 0) }] as const
          )
          .catch(() => [iso, { projectCount: 0, totalApproved: 0 }] as const)
      )
    ).then((entries) => setEngagementByIso3(Object.fromEntries(entries)));
  }, []);

  const scrollToDashboard = () => {
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHeroSelectCountry = (iso3: string) => {
    setSelectedIso3(iso3);
    setSelectedCountryName(COUNTRY_COORDS[iso3]?.name);
    scrollToDashboard();
  };

  const handleSelectCountry = (iso3: string, name: string) => {
    setSelectedIso3(iso3);
    setSelectedCountryName(COUNTRY_COORDS[iso3]?.name ?? name);
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
                Initializing 3D WebGL engagement globe…
              </div>
            }
          >
            <LazyInteractiveGlobe
              engagedIso3={ENGAGED_ISO3}
              engagementByIso3={engagementByIso3}
              selectedIso3={selectedIso3}
              isMobile={isMobile}
              onSelectCountry={handleSelectCountry}
            />
          </Suspense>

          {/* Legend */}
          <div className="pointer-events-none absolute left-3 right-3 top-3 z-10">
            <div className="liquid-glass pointer-events-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Active World Bank Client Connection engagement
              <span className="font-mono text-foreground">({ENGAGED_ISO3.length} countries)</span>
            </div>
          </div>

          {/* Quick country pills */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
            {ENGAGED_ISO3.map((iso) => (
              <button
                key={iso}
                onClick={() => {
                  setSelectedIso3(iso);
                  setSelectedCountryName(COUNTRY_COORDS[iso]?.name);
                }}
                title={COUNTRY_COORDS[iso]?.name}
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
          <CountryIntelPanel iso3={selectedIso3} countryName={selectedCountryName} />
        </aside>
      </div>
    </div>

      <ImpactSections />
    </div>
  );
};
