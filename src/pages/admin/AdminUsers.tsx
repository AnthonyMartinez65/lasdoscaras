import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import AdminNav from '../../components/AdminNav';
import ConfirmButton from '../../components/ConfirmButton';
import { AdminUserService } from '../../services/adminUser.service';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useNotification } from '../../context/NotificationContext';
import type { User } from '../../models/auth.types';

export default function AdminUsers() {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    AdminUserService.list({ search: debouncedSearch || undefined, limit: 50 })
      .then(res => setUsers(res.users))
      .catch(() => setError('No fue posible cargar los usuarios.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [debouncedSearch]);

  const handleToggleBan = async (u: User) => {
    setActingOn(u.id);
    try {
      if (u.status === 'SUSPENDED') {
        await AdminUserService.unban(u.id);
        showNotification(`${u.name} fue desbaneado.`, 'success');
      } else {
        await AdminUserService.ban(u.id);
        showNotification(`${u.name} fue baneado.`, 'success');
      }
      load();
    } catch (err) {
      console.error('Error al cambiar el estado del usuario', err);
      showNotification('No fue posible actualizar el usuario.', 'error');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-slate-900 mb-6">Usuarios</h1>
        <AdminNav />

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 mb-6"
        />

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : error ? (
          <p className="text-red-600 font-bold">{error}</p>
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No se encontraron usuarios.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-bold text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3 text-slate-500">{u.role}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'SUPERADMIN' && (
                        <ConfirmButton
                          onConfirm={() => handleToggleBan(u)}
                          confirmLabel={u.status === 'SUSPENDED' ? '¿Desbanear?' : '¿Banear?'}
                          disabled={actingOn === u.id}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${u.status === 'SUSPENDED'
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                          {u.status === 'SUSPENDED' ? 'Desbanear' : 'Banear'}
                        </ConfirmButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}