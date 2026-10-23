import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Stepper: React.FC<{ stages: string[]; currentIndex: number }> = ({ stages, currentIndex }) => (
  <div className="flex items-center">
    {stages.map((stage, i) => {
      const isLastStage = i === stages.length - 1;
      // The terminal stage (Closed) has nothing left to progress toward, so being
      // "current" there means the lifecycle is complete — render it as done, not in-progress.
      const done = i < currentIndex || (isLastStage && i === currentIndex);
      const current = i === currentIndex && !done;
      return (
        <React.Fragment key={stage}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono',
                done
                  ? 'bg-emerald-500 text-zinc-950'
                  : current
                  ? 'border-2 border-emerald-500 text-emerald-400'
                  : 'border border-border text-muted-foreground'
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={cn('text-xs font-medium whitespace-nowrap', current ? 'text-foreground' : 'text-muted-foreground')}>
              {stage}
            </span>
          </div>
          {i < stages.length - 1 && (
            <div className={cn('mx-1 mb-4 h-px flex-1', done ? 'bg-emerald-500' : 'bg-muted')} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);
