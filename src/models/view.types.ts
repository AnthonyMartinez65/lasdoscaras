import type { Category, Hashtag } from './category.types';

export type SourceType = 'LINK' | 'YOUTUBE' | 'DOCUMENT';

export interface Source {
  id: string;
  type: SourceType;
  url: string;
  label?: string | null;
}

export type SideType = 'SIDE' | 'COUNTERPART';

export interface ViewSide {
  id: string;
  type: SideType;
  title: string;
  description: string;
  sources: Source[];
  likes: number;
  dislikes: number;
}

export type ViewStatus = 'PUBLISHED' | 'UNPUBLISHED';

export interface ViewAuthor {
  id: string;
  name: string;
}

export interface PoliticalView {
  id: string;
  categoryId: string;
  category?: Category; 
  author: ViewAuthor;
  status: ViewStatus;
  side: ViewSide; 
  counterpart: ViewSide; 
  hashtags: Hashtag[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateViewPayload {
  categoryId: string;
  side: {
    title: string;
    description: string;
    sources: { type: SourceType; url: string; label?: string }[];
  };
  counterpart: {
    title: string;
    description: string;
    sources: { type: SourceType; url: string; label?: string }[];
  };
  hashtags: string[];
}

export interface ViewsListResponse {
  views: PoliticalView[];
  total: number;
  page: number;
  limit: number;
}