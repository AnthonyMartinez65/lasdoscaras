import { ApiService } from './api.service';
import { CacheService } from './cache.service';
import { ViewService } from './view.service';
import type { PoliticalView } from '../models/view.types';

const FAVORITES_CACHE_KEY = 'lasdoscaras_favorites';

export class FavoriteService {
  static async add(viewId: string): Promise<void> {
    await ApiService.request(`/api/views/${viewId}/favorite`, { method: 'POST' });
    this.addToCache(viewId);
  }

  static async remove(viewId: string): Promise<void> {
    await ApiService.request(`/api/views/${viewId}/favorite`, { method: 'DELETE' });
    this.removeFromCache(viewId);
  }

  static async listMine(): Promise<{ favorites: string[] }> {
    return ApiService.request<{ favorites: string[] }>('/api/users/me/favorites');
  }

  // Trae la publicación completa de cada id favorito, en paralelo, para
  // poder mostrarlas como cards en la pestaña "Favoritos" del perfil.
  static async getMyFavoriteViews(): Promise<PoliticalView[]> {
    const { favorites } = await this.listMine();
    const results = await Promise.all(
      favorites.map(id => ViewService.getById(id).then(res => res.view).catch(() => null))
    );
    return results.filter((v): v is PoliticalView => v !== null);
  }

  // --- Caché local (lasdoscaras_favorites) ---
  // Guarda solo los ids favoritos del usuario actual. Cada FavoriteButton
  // lo consulta directamente para saber si mostrarse lleno o vacío, sin
  // pedirle nada al API en cada render.

  static getCachedIds(): Set<string> {
    const ids = CacheService.get<string[]>(FAVORITES_CACHE_KEY);
    return new Set(ids ?? []);
  }

  static isCached(viewId: string): boolean {
    return this.getCachedIds().has(viewId);
  }

  static addToCache(viewId: string): void {
    const ids = this.getCachedIds();
    ids.add(viewId);
    CacheService.set(FAVORITES_CACHE_KEY, Array.from(ids));
  }

  static removeFromCache(viewId: string): void {
    const ids = this.getCachedIds();
    ids.delete(viewId);
    CacheService.set(FAVORITES_CACHE_KEY, Array.from(ids));
  }

  // Sincroniza el caché completo contra el API — se llama justo después
  // del login, para que el caché arranque con los favoritos reales en
  // vez de vacío.
  static async syncCache(): Promise<void> {
    try {
      const { favorites } = await this.listMine();
      CacheService.set(FAVORITES_CACHE_KEY, favorites);
    } catch {
      // Si falla, dejamos el caché como estaba — no es crítico para
      // poder seguir usando la app.
    }
  }
}