import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ApiService } from '../services/api.service';

export default function Activate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const token = location.state?.token;

  if (!email || !token) {
    return <Navigate to="/register" />;
  }

  const handleActivate = async () => {
    setLoading(true);
    setError('');

    try {
      await ApiService.request(`/api/auth/activate/${token}`, {
        method: 'GET'
      });

      navigate('/login');
    } catch (err) {
      setError('Hubo un problema al activar la cuenta. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center transition-all">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        <h2 className="text-3xl font-extrabold mb-4 text-slate-900 tracking-tight">¡Casi listo!</h2>
        <p className="text-slate-500 mb-8 text-lg font-medium">
          Tu cuenta para <strong className="text-slate-800">{email}</strong> ha sido creada. Actívala para continuar.
        </p>
        {error && <p className="text-red-500 text-sm font-bold mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        <button 
          onClick={handleActivate} 
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {loading ? 'Activando...' : 'Activar mi cuenta'}
        </button>
      </div>
    </div>
  );
}
