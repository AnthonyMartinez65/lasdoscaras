/**
 * Contexto de Tema (Claro/Oscuro).
 * Maneja la preferencia visual del usuario y la inyecta en el DOM (clase 'dark').
 * Soporta persistencia nativa vía localStorage y detecta la preferencia del OS si no hay guardada.
 */
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
  const saved = localStorage.getItem(THEME_CACHE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  // Si el usuario nunca eligio, respetar la preferencia del sistema operativo.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Proveedor de Tema.
 * Usa localStorage directamente en vez de CacheService a propósito: el
 * tema no debe expirar con un TTL como si lo hacen las categorías o los
 * favoritos — es una preferencia que debe persistir indefinidamente
 * hasta que el usuario la cambie.
 */
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