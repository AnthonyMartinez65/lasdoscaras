import { ApiService } from './api.service';
import type { Category, Hashtag } from '../models/category.types';
import type { ViewStatus, ViewAuthor, SideType } from '../models/view.types';

export interface SearchViewSide {
  type: SideType;
  title: string;
}

export interface SearchViewResult {
  id: string;
  categoryId: string;
  authorId: string;
  status: ViewStatus;
  createdAt: string;
  updatedAt: string;
  category: Category;
  author: ViewAuthor;
  sides: SearchViewSide[];
}

export interface SearchResultsResponse {
  views: SearchViewResult[];
  categories: Category[];
  hashtags: Hashtag[];

  authors: ViewAuthor[];
}

export class SearchService {
  static async search(query: string): Promise<SearchResultsResponse> {
    const params = new URLSearchParams({ q: query });
    return ApiService.request<SearchResultsResponse>(`/api/search?${params.toString()}`);
  }

  static async suggest(query: string, limit = 5): Promise<SearchViewResult[]> {
    if (!query.trim()) return [];
    const { views } = await this.search(query);
    return views.slice(0, limit);
  }
}