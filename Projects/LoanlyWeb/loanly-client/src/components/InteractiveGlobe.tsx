import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import {
  type GeoFeature,
  resolveIso3,
  resolveCountryName,
  computeFeatureCenter,
  getChoroplethColor,
} from '../utils/globeHelpers';

interface InteractiveGlobeProps {
  valueByIso3: Record<string, number>;
  minVal: number;
  maxVal: number;
  unit: string;
  colorScale: string;
  selectedIso3: string | null;
  compareIso3List: string[];
  isMobile: boolean;
  onSelectCountry: (iso3: string, name: string) => void;
}

const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({
  valueByIso3,
  minVal,
  maxVal,
  unit,
  colorScale,
  selectedIso3,
  compareIso3List,
  isMobile,
  onSelectCountry,
}) => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [dimensions, setDimensions] = useState({ width: 820, height: 550 });

  useEffect(() => {
    fetch('/data/countries.geojson')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.features)) {
          setFeatures(data.features.filter((f: GeoFeature) => resolveIso3(f) !== 'AQ'));
        }
      })
      .catch(() => setFeatures([]));
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(300, Math.floor(rect.width)),
          height: isMobile ? 390 : 550,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isMobile]);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = !selectedIso3;
      controls.autoRotateSpeed = isMobile ? 0.65 : 0.45;
      controls.enableZoom = true;
    }
  }, [selectedIso3, isMobile, features.length]);

  const compareSet = useMemo(() => new Set(compareIso3List), [compareIso3List]);

  const handlePolygonClick = (polygonObj: object) => {
    const feat = polygonObj as GeoFeature;
    const iso3 = resolveIso3(feat);
    if (!iso3) return;
    const name = resolveCountryName(feat);
    const center = computeFeatureCenter(feat);

    if (globeRef.current) {
      globeRef.current.pointOfView(
        { lat: center.lat, lng: center.lng, altitude: isMobile ? 1.85 : 1.55 },
        900
      );
    }
    onSelectCountry(iso3, name);
  };

  return (
    <div ref={containerRef} className="globe-canvas-container">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        atmosphereColor="#38bdf8"
        atmosphereAltitude={0.18}
        polygonsData={features}
        polygonAltitude={(d) => {
          const iso = resolveIso3(d as GeoFeature);
          if (iso === selectedIso3) return 0.055;
          if (compareSet.has(iso)) return 0.04;
          return 0.012;
        }}
        polygonCapColor={(d) => {
          const iso = resolveIso3(d as GeoFeature);
          return getChoroplethColor(
            valueByIso3[iso],
            minVal,
            maxVal,
            colorScale,
            iso === selectedIso3,
            compareSet.has(iso)
          );
        }}
        polygonSideColor={() => 'rgba(15, 23, 42, 0.55)'}
        polygonStrokeColor={(d) => {
          const iso = resolveIso3(d as GeoFeature);
          if (iso === selectedIso3) return '#fde047';
          if (compareSet.has(iso)) return '#38bdf8';
          return 'rgba(148, 163, 184, 0.32)';
        }}
        polygonLabel={(d) => {
          const feat = d as GeoFeature;
          const iso = resolveIso3(feat);
          const name = resolveCountryName(feat);
          const val = valueByIso3[iso];
          const formatted =
            val !== undefined
              ? unit === 'USD'
                ? `$${val.toLocaleString()}`
                : `${val.toLocaleString()} ${unit}`
              : 'No data for selected year';
          return `<div class="globe-tooltip"><strong>${name} (${iso})</strong><div>${formatted}</div><small>Tap to inspect &amp; compare</small></div>`;
        }}
        onPolygonClick={handlePolygonClick}
        polygonsTransitionDuration={350}
      />
    </div>
  );
};

export default InteractiveGlobe;
