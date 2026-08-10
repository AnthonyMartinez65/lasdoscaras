import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ThemeCard from '../components/ThemeCard';
import type { Theme } from '../models/theme.types';

export default function Home() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  // Próximamente: useEffect para consumir el API real
  useEffect(() => {
    // Aquí pondremos la llamada al API
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Tablero Principal</h1>
          <p className="text-lg text-slate-600 mt-2 font-medium">Explora las dos caras de la moneda en los temas más relevantes.</p>
        </div>
        
        <div>
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-500 mt-4 font-medium">Cargando publicaciones...</p>
            </div>
          ) : themes.length > 0 ? (
            themes.map(theme => (
              <ThemeCard key={theme.id} theme={theme} />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <h3 className="text-xl font-bold text-slate-700">No hay publicaciones disponibles</h3>
              <p className="text-slate-500 mt-2">Esperando los datos reales del servidor.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
