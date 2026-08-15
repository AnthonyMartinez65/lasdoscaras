import { ApiService } from './api.service';
import type { PoliticalView, ViewsListResponse, CreateViewPayload } from '../models/view.types';

export type ViewsSort = 'recent' | 'likes' | 'dislikes';

export interface ListViewsParams {
  category?: string;
  hashtag?: string;
  sort?: ViewsSort;
  page?: number;
  limit?: number;
}

export class ViewService {
  static async list(params: ListViewsParams = {}): Promise<ViewsListResponse> {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.hashtag) query.set('hashtag', params.hashtag);
    query.set('sort', params.sort ?? 'recent');
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));

    return ApiService.request<ViewsListResponse>(`/api/views?${query.toString()}`);
  }

  static async getById(id: string): Promise<{ view: PoliticalView }> {
    return ApiService.request<{ view: PoliticalView }>(`/api/views/${id}`);
  }

  static async create(payload: CreateViewPayload): Promise<{ view: PoliticalView }> {
    return ApiService.request<{ view: PoliticalView }>('/api/views', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}