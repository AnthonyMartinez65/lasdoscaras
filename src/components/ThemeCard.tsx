import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import { CacheService } from '../services/cache.service';
import FavoriteButton from './FavoriteButton';
import type { PoliticalView, ViewSide } from '../models/view.types';

interface ThemeCardProps {
  view: PoliticalView;
  isFavorited?: boolean;
}

type SideKey = 'a' | 'b';

export default function ThemeCard({ view, isFavorited }: ThemeCardProps) {
  const [side, setSide] = useState<ViewSide>(view.side);
  const [counterpart, setCounterpart] = useState<ViewSide>(view.counterpart);
  const [reacting, setReacting] = useState(false);

  const react = async (sideKey: SideKey, type: 'like' | 'dislike') => {
    if (reacting) return;

    const auth = CacheService.get<{ token: string }>('lasdoscaras_auth');
    if (!auth?.token) {
      console.warn('Debe iniciar sesión para reaccionar');
      return;
    }

    setReacting(true);
    try {
      await ApiService.request(`/api/views/${view.id}/sides/${sideKey}/${type}`, { method: 'POST' });
      const setter = sideKey === 'a' ? setSide : setCounterpart;
      setter(prev => ({
        ...prev,
        likes: type === 'like' ? prev.likes + 1 : prev.likes,
        dislikes: type === 'dislike' ? prev.dislikes + 1 : prev.dislikes,
      }));
    } catch (err) {
      console.error('Error al reaccionar', err);
    } finally {
      setReacting(false);
    }
  };

  const renderSide = (data: ViewSide, sideKey: SideKey, label: string) => {
    const badgeColor = sideKey === 'a' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

    return (
      <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex justify-between items-start mb-4">
            <span className={`px-3 py-1 text-xs font-extrabold uppercase rounded-full ${badgeColor}`}>
              {label}
            </span>
          </div>
          <h4 className="text-xl font-bold text-slate-800 mb-3 leading-tight">{data.title}</h4>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">{data.description}</p>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
          <button
            onClick={() => react(sideKey, 'like')}
            disabled={reacting}
            className="flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            <span>👍 {data.likes}</span>
          </button>
          <button
            onClick={() => react(sideKey, 'dislike')}
            disabled={reacting}
            className="flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <span>👎 {data.dislikes}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 rounded-3xl shadow-lg border border-slate-200 overflow-hidden mb-10 transition-transform hover:-translate-y-1 duration-300">
      <div className="px-8 py-6 border-b border-slate-200 bg-white flex items-start justify-between gap-4">
        <div className="flex-1">
          <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase mb-1 block">
            {view.category?.name}
          </span>
          <Link to={`/views/${view.id}`} className="hover:opacity-80 transition-opacity block">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{side.title} vs {counterpart.title}</h3>
          </Link>
          <Link
            to={`/authors/${view.author.id}`}
            className="text-xs text-slate-500 font-medium hover:text-blue-600 hover:underline"
          >
            Por {view.author.name}
          </Link>
        </div>
        <FavoriteButton viewId={view.id} initialFavorited={isFavorited} />
      </div>

      <div className="p-8 flex flex-col md:flex-row gap-6 lg:gap-10">
        {renderSide(side, 'a', 'Postura')}
        <div className="hidden md:flex flex-col items-center justify-center opacity-20">
          <div className="w-px h-16 bg-slate-900"></div>
          <span className="my-3 font-black text-slate-900 text-lg">VS</span>
          <div className="w-px h-16 bg-slate-900"></div>
        </div>
        {renderSide(counterpart, 'b', 'Contrapostura')}
      </div>
    </div>
  );
}