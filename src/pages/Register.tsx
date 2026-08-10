import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api.service';

export default function Register() {
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      setErrors({ confirm: 'Las contraseñas no coinciden' });
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const response = await ApiService.request<any>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: formData.nombre, email: formData.email, password: formData.password })
      });
      
      navigate('/activar', { 
        state: { 
          email: formData.email,
          token: response.activationToken 
        } 
      });
    } catch (error: any) {
      if (error.status === 409) {
        setErrors({ email: 'El correo ya está registrado' });
      } else if (error.status === 400 && error.data.errors) {
        setErrors(error.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Crear Cuenta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
            <input type="text" name="nombre" onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full p-2 border rounded" />
            {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Confirmar Contraseña</label>
            <input type="password" name="confirm" onChange={handleChange} required className="w-full p-2 border rounded" />
            {errors.confirm && <p className="text-red-500 text-xs italic mt-1">{errors.confirm}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}