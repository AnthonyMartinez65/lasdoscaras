import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, type ReactNode } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Notification from './components/Notification';
import Login from './pages/login';
import Register from './pages/Register';
import Activate from './pages/Activate';
import Home from './pages/Home';

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { token } = useContext(AuthContext);
  return token ? <Navigate to="/" /> : <>{children}</>;
};

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { token } = useContext(AuthContext);
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <>
      <Notification />
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/activar" element={<PublicRoute><Activate /></PublicRoute>} />
        <Route path="/" element={<Home />} />
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