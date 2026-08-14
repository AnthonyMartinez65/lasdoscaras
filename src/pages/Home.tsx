import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ThemeCard from '../components/ThemeCard';
import { ViewService } from '../services/view.service';
import type { PoliticalView } from '../models/view.types';

export default function Home() {
  const [views, setViews] = useState<PoliticalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    ViewService.list({ sort: 'recent', page: 1, limit: 20 })
      .then(res => {
        if (!cancelled) setViews(res.views);
      })
      .catch(() => {
        if (!cancelled) setError('No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Tablero Principal</h1>
          <p className="text-lg text-slate-600 mt-2 font-medium">Explora las dos caras de la moneda en los temas más relevantes.</p>
        </div>

        <div>
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-500 mt-4 font-medium">Cargando publicaciones...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-red-200">
              <p className="text-red-600 font-bold">{error}</p>
            </div>
          ) : views.length > 0 ? (
            views.map(view => (
              <ThemeCard key={view.id} view={view} />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-700">No hay publicaciones disponibles</h3>
              <p className="text-slate-500 mt-2">Todavía no hay publicaciones para mostrar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}