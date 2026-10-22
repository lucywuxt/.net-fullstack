import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <main className="main-content">
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
          </main>
          <footer className="app-footer">
            <div>
              <strong>LOANLY (loanly.wiki)</strong> — Sovereign Development Financing &amp; Client Connection Operations Platform
            </div>
            <div>
              Powered by World Bank Open Data API v2 • ASP.NET Core 10 • EF Core 10 • Gemini 3.6 Flash
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
