import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SourceBadge from '../components/SourceBadge';
import CommentThreadCard from '../components/CommentThread';
import FavoriteButton from '../components/FavoriteButton';
import { ViewService } from '../services/view.service';
import { CommentService } from '../services/comment.service';
import { CacheService } from '../services/cache.service';
import { getSide, getCounterpart } from '../models/view.types';
import type { PoliticalView, ViewSide } from '../models/view.types';
import type { CommentThread } from '../models/comment.types';

function SideBlock({ data, label, colorClass }: { data: ViewSide; label: string; colorClass: string }) {
  return (
    <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <span className={`px-3 py-1 text-xs font-extrabold uppercase rounded-full ${colorClass}`}>
        {label}
      </span>
      <h3 className="text-2xl font-bold text-slate-900 mt-4 mb-3">{data.title}</h3>
      <p className="text-slate-600 leading-relaxed mb-5 whitespace-pre-line">{data.description}</p>
      {data.sources.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {data.sources.map(source => (
            <SourceBadge key={source.id} source={source} />
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 text-sm font-bold text-slate-500 border-t border-slate-100 pt-4">
        <span>👍 {data.likeCount}</span>
        <span>👎 {data.dislikeCount}</span>
      </div>
    </div>
  );
}

export default function ViewDetail() {
  const { id } = useParams<{ id: string }>();
  const [view, setView] = useState<PoliticalView | null>(null);
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [newThreadText, setNewThreadText] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    ViewService.getById(id)
      .then(res => {
        setView(res.view);
        setIsFavorited(res.view.isFavorite ?? false);
      })
      .catch((err: { status?: number }) => {
        setError(
          err.status === 404
            ? 'Esta publicación no existe o fue eliminada.'
            : 'No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.'
        );
      })
      .finally(() => setLoading(false));

    CommentService.listThreads(id)
      .then(res => setThreads(res.threads))
      .catch(() => {
        // Si fallan los hilos, no bloqueamos el detalle completo — solo esa sección queda vacía.
      });
  }, [id]);

  const handleNewThread = async () => {
    if (!id || !newThreadText.trim()) return;
    if (!CacheService.get<{ token: string }>('lasdoscaras_auth')?.token) {
      console.warn('Debe iniciar sesión para abrir un hilo');
      return;
    }
    try {
      const { thread } = await CommentService.createThread(id, { content: newThreadText.trim() });
      setThreads(prev => [...prev, thread]);
      setNewThreadText('');
    } catch (err) {
      console.error('Error al crear el hilo', err);
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

  if (error || !view) {
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

  const side = getSide(view);
  const counterpart = getCounterpart(view);

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/" className="text-sm font-bold text-blue-600 hover:underline mb-6 inline-block">
          ← Volver al tablero
        </Link>

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <Link
              to={`/categories/${view.categoryId}`}
              className="text-xs font-extrabold text-blue-600 tracking-wider uppercase hover:underline"
            >
              {view.category?.name}
            </Link>
            <h1 className="text-3xl font-black text-slate-900 mt-1">
              {side.title} vs {counterpart.title}
            </h1>
            <Link
              to={`/authors/${view.author.id}`}
              className="text-sm text-slate-500 font-medium mt-1 inline-block hover:text-blue-600 hover:underline"
            >
              Por {view.author.name}
            </Link>

            {view.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {view.hashtags.map(tag => (
                  <Link
                    key={tag.id}
                    to={`/?hashtag=${encodeURIComponent(tag.name)}`}
                    className="text-xs font-bold text-slate-500 bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-full transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <FavoriteButton viewId={view.id} initialFavorited={isFavorited} />
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <SideBlock data={side} label="Postura" colorClass="bg-blue-100 text-blue-700" />
          <SideBlock data={counterpart} label="Contrapostura" colorClass="bg-purple-100 text-purple-700" />
        </div>

        <section>
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Discusión</h2>

          <div className="flex gap-2 mb-6">
            <input
              value={newThreadText}
              onChange={e => setNewThreadText(e.target.value)}
              placeholder="Abrir un nuevo hilo de discusión..."
              className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleNewThread}
              className="bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700"
            >
              Publicar
            </button>
          </div>

          {threads.length > 0 ? (
            threads.map(thread => (
              <CommentThreadCard key={thread.id} viewId={id!} thread={thread} />
            ))
          ) : (
            <p className="text-slate-500 text-sm">Todavía no hay hilos de discusión. ¡Sé el primero!</p>
          )}
        </section>
      </main>
    </div>
  );
}