import { ApiService } from './api.service';
import type { PoliticalView } from '../models/view.types';

export class FavoriteService {
  static async add(viewId: string): Promise<void> {
    await ApiService.request(`/api/views/${viewId}/favorite`, { method: 'POST' });
  }

  static async remove(viewId: string): Promise<void> {
    await ApiService.request(`/api/views/${viewId}/favorite`, { method: 'DELETE' });
  }

  // Corregido: antes se asumía que devolvía solo ids ({ id }[]); tiene más
  // sentido que devuelva las publicaciones completas, igual que el resto
  // de los listados del API — así el perfil no tiene que hacer un fetch
  // extra por cada favorito para poder mostrarlo como card. Sigue siendo
  // un supuesto sin confirmar contra una respuesta real.
  static async listMine(): Promise<{ favorites: PoliticalView[] }> {
    return ApiService.request<{ favorites: PoliticalView[] }>('/api/users/me/favorites');
  }
}