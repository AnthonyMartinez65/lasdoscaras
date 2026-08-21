import { ApiService } from './api.service';
import type { Category } from '../models/category.types';

export class AdminCategoryService {
  static async list(): Promise<Category[]> {
    const res = await ApiService.request<{ categories: Category[] }>('/api/admin/categories');
    return res.categories;
  }

  // TODO: el body exacto de creación no se confirmó contra una respuesta
  // guardada — se asume { name } porque es el único campo real del
  // modelo Category (ver schema.prisma: solo id, name y deletedAt).
  static async create(name: string): Promise<{ category: Category }> {
    return ApiService.request<{ category: Category }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  static async remove(id: string): Promise<void> {
    await ApiService.request(`/api/admin/categories/${id}`, { method: 'DELETE' });
  }
}