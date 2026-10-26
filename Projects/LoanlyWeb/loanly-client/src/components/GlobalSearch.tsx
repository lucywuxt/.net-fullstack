import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Landmark, Clock, Receipt, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react';
import type { Disbursement, Project, WithdrawalApplication } from '../types/api';
import { PROJECT_STATUS_TONE, WITHDRAWAL_STATUS_TONE } from '../lib/status';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export interface HighlightTarget {
  type: 'withdrawal' | 'disbursement';
  id: number;
}

interface SearchResult {
  key: string;
  category: 'Projects' | 'Withdrawal Applications' | 'Disbursements';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badgeLabel?: string;
  badgeTone?: 'active' | 'pipeline' | 'info' | 'risk' | 'muted' | 'default';
  projectId: number;
  highlight?: HighlightTarget;
}

interface GlobalSearchProps {
  projects: Project[];
  withdrawals: WithdrawalApplication[];
  disbursements: Disbursement[];
  onSelectProject: (projectId: number, highlight?: HighlightTarget) => void;
}

export interface GlobalSearchHandle {
  open: () => void;
}

const MAX_RESULTS = 24;

export const GlobalSearch = forwardRef<GlobalSearchHandle, GlobalSearchProps>(function GlobalSearch(
  { projects, withdrawals, disbursements, onSelectProject },
  ref
) {
  const [open, setOpen] = useState(false);
  useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), []);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Cmd/Ctrl+K toggles the palette from anywhere in the portal; Escape closes it.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      const id = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(id);
    }
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out: SearchResult[] = [];

    for (const p of projects) {
      if (
        p.title.toLowerCase().includes(q) ||
        p.projectCode.toLowerCase().includes(q) ||
        p.countryName.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q)
      ) {
        out.push({
          key: `project-${p.id}`,
          category: 'Projects',
          icon: <Landmark className="h-4 w-4" />,
          title: p.title,
          subtitle: `${p.countryName} · ${p.projectCode}`,
          badgeLabel: p.status,
          badgeTone: PROJECT_STATUS_TONE[p.status] ?? 'default',
          projectId: p.id,
        });
      }
    }

    for (const w of withdrawals) {
      if (
        w.applicationNumber.toLowerCase().includes(q) ||
        w.projectTitle.toLowerCase().includes(q) ||
        w.countryName.toLowerCase().includes(q)
      ) {
        out.push({
          key: `wa-${w.id}`,
          category: 'Withdrawal Applications',
          icon: <Clock className="h-4 w-4" />,
          title: w.applicationNumber,
          subtitle: `${w.projectTitle} · ${w.countryName}`,
          badgeLabel: w.status,
          badgeTone: WITHDRAWAL_STATUS_TONE[w.status] ?? 'default',
          projectId: w.projectId,
          highlight: { type: 'withdrawal', id: w.id },
        });
      }
    }

    for (const d of disbursements) {
      if (
        d.transactionReference.toLowerCase().includes(q) ||
        d.projectTitle.toLowerCase().includes(q) ||
        d.countryName.toLowerCase().includes(q)
      ) {
        out.push({
          key: `disb-${d.id}`,
          category: 'Disbursements',
          icon: <Receipt className="h-4 w-4" />,
          title: d.transactionReference,
          subtitle: `${d.projectTitle} · $${d.amountDisbursed.toLocaleString()}`,
          projectId: d.projectId,
          highlight: { type: 'disbursement', id: d.id },
        });
      }
    }

    return out.slice(0, MAX_RESULTS);
  }, [query, projects, withdrawals, disbursements]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleSelect = (r: SearchResult) => {
    onSelectProject(r.projectId, r.highlight);
    setOpen(false);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[activeIndex];
      if (r) handleSelect(r);
    }
  };

  return (
    <>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
          <div
            className="liquid-glass liquid-glass-solid w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search projects, withdrawal applications, disbursements…"
                className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none"
              />
              <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                esc
              </kbd>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {query.trim() === '' ? (
                <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Search across your whole portfolio.
                </div>
              ) : results.length === 0 ? (
                <div className="px-3 py-10 text-center text-sm text-muted-foreground">No matches for &ldquo;{query}&rdquo;.</div>
              ) : (
                results.map((r, idx) => {
                  const prevCategory = idx > 0 ? results[idx - 1].category : null;
                  return (
                    <React.Fragment key={r.key}>
                      {r.category !== prevCategory && (
                        <div className="px-3 pb-1.5 pt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground first:pt-1.5">
                          {r.category}
                        </div>
                      )}
                      <button
                        ref={(el) => {
                          itemRefs.current[idx] = el;
                        }}
                        type="button"
                        onClick={() => handleSelect(r)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                          idx === activeIndex ? 'bg-emerald-500/10' : ''
                        )}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          {r.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{r.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span>
                        </span>
                        {r.badgeLabel && (
                          <Badge variant={r.badgeTone} className="shrink-0">
                            {r.badgeLabel}
                          </Badge>
                        )}
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-border px-5 py-2.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" /> Navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" /> Select
              </span>
              <span className="ml-auto font-mono">⌘K to toggle</span>
            </div>
          </div>
          </div>,
          document.body
        )}
    </>
  );
});
