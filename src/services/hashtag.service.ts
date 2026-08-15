import { ApiService } from './api.service';
import type { Hashtag } from '../models/category.types';

export class HashtagService {
  static async search(query: string): Promise<Hashtag[]> {
    if (!query.trim()) return [];
    // TODO: confirmar el sobre exacto de la respuesta — sin ejemplo
    // guardado en Postman para GET /api/hashtags.
    const res = await ApiService.request<{ hashtags: Hashtag[] }>(`/api/hashtags?q=${encodeURIComponent(query)}`);
    return res.hashtags;
  }
}