import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThemeCard from '../components/ThemeCard';
import { SearchService } from '../services/search.service';
import type { PoliticalView } from '../models/view.types';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [views, setViews] = useState<PoliticalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setViews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    SearchService.search({ query })
      .then(res => setViews(res.views))
      .catch(() => setError('No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.'))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-8">
          Resultados para "<span className="text-blue-600">{query}</span>"
        </h1>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-red-200">
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        ) : views.length > 0 ? (
          views.map(view => <ThemeCard key={view.id} view={view} />)
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-700">Sin resultados</h3>
            <p className="text-slate-500 mt-2">
              Prueba con otros términos, o vuelve al{' '}
              <Link to="/" className="text-blue-600 font-bold hover:underline">tablero</Link>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}