import React from 'react';
import { cn } from '@/lib/utils';

const TONE: Record<string, string> = {
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
};

export const ProgressBar: React.FC<{ percent: number; tone?: keyof typeof TONE; className?: string }> = ({
  percent,
  tone = 'emerald',
  className,
}) => (
  <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-muted-foreground/20', className)}>
    <div
      className={cn('h-full rounded-full transition-all', TONE[tone])}
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);
