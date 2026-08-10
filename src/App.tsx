import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Notification from './components/Notification';
import Login from './pages/Login';
import Register from './pages/Register';
import Activate from './pages/Activate';

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useContext(AuthContext);
  return token ? <Navigate to="/" /> : children;
};

function AppRoutes() {
  return (
    <>
      <Notification />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/activar" element={<PublicRoute><Activate /></PublicRoute>} />
        <Route path="/" element={<div className="p-8 text-center text-2xl font-bold">¡Bienvenido al Tablero (Home)!</div>} />
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