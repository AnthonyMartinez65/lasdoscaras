import { ApiService } from './api.service';
import { ViewService } from './view.service';
import type { PoliticalView } from '../models/view.types';

export class FavoriteService {
  static async add(viewId: string): Promise<void> {
    await ApiService.request(`/api/views/${viewId}/favorite`, { method: 'POST' });
  }

  static async remove(viewId: string): Promise<void> {
    await ApiService.request(`/api/views/${viewId}/favorite`, { method: 'DELETE' });
  }

  static async listMine(): Promise<{ favorites: string[] }> {
    return ApiService.request<{ favorites: string[] }>('/api/users/me/favorites');
  }

  static async getMyFavoriteViews(): Promise<PoliticalView[]> {
    const { favorites } = await this.listMine();
    const results = await Promise.all(
      favorites.map(id => ViewService.getById(id).then(res => res.view).catch(() => null))
    );
    return results.filter((v): v is PoliticalView => v !== null);
  }
}