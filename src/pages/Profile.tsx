import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThemeCard from '../components/ThemeCard';
import { AuthContext } from '../context/AuthContext';
import { AuthorService } from '../services/author.service';
import type { AuthorProfile } from '../models/author.types';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    AuthorService.getById(user.id)
      .then(res => setProfile(res.author))
      .catch(() => setError('No fue posible cargar tu perfil. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null; // la ruta ya está protegida por PrivateRoute

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-10">
          <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
          <p className="text-slate-500 font-medium">{user.email}</p>
          {profile && (
            <p className="text-xs text-slate-400 mt-2">
              Miembro desde {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-4">Mis publicaciones</h2>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <p className="text-red-600 font-bold">{error}</p>
        ) : profile && profile.views.length > 0 ? (
          profile.views.map(view => <ThemeCard key={view.id} view={view} />)
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">Todavía no has publicado nada.</p>
            <Link to="/views/new" className="text-blue-600 font-bold hover:underline mt-2 inline-block">
              Crear tu primera publicación
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}