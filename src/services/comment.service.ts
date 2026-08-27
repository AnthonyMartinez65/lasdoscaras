import { ApiService } from './api.service';
import type { CommentThread, Comment, CreateThreadPayload, CreateCommentPayload } from '../models/comment.types';

export class CommentService {
  static async listThreads(viewId: string): Promise<{ threads: CommentThread[] }> {
    // TODO: confirmar el sobre exacto de la respuesta — sin ejemplo
    // guardado en Postman para este endpoint.
    return ApiService.request<{ threads: CommentThread[] }>(`/api/views/${viewId}/threads`);
  }

  static async createThread(viewId: string, payload: CreateThreadPayload): Promise<{ thread: CommentThread }> {
    return ApiService.request<{ thread: CommentThread }>(`/api/views/${viewId}/threads`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async listComments(viewId: string, threadId: string): Promise<{ comments: Comment[] }> {
    return ApiService.request<{ comments: Comment[] }>(`/api/views/${viewId}/threads/${threadId}/comments`);
  }

  static async createComment(viewId: string, threadId: string, payload: CreateCommentPayload): Promise<{ comment: Comment }> {
    return ApiService.request<{ comment: Comment }>(`/api/views/${viewId}/threads/${threadId}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}