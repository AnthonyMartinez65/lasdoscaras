import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NotFound from './NotFound';
import ThemeCard from '../components/ThemeCard';
import { CategoryService } from '../services/category.service';
import { ViewService } from '../services/view.service';
import type { Category } from '../models/category.types';
import type { PoliticalView } from '../models/view.types';

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extraemos los filtros de la URL (si existen)
  const hashtag = searchParams.get('hashtag') || '';
  const sort = (searchParams.get('sort') as 'recent' | 'popular') || 'recent';

  const [category, setCategory] = useState<Category | null>(null);
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
      CategoryService.getById(id).then(cat => {
        if (!cat) setNotFound(true);
        else setCategory(cat);
      }),
      // Pasamos los filtros de sort y hashtag a la API (con el as any para TypeScript)
      ViewService.list({ category: id, sort: sort as any, hashtag, page: 1, limit: 50 }).then(res => setViews(res.views))
    ])
      .catch(() => setError('No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.'))
      .finally(() => setLoading(false));
  }, [id, sort, hashtag]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (notFound) return <NotFound />;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="max-w-2xl mx-auto text-center py-24 px-4">
          <p className="text-red-600 font-bold mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumbs requeridos por el PR */}
        <nav className="flex text-sm text-slate-500 dark:text-slate-400 mb-6 gap-2">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Inicio</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-blue-600 dark:hover:text-blue-400">Categorías</Link>
          <span>/</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{category?.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 tracking-wider uppercase">Categoría</span>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              {category?.name}
            </h1>
            {/* Conteo de publicaciones requerido por el PR */}
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {views.length} {views.length === 1 ? 'publicación' : 'publicaciones'}
            </p>
          </div>
          
          {/* Filtros requeridos por el PR */}
          <div className="flex items-center gap-3">
            {hashtag && (
              <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                <span>#{hashtag}</span>
                <button onClick={() => { searchParams.delete('hashtag'); setSearchParams(searchParams); }} className="hover:text-blue-900 dark:hover:text-white">✕</button>
              </div>
            )}
            <select
              value={sort}
              onChange={(e) => { searchParams.set('sort', e.target.value); setSearchParams(searchParams); }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="recent">Más recientes</option>
              <option value="popular">Más populares</option>
            </select>
          </div>
        </div>

        {views.length > 0 ? (
          /* Grilla de 2 columnas requerida por el PR */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {views.map(view => <ThemeCard key={view.id} view={view} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No hay publicaciones en esta categoría todavía</h3>
          </div>
        )}
      </main>
    </div>
  );
}