import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThemeCard from '../components/ThemeCard';
import Pagination from '../components/Pagination';
import { SearchService } from '../services/search.service';
import type { ViewsSort } from '../services/view.service';
import type { PoliticalView } from '../models/view.types';

const PAGE_SIZE = 10;

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [views, setViews] = useState<PoliticalView[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ViewsSort>('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query, sort]);

  useEffect(() => {
    if (!query.trim()) {
      setViews([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    SearchService.search({ query, sort, page, limit: PAGE_SIZE })
      .then(res => {
        setViews(res.views);
        setTotal(res.total);
      })
      .catch(() => setError('No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.'))
      .finally(() => setLoading(false));
  }, [query, sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">
            {total} resultado{total !== 1 ? 's' : ''} para "<span className="text-blue-600">{query}</span>"
          </h1>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as ViewsSort)}
            className="border border-slate-300 rounded-xl p-2.5 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Más recientes</option>
            <option value="likes">Más likes</option>
            <option value="dislikes">Más dislikes</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-red-200">
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        ) : views.length > 0 ? (
          <>
            {views.map(view => <ThemeCard key={view.id} view={view} />)}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
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