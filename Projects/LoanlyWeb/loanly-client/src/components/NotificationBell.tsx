import React, { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import type { AuditLogEntry } from '../types/api';
import { api } from '../services/api';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const LAST_SEEN_KEY = 'loanly_notifications_last_seen';
const POLL_INTERVAL_MS = 30_000;

export const NotificationBell: React.FC = () => {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>(() => localStorage.getItem(LAST_SEEN_KEY) ?? '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => {
      api.getRecentActivity(20).then(setEntries).catch(() => {});
    };
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unreadCount = entries.filter((e) => !lastSeen || e.createdAt > lastSeen).length;

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && entries.length > 0) {
        const newest = entries[0].createdAt;
        localStorage.setItem(LAST_SEEN_KEY, newest);
        setLastSeen(newest);
      }
      return next;
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'liquid-glass absolute right-0 top-10 z-50 w-80 max-h-96 overflow-y-auto rounded-xl p-2 shadow-2xl',
            'md:left-0 md:right-auto'
          )}
        >
          <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Recent Activity
          </div>
          {entries.length === 0 ? (
            <div className="px-2 py-6 text-center text-xs text-muted-foreground">No recent activity.</div>
          ) : (
            <ul className="space-y-1">
              {entries.map((e) => (
                <li key={e.id} className="rounded-lg px-2 py-1.5 hover:bg-muted/60">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="muted">{e.action}</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-foreground">{e.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
