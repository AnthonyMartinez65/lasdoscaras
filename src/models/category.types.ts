export interface Category {
  id: string;
  name: string;
  description?: string;
  deletedAt: string | null;
}

export interface Hashtag {
  id: string;
  name: string;
  createdAt: string;
}