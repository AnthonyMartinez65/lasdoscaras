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
  const [user, setUser] = useState<User | null>(
    () => CacheService.get<{ token: string; user: User }>('lasdoscaras_auth')?.user ?? null
  );
  const [token, setToken] = useState<string | null>(
    () => CacheService.get<{ token: string; user: User }>('lasdoscaras_auth')?.token ?? null
  );

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    CacheService.set('lasdoscaras_auth', { token: newToken, user: newUser });
    FavoriteService.syncCache();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    CacheService.remove('lasdoscaras_auth');
    CacheService.remove('lasdoscaras_favorites');
    CacheService.remove('lasdoscaras_history');
  };

  // Registrar el callback global para que api.service pueda limpiar la
  // sesion cuando recibe un 401 sin depender de React Context.
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