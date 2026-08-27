import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ThemeCard from '../components/ThemeCard';
import Tabs from '../components/Tabs';
import ConfirmButton from '../components/ConfirmButton';
import { AuthContext } from '../context/AuthContext';
import { AuthorService } from '../services/author.service';
import { ViewService } from '../services/view.service';
import { FavoriteService } from '../services/favorite.service';
import { HistoryService } from '../services/history.service';
import type { AuthorProfile } from '../models/author.types';
import type { PoliticalView } from '../models/view.types';
import type { HistoryEntry } from '../models/history.types';

function ViewList({
  views,
  emptyMessage,
  showActions,
}: {
  views: PoliticalView[];
  emptyMessage: string;
  showActions?: boolean;
}) {
  if (views.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {views.map(view => (
        <div key={view.id}>
          {showActions && (
            <div className="flex items-start justify-between gap-2 mb-2">
              {view.status === 'UNPUBLISHED' ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-2 rounded-xl flex-1">
                  ⚠️ Despublicada por un superadministrador.
                </div>
              ) : <div />}
              <Link
                to={`/views/${view.id}/edit`}
                className="text-xs font-bold text-blue-600 hover:underline shrink-0 mt-1"
              >
                Editar
              </Link>
            </div>
          )}
          <ThemeCard view={view} />
        </div>
      ))}
    </div>
  );
}

function HistoryList({ entries, onClear }: { entries: HistoryEntry[]; onClear: () => void }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">Todavía no visitaste ninguna publicación.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-end mb-4">
        <ConfirmButton
          onConfirm={onClear}
          confirmLabel="¿Borrar todo?"
          className="text-xs font-bold text-red-600 hover:underline"
        >
          Limpiar historial
        </ConfirmButton>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {entries.map(entry => (
          <Link
            key={entry.viewId}
            to={`/views/${entry.viewId}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="font-bold text-slate-800">{entry.title}</p>
              <p className="text-xs text-slate-500">{entry.category}</p>
            </div>
            <span className="text-xs text-slate-400 shrink-0">
              {new Date(entry.visitedAt).toLocaleString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [myViews, setMyViews] = useState<PoliticalView[]>([]);
  const [favorites, setFavorites] = useState<PoliticalView[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>(() => HistoryService.getAll());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      AuthorService.getById(user.id).then(res => setProfile(res.author)),
      ViewService.list({ authorId: user.id, limit: 50 }).then(res => setMyViews(res.views)),
      FavoriteService.getMyFavoriteViews().then(setFavorites).catch(() => {
        // Si fallan los favoritos, no bloqueamos el resto del perfil.
      }),
    ])
      .catch(() => setError('No fue posible cargar tu perfil. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, [user]);

  const clearHistory = () => {
    HistoryService.clear();
    setHistory([]);
  };

  if (!user) return null; // la ruta ya está protegida por PrivateRoute

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-10">
          <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
          <p className="text-slate-500 font-medium">{user.email}</p>
          <p className="text-xs text-slate-400 mt-2 uppercase font-bold tracking-wide">{user.role}</p>
          {profile && (
            <p className="text-xs text-slate-400 mt-1">
              Miembro desde {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <p className="text-red-600 font-bold">{error}</p>
        ) : (
          <Tabs
            tabs={[
              {
                label: 'Mis publicaciones',
                content: <ViewList views={myViews} emptyMessage="Todavía no has publicado nada." showActions />,
              },
              {
                label: 'Favoritos',
                content: <ViewList views={favorites} emptyMessage="Todavía no marcaste ninguna publicación como favorita." />,
              },
              {
                label: 'Historial',
                content: <HistoryList entries={history} onClear={clearHistory} />,
              },
            ]}
          />
        )}

        {!loading && myViews.length === 0 && (
          <Link to="/views/new" className="text-blue-600 font-bold hover:underline mt-4 inline-block">
            Crear tu primera publicación
          </Link>
        )}
      </main>
    </div>
  );
}