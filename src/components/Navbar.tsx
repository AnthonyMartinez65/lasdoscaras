import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-extrabold text-white tracking-tight cursor-pointer" onClick={() => navigate('/')}>
              LasDos<span className="text-blue-500">Caras</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <input
                type="text"
                placeholder="Buscar temas..."
                className="bg-slate-800 text-slate-200 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none w-64"
              />
            </div>
            {user ? (
              <div className="flex items-center space-x-3 border-l border-slate-700 pl-4 ml-2">
                <Link
                  to="/views/new"
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg transition-colors font-bold"
                >
                  Publicar
                </Link>
                <Link
                  to="/profile"
                  className="text-slate-300 font-medium hidden sm:block hover:text-white transition-colors"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-slate-800 hover:bg-slate-700 text-white py-1.5 px-3 rounded-lg transition-colors font-bold"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 border-l border-slate-700 pl-4 ml-2">
                <Link
                  to="/login"
                  className="text-sm bg-slate-800 hover:bg-slate-700 text-white py-1.5 px-3 rounded-lg transition-colors font-bold"
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}