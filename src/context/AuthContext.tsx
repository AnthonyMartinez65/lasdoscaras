import { createContext, useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../models/auth.types';
import { CacheService } from '../services/cache.service';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  login: (token: string, user: Usuario) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
   
    const cachedAuth = CacheService.get<{ token: string; user: Usuario }>('lasdoscaras_auth');
    if (cachedAuth) {
      setToken(cachedAuth.token);
      setUser(cachedAuth.user);
    }
  }, []);

  const login = (newToken: string, newUser: Usuario) => {
    setToken(newToken);
    setUser(newUser);
    
    CacheService.set('lasdoscaras_auth', { token: newToken, user: newUser });
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