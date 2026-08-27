import { useState, useEffect, useContext, type SubmitEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HashtagInput from '../components/HashtagInput';
import SourceInput, { type SourceData } from '../components/SourceInput';
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
  const [hashtags, setHashtags] = useState<string[]>([]);

  const [sideATitle, setSideATitle] = useState('');
  const [sideADesc, setSideADesc] = useState('');

  const [sideBTitle, setSideBTitle] = useState('');
  const [sideBDesc, setSideBDesc] = useState('');

  const [sideASources, setSideASources] = useState<SourceData[]>([]);
  const [sideBSources, setSideBSources] = useState<SourceData[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        setHashtags(view.hashtags.map(h => h.name));

        const sideA = view.sides.find(s => s.type === 'SIDE');
        const sideB = view.sides.find(s => s.type === 'COUNTERPART');

        if (sideA) {
          setSideATitle(sideA.title);
          setSideADesc(sideA.description);
          if (sideA.sources) setSideASources(sideA.sources.map(s => ({ type: s.type, url: s.url, label: s.label || '' })));
        }
        if (sideB) {
          setSideBTitle(sideB.title);
          setSideBDesc(sideB.description);
          if (sideB.sources) setSideBSources(sideB.sources.map(s => ({ type: s.type, url: s.url, label: s.label || '' })));
        }

        setInitialData({
          categoryId: view.categoryId || '',
          hashtags: JSON.stringify(view.hashtags.map(h => h.name)),
          sideATitle: sideA?.title || '',
          sideADesc: sideA?.description || '',
          sideBTitle: sideB?.title || '',
          sideBDesc: sideB?.description || '',
          sideASources: JSON.stringify(sideA?.sources?.map(s => ({ type: s.type, url: s.url, label: s.label || '' })) || []),
          sideBSources: JSON.stringify(sideB?.sources?.map(s => ({ type: s.type, url: s.url, label: s.label || '' })) || [])
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
      JSON.stringify(hashtags) !== initialData.hashtags ||
      sideATitle !== initialData.sideATitle ||
      sideADesc !== initialData.sideADesc ||
      sideBTitle !== initialData.sideBTitle ||
      sideBDesc !== initialData.sideBDesc ||
      JSON.stringify(sideASources) !== initialData.sideASources ||
      JSON.stringify(sideBSources) !== initialData.sideBSources
    );
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    if (sideADesc.length < 100 || sideBDesc.length < 100) {
      showNotification('La descripción de cada postura debe tener al menos 100 caracteres.', 'warning');
      return;
    }

    const validSourcesA = sideASources.filter(s => s.url.trim() !== '');
    const validSourcesB = sideBSources.filter(s => s.url.trim() !== '');

    if (validSourcesA.length === 0 || validSourcesB.length === 0) {
      showNotification('Debes añadir al menos una fuente válida (enlace) para cada postura (Lado A y Lado B).', 'warning');
      return;
    }

    if (validSourcesA.some(s => !s.label.trim()) || validSourcesB.some(s => !s.label.trim())) {
      showNotification('Por favor, escribe una Etiqueta para cada una de las fuentes que agregaste.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        categoryId,
        hashtags: hashtags,
        side: {
          title: sideATitle,
          description: sideADesc,
          sources: validSourcesA
        },
        counterpart: {
          title: sideBTitle,
          description: sideBDesc,
          sources: validSourcesB
        }
      };

      const { view } = await ViewService.update(id, payload);
      showNotification('¡Publicación actualizada!', 'success');
      setInitialData({
        categoryId: view.categoryId || '',
        hashtags: JSON.stringify(view.hashtags.map(h => h.name)),
        sideATitle: sideATitle,
        sideADesc: sideADesc,
        sideBTitle: sideBTitle,
        sideBDesc: sideBDesc,
        sideASources: JSON.stringify(sideASources),
        sideBSources: JSON.stringify(sideBSources)
      });
      navigate(`/views/${id}`);
    } catch (err: any) {
      showNotification(err.message || 'Error al actualizar', 'error');
    } finally {
      setIsSubmitting(false);
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

        <form 
          onSubmit={handleSubmit} 
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700"
        >

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
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hashtags</label>
              <HashtagInput value={hashtags} onChange={setHashtags} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-full mb-3 uppercase tracking-wider">
                Postura A
              </span>
              <input
                type="text"
                value={sideATitle}
                onChange={e => setSideATitle(e.target.value)}
                placeholder="Título corto de esta postura..."
                className="w-full text-xl font-bold border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 mb-2 bg-white dark:bg-slate-700"
                required
                maxLength={120}
              />
              <div className="text-right text-xs text-slate-500 mb-4">
                {sideATitle.length} / 120 max
              </div>
              <textarea
                value={sideADesc}
                onChange={e => setSideADesc(e.target.value)}
                placeholder="Desarrolla los argumentos de esta postura..."
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 min-h-[150px] resize-none"
                required
                
              />
              <div className="mt-4">
                <label className="block text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">Fuentes y Enlaces</label>
                <SourceInput value={sideASources} onChange={setSideASources} />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50">
              <span className="inline-block px-3 py-1 bg-purple-600 text-white text-xs font-black rounded-full mb-3 uppercase tracking-wider">
                Contrapostura B
              </span>
              <input
                type="text"
                value={sideBTitle}
                onChange={e => setSideBTitle(e.target.value)}
                placeholder="Título de la postura contraria..."
                className="w-full text-xl font-bold border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 mb-2 bg-white dark:bg-slate-700"
                required
                maxLength={120}
              />
              <div className="text-right text-xs text-slate-500 mb-4">
                {sideBTitle.length} / 120 max
              </div>
              <textarea
                value={sideBDesc}
                onChange={e => setSideBDesc(e.target.value)}
                placeholder="Desarrolla los argumentos de la contrapostura..."
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 min-h-[150px] resize-none"
                required
                
              />
              <div className="mt-4">
                <label className="block text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">Fuentes y Enlaces</label>
                <SourceInput value={sideBSources} onChange={setSideBSources} />
              </div>
            </div>
          </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!hasChanges() || isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/30 disabled:shadow-none"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
        </form>
      </main>
    </div>
  );
}
