import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CountryPortalPage } from './pages/CountryPortalPage';
import { AdminPortalPage } from './pages/AdminPortalPage';

const ProtectedRoute: React.FC<{
  allowedRole: 'Country' | 'Admin';
  children: React.ReactElement;
}> = ({ allowedRole, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.accountType !== allowedRole) {
    return <Navigate to={user.accountType === 'Admin' ? '/admin' : '/country'} replace />;
  }
  return children;
};

const Shell: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  const routes = (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/country"
        element={
          <ProtectedRoute allowedRole="Country">
            <CountryPortalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="Admin">
            <AdminPortalPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  if (isDashboard) {
    // Full-bleed dashboard: the landing page owns its own header/layout.
    return routes;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6">{routes}</main>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-4 text-xs text-muted-foreground">
        <div>
          <strong className="text-muted-foreground">LOANLY (loanly.wiki)</strong> — Sovereign Development Financing &amp; Client Connection Operations Platform
        </div>
        <div>
          Powered by World Bank Open Data API v2 • ASP.NET Core 10 • EF Core 10 • Gemini 3.6 Flash
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
