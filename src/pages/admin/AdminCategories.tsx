import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { AdminCategoryService } from '../../services/admin-category.service';
import type { Category } from '../../models/category.types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    AdminCategoryService.list()
      .then(setCategories)
      .catch(() => setError('No fue posible cargar las categorías.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      await AdminCategoryService.create(newName.trim());
      setNewName('');
      load();
    } catch (err) {
      console.error('Error al crear la categoría', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await AdminCategoryService.remove(id);
      load();
    } catch (err) {
      console.error('Error al eliminar la categoría', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Categorías</h1>

        <div className="flex gap-2 mb-8">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nombre de la nueva categoría"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            Crear
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <p className="text-red-600 font-bold">{error}</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">{cat.name}</span>
                  {cat.deletedAt && (
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      Inactiva
                    </span>
                  )}
                </div>
                {!cat.deletedAt && (
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    Desactivar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}