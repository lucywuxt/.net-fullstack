import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { TabBar, type TabItem } from './ui/tabs';
import { cn } from '@/lib/utils';

interface SidebarShellProps {
  portalLabel: string;
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
}

export const SidebarShell: React.FC<SidebarShellProps> = ({ portalLabel, tabs, active, onChange, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Vertical sidebar (desktop) */}
      <aside className="liquid-glass hidden w-60 shrink-0 flex-col rounded-none border-y-0 border-l-0 md:flex">
        <Link to="/" className="flex items-center gap-2 px-4 py-4">
          <Globe2 className="h-5 w-5 text-emerald-500" />
          <span className="font-mono text-sm font-semibold tracking-tight">LOANLY</span>
        </Link>

        <div className="flex items-center justify-between px-4 pb-3">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{portalLabel}</span>
          <NotificationBell />
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                active === t.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2 border-t border-border p-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Globe2 className="h-4 w-4" />
            Global Data Observatory
          </Link>

          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-foreground">{user?.name}</div>
              <div className="truncate text-[10px] text-muted-foreground">
                {user?.accountType === 'Admin' ? `WB ${user?.subRoleOrRegion}` : `${user?.subRoleOrRegion} • ${user?.incomeLevel}`}
              </div>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top bar: brand + theme + sign out, tabs render as a horizontal TabBar below */}
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-emerald-500" />
            <span className="font-mono text-sm font-semibold tracking-tight">LOANLY</span>
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <div className="shrink-0 overflow-x-auto px-4 md:hidden">
          <TabBar tabs={tabs} active={active} onChange={onChange} />
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
};
