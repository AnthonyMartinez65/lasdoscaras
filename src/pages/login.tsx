import { useState, useContext } from 'react';
import { ApiService } from '../services/api.service';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { CacheService } from '../services/cache.service';
import { useNavigate, Link } from 'react-router-dom';
import { AuthResponse } from '../models/auth.types';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Correo</label>
          <input type="email" required className="w-full border rounded p-2" onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
          <input type="password" required className="w-full border rounded p-2" onChange={e => setPassword(e.target.value)} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
        <p className="mt-4 text-center text-sm"><Link to="/register" className="text-blue-600">¿No tienes cuenta? Regístrate</Link></p>
      </form>
    </div>
  );
}