import { ApiService } from './api.service';
import { CacheService } from './cache.service';
import type { Category } from '../models/category.types';

const CATEGORIES_CACHE_KEY = 'lasdoscaras_categories';
const CATEGORIES_TTL_MINUTES = 60; // 1 hora, según el enunciado

export class CategoryService {
  static async list(): Promise<Category[]> {
    const cached = CacheService.get<Category[]>(CATEGORIES_CACHE_KEY);
    if (cached) return cached;

    const fresh = await ApiService.request<{ categories: Category[] }>('/api/categories');
    CacheService.set(CATEGORIES_CACHE_KEY, fresh.categories, CATEGORIES_TTL_MINUTES);
    return fresh.categories;
  }

  static async refresh(): Promise<Category[]> {
    const fresh = await ApiService.request<{ categories: Category[] }>('/api/categories');
    CacheService.set(CATEGORIES_CACHE_KEY, fresh.categories, CATEGORIES_TTL_MINUTES);
    return fresh.categories;
  }

  // El API no expone un GET /api/categories/:id individual (no aparece ni
  // en el README ni en la colección de Postman) — así que se busca dentro
  // de la lista completa, que de todas formas ya está cacheada la mayor
  // parte del tiempo.
  static async getById(id: string): Promise<Category | undefined> {
    const categories = await this.list();
    return categories.find(c => c.id === id);
  }
}