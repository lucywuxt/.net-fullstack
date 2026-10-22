import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <table className={cn('w-full border-collapse text-left text-xs', className)} {...props} />
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn('[&_tr]:border-b [&_tr]:border-border', className)} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn('border-b border-border transition-colors hover:bg-muted/50', className)} {...props} />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th
    className={cn(
      'py-2 pl-3 pr-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground first:pl-0',
      className
    )}
    {...props}
  />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn('py-2.5 pl-3 pr-3 text-foreground first:pl-0', className)} {...props} />
);

interface SortableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  active: boolean;
  direction: 'asc' | 'desc';
  onSort: () => void;
}

export const SortableHead: React.FC<SortableHeadProps> = ({ active, direction, onSort, className, children, ...props }) => (
  <TableHead className={cn('cursor-pointer select-none hover:text-foreground', className)} onClick={onSort} {...props}>
    <span className="inline-flex items-center gap-1">
      {children}
      {active ? (
        direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </span>
  </TableHead>
);
