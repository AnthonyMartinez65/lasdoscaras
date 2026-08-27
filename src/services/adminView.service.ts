import { ApiService } from './api.service';
import type { PoliticalView, ViewStatus } from '../models/view.types';

export interface ListAdminViewsParams {
  status?: ViewStatus;
  page?: number;
  limit?: number;
}

export interface AdminViewsResponse {
  total: number;
  page: number;
  limit: number;
  views: PoliticalView[];
}

export class AdminViewService {
  static async list(params: ListAdminViewsParams = {}): Promise<AdminViewsResponse> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));
    return ApiService.request<AdminViewsResponse>(`/api/admin/views?${query.toString()}`);
  }

  static async publish(viewId: string): Promise<void> {
    await ApiService.request(`/api/views/${viewId}/publish`, { method: 'PATCH' });
  }

  static async unpublish(viewId: string): Promise<void> {
    await ApiService.request(`/api/views/${viewId}/unpublish`, { method: 'PATCH' });
  }
}