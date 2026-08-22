import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <Navbar />
      <div className="max-w-2xl mx-auto text-center py-24 px-4">
        <h1 className="text-6xl font-black text-slate-300 mb-4">404</h1>
        <p className="text-xl font-bold text-slate-700 mb-2">Esta página no existe.</p>
        <p className="text-slate-500 mb-6">Puede que el enlace esté roto o que la publicación haya sido eliminada.</p>
        <Link to="/" className="text-blue-600 font-bold hover:underline">Volver al tablero</Link>
      </div>
    </div>
  );
}