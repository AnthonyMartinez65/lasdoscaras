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
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <p className="text-slate-500 dark:text-slate-400 font-medium">{emptyMessage}</p>
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
                <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-xs font-bold px-3 py-2 rounded-xl flex-1">
                  ⚠️ Despublicada por un superadministrador.
                </div>
              ) : <div />}
              <Link
                to={`/views/${view.id}/edit`}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 mt-1"
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
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <p className="text-slate-500 dark:text-slate-400 font-medium">Todavía no visitaste ninguna publicación.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-end mb-4">
        <ConfirmButton
          onConfirm={onClear}
          confirmLabel="¿Borrar todo?"
          className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
        >
          Limpiar historial
        </ConfirmButton>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden">
        {entries.map(entry => (
          <Link
            key={entry.viewId}
            to={`/views/${entry.viewId}`}
            className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{entry.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{entry.category}</p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
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
      // CORRECCIÓN APLICADA: getFavorites()
      FavoriteService.getFavorites().then(setFavorites).catch(() => {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-20 transition-colors">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-10 flex flex-col items-start">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{user.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-3">{user.email}</p>
          
          {/* Badge de Rol Prominente requerido por el PR */}
          <span className={`text-xs font-extrabold uppercase px-3 py-1.5 rounded-lg tracking-wider ${
            user.role === 'SUPERADMIN' 
              ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' 
              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
          }`}>
            Rol: {user.role}
          </span>
          
          {profile && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 font-bold">
              Miembro desde el {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-red-200 dark:border-red-900/50 text-center">
            <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
          </div>
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
          <Link to="/views/new" className="text-blue-600 dark:text-blue-400 font-bold hover:underline mt-4 inline-block">
            Crear tu primera publicación
          </Link>
        )}
      </main>
    </div>
  );
}