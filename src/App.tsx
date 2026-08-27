/**
 * Componente raíz de la aplicación LasDosCaras.
 * Configura los proveedores de estado globales (Auth, Notificaciones, Temas) 
 * y define todo el enrutamiento de la aplicación (SPA).
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, useState, useEffect, type ReactNode } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Notification from './components/Notification';
import Login from './pages/login';
import Register from './pages/Register';
import Activate from './pages/Activate';
import Home from './pages/Home';
import ViewDetail from './pages/ViewDetail';
import CreateView from './pages/CreateView';
import EditView from './pages/EditView';
import Profile from './pages/Profile';
import AuthorProfile from './pages/AuthorProfile';
import CategoryIndex from './pages/CategoryIndex';
import CategoryPage from './pages/CategoryPage';
import SearchResults from './pages/SearchResults';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminViews from './pages/admin/AdminViews';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';

/**
 * Guard para rutas públicas (ej. Login, Register).
 * Si el usuario ya está autenticado, lo redirige al tablero principal (Home)
 * para evitar que vuelva a iniciar sesión.
 */
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { token } = useContext(AuthContext);
  return token ? <Navigate to="/" /> : <>{children}</>;
};

/**
 * Guard para rutas privadas (ej. Crear Publicación, Perfil).
 * Si no hay token de sesión, redirige al usuario al Login.
 */
export const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { token } = useContext(AuthContext);
  return token ? <>{children}</> : <Navigate to="/login" />;
};

/**
 * Guard para rutas de administración.
 * Exige estar autenticado Y tener el rol de 'SUPERADMIN'. 
 * Si falla la autenticación va a login, si falla el rol va a error 403.
 */
export const SuperAdminRoute = ({ children }: { children: ReactNode }) => {
  const { token, user } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'SUPERADMIN') return <Navigate to="/403" />;
  return <>{children}</>;
};

/**
 * Banner de modo offline — se muestra encima de todo cuando el navegador
 * detecta que no hay conexión, indicando modo lectura.
 */
function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => {
      setOffline(false);
      // Recargar datos frescos tras recuperar conexion
      window.dispatchEvent(new CustomEvent('app:online'));
    };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 bg-amber-500 text-white text-center text-sm font-bold py-2 z-[200]"
    >
      Sin conexion a internet — mostrando informacion guardada.
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <OfflineBanner />
      <Notification />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/activar" element={<PublicRoute><Activate /></PublicRoute>} />
        <Route path="/" element={<Home />} />
        <Route path="/views/new" element={<PrivateRoute><CreateView /></PrivateRoute>} />
        <Route path="/views/:id/edit" element={<PrivateRoute><EditView /></PrivateRoute>} />
        <Route path="/views/:id" element={<ViewDetail />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/authors/:id" element={<AuthorProfile />} />
        <Route path="/categories" element={<CategoryIndex />} /> 
        
        <Route path="/categories/:id" element={<CategoryPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/admin/users" element={<SuperAdminRoute><AdminUsers /></SuperAdminRoute>} />
        <Route path="/admin/categories" element={<SuperAdminRoute><AdminCategories /></SuperAdminRoute>} />
        <Route path="/admin/moderation" element={<SuperAdminRoute><AdminViews /></SuperAdminRoute>} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}