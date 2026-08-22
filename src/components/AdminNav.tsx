import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function AdminNav() {
  return (
    <div className="flex gap-2 mb-8">
      <NavLink to="/admin/users" className={linkClass}>Usuarios</NavLink>
      <NavLink to="/admin/categories" className={linkClass}>Categorías</NavLink>
    </div>
  );
}