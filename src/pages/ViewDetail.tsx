/**
 * Vista de Detalle de Publicación.
 * Muestra el contenido completo de un debate, incluyendo Lado A, Lado B,
 * las fuentes embebidas (ej. YouTube), estadísticas y el hilo de comentarios.
 */
import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NotFound from './NotFound';
import SourceBadge from '../components/SourceBadge';
import CommentThreadCard from '../components/CommentThread';
import FavoriteButton from '../components/FavoriteButton';
import { ViewService } from '../services/view.service';
import { CommentService } from '../services/comment.service';
import { CacheService } from '../services/cache.service';
import { HistoryService } from '../services/history.service';
import { ReactionService } from '../services/reaction.service';
import { AdminViewService } from '../services/adminView.service';
import { useNotification } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import { getSide, getCounterpart } from '../models/view.types';
import type { PoliticalView, ViewSide, Source } from '../models/view.types';
import type { CommentThread } from '../models/comment.types';

const ShareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
  </svg>
);

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Componente interno para renderizar cada lado del debate (A o B).
 * Muestra el título, descripción, fuentes y botones de reacción (Me Gusta / No Me Gusta).
 */
function SideBlock({ data, label, colorClass, onReact }: { data: ViewSide; label: string; colorClass: string; onReact: (type: 'like' | 'dislike') => void }) {
  return (
    <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm min-w-0">
      <span className={`px-3 py-1 text-xs font-extrabold uppercase rounded-full ${colorClass}`}>
        {label}
      </span>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-3 break-words">{data.title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-5 whitespace-pre-line break-words">{data.description}</p>
      {data.sources.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {data.sources.map(source => (
            <SourceBadge key={source.id} source={source} />
          ))}
        </div>
      )}
      {data.sources.filter((s: Source) => s.type === 'YOUTUBE').map((source: Source) => {
        const ytId = getYoutubeId(source.url);
        if (!ytId) return null;
        return (
          <div key={`yt-${source.id}`} className="mb-5 rounded-xl overflow-hidden shadow-sm aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${ytId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      })}
      <div className="flex items-center gap-4 text-sm font-bold text-slate-500 border-t border-slate-100 pt-4">
        <button onClick={() => onReact('like')} className={`flex items-center gap-1 transition-colors ${data.myReaction === 'LIKE' ? 'text-green-600 scale-110' : 'hover:text-green-600'}`} title="Dar Me Gusta">
          👍 {data.likeCount}
        </button>
        <button onClick={() => onReact('dislike')} className={`flex items-center gap-1 transition-colors ${data.myReaction === 'DISLIKE' ? 'text-red-600 scale-110' : 'hover:text-red-600'}`} title="Dar No Me Gusta">
          👎 {data.dislikeCount}
        </button>
      </div>
    </div>
  );
}

export default function ViewDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const [view, setView] = useState<PoliticalView | null>(null);
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [newThreadText, setNewThreadText] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Efecto principal para cargar los detalles del debate, registrar en el historial
  // y cargar los hilos de comentarios asíncronamente.
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    ViewService.getById(id)
      .then(res => {
        setView(res.view);
        const s = getSide(res.view);
        const c = getCounterpart(res.view);
        HistoryService.record({
          viewId: res.view.id,
          title: `${s.title} vs ${c.title}`,
          category: res.view.category?.name ?? '',
        });
      })
      .catch((err: { status?: number }) => {
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError('No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.');
        }
      })
      .finally(() => setLoading(false));

    CommentService.listThreads(id)
      .then(res => setThreads(res.threads))
      .catch(() => {
        // Fallback silencioso: si fallan los hilos, no bloqueamos el detalle completo.
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

  if (notFound) {
    return <NotFound />;
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
  const canEdit = user && (user.id === view.author.id || user.role === 'SUPERADMIN');

  /**
   * Registra una reacción del usuario hacia un lado específico del debate.
   * Refresca la vista completa para actualizar los contadores desde el servidor.
   */
  const handleReact = async (sideLetter: 'a' | 'b', type: 'like' | 'dislike') => {
    if (!user) {
      alert('Debes iniciar sesión para votar.');
      return;
    }
    try {
      await ReactionService.react(view!.id, sideLetter, type);
      const updated = await ViewService.getById(view!.id);
      setView(updated.view);
    } catch (error) {
      console.error('Error reacting', error);
      alert('No se pudo registrar el voto. Intenta de nuevo.');
    }
  };

  /**
   * Maneja el botón de compartir utilizando la Web Share API si está disponible,
   * o copiando el enlace al portapapeles como fallback.
   */
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!view) return;
    const url = `${window.location.origin}/views/${view.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Las Dos Caras: ${getSide(view).title} vs ${getCounterpart(view)?.title}`,
          url: url
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      showNotification('¡Enlace copiado al portapapeles!', 'success');
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('¿Estás seguro de que deseas despublicar esta vista?')) return;
    try {
      await AdminViewService.unpublish(view!.id);
      showNotification('Publicación despublicada con éxito', 'success');
      navigate('/');
    } catch (err: any) {
      showNotification(err.message || 'Error al despublicar', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => navigate(-1)} className="text-sm font-bold text-blue-600 hover:underline mb-6 inline-block">
          ← Volver
        </button>

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
            <p className="text-xs text-slate-400 font-medium mt-1">
              Publicado el {new Date(view.createdAt).toLocaleDateString()}
            </p>
            <Link
              to={`/authors/${view.author.id}`}
              className="text-sm text-slate-500 font-medium mt-1 inline-block hover:text-blue-600 hover:underline"
            >
              Por {view.author.name}
            </Link>
            {canEdit && (
              <Link
                to={`/views/${view.id}/edit`}
                className="text-sm font-bold text-blue-600 hover:underline mt-1 ml-3 inline-block"
              >
                Editar
              </Link>
            )}
            {user?.role === 'SUPERADMIN' && (
              <button
                onClick={handleUnpublish}
                className="text-sm font-bold text-red-600 hover:underline mt-1 ml-3 inline-block"
              >
                Despublicar (Admin)
              </button>
            )}

            {view.hashtags && view.hashtags.length > 0 && (
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
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors"
              title="Compartir"
            >
              <ShareIcon className="w-6 h-6" />
            </button>
            <FavoriteButton viewId={view.id} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <SideBlock data={side} label="Postura" colorClass="bg-blue-100 text-blue-700" onReact={(type) => handleReact('a', type)} />
          <SideBlock data={counterpart} label="Contrapostura" colorClass="bg-purple-100 text-purple-700" onReact={(type) => handleReact('b', type)} />
        </div>

        <section>
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Discusión</h2>

          {user ? (
            <div className="mb-6">
              <div className="flex flex-col gap-2">
                <textarea
                  value={newThreadText}
                  onChange={e => setNewThreadText(e.target.value)}
                  placeholder="Abrir un nuevo hilo de discusión..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-3">
                  <p className="text-xs text-slate-500 italic max-w-xl">
                    Nota: Los comentarios son moderados por Inteligencia Artificial. Lenguaje de odio o spam será bloqueado.
                  </p>
                  <button
                    onClick={handleNewThread}
                    className="bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap self-end sm:self-auto"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center mb-6">
              <p className="text-slate-600 text-sm">
                Debes <Link to="/login" className="text-blue-600 hover:underline font-bold">iniciar sesión</Link> para unirte a la discusión.
              </p>
            </div>
          )}

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