/**
 * Contexto de Autenticación Global (AuthContext).
 * Maneja el estado de la sesión del usuario a lo largo de toda la aplicación.
 * Sincroniza la información del usuario y el JWT con el localStorage mediante CacheService.
 */
import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../models/auth.types';
import { CacheService } from '../services/cache.service';
import { FavoriteService } from '../services/favorite.service';
import { setOnUnauthorized } from '../services/api.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicialización perezosa (lazy init) para leer del localStorage solo en el primer render
  const [user, setUser] = useState<User | null>(
    () => CacheService.get<{ token: string; user: User }>('lasdoscaras_auth')?.user ?? null
  );
  const [token, setToken] = useState<string | null>(
    () => CacheService.get<{ token: string; user: User }>('lasdoscaras_auth')?.token ?? null
  );

  useEffect(() => {
    if (token) {
      FavoriteService.syncCache();
    }
  }, []);

  /**
   * Registra el inicio de sesión.
   * Guarda el token y el usuario en el estado y en localStorage, 
   * y desencadena la sincronización de favoritos.
   */
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    CacheService.set('lasdoscaras_auth', { token: newToken, user: newUser });
    FavoriteService.syncCache();
  };

  /**
   * Limpia la sesión actual.
   * Elimina las credenciales y los datos privados del usuario (favoritos/historial)
   * del localStorage.
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    CacheService.remove('lasdoscaras_auth');
    CacheService.remove('lasdoscaras_favorites');
    CacheService.remove('lasdoscaras_history');
  };

  /**
   * Callback Global 401:
   * Permite que la capa de red (api.service) desconecte al usuario automáticamente
   * si recibe un error 401 (Token Expirado) desde el backend.
   */
  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
      window.location.href = '/login';
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};