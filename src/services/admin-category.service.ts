import { ApiService } from './api.service';
import type { Category } from '../models/category.types';

export class AdminCategoryService {
  static async list(): Promise<Category[]> {
    const res = await ApiService.request<{ categories: Category[] }>('/api/admin/categories');
    return res.categories;
  }

  static async create(name: string): Promise<{ category: Category }> {
    return ApiService.request<{ category: Category }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  static async update(id: string, name: string): Promise<{ category: Category }> {
    return ApiService.request<{ category: Category }>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  static async remove(id: string): Promise<void> {
    await ApiService.request(`/api/admin/categories/${id}`, { method: 'DELETE' });
  }
}