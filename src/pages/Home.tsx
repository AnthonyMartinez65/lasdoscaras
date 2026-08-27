import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThemeCard from '../components/ThemeCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import { ViewService, type ViewsSort } from '../services/view.service';
import { CategoryService } from '../services/category.service';
import { CacheService } from '../services/cache.service';
import type { PoliticalView } from '../models/view.types';
import type { Category } from '../models/category.types';

const PAGE_SIZE = 20;

/**
 * Página principal (Tablero).
 * Muestra la lista paginada de publicaciones (debates) y permite filtrar
 * por categoría, ordenamiento y hashtags.
 */
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Leemos filtros cacheados para mantener el estado si el usuario entra a un detalle y regresa
  const cachedFilters = CacheService.get<{ category: string; sort: ViewsSort; hashtag: string }>('lasdoscaras_filters');
  const hashtag = searchParams.get('hashtag') ?? cachedFilters?.hashtag ?? '';

  const [views, setViews] = useState<PoliticalView[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(cachedFilters?.category ?? '');
  const [sort, setSort] = useState<ViewsSort>(cachedFilters?.sort ?? 'recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guardamos en caché local cada vez que cambian los filtros
  useEffect(() => {
    CacheService.set('lasdoscaras_filters', { category: selectedCategory, sort, hashtag });
  }, [selectedCategory, sort, hashtag]);

  useEffect(() => {
    CategoryService.list()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Reseteamos a la página 1 cada vez que cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, sort, hashtag]);

  // Carga principal de datos y manejo de petición asíncrona segura
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    ViewService.list({
      category: selectedCategory || undefined,
      hashtag: hashtag || undefined,
      sort,
      page,
      limit: PAGE_SIZE,
    })
      .then(res => {
        if (!cancelled) {
          setViews(res.views);
          setTotal(res.total);
        }
      })
      .catch(() => {
        if (!cancelled) setError('No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedCategory, sort, hashtag, page]);

  const clearHashtag = () => {
    CacheService.set('lasdoscaras_filters', { category: selectedCategory, sort, hashtag: '' });
    setSearchParams(params => {
      const next = new URLSearchParams(params);
      next.delete('hashtag');
      return next;
    });
  };

  const searchHashtag = (tag: string) => {
    setSearchParams(params => {
      const next = new URLSearchParams(params);
      next.set('hashtag', tag.replace(/^#/, ''));
      return next;
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Tablero Principal</h1>
          <p className="text-lg text-slate-600 mt-2 font-medium">Explora las dos caras de la moneda en los temas más relevantes.</p>
        </div>

        <FilterPanel
          categories={categories}
          selectedCategory={selectedCategory}
          sort={sort}
          onCategoryChange={setSelectedCategory}
          onSortChange={setSort}
          activeHashtag={hashtag || undefined}
          onClearHashtag={clearHashtag}
          onSearchHashtag={searchHashtag}
        />

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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {views.map(view => (
                <ThemeCard key={view.id} view={view} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-700">No hay publicaciones disponibles</h3>
            <p className="text-slate-500 mt-2">Prueba con otros filtros.</p>
          </div>
        )}
      </main>
    </div>
  );
}
