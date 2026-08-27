import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api.service';

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

export default function Register() {
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 4);
  };

  const strengthScore = calculateStrength(formData.password);
  const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones Frontend
    let newErrors: any = {};
    if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (formData.password !== formData.confirm) {
      newErrors.confirm = 'Las contraseñas no coinciden';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                onChange={handleChange} 
                required 
                className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3 pr-10 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                placeholder="••••••••" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 h-1.5 mb-1">
                  {[1, 2, 3, 4].map(level => (
                    <div key={level} className={`flex-1 rounded-full transition-colors duration-300 ${strengthScore >= level ? strengthColors[strengthScore] : 'bg-slate-200'}`}></div>
                  ))}
                </div>
                <p className={`text-xs font-bold text-right ${strengthScore > 0 ? strengthColors[strengthScore].replace('bg-', 'text-') : ''}`}>
                  {strengthLabels[strengthScore]}
                </p>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-2">Confirmar Contraseña</label>
            <div className="relative">
              <input 
                type={showConfirm ? "text" : "password"} 
                name="confirm" 
                onChange={handleChange} 
                required 
                className="w-full border border-slate-300 bg-slate-50 text-slate-900 rounded-xl p-3 pr-10 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                placeholder="••••••••" 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
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