import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Stepper: React.FC<{ stages: string[]; currentIndex: number }> = ({ stages, currentIndex }) => (
  <div className="flex items-center">
    {stages.map((stage, i) => {
      const done = i < currentIndex;
      const current = i === currentIndex;
      return (
        <React.Fragment key={stage}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono',
                done
                  ? 'bg-emerald-500 text-zinc-950'
                  : current
                  ? 'border-2 border-emerald-500 text-emerald-400'
                  : 'border border-border text-muted-foreground'
              )}
            >
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span className={cn('text-[10px] whitespace-nowrap', current ? 'text-foreground' : 'text-muted-foreground')}>
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
