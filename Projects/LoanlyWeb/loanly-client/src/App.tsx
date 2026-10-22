import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
    <div className="app-shell">
      <Navbar />
      <main className="main-content">{routes}</main>
      <footer className="app-footer">
        <div>
          <strong>LOANLY (loanly.wiki)</strong> — Sovereign Development Financing &amp; Client Connection Operations Platform
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
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
