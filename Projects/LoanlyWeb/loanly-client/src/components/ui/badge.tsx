import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium font-mono tracking-wide',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted text-foreground',
        active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        pipeline: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        info: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
        risk: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
        muted: 'border-border bg-card text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);
