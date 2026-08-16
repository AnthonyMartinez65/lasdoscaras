import type { PoliticalView } from './view.types';

export interface AuthorProfile {
  id: string;
  name: string;
  createdAt: string;
  views: PoliticalView[];
}