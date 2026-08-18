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

  likeCount: number;
  dislikeCount: number;

  myReaction: 'LIKE' | 'DISLIKE' | null;
}

export type ViewStatus = 'PUBLISHED' | 'UNPUBLISHED';

export interface ViewAuthor {
  id: string;
  name: string;
}

export interface PoliticalView {
  id: string;
  categoryId: string;
  authorId: string;
  category?: Category;
  author: ViewAuthor;
  status: ViewStatus;
 
  sides: ViewSide[];
  hashtags: Hashtag[];
  createdAt: string;
  updatedAt: string;

  totalLikes?: number;
  totalDislikes?: number;
  isFavorite?: boolean;
  _count?: { threads: number };
}

export function getSide(view: PoliticalView): ViewSide {
  return view.sides.find(s => s.type === 'SIDE')!;
}

export function getCounterpart(view: PoliticalView): ViewSide {
  return view.sides.find(s => s.type === 'COUNTERPART')!;
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