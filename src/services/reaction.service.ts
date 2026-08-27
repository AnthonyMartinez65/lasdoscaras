import { ApiService } from './api.service';

export class ReactionService {
  /**
   * Envía una reacción ('like' o 'dislike') a un lado ('a' o 'b') de una vista.
   */
  static async react(viewId: string, side: 'a' | 'b', type: 'like' | 'dislike'): Promise<void> {
    await ApiService.request(`/api/views/${viewId}/sides/${side}/${type}`, { method: 'POST' });
  }
}
