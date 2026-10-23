import React, { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';
import { useTheme } from '../context/ThemeContext';
import { COUNTRY_COORDS } from '../lib/countryGeo';

interface CountryFocusGlobeProps {
  isoAlpha3: string;
  committed: number;
  disbursed: number;
  remaining: number;
}

const RING_SIZE = 280;
const STROKE = 10;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DISBURSED_COLOR = '#10b981'; // emerald-500
const REMAINING_COLOR = '#f59e0b'; // amber-500 — kept visually distinct from the emerald marker/arc

interface Tip {
  x: number;
  y: number;
  label: string;
  amount: number;
}

export const CountryFocusGlobe: React.FC<CountryFocusGlobeProps> = ({ isoAlpha3, committed, disbursed, remaining }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const rRef = useRef(0);
  const { theme } = useTheme();
  const [tip, setTip] = useState<Tip | null>(null);

  const coords = COUNTRY_COORDS[isoAlpha3]?.location ?? [0, 0];
  const countryName = COUNTRY_COORDS[isoAlpha3]?.name ?? isoAlpha3;

  const disbursedPct = committed > 0 ? Math.min(1, disbursed / committed) : 0;
  const remainingPct = committed > 0 ? Math.min(1 - disbursedPct, remaining / committed) : 0;
  const disbursedLen = CIRCUMFERENCE * disbursedPct;
  const remainingLen = CIRCUMFERENCE * remainingPct;

  const showTip = (label: string, amount: number) => (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top, label, amount });
  };
  const hideTip = () => setTip(null);

  useEffect(() => {
    let width = 0;
    const onResize = () => {
      if (wrapperRef.current) width = wrapperRef.current.offsetWidth;
    };
    window.addEventListener('resize', onResize);
    onResize();

    const dark = theme === 'dark';
    // Start facing the country's own marker, then auto-rotate from there (same feel as the landing globe).
    const focusPhi = (-coords[1] * Math.PI) / 180;
    const focusTheta = (coords[0] * Math.PI) / 180;
    phiRef.current = focusPhi;

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: focusPhi,
      theta: focusTheta,
      dark: dark ? 1 : 0,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: dark ? 6 : 3.5,
      baseColor: dark ? [0.25, 0.25, 0.28] : [0.85, 0.85, 0.88],
      markerColor: [0.06, 0.73, 0.51],
      glowColor: dark ? [0.15, 0.3, 0.25] : [0.6, 0.85, 0.75],
      markers: [{ location: coords, size: 0.1, id: isoAlpha3 }],
    });

    let frame: number;
    const render = () => {
      if (!pointerInteracting.current) {
        phiRef.current += 0.003;
      }
      globe.update({
        phi: phiRef.current + rRef.current,
        theta: focusTheta,
        width: width * 2,
        height: width * 2,
      });
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

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
  }, [theme, coords, isoAlpha3]);

  return (
    <div ref={containerRef} className="relative mx-auto aspect-square w-full max-w-[260px] lg:max-w-[360px]">
      <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={DISBURSED_COLOR}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${disbursedLen} ${CIRCUMFERENCE - disbursedLen}`}
          className="cursor-default"
          onMouseEnter={showTip('Disbursed', disbursed)}
          onMouseMove={showTip('Disbursed', disbursed)}
          onMouseLeave={hideTip}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={REMAINING_COLOR}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${remainingLen} ${CIRCUMFERENCE - remainingLen}`}
          strokeDashoffset={-disbursedLen}
          className="cursor-default"
          onMouseEnter={showTip('Remaining', remaining)}
          onMouseMove={showTip('Remaining', remaining)}
          onMouseLeave={hideTip}
        />
      </svg>
      <div ref={wrapperRef} className="absolute inset-0 m-[6%]">
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
        {/* Tracks the marker's live screen position via cobe's CSS anchor vars (--cobe-<id>); fades in only while the marker faces the camera. */}
        <div
          className="cobe-marker-label"
          style={
            {
              positionAnchor: `--cobe-${isoAlpha3}`,
              opacity: `var(--cobe-visible-${isoAlpha3}, 0)`,
              cursor: 'default',
            } as React.CSSProperties
          }
        >
          {countryName}
        </div>
      </div>

      {tip && (
        <div
          className="globe-tooltip pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap"
          style={{ left: tip.x, top: tip.y }}
        >
          <strong>{tip.label}</strong>
          <div>${tip.amount.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};
