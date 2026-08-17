import { ApiService } from './api.service';
import type { PoliticalView } from '../models/view.types';
import type { ViewsSort } from './view.service';

export interface SearchParams {
  query: string;
  sort?: ViewsSort;
  page?: number;
  limit?: number;
}

export class SearchService {
  // TODO: no hay ejemplo guardado en la colección de Postman para
  // GET /api/search — se asume el mismo sobre que el resto de los
  // listados ({ views, total }) y que acepta "sort" igual que
  // /api/views. Correr el request contra el servidor local antes de
  // confiar en esto.
  static async search({ query, sort = 'recent', page = 1, limit = 10 }: SearchParams): Promise<{ views: PoliticalView[]; total: number }> {
    const params = new URLSearchParams({ q: query, sort, page: String(page), limit: String(limit) });
    return ApiService.request<{ views: PoliticalView[]; total: number }>(`/api/search?${params.toString()}`);
  }
}