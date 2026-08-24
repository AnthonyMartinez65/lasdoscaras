import { createContext, useState, type ReactNode } from 'react';
import type { User } from '../models/auth.types';
import { CacheService } from '../services/cache.service';
import { FavoriteService } from '../services/favorite.service';

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
    // Trae los favoritos reales del usuario apenas inicia sesión, para
    // que el caché local (lasdoscaras_favorites) no arranque vacío.
    FavoriteService.syncCache();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    CacheService.remove('lasdoscaras_auth');
    CacheService.remove('lasdoscaras_favorites');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};