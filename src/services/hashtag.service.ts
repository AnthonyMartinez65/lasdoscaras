import { ApiService } from './api.service';
import { CacheService } from './cache.service';
import type { Hashtag } from '../models/category.types';

const HASHTAGS_CACHE_KEY = 'lasdoscaras_hashtags';
const HASHTAGS_TTL_MINUTES = 30;

export class HashtagService {
  static async listAll(): Promise<Hashtag[]> {
    const cached = CacheService.get<Hashtag[]>(HASHTAGS_CACHE_KEY);
    
    if (cached) {
      ApiService.request<{ hashtags: Hashtag[] }>('/api/hashtags').then(fresh => {
        CacheService.set(HASHTAGS_CACHE_KEY, fresh.hashtags, HASHTAGS_TTL_MINUTES);
      }).catch(() => {});
      return cached;
    }

    const fresh = await ApiService.request<{ hashtags: Hashtag[] }>('/api/hashtags');
    CacheService.set(HASHTAGS_CACHE_KEY, fresh.hashtags, HASHTAGS_TTL_MINUTES);
    return fresh.hashtags;
  }
}
