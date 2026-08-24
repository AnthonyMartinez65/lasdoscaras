import { useState, type MouseEvent } from 'react';
import { FavoriteService } from '../services/favorite.service';
import { CacheService } from '../services/cache.service';

interface FavoriteButtonProps {
  viewId: string;
}

export default function FavoriteButton({ viewId }: FavoriteButtonProps) {
  const isAuthenticated = !!CacheService.get<{ token: string }>('lasdoscaras_auth')?.token;
  // El estado inicial se lee directo del caché local, sin pedirle nada
  // al API — el corazón ya sabe si mostrarse lleno o vacío desde el
  // primer render.
  const [favorited, setFavorited] = useState(() => FavoriteService.isCached(viewId));
  const [loading, setLoading] = useState(false);

  // Requisito del enunciado: el corazón solo es visible para usuarios
  // autenticados, no solo deshabilitado para el resto.
  if (!isAuthenticated) return null;

  const toggle = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);
    const next = !favorited;
    setFavorited(next); // optimista

    try {
      if (next) {
        await FavoriteService.add(viewId);
      } else {
        await FavoriteService.remove(viewId);
      }
    } catch (err) {
      setFavorited(!next); // revertir si falla
      console.error('Error al actualizar favorito', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xl transition-transform hover:scale-110 disabled:opacity-50 ${favorited ? 'grayscale-0' : 'grayscale opacity-60'}`}
      aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {favorited ? '❤️' : '🤍'}
    </button>
  );
}