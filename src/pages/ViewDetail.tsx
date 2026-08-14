import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SourceBadge from '../components/SourceBadge';
import { ViewService } from '../services/view.service';
import type { PoliticalView, ViewSide } from '../models/view.types';

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
        <span>👍 {data.likes}</span>
        <span>👎 {data.dislikes}</span>
      </div>
    </div>
  );
}

export default function ViewDetail() {
  const { id } = useParams<{ id: string }>();
  const [view, setView] = useState<PoliticalView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    ViewService.getById(id)
      .then(res => setView(res.view))
      .catch((err: { status?: number }) => {
        setError(
          err.status === 404
            ? 'Esta publicación no existe o fue eliminada.'
            : 'No fue posible conectar con el servidor. Verifique su conexión e intente de nuevo.'
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

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

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/" className="text-sm font-bold text-blue-600 hover:underline mb-6 inline-block">
          ← Volver al tablero
        </Link>

        <div className="mb-8">
          <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase">
            {view.category?.name}
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            {view.side.title} vs {view.counterpart.title}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Por {view.author.name}</p>

          {view.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {view.hashtags.map(tag => (
                <span key={tag.id} className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <SideBlock data={view.side} label="Postura" colorClass="bg-blue-100 text-blue-700" />
          <SideBlock data={view.counterpart} label="Contrapostura" colorClass="bg-purple-100 text-purple-700" />
        </div>
      </main>
    </div>
  );
}