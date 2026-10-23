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

/** Binary "is this country an active Loanly engagement" color, not a generic data choropleth. */
export function getEngagementColor(isEngaged: boolean, isSelected: boolean, isCompared: boolean): string {
  if (isSelected) return 'rgba(250, 204, 21, 0.92)';
  if (isCompared) return 'rgba(56, 189, 248, 0.88)';
  if (isEngaged) return 'rgba(16, 185, 129, 0.75)';
  return 'rgba(71, 85, 105, 0.3)';
}
