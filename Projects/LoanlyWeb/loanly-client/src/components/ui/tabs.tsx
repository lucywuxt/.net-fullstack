import React from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, active, onChange, className }) => (
  <div className={cn('flex flex-wrap gap-1 border-b border-border', className)}>
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={cn(
          'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
          active === t.id
            ? 'border-emerald-500 text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        )}
      >
        {t.icon}
        {t.label}
      </button>
    ))}
  </div>
);
