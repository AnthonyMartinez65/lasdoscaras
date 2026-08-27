import { useState, useContext } from 'react';
import { ApiService } from '../services/api.service';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { CacheService } from '../services/cache.service';
import { useNavigate, Link } from 'react-router-dom';
import type { AuthResponse } from '../models/auth.types';

const EyeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeSlashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3.5 pr-10 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
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