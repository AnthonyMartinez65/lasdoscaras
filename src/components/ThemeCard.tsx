import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import FavoriteButton from './FavoriteButton';
import type { PoliticalView } from '../models/view.types';

/**
 * Tarjeta de Publicación (ThemeCard).
 * Componente UI reutilizable que renderiza el resumen de un debate (Lado A vs Lado B).
 * Navega al detalle completo de la publicación al hacer clic.
 */
export default function ThemeCard({ view }: { view: PoliticalView }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const sideA = view.sides[0];
  
  // Extracto breve: primeros 120 caracteres de la postura A para previsualización
  const excerpt = sideA.description.length > 120 
    ? sideA.description.substring(0, 120) + '...' 
    : sideA.description;

  /**
   * Maneja el botón de compartir. Utiliza la API nativa de Web Share en móviles/soportados,
   * de lo contrario, utiliza un fallback de copiado al portapapeles.
   */
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se dispare la navegación de la tarjeta completa
    const url = `${window.location.origin}/views/${view.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Las Dos Caras: ${view.sides[0].title} vs ${view.sides[1]?.title}`,
          url: url
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <div 
      onClick={() => navigate(`/views/${view.id}`)}
      className="block bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-extrabold uppercase px-2.5 py-1 rounded-full">
            {view.category?.name || 'General'}
          </span>
          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            <button 
              onClick={handleShare}
              className="text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors"
              title="Compartir"
            >
              🔗
            </button>
            {user && <FavoriteButton viewId={view.id} />}
          </div>
        </div>
        
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
          {view.sides[0].title} <span className="bg-gradient-to-br from-amber-400 to-orange-600 bg-clip-text text-transparent font-black mx-1 italic text-lg uppercase tracking-wide">VS</span> {view.sides[1]?.title}
        </h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
          {excerpt}
        </p>

        {view.hashtags && view.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {view.hashtags.map(h => (
              <span key={h.id} className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                #{h.name}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3 mb-2">
          <span className="text-blue-600 dark:text-blue-400">👍 Lado A: {view.sides[0]?.likeCount || 0}</span>
          <span className="text-purple-600 dark:text-purple-400">👍 Lado B: {view.sides[1]?.likeCount || 0}</span>
        </div>

        <div className="flex justify-between items-center text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>{new Date(view.createdAt).toLocaleDateString()}</span>
          <span onClick={e => e.stopPropagation()}>Por <Link to={`/authors/${view.author.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{view.author.name}</Link></span>
        </div>
      </div>
    </div>
  );
}