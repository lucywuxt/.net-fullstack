import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';

const ICON_TONE: Record<string, string> = {
  sky: 'bg-sky-500/10 text-sky-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
  violet: 'bg-violet-500/10 text-violet-400',
  rose: 'bg-rose-500/10 text-rose-400',
};

interface StatCardProps {
  icon: React.ReactNode;
  tone?: keyof typeof ICON_TONE;
  label: string;
  value: string;
  sub?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, tone = 'sky', label, value, sub, className }) => (
  <Card className={cn('flex items-start gap-3 p-4', className)}>
    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', ICON_TONE[tone])}>
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-xl text-foreground">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  </Card>
);
