export interface CommentAuthor {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  content: string;
  parentId: string | null;
  author: CommentAuthor;
  createdAt: string;
  // TODO: confirmar si el API anida las respuestas dentro de cada comentario
  // top-level (como se asume acá) o si las devuelve todas planas con
  // parentId y hay que agruparlas en el cliente. No hay ejemplo guardado en
  // la colección de Postman para "List Comments".
  replies?: Comment[];
}

export interface CommentThread {
  id: string;
  title: string | null;
  viewId: string;
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