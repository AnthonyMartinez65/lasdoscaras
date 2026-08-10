export interface Narrative {
  id: string;
  posture: string;
  title: string;
  content: string;
  author: string;
  reactions: number;
}

export interface Theme {
  id: string;
  title: string;
  category: string;
  date: string;
  narrativeA: Narrative;
  narrativeB: Narrative;
  isFavorite?: boolean;
}
