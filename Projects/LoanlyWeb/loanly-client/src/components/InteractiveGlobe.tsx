import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import {
  type GeoFeature,
  resolveIso3,
  resolveCountryName,
  computeFeatureCenter,
  getEngagementColor,
} from '../utils/globeHelpers';

export interface EngagementInfo {
  projectCount: number;
  totalApproved: number;
}

interface InteractiveGlobeProps {
  engagedIso3: string[];
  engagementByIso3: Record<string, EngagementInfo>;
  selectedIso3: string | null;
  isMobile: boolean;
  onSelectCountry: (iso3: string, name: string) => void;
}

const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({
  engagedIso3,
  engagementByIso3,
  selectedIso3,
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
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({
        width: Math.max(300, Math.floor(rect.width)),
        height: Math.max(isMobile ? 320 : 400, Math.floor(rect.height)),
      });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = !selectedIso3;
      controls.autoRotateSpeed = isMobile ? 0.65 : 0.45;
      controls.enableZoom = true;
    }

    if (selectedIso3 && features.length > 0) {
      const feat = features.find((f) => resolveIso3(f) === selectedIso3);
      if (feat) {
        const center = computeFeatureCenter(feat);
        globeRef.current.pointOfView(
          { lat: center.lat, lng: center.lng, altitude: isMobile ? 1.85 : 1.55 },
          900
        );
      }
    }
  }, [selectedIso3, isMobile, features]);

  const engagedSet = useMemo(() => new Set(engagedIso3), [engagedIso3]);

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
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
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
          if (engagedSet.has(iso)) return 0.025;
          return 0.01;
        }}
        polygonCapColor={(d) => {
          const iso = resolveIso3(d as GeoFeature);
          return getEngagementColor(engagedSet.has(iso), iso === selectedIso3, false);
        }}
        polygonSideColor={() => 'rgba(15, 23, 42, 0.55)'}
        polygonStrokeColor={(d) => {
          const iso = resolveIso3(d as GeoFeature);
          if (iso === selectedIso3) return '#fde047';
          if (engagedSet.has(iso)) return 'rgba(16, 185, 129, 0.55)';
          return 'rgba(148, 163, 184, 0.2)';
        }}
        polygonLabel={(d) => {
          const feat = d as GeoFeature;
          const iso = resolveIso3(feat);
          const name = resolveCountryName(feat);
          const info = engagementByIso3[iso];
          if (info) {
            return `<div class="globe-tooltip"><strong>${name} (${iso})</strong><div>${info.projectCount} active project${info.projectCount === 1 ? '' : 's'} &middot; $${(info.totalApproved / 1e6).toFixed(0)}M approved</div><small>Click to view engagement</small></div>`;
          }
          return `<div class="globe-tooltip"><strong>${name}</strong><small>No active World Bank Client Connection engagement</small></div>`;
        }}
        onPolygonClick={handlePolygonClick}
        polygonsTransitionDuration={350}
      />
    </div>
  );
};

export default InteractiveGlobe;
