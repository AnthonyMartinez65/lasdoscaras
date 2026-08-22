import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import AdminNav from '../../components/AdminNav';
import ConfirmButton from '../../components/ConfirmButton';
import { AdminViewService } from '../../services/adminView.service';
import { useNotification } from '../../context/NotificationContext';
import { getSide, getCounterpart } from '../../models/view.types';
import type { PoliticalView } from '../../models/view.types';

export default function AdminViews() {
  const { showNotification } = useNotification();
  const [views, setViews] = useState<PoliticalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    AdminViewService.list({ limit: 50 })
      .then(res => setViews(res.views))
      .catch(() => setError('No fue posible cargar las publicaciones.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleTogglePublish = async (view: PoliticalView) => {
    setActingOn(view.id);
    try {
      if (view.status === 'PUBLISHED') {
        await AdminViewService.unpublish(view.id);
        showNotification('Publicación despublicada.', 'success');
      } else {
        await AdminViewService.publish(view.id);
        showNotification('Publicación restaurada.', 'success');
      }
      load();
    } catch (err) {
      console.error('Error al cambiar el estado de la publicación', err);
      showNotification('No fue posible actualizar la publicación.', 'error');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-slate-900 mb-6">Publicaciones</h1>
        <AdminNav />

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <p className="text-red-600 font-bold">{error}</p>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {views.map(view => {
              const side = getSide(view);
              const counterpart = getCounterpart(view);
              return (
                <div key={view.id} className="flex items-center justify-between px-5 py-4 gap-4">
                  <div className="min-w-0">
                    <Link to={`/views/${view.id}`} className="font-bold text-slate-800 hover:text-blue-600 truncate block">
                      {side.title} vs {counterpart.title}
                    </Link>
                    <p className="text-xs text-slate-500">Por {view.author.name} · {view.category?.name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      view.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {view.status}
                    </span>
                    {view.status === 'PUBLISHED' ? (
                      <ConfirmButton
                        onConfirm={() => handleTogglePublish(view)}
                        confirmLabel="¿Despublicar?"
                        disabled={actingOn === view.id}
                        className="text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        Despublicar
                      </ConfirmButton>
                    ) : (
                      <button
                        onClick={() => handleTogglePublish(view)}
                        disabled={actingOn === view.id}
                        className="text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Publicar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}