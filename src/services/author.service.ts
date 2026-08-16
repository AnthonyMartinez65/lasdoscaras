import { ApiService } from './api.service';
import type { AuthorProfile } from '../models/author.types';

export class AuthorService {
  static async getById(id: string): Promise<{ author: AuthorProfile }> {
    return ApiService.request<{ author: AuthorProfile }>(`/api/authors/${id}`);
  }
}