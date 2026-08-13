import { ApiService } from './api.service';
import { CacheService } from './cache.service';
import type { Category } from '../models/category.types';

const CATEGORIES_CACHE_KEY = 'lasdoscaras_categories';
const CATEGORIES_TTL_MINUTES = 60; // 1 hora, según el enunciado

export class CategoryService {
  // Cache-first: si hay algo en caché y no expiró, lo devuelve de inmediato
  // sin llamar al API. Si no hay caché (o expiró), consulta el API y
  // actualiza el caché.
  static async list(): Promise<Category[]> {
    const cached = CacheService.get<Category[]>(CATEGORIES_CACHE_KEY);
    if (cached) return cached;

    // TODO: confirmar si la respuesta real trae { categories: [...] } o un
    // arreglo plano — no hay ejemplo guardado en la colección de Postman
    // para "List Categories". Correr el request contra el server local y
    // ajustar si hace falta.
    const fresh = await ApiService.request<{ categories: Category[] }>('/api/categories');
    CacheService.set(CATEGORIES_CACHE_KEY, fresh.categories, CATEGORIES_TTL_MINUTES);
    return fresh.categories;
  }

  // Trae del API en segundo plano y refresca el caché sin bloquear la UI
  // (patrón stale-while-revalidate que pide el enunciado).
  static async refresh(): Promise<Category[]> {
    const fresh = await ApiService.request<{ categories: Category[] }>('/api/categories');
    CacheService.set(CATEGORIES_CACHE_KEY, fresh.categories, CATEGORIES_TTL_MINUTES);
    return fresh.categories;
  }
}