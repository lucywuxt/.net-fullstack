// Consistent per-sector color identity used across badges and charts.
export const SECTOR_BADGE_CLASSES: Record<string, string> = {
  Infrastructure: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
  Climate: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Education: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  Health: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
};

export const SECTOR_HEX: Record<string, string> = {
  Infrastructure: '#38bdf8',
  Climate: '#10b981',
  Education: '#a78bfa',
  Health: '#f43f5e',
};

export const SECTOR_ORDER = ['Infrastructure', 'Climate', 'Education', 'Health'];
