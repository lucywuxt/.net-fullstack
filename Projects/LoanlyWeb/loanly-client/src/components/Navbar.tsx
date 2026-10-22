import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe2, ShieldCheck, Building2, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="liquid-glass sticky top-0 z-40 h-14 rounded-none border-x-0 border-t-0">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <Globe2 className="h-5 w-5 text-emerald-500" />
          <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
            LOANLY
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              location.pathname === '/' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Global Data Observatory</span>
          </Link>

          {user?.accountType === 'Country' && (
            <Link
              to="/country"
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                location.pathname.startsWith('/country')
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Borrower Portal ({user.isoAlpha3 || user.name})</span>
            </Link>
          )}

          {user?.accountType === 'Admin' && (
            <Link
              to="/admin"
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                location.pathname.startsWith('/admin')
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Task Team &amp; WFACS Portal</span>
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden text-right sm:block">
                <div className="text-xs font-medium text-foreground">{user.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {user.accountType === 'Admin' ? `WB ${user.subRoleOrRegion}` : `${user.subRoleOrRegion} • ${user.incomeLevel}`}
                </div>
              </div>
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  user.accountType === 'Admin' ? 'bg-sky-400' : 'bg-emerald-400'
                )}
              />
              <Button size="sm" variant="outline" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">
                <LogIn className="h-3.5 w-3.5" />
                <span>Client Connection Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
