import { useEffect, useState, type FormEvent } from 'react';
import Navbar from '../../components/Navbar';
import AdminNav from '../../components/AdminNav';
import ConfirmButton from '../../components/ConfirmButton';
import { AdminCategoryService } from '../../services/admin-category.service';
import { ViewService } from '../../services/view.service';
import { useNotification } from '../../context/NotificationContext';
import type { Category } from '../../models/category.types';

export default function AdminCategories() {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

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

  useEffect(() => {
    if (categories.length === 0) return;
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        categories.map(async (cat) => {
          try {
            const res = await ViewService.list({ category: cat.id, limit: 1 });
            counts[cat.id] = res.total;
          } catch (e) {
            counts[cat.id] = 0;
          }
        })
      );
      setCategoryCounts(counts);
    };
    fetchCounts();
  }, [categories]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showNotification('El nombre no puede estar vacío.', 'error');
      return;
    }
    try {
      await AdminCategoryService.create(newName.trim());
      showNotification('Categoría creada.', 'success');
      setNewName('');
      load();
    } catch (err) {
      console.error('Error al crear la categoría', err);
      showNotification('No fue posible crear la categoría.', 'error');
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) {
      showNotification('El nombre no puede estar vacío.', 'error');
      return;
    }
    try {
      await AdminCategoryService.update(id, editingName.trim());
      showNotification('Categoría actualizada.', 'success');
      setEditingId(null);
      load();
    } catch (err) {
      console.error('Error al actualizar la categoría', err);
      showNotification('No fue posible actualizar la categoría.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (categoryCounts[id] > 0) {
      showNotification('No puedes eliminar una categoría que tiene publicaciones asociadas.', 'error');
      return;
    }

    try {
      await AdminCategoryService.remove(id);
      showNotification('Categoría eliminada.', 'success');
      load();
    } catch (err) {
      console.error('Error al eliminar la categoría', err);
      showNotification('No fue posible eliminar la categoría.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-slate-900 mb-6">Categorías</h1>
        <AdminNav />

        <form onSubmit={handleCreate} className="flex gap-2 mb-8">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nombre de la nueva categoría"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700"
          >
            Crear
          </button>
        </form>

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
                {editingId === cat.id ? (
                  <input
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm mr-3"
                    autoFocus
                  />
                ) : (
                  <div className="flex flex-col">
                    <span className={`font-bold ${cat.deletedAt ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {cat.name}
                      {cat.deletedAt && <span className="ml-2 text-xs font-normal text-slate-400">(eliminada)</span>}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      {categoryCounts[cat.id] !== undefined ? `${categoryCounts[cat.id]} publicaciones asociadas` : 'Cargando publicaciones...'}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  {editingId === cat.id ? (
                    <>
                      <button onClick={() => handleUpdate(cat.id)} className="text-xs font-bold text-blue-600 hover:underline">
                        Guardar
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-xs font-bold text-slate-500 hover:underline">
                        Cancelar
                      </button>
                    </>
                  ) : !cat.deletedAt ? (
                    <>
                      <button onClick={() => startEdit(cat)} className="text-xs font-bold text-blue-600 hover:underline">
                        Editar
                      </button>
                      <ConfirmButton
                        onConfirm={() => handleDelete(cat.id)}
                        confirmLabel="¿Eliminar?"
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Eliminar
                      </ConfirmButton>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}