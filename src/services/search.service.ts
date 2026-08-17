import { ApiService } from './api.service';
import type { PoliticalView } from '../models/view.types';

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
}

export class SearchService {
  // Verificar
  static async search({ query, page = 1, limit = 20 }: SearchParams): Promise<{ views: PoliticalView[]; total: number }> {
    const params = new URLSearchParams({ q: query, page: String(page), limit: String(limit) });
    return ApiService.request<{ views: PoliticalView[]; total: number }>(`/api/search?${params.toString()}`);
  }
}