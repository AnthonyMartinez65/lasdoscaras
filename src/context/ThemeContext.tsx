import { createContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const THEME_CACHE_KEY = 'lasdoscaras_theme';

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

function getInitialTheme(): Theme {
  return localStorage.getItem(THEME_CACHE_KEY) === 'dark' ? 'dark' : 'light';
}

// Usa localStorage directamente en vez de CacheService a propósito: el
// tema no debe expirar con un TTL como sí lo hacen las categorías o los
// favoritos — es una preferencia que debe persistir indefinidamente
// hasta que el usuario la cambie.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_CACHE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}