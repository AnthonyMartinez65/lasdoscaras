import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NotFound from './NotFound';
import ThemeCard from '../components/ThemeCard';
import { AuthorService } from '../services/author.service';
import { ViewService } from '../services/view.service';
import type { AuthorProfile as AuthorProfileType } from '../models/author.types';
import type { PoliticalView } from '../models/view.types';

export default function AuthorProfile() {
  const { id } = useParams<{ id: string }>();
  const [author, setAuthor] = useState<AuthorProfileType | null>(null);
  const [views, setViews] = useState<PoliticalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    Promise.all([
      AuthorService.getById(id).then(res => setAuthor(res.author)),
      ViewService.list({ authorId: id, limit: 50 }).then(res => setViews(res.views)),
    ])
      .catch((err: { status?: number }) => {
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError('No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <NotFound />;
  }

  if (error || !author) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="max-w-2xl mx-auto text-center py-24 px-4">
          <p className="text-red-600 font-bold mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-10">
          <h1 className="text-3xl font-black text-slate-900">{author.name}</h1>
          <p className="text-xs text-slate-400 mt-2">
            Miembro desde {new Date(author.createdAt).toLocaleDateString()}
          </p>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-4">Publicaciones</h2>

        {views.length > 0 ? (
          views.map(view => <ThemeCard key={view.id} view={view} isFavorited={view.isFavorite} />)
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">Este autor todavía no ha publicado nada.</p>
          </div>
        )}
      </main>
    </div>
  );
}