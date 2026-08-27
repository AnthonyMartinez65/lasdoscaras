export interface CommentUser {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  threadId: string;
  content: string;
  parentId: string | null;
  user: CommentUser;
  createdAt: string;
  replies?: Comment[];
}

export interface CommentThread {
  id: string;
  title: string | null;
  politicalViewId: string;
  comments: Comment[];
  createdAt: string;
}

export interface CreateThreadPayload {
  title?: string;
  content: string;
}

export interface CreateCommentPayload {
  content: string;
  parentId?: string;
}