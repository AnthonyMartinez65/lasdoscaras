import { useState } from 'react';
import { FavoriteService } from '../services/favorite.service';
import { CacheService } from '../services/cache.service';

interface FavoriteButtonProps {
  viewId: string;
  initialFavorited?: boolean;
}

export default function FavoriteButton({ viewId, initialFavorited = false }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!CacheService.get<{ token: string }>('lasdoscaras_auth')?.token) {
      // TODO: reemplazar por una notificación real vía NotificationContext.
      console.warn('Debe iniciar sesión para usar favoritos');
      return;
    }

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