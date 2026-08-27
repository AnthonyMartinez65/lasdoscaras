import { ApiService } from './api.service';
import type { User } from '../models/auth.types';

export interface ListUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListUsersResponse {
  total: number;
  page: number;
  limit: number;
  users: User[];
}

export class AdminUserService {
  static async list(params: ListUsersParams = {}): Promise<ListUsersResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 20));
    return ApiService.request<ListUsersResponse>(`/api/admin/users?${query.toString()}`);
  }

  static async ban(userId: string): Promise<void> {
    await ApiService.request(`/api/admin/users/${userId}/ban`, { method: 'PATCH' });
  }

  static async unban(userId: string): Promise<void> {
    await ApiService.request(`/api/admin/users/${userId}/unban`, { method: 'PATCH' });
  }
}