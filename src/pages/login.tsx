import { useState, useContext } from 'react';
import { ApiService } from '../services/api.service';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { CacheService } from '../services/cache.service';
import { useNavigate, Link } from 'react-router-dom';
import type { AuthResponse } from '../models/auth.types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await ApiService.request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      login(response.token, response.user);

      try {
        const favs = await ApiService.request<string[]>('/api/users/me/favorites');
        CacheService.set('lasdoscaras_favorites', favs);
      } catch (err) {
        console.error("Error cargando favoritos", err);
      }

      navigate('/');
    } catch (error: any) {
      if (error.status === 401) {
        showNotification('Correo o contraseña incorrectos.', 'error');
      } else {
        showNotification('Ocurrió un error en el servidor. Intente más tarde.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">LasDosCaras</h2>
          <p className="text-slate-500 mt-2 font-medium">Inicia sesión para continuar</p>
        </div>
        
        <div className="mb-5">
          <label className="block text-slate-700 text-sm font-bold mb-2">Correo Electrónico</label>
          <input type="email" required className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" />
        </div>
        
        <div className="mb-6">
          <label className="block text-slate-700 text-sm font-bold mb-2">Contraseña</label>
          <input type="password" required className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl mt-4 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none">
          {loading ? 'Iniciando...' : 'Entrar al Tablero'}
        </button>
        
        <div className="mt-8 text-center text-sm">
          <span className="text-slate-500">¿No tienes cuenta? </span>
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-bold transition-colors">Regístrate aquí</Link>
        </div>
      </form>
    </div>
  );
}