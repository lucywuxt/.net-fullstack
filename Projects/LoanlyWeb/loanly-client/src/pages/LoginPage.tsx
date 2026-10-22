import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, KeyRound, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { AccountType, DemoCredential } from '../types/api';

export const LoginPage: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<AccountType>('Country');
  const [email, setEmail] = useState('treasury@kenya.go.ke');
  const [password, setPassword] = useState('Password123!');
  const [demoAccounts, setDemoAccounts] = useState<DemoCredential[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getDemoAccounts().then(setDemoAccounts).catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const authUser = await api.login(email, password, accountType);
      setUser(authUser);
      navigate(authUser.accountType === 'Admin' ? '/admin' : '/country');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (cred: DemoCredential) => {
    setAccountType(cred.accountType);
    setEmail(cred.email);
    setPassword(cred.password);
    setError(null);
    setLoading(true);
    try {
      const authUser = await api.login(cred.email, cred.password, cred.accountType);
      setUser(authUser);
      navigate(authUser.accountType === 'Admin' ? '/admin' : '/country');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-grid">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Client Connection Authentication</h2>
            <p>Sign in as a Member Country Borrower Official or World Bank Task Team / WFACS Officer.</p>
          </div>

          <div className="role-toggle-tabs">
            <button
              type="button"
              className={`role-tab ${accountType === 'Country' ? 'active' : ''}`}
              onClick={() => {
                setAccountType('Country');
                setEmail('treasury@kenya.go.ke');
              }}
            >
              <Building2 size={16} />
              <span>Country (Borrower) Portal</span>
            </button>
            <button
              type="button"
              className={`role-tab ${accountType === 'Admin' ? 'active' : ''}`}
              onClick={() => {
                setAccountType('Admin');
                setEmail('elena.vance@worldbank.org');
              }}
            >
              <ShieldCheck size={16} />
              <span>Admin (Task Team / WFACS)</span>
            </button>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-field">
              <label>Official Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              <KeyRound size={16} />
              <span>{loading ? 'Authenticating...' : `Sign In to ${accountType} Portal`}</span>
            </button>
          </form>
        </div>

        <div className="demo-credentials-panel">
          <h3>Instant One-Click Portfolio Demo Accounts</h3>
          <p className="text-muted">
            Click any pre-seeded sovereign borrower or World Bank staff account below to sign in immediately:
          </p>
          <div className="demo-list">
            {demoAccounts.map((cred, idx) => (
              <div key={idx} className="demo-account-item">
                <div>
                  <div className="demo-badge-row">
                    <span className={`badge badge-${cred.accountType.toLowerCase()}`}>
                      {cred.accountType === 'Country' ? 'BORROWER' : 'WB STAFF'}
                    </span>
                    <strong>{cred.label}</strong>
                  </div>
                  <div className="demo-desc">{cred.roleDescription}</div>
                  <code className="demo-email">{cred.email}</code>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleQuickDemo(cred)}
                  disabled={loading}
                >
                  <span>Launch</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
