export interface GeoFeature {
  type: string;
  properties: {
    ADMIN?: string;
    NAME?: string;
    ISO_A3?: string;
    ADM0_A3?: string;
    REGION_WB?: string;
    CONTINENT?: string;
    [key: string]: unknown;
  };
  bbox?: number[];
  geometry: {
    type: string;
    coordinates: unknown[];
  };
}

export function resolveIso3(feat: GeoFeature): string {
  const iso = feat.properties?.ISO_A3;
  if (iso && iso !== '-99') return String(iso).toUpperCase();
  const adm = feat.properties?.ADM0_A3;
  if (adm && adm !== '-99') return String(adm).toUpperCase();
  return '';
}

export function resolveCountryName(feat: GeoFeature): string {
  return String(feat.properties?.ADMIN || feat.properties?.NAME || resolveIso3(feat));
}

export function computeFeatureCenter(feat: GeoFeature): { lat: number; lng: number } {
  if (Array.isArray(feat.bbox) && feat.bbox.length >= 4) {
    const [minLng, minLat, maxLng, maxLat] = feat.bbox;
    return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
  }
  return { lat: 10, lng: 20 };
}

export function getChoroplethColor(
  value: number | undefined,
  minVal: number,
  maxVal: number,
  scale: string,
  isSelected: boolean,
  isCompared: boolean
): string {
  if (isSelected) return 'rgba(250, 204, 21, 0.92)';
  if (isCompared) return 'rgba(56, 189, 248, 0.88)';
  if (value === undefined || Number.isNaN(value)) return 'rgba(30, 41, 59, 0.65)';

  const span = Math.max(maxVal - minVal, 0.0001);
  const rawRatio = Math.max(0, Math.min(1, (value - minVal) / span));
  const t = scale === 'emerald' ? Math.pow(rawRatio, 0.45) : rawRatio;

  if (scale === 'amber') {
    return `rgba(${Math.round(60 + 195 * t)}, ${Math.round(50 + 145 * t)}, ${Math.round(30 + 30 * (1 - t))}, 0.84)`;
  }
  if (scale === 'rose') {
    return `rgba(${Math.round(70 + 175 * t)}, ${Math.round(45 + 40 * (1 - t))}, ${Math.round(80 + 50 * t)}, 0.84)`;
  }
  if (scale === 'violet') {
    return `rgba(${Math.round(55 + 135 * t)}, ${Math.round(50 + 60 * t)}, ${Math.round(110 + 140 * t)}, 0.84)`;
  }
  if (scale === 'cyan') {
    return `rgba(${Math.round(20 + 40 * t)}, ${Math.round(80 + 145 * t)}, ${Math.round(130 + 115 * t)}, 0.84)`;
  }
  if (scale === 'sky') {
    return `rgba(${Math.round(30 + 25 * t)}, ${Math.round(100 + 90 * t)}, ${Math.round(160 + 80 * t)}, 0.84)`;
  }
  if (scale === 'indigo') {
    return `rgba(${Math.round(60 + 40 * t)}, ${Math.round(55 + 50 * t)}, ${Math.round(150 + 90 * t)}, 0.84)`;
  }
  return `rgba(${Math.round(16 + 35 * t)}, ${Math.round(75 + 155 * t)}, ${Math.round(90 + 75 * t)}, 0.85)`;
}
