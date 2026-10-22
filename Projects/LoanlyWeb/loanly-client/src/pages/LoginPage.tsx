import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2, KeyRound, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { AccountType, DemoCredential } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input, Label } from '../components/ui/input';
import { Alert } from '../components/ui/alert';
import { cn } from '@/lib/utils';

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
    <div className="mx-auto grid max-w-4xl gap-6 py-6 lg:grid-cols-2">
      <Card className="p-0">
        <CardHeader className="flex-col items-start gap-1 border-b border-border p-5">
          <CardTitle className="text-sm normal-case text-foreground">Client Connection Authentication</CardTitle>
          <p className="text-xs text-muted-foreground">
            Sign in as a Member Country Borrower Official or World Bank Task Team / WFACS Officer.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => {
                setAccountType('Country');
                setEmail('treasury@kenya.go.ke');
              }}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors',
                accountType === 'Country' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              Country (Borrower)
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountType('Admin');
                setEmail('admin@worldbank.org');
              }}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition-colors',
                accountType === 'Admin' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin (WFACS)
            </button>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <Label>Official Email Address</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <KeyRound className="h-4 w-4" />
              {loading ? 'Authenticating…' : `Sign In to ${accountType} Portal`}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="p-0">
        <CardHeader className="flex-col items-start gap-1 border-b border-border p-5">
          <CardTitle className="text-sm normal-case text-foreground">Instant Demo Accounts</CardTitle>
          <p className="text-xs text-muted-foreground">
            Click any pre-seeded sovereign borrower or World Bank staff account to sign in immediately.
          </p>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {demoAccounts.map((cred, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={cred.accountType === 'Country' ? 'active' : 'pipeline'}>
                    {cred.accountType === 'Country' ? 'BORROWER' : 'WB STAFF'}
                  </Badge>
                  <strong className="truncate text-sm text-foreground">{cred.label}</strong>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{cred.roleDescription}</div>
                <code className="text-[11px] text-muted-foreground">{cred.email}</code>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleQuickDemo(cred)} disabled={loading}>
                Launch
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
