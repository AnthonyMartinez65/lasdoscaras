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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">¡Registro casi completo!</h2>
        <p className="text-gray-600 mb-6">
          Tu cuenta para <strong>{email}</strong> ha sido creada. Haz clic en el botón de abajo para activarla.
        </p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button 
          onClick={handleActivate} 
          disabled={loading} 
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Activando...' : 'Activar mi cuenta'}
        </button>
      </div>
    </div>
  );
}
