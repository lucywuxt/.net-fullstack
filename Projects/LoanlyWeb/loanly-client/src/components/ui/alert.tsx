import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Alert: React.FC<{ variant: 'error' | 'success'; children: React.ReactNode; className?: string }> = ({
  variant,
  children,
  className,
}) => (
  <div
    className={cn(
      'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
      variant === 'error'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      className
    )}
  >
    {variant === 'error' ? (
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
    ) : (
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
    )}
    <span>{children}</span>
  </div>
);
