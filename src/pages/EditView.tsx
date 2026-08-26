import { useState, useEffect, useContext, type SubmitEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ViewService } from '../services/view.service';
import { CategoryService } from '../services/category.service';
import { useNotification } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import type { Category } from '../models/category.types';

export default function EditView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user } = useContext(AuthContext);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [hashtags, setHashtags] = useState('');

  const [sideATitle, setSideATitle] = useState('');
  const [sideADesc, setSideADesc] = useState('');

  const [sideBTitle, setSideBTitle] = useState('');
  const [sideBDesc, setSideBDesc] = useState('');

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      CategoryService.list(),
      ViewService.getById(id)
    ])
      .then(([cats, { view }]) => {
        // Verificar permisos
        if (user?.id !== view.author.id && user?.role !== 'SUPERADMIN') {
          navigate('/403');
          return;
        }

        setCategories(cats);
        setCategoryId(view.categoryId || '');
        setHashtags(view.hashtags.map(h => h.name).join(', '));

        const sideA = view.sides.find(s => s.type === 'SIDE');
        const sideB = view.sides.find(s => s.type === 'COUNTERPART');

        if (sideA) {
          setSideATitle(sideA.title);
          setSideADesc(sideA.description);
        }
        if (sideB) {
          setSideBTitle(sideB.title);
          setSideBDesc(sideB.description);
        }

        setInitialData({
          categoryId: view.categoryId || '',
          hashtags: view.hashtags.map(h => h.name).join(', '),
          sideATitle: sideA?.title || '',
          sideADesc: sideA?.description || '',
          sideBTitle: sideB?.title || '',
          sideBDesc: sideB?.description || ''
        });

      })
      .catch(() => {
        showNotification('Error al cargar la publicación', 'error');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, user, navigate, showNotification]);

  const hasChanges = () => {
    if (!initialData) return false;
    return (
      categoryId !== initialData.categoryId ||
      hashtags !== initialData.hashtags ||
      sideATitle !== initialData.sideATitle ||
      sideADesc !== initialData.sideADesc ||
      sideBTitle !== initialData.sideBTitle ||
      sideBDesc !== initialData.sideBDesc
    );
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    if (sideADesc.length < 100 || sideBDesc.length < 100) {
      showNotification('La descripción de cada postura debe tener al menos 100 caracteres.', 'warning');
      return;
    }

    try {
      const payload = {
        categoryId,
        hashtags: hashtags.split(',').map(t => t.trim()).filter(Boolean),
        side: {
          title: sideATitle,
          description: sideADesc,
          sources: []
        },
        counterpart: {
          title: sideBTitle,
          description: sideBDesc,
          sources: []
        }
      };

      const { view } = await ViewService.update(id, payload);
      showNotification('Publicación actualizada', 'success');
      navigate(`/views/${view.id}`);
    } catch (err: any) {
      showNotification(err.message || 'Error al actualizar', 'error');
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('Tienes cambios sin guardar. ¿Seguro que deseas cancelar?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-20 text-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 mt-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Editar Publicación</h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Categoría</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 bg-white dark:bg-slate-700"
                required
              >
                <option value="">Seleccione una categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hashtags (separados por coma)</label>
              <input
                value={hashtags}
                onChange={e => setHashtags(e.target.value)}
                placeholder="politica, debate, 2026"
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 bg-white dark:bg-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <h2 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-4">Postura (Lado A)</h2>
              <input
                value={sideATitle}
                onChange={e => setSideATitle(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 mb-4 bg-white dark:bg-slate-700"
                required
              />
              <textarea
                value={sideADesc}
                onChange={e => setSideADesc(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 h-40 bg-white dark:bg-slate-700"
                required
                minLength={100}
              />
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50">
              <h2 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-4">Contrapostura (Lado B)</h2>
              <input
                value={sideBTitle}
                onChange={e => setSideBTitle(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 mb-4 bg-white dark:bg-slate-700"
                required
              />
              <textarea
                value={sideBDesc}
                onChange={e => setSideBDesc(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 h-40 bg-white dark:bg-slate-700"
                required
                minLength={100}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-slate-100 dark:border-slate-700 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!hasChanges()}
              className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}