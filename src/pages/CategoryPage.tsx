import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThemeCard from '../components/ThemeCard';
import { CategoryService } from '../services/category.service';
import { ViewService } from '../services/view.service';
import type { Category } from '../models/category.types';
import type { PoliticalView } from '../models/view.types';

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [views, setViews] = useState<PoliticalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      CategoryService.getById(id).then(cat => setCategory(cat ?? null)),
      ViewService.list({ category: id, sort: 'recent', page: 1, limit: 20 }).then(res => setViews(res.views)),
    ])
      .catch(() => setError('No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.'))
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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="max-w-2xl mx-auto text-center py-24 px-4">
          <p className="text-red-600 font-bold mb-4">{error}</p>
          <Link to="/" className="text-blue-600 font-bold hover:underline">Volver al tablero</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase">Categoría</span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-8">
          {category ? category.name : 'Categoría'}
        </h1>

        {views.length > 0 ? (
          views.map(view => <ThemeCard key={view.id} view={view} />)
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-700">No hay publicaciones en esta categoría todavía</h3>
          </div>
        )}
      </main>
    </div>
  );
}