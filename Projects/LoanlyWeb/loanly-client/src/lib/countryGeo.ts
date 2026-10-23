// Approximate capital/major-city coordinates ([lat, lon]) for the countries
// this app's demo portfolio operates in — shared by the public landing
// globe and the per-country portal globe so there's one source of truth.
export const COUNTRY_COORDS: Record<string, { location: [number, number]; name: string }> = {
  KEN: { location: [-1.286, 36.817], name: 'Kenya' },
  IND: { location: [28.6139, 77.209], name: 'India' },
  BRA: { location: [-15.793, -47.882], name: 'Brazil' },
  VNM: { location: [21.0278, 105.8342], name: 'Vietnam' },
  NGA: { location: [9.0765, 7.3986], name: 'Nigeria' },
  COL: { location: [4.711, -74.0721], name: 'Colombia' },
};
