import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { useTheme } from '../../context/ThemeContext';
import { COUNTRY_COORDS } from '../../lib/countryGeo';

const MARKED_COUNTRIES = Object.entries(COUNTRY_COORDS).map(([iso, c]) => ({
  location: c.location,
  size: iso === 'IND' ? 0.07 : 0.06,
  iso,
  name: c.name,
}));
const MARKERS = MARKED_COUNTRIES.map(({ location, size, iso }) => ({ location, size, id: iso }));

interface CobeGlobeProps {
  onSelectCountry: (iso3: string) => void;
}

export const CobeGlobe: React.FC<CobeGlobeProps> = ({ onSelectCountry }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const rRef = useRef(0);
  const { theme } = useTheme();

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
      markerColor: [0.06, 0.73, 0.51], // emerald-500
      glowColor: dark ? [0.15, 0.3, 0.25] : [0.6, 0.85, 0.75],
      markers: MARKERS,
    });

    let frame: number;
    const animate = () => {
      if (!pointerInteracting.current) {
        phiRef.current += 0.003;
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
  }, [theme]);

  return (
    <div ref={wrapperRef} className="relative mx-auto aspect-square w-full max-w-[460px]">
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

      {/* Floating labels anchored to each marker's live screen position via
          CSS anchor positioning (cobe sets --cobe-<id> / --cobe-visible-<id>
          itself). Clicking one jumps straight to that country on the real
          dashboard below. Browsers without anchor-positioning support just
          never see these (gated by @supports in CSS) — the legend row
          below covers that case. */}
      {MARKED_COUNTRIES.map((c) => (
        <button
          key={c.iso}
          type="button"
          onClick={() => onSelectCountry(c.iso)}
          className="cobe-marker-label"
          style={
            {
              positionAnchor: `--cobe-${c.iso}`,
              opacity: `var(--cobe-visible-${c.iso}, 0)`,
            } as React.CSSProperties
          }
        >
          {c.name}
        </button>
      ))}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {MARKED_COUNTRIES.map((c) => (
          <button
            key={c.iso}
            type="button"
            title={c.name}
            onClick={() => onSelectCountry(c.iso)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-emerald-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {c.iso}
          </button>
        ))}
      </div>
    </div>
  );
};
