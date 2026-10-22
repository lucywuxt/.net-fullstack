import React from 'react';
import { cn } from '@/lib/utils';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <table className={cn('w-full border-collapse text-left text-xs', className)} {...props} />
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn('[&_tr]:border-b [&_tr]:border-zinc-800', className)} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn('border-b border-zinc-900 transition-colors hover:bg-zinc-800/40', className)} {...props} />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th
    className={cn(
      'py-2 pl-3 pr-3 text-[11px] font-medium uppercase tracking-wide text-zinc-500 first:pl-0',
      className
    )}
    {...props}
  />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn('py-2.5 pl-3 pr-3 text-zinc-200 first:pl-0', className)} {...props} />
);
