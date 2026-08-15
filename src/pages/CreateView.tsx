import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ViewService } from '../services/view.service';
import { CategoryService } from '../services/category.service';
import type { Category } from '../models/category.types';

interface SideForm {
  title: string;
  description: string;
}

export default function CreateView() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [side, setSide] = useState<SideForm>({ title: '', description: '' });
  const [counterpart, setCounterpart] = useState<SideForm>({ title: '', description: '' });
  const [hashtagsText, setHashtagsText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    CategoryService.list().then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId || !side.title || !side.description || !counterpart.title || !counterpart.description) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const hashtags = hashtagsText
        .split(',')
        .map(h => h.trim())
        .filter(Boolean);

      // TODO: por ahora se envía sin fuentes (sources: []) — se agrega el
      // input dinámico de fuentes en el siguiente commit del ciclo.
      const { view } = await ViewService.create({
        categoryId,
        side: { ...side, sources: [] },
        counterpart: { ...counterpart, sources: [] },
        hashtags,
      });
      navigate(`/views/${view.id}`);
    } catch (err) {
      console.error('Error al crear la publicación', err);
      setError('No fue posible crear la publicación. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Nueva Publicación</h1>

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

            <label className="block text-xs font-bold text-slate-500 uppercase mt-5 mb-1.5">Hashtags (separados por coma)</label>
            <input
              value={hashtagsText}
              onChange={e => setHashtagsText(e.target.value)}
              placeholder="economia, comercio, aranceles"
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-600 font-bold text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Publicando...' : 'Publicar'}
          </button>
        </form>
      </main>
    </div>
  );
}