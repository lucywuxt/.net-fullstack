import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'loanly_theme';

function getInitialTheme(): Theme {
  // The inline script in index.html already applied the correct class
  // before React mounted (it runs pre-hydration, avoiding a flash of the
  // wrong theme). Read that decision back instead of re-deriving it from
  // matchMedia a second time — a second independent read can disagree with
  // the first in headless/CI Chrome, where prefers-color-scheme is briefly
  // flaky right after launch, causing a visible mid-session theme flip.
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
