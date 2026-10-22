import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Globe2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface WelcomeHeroProps {
  onExplore: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onExplore }) => {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-16 text-center md:min-h-[calc(100vh-56px)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-1/4 top-1/4 h-[320px] w-[320px] rounded-full bg-sky-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex max-w-3xl flex-col items-center">
        <div className="liquid-glass mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-emerald-500">
          <Globe2 className="h-8 w-8" />
        </div>

        <Badge variant="pipeline" className="mb-4">
          WORLD BANK OPEN DATA OBSERVATORY
        </Badge>

        <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          See Where Development Financing Moves the World
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Loanly tracks real World Bank indicator data across 205 economies and models the full IBRD/IDA project
          financing lifecycle — from board approval through disbursement — in one transparent, real-time platform.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="default" onClick={onExplore}>
            Explore the Global Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button asChild size="default" variant="outline">
            <Link to="/login">Client Connection Sign In</Link>
          </Button>
        </div>
      </div>

      <button
        onClick={onExplore}
        aria-label="Scroll to global dashboard"
        className="group absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="mb-1 block text-[11px] uppercase tracking-wide">or scroll down</span>
        <ChevronDown className="mx-auto h-5 w-5 animate-bounce" />
      </button>
    </section>
  );
};
