import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe2, ShieldCheck, Building2, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="top-navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-link">
          <div className="brand-icon">
            <Globe2 size={22} />
          </div>
          <div>
            <div className="brand-title">
              LOANLY <span className="brand-domain">loanly.wiki</span>
            </div>
            <div className="brand-subtitle">World Bank Operations &amp; Client Connection</div>
          </div>
        </Link>

        <nav className="nav-links">
          <Link
            to="/"
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Globe2 size={16} />
            <span>Global Data Observatory</span>
          </Link>

          {user?.accountType === 'Country' && (
            <Link
              to="/country"
              className={`nav-item ${location.pathname.startsWith('/country') ? 'active' : ''}`}
            >
              <Building2 size={16} />
              <span>Borrower Portal ({user.isoAlpha3 || user.name})</span>
            </Link>
          )}

          {user?.accountType === 'Admin' && (
            <Link
              to="/admin"
              className={`nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
            >
              <ShieldCheck size={16} />
              <span>Task Team &amp; WFACS Portal</span>
            </Link>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="user-pill-group">
              <div className="user-badge">
                <span className={`role-dot ${user.accountType.toLowerCase()}`} />
                <div className="user-meta">
                  <span className="user-name">{user.name}</span>
                  <span className="user-subrole">
                    {user.accountType === 'Admin'
                      ? `WB ${user.subRoleOrRegion}`
                      : `${user.subRoleOrRegion} • ${user.incomeLevel}`}
                  </span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="auth-cta-group">
              <Link to="/login" className="btn btn-primary btn-sm">
                <LogIn size={15} />
                <span>Client Connection Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
