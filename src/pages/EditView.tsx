import { useState, useEffect, useContext, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Forbidden from './Forbidden';
import NotFound from './NotFound';
import HashtagInput from '../components/HashtagInput';
import SourceInputList, { type SourceDraft } from '../components/SourceInputList';
import { ViewService } from '../services/view.service';
import { CategoryService } from '../services/category.service';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getSide, getCounterpart } from '../models/view.types';
import type { Category } from '../models/category.types';

interface SideForm {
  title: string;
  description: string;
}

export default function EditView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [side, setSide] = useState<SideForm>({ title: '', description: '' });
  const [counterpart, setCounterpart] = useState<SideForm>({ title: '', description: '' });
  const [sideSources, setSideSources] = useState<SourceDraft[]>([]);
  const [counterpartSources, setCounterpartSources] = useState<SourceDraft[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [authorId, setAuthorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    CategoryService.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ViewService.getById(id)
      .then(res => {
        const view = res.view;
        const s = getSide(view);
        const c = getCounterpart(view);
        setAuthorId(view.authorId);
        setCategoryId(view.categoryId);
        setSide({ title: s.title, description: s.description });
        setCounterpart({ title: c.title, description: c.description });
        setSideSources(s.sources.map(({ type, url, label }) => ({ type, url, label: label ?? '' })));
        setCounterpartSources(c.sources.map(({ type, url, label }) => ({ type, url, label: label ?? '' })));
        setHashtags(view.hashtags.map(h => h.name));
      })
      .catch((err: { status?: number }) => {
        if (err.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const cleanSources = (sources: SourceDraft[]) =>
    sources.map(({ type, url, label }) => ({
      type,
      url,
      ...(label.trim() ? { label: label.trim() } : {}),
    }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!categoryId || !side.title || !side.description || !counterpart.title || !counterpart.description) {
      showNotification('Completa todos los campos requeridos.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await ViewService.update(id, {
        categoryId,
        side: { ...side, sources: cleanSources(sideSources) },
        counterpart: { ...counterpart, sources: cleanSources(counterpartSources) },
        hashtags,
      });
      showNotification('Publicación actualizada con éxito.', 'success');
      navigate(`/views/${id}`);
    } catch (err) {
      console.error('Error al actualizar la publicación', err);
      showNotification('No fue posible actualizar la publicación. Intenta de nuevo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (notFound) return <NotFound />;

  // Solo el autor de la publicación o un superadmin pueden editarla.
  const canEdit = user && (user.id === authorId || user.role === 'SUPERADMIN');
  if (!canEdit) return <Forbidden />;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Editar Publicación</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Categoría</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <label className="block text-xs font-bold text-slate-500 uppercase mt-5 mb-1.5">Hashtags</label>
            <HashtagInput value={hashtags} onChange={setHashtags} />
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <span className="inline-block px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-blue-100 text-blue-700 mb-4">
              Postura
            </span>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Título</label>
            <input
              value={side.title}
              onChange={e => setSide(s => ({ ...s, title: e.target.value }))}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descripción</label>
            <textarea
              value={side.description}
              onChange={e => setSide(s => ({ ...s, description: e.target.value }))}
              rows={4}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 mb-5"
            />
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Fuentes</label>
            <SourceInputList sources={sideSources} onChange={setSideSources} />
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <span className="inline-block px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-purple-100 text-purple-700 mb-4">
              Contrapostura
            </span>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Título</label>
            <input
              value={counterpart.title}
              onChange={e => setCounterpart(s => ({ ...s, title: e.target.value }))}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descripción</label>
            <textarea
              value={counterpart.description}
              onChange={e => setCounterpart(s => ({ ...s, description: e.target.value }))}
              rows={4}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 mb-5"
            />
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Fuentes</label>
            <SourceInputList sources={counterpartSources} onChange={setCounterpartSources} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </main>
    </div>
  );
}