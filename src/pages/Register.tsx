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
      console.error("Detalle del error del servidor:", error);
      if (error.status === 409) {
        setErrors({ email: 'El correo ya está registrado' });
      } else if (error.status === 400) {
        if (error.data?.errors) {
          setErrors(error.data.errors);
        } else if (error.data?.details) {
          // Si el API del profe manda los errores dentro de "details"
          if (typeof error.data.details === 'object' && !Array.isArray(error.data.details)) {
            setErrors(error.data.details);
          } else {
            setErrors({ general: JSON.stringify(error.data.details) });
          }
        } else if (error.data?.message) {
          // A veces las APIs devuelven un array de mensajes o un string directo
          setErrors({ general: Array.isArray(error.data.message) ? error.data.message.join(', ') : error.data.message });
        } else {
          setErrors({ general: error.data?.error || 'Los datos enviados no cumplen con los requisitos.' });
        }
      } else {
        setErrors({ general: error.data?.message || 'Error de conexión con el servidor. ¿Está encendido el backend?' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Crear Cuenta</h2>
          <p className="text-slate-500 mt-2 font-medium">Únete a LasDosCaras</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2">Nombre</label>
            <input type="text" name="nombre" onChange={handleChange} required className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="Tu nombre" />
            {errors.nombre && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.nombre}</p>}
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2">Correo Electrónico</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="tu@correo.com" />
            {errors.email && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2">Contraseña</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="••••••••" />
            {errors.password && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2">Confirmar Contraseña</label>
            <input type="password" name="confirm" onChange={handleChange} required className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" placeholder="••••••••" />
            {errors.confirm && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.confirm}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl mt-6 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none">
            {loading ? 'Registrando...' : 'Comenzar ahora'}
          </button>
          {errors.general && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold text-center mt-4">{errors.general}</div>}
        </form>
        <div className="mt-8 text-center text-sm">
          <span className="text-slate-500">¿Ya tienes cuenta? </span>
          <button type="button" onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-800 font-bold transition-colors">Inicia sesión</button>
        </div>
      </div>
    </div>
  );
}