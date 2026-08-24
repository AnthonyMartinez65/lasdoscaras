import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import { CacheService } from '../services/cache.service';
import FavoriteButton from './FavoriteButton';
import { getSide, getCounterpart } from '../models/view.types';
import type { PoliticalView, ViewSide } from '../models/view.types';

const BADGE_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
];

// El backend no tiene un campo de color para categorías, así que
// derivamos uno consistente a partir del id — la misma categoría
// siempre cae en el mismo color, sin guardar nada nuevo en ningún lado.
function getCategoryColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % BADGE_COLORS.length;
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}

function excerpt(text: string, max = 140): string {
  return text.length > max ? text.slice(0, max).trim() + '…' : text;
}

type SideKey = 'a' | 'b';

interface ThemeCardProps {
  view: PoliticalView;
}

export default function ThemeCard({ view }: ThemeCardProps) {
  const [side, setSide] = useState<ViewSide>(getSide(view));
  const [counterpart, setCounterpart] = useState<ViewSide>(getCounterpart(view));
  const [reacting, setReacting] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const badgeColor = getCategoryColor(view.categoryId);

  const react = async (sideKey: SideKey, type: 'like' | 'dislike') => {
    const auth = CacheService.get<{ token: string }>('lasdoscaras_auth');
    if (!auth?.token) {
      console.warn('Debe iniciar sesión para reaccionar');
      return;
    }

    const current = sideKey === 'a' ? side : counterpart;
    const newReaction = type === 'like' ? 'LIKE' : 'DISLIKE';
    if (current.myReaction === newReaction) return; // ya está en ese estado, no repetimos la llamada

    const key = `${sideKey}-${type}`;
    setReacting(key);
    try {
      await ApiService.request(`/api/views/${view.id}/sides/${sideKey}/${type}`, { method: 'POST' });
      const setter = sideKey === 'a' ? setSide : setCounterpart;
      setter(prev => {
        let { likeCount, dislikeCount } = prev;
        if (prev.myReaction === 'LIKE') likeCount--;
        if (prev.myReaction === 'DISLIKE') dislikeCount--;
        if (newReaction === 'LIKE') likeCount++;
        if (newReaction === 'DISLIKE') dislikeCount++;
        return { ...prev, likeCount, dislikeCount, myReaction: newReaction };
      });
    } catch (err) {
      console.error('Error al reaccionar', err);
    } finally {
      setReacting(null);
    }
  };

  const handleShare = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/views/${view.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${side.title} vs ${counterpart.title}`, url });
      } catch {
        // El usuario canceló el share nativo — no hacemos nada.
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderReactions = (data: ViewSide, sideKey: SideKey, label: string, labelColor: string) => (
    <div className="flex items-center gap-1.5">
      <span className={`text-[10px] font-extrabold uppercase ${labelColor}`}>{label}</span>
      <button
        onClick={() => react(sideKey, 'like')}
        disabled={reacting === `${sideKey}-like`}
        className={`text-xs font-bold px-1.5 py-0.5 rounded-md transition-colors disabled:opacity-50 ${
          data.myReaction === 'LIKE' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        👍 {data.likeCount}
      </button>
      <button
        onClick={() => react(sideKey, 'dislike')}
        disabled={reacting === `${sideKey}-dislike`}
        className={`text-xs font-bold px-1.5 py-0.5 rounded-md transition-colors disabled:opacity-50 ${
          data.myReaction === 'DISLIKE' ? 'bg-red-100 text-red-700' : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        👎 {data.dislikeCount}
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link
            to={`/categories/${view.categoryId}`}
            className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity ${badgeColor}`}
          >
            {view.category?.name}
          </Link>
          <span className="text-xs text-slate-400 font-medium shrink-0">
            {new Date(view.createdAt).toLocaleDateString()}
          </span>
        </div>

        <Link to={`/views/${view.id}`} className="hover:opacity-80 transition-opacity">
          <h3 className="text-lg font-black text-slate-900 leading-snug mb-2">
            {side.title} <span className="text-slate-400 font-normal">vs</span> {counterpart.title}
          </h3>
        </Link>

        <p className="text-sm text-slate-600 leading-relaxed mb-4">{excerpt(side.description)}</p>

        <div className="flex items-center gap-4 mb-3">
          {renderReactions(side, 'a', 'A', 'text-blue-600')}
          {renderReactions(counterpart, 'b', 'B', 'text-purple-600')}
        </div>

        {view.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {view.hashtags.map(tag => (
              <Link
                key={tag.id}
                to={`/?hashtag=${encodeURIComponent(tag.name)}`}
                className="text-[11px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/authors/${view.author.id}`}
          className="text-xs font-bold text-slate-500 hover:text-blue-600 hover:underline truncate"
        >
          Por {view.author.name}
        </Link>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleShare}
            className="text-slate-400 hover:text-blue-600 transition-colors relative"
            aria-label="Compartir"
          >
            🔗
            {copied && (
              <span className="absolute -top-9 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                Enlace copiado
              </span>
            )}
          </button>
          <FavoriteButton viewId={view.id} />
        </div>
      </div>
    </div>
  );
}