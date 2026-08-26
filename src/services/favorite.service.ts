import { ApiService } from './api.service';
import { CacheService } from './cache.service';
// Corregido: Usamos PoliticalView en lugar del ViewResponse que pedía el doc
import type { PoliticalView } from '../models/view.types';

const FAVORITES_CACHE_KEY = 'lasdoscaras_favorites';

export class FavoriteService {
  static async toggleFavorite(viewId: string): Promise<{ isFavorite: boolean }> {
    const res = await ApiService.request<{ isFavorite: boolean }>(`/api/favorites/${viewId}`, {
      method: 'POST',
    });
    
    // Actualizar caché al cambiar
    const cached = this.getFavoritesCache();
    if (res.isFavorite) {
      if (!cached.includes(viewId)) CacheService.set(FAVORITES_CACHE_KEY, [...cached, viewId]);
    } else {
      CacheService.set(FAVORITES_CACHE_KEY, cached.filter(id => id !== viewId));
    }
    
    return res;
  }

  // Corregido: Reemplazado ViewResponse por PoliticalView
  static async getFavorites(): Promise<PoliticalView[]> {
    const res = await ApiService.request<PoliticalView[]>('/api/favorites');
    const ids = res.map(v => v.id);
    CacheService.set(FAVORITES_CACHE_KEY, ids);
    return res;
  }

  static getFavoritesCache(): string[] {
    return CacheService.get<string[]>(FAVORITES_CACHE_KEY) || [];
  }

  static async syncCache(): Promise<void> {
    try {
      // Corregido: Quitamos el 'const res =' para que no dé advertencia
      await this.getFavorites();
    } catch {
      // Ignorar error si no hay conexión, se usará lo que esté en caché
    }
  }
}