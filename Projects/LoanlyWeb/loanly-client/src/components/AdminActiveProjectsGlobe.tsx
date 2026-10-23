import React, { useEffect, useMemo, useRef } from 'react';
import createGlobe from 'cobe';
import { useTheme } from '../context/ThemeContext';
import { COUNTRY_COORDS } from '../lib/countryGeo';
import type { Project } from '../types/api';

interface AdminActiveProjectsGlobeProps {
  projects: Project[];
  onSelectCountry?: (iso3: string) => void;
}

export const AdminActiveProjectsGlobe: React.FC<AdminActiveProjectsGlobeProps> = ({ projects, onSelectCountry }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const rRef = useRef(0);
  const { theme } = useTheme();

  const countryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projects) {
      if (p.status !== 'Active') continue;
      map.set(p.countryIso3, (map.get(p.countryIso3) ?? 0) + 1);
    }
    return map;
  }, [projects]);

  const markers = useMemo(
    () =>
      Array.from(countryCounts.entries())
        .map(([iso, count]) => {
          const coords = COUNTRY_COORDS[iso];
          if (!coords) return null;
          return { location: coords.location, size: Math.min(0.16, 0.07 + count * 0.02), id: iso };
        })
        .filter((m): m is { location: [number, number]; size: number; id: string } => m !== null),
    [countryCounts]
  );

  useEffect(() => {
    let width = 0;
    const onResize = () => {
      if (wrapperRef.current) width = wrapperRef.current.offsetWidth;
    };
    window.addEventListener('resize', onResize);
    onResize();

    const dark = theme === 'dark';

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: dark ? 1 : 0,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: dark ? 6 : 3.5,
      baseColor: dark ? [0.25, 0.25, 0.28] : [0.85, 0.85, 0.88],
      markerColor: [0.06, 0.73, 0.51],
      glowColor: dark ? [0.15, 0.3, 0.25] : [0.6, 0.85, 0.75],
      markers,
    });

    let frame: number;
    const animate = () => {
      if (!pointerInteracting.current) {
        phiRef.current += 0.0025;
      }
      globe.update({
        phi: phiRef.current + rRef.current,
        width: width * 2,
        height: width * 2,
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    if (canvasRef.current) {
      setTimeout(() => {
        if (canvasRef.current) canvasRef.current.style.opacity = '1';
      });
    }

    return () => {
      cancelAnimationFrame(frame);
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [theme, markers]);

  const totalActive = Array.from(countryCounts.values()).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col items-center">
      <div ref={wrapperRef} className="relative mx-auto aspect-square w-full max-w-[220px]">
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-grab opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
            if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
          }}
          onPointerUp={() => {
            pointerInteracting.current = null;
            if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            pointerInteracting.current = null;
            if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
          }}
          onMouseMove={(e) => {
            if (pointerInteracting.current !== null) {
              const delta = e.clientX - pointerInteracting.current;
              pointerInteractionMovement.current = delta;
              rRef.current = delta / 200;
            }
          }}
          onTouchMove={(e) => {
            if (pointerInteracting.current !== null && e.touches[0]) {
              const delta = e.touches[0].clientX - pointerInteracting.current;
              pointerInteractionMovement.current = delta;
              rRef.current = delta / 100;
            }
          }}
        />

        {/* Floating labels that track each marker's live screen position via cobe's
            CSS anchor vars (--cobe-<id> / --cobe-visible-<id>), fading in only while
            that marker faces the camera. Clicking jumps to that country's projects. */}
        {Array.from(countryCounts.entries()).map(([iso, count]) => (
          <button
            key={iso}
            type="button"
            onClick={() => onSelectCountry?.(iso)}
            disabled={!onSelectCountry}
            className="cobe-marker-label"
            style={
              {
                positionAnchor: `--cobe-${iso}`,
                opacity: `var(--cobe-visible-${iso}, 0)`,
                cursor: onSelectCountry ? 'pointer' : 'default',
                pointerEvents: onSelectCountry ? 'auto' : 'none',
              } as React.CSSProperties
            }
          >
            {COUNTRY_COORDS[iso]?.name ?? iso} &middot; {count}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {Array.from(countryCounts.entries()).map(([iso, count]) => (
          <button
            key={iso}
            type="button"
            onClick={() => onSelectCountry?.(iso)}
            disabled={!onSelectCountry}
            title={COUNTRY_COORDS[iso]?.name ?? iso}
            className="flex items-center gap-1 text-[11px] text-muted-foreground enabled:transition-colors enabled:hover:text-emerald-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {iso} &middot; {count}
          </button>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {countryCounts.size} {countryCounts.size === 1 ? 'country' : 'countries'} &middot; {totalActive} active {totalActive === 1 ? 'project' : 'projects'}
      </p>
    </div>
  );
};
