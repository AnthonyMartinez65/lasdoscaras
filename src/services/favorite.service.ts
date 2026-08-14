import { ApiService } from './api.service';

export class FavoriteService {
  static async add(viewId: string): Promise<void> {
    await ApiService.request(`/api/views/${viewId}/favorite`, { method: 'POST' });
  }

  static async remove(viewId: string): Promise<void> {
    await ApiService.request(`/api/views/${viewId}/favorite`, { method: 'DELETE' });
  }

  // TODO: confirmar el endpoint/forma exacta de GET /api/users/me/favorites
  // para saber, al cargar el tablero o el detalle, cuáles publicaciones ya
  // tiene marcadas como favoritas el usuario actual (y así mostrar el
  // corazón "lleno" desde el primer render, no solo después de tocarlo).
  static async listMine(): Promise<{ favorites: { id: string }[] }> {
    return ApiService.request<{ favorites: { id: string }[] }>('/api/users/me/favorites');
  }
}