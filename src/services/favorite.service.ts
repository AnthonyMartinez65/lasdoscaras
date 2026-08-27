/**
 * Servicio de Favoritos.
 * Maneja la lógica de agregar/quitar favoritos tanto en el backend (API)
 * como en el caché local (localStorage) para mantener la UI rápida y sincronizada.
 */
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

  /**
   * Obtiene la lista completa de publicaciones favoritas del usuario actual.
   * Realiza peticiones en paralelo (Promise.all) para hidratar los IDs devueltos
   * por el API en objetos PoliticalView completos.
   */
  static async getMyFavoriteViews(): Promise<PoliticalView[]> {
    const { favorites } = await this.listMine();
    const results = await Promise.all(
      favorites.map(id => ViewService.getById(id).then(res => res.view).catch(() => null))
    );
    return results.filter((v): v is PoliticalView => v !== null);
  }

  // --- Manejo de Caché Local (lasdoscaras_favorites) ---
  // Guarda un array de IDs de las publicaciones favoritas.
  // Esto permite que componentes como FavoriteButton verifiquen el estado (lleno/vacío)
  // de forma síncrona sin necesidad de consultar el API en cada render.

  static getCachedIds(): Set<string> {
    const ids = CacheService.get<unknown>(FAVORITES_CACHE_KEY);
    
    const safeIds = Array.isArray(ids) ? ids : [];
    
    return new Set(safeIds as string[]);
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

  /**
   * Sincroniza el caché local con la fuente de verdad (el API).
   * Usualmente llamado automáticamente tras el login en AuthContext.
   */
  static async syncCache(): Promise<void> {
    try {
      const { favorites } = await this.listMine();
      CacheService.set(FAVORITES_CACHE_KEY, favorites);
    } catch {
    }
  }
}