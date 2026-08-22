import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Navbar />
      <div className="max-w-2xl mx-auto text-center py-24 px-4">
        <h1 className="text-6xl font-black text-slate-300 mb-4">403</h1>
        <p className="text-xl font-bold text-slate-700 mb-2">No tenés permiso para ver esta página.</p>
        <p className="text-slate-500 mb-6">Esta sección es solo para superadministradores.</p>
        <Link to="/" className="text-blue-600 font-bold hover:underline">Volver al tablero</Link>
      </div>
    </div>
  );
}