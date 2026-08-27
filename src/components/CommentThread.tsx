import { useState } from 'react';
import { CommentService } from '../services/comment.service';
import { CacheService } from '../services/cache.service';
import type { CommentThread as CommentThreadType, Comment } from '../models/comment.types';

/**
 * Componente de Hilo de Comentarios.
 * Renderiza la discusión en forma de árbol (comentarios y respuestas),
 * consumiendo el API a través del CommentService.
 */
interface CommentThreadProps {
  viewId: string;
  thread: CommentThreadType;
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: (parentId: string, content: string) => void }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  return (
    <div className="border-l-2 border-slate-200 pl-4 py-2">
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-sm text-slate-800">{comment.user.name}</span>
        <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="text-sm text-slate-600 mt-1">{comment.content}</p>
      <button
        onClick={() => setReplying(r => !r)}
        className="text-xs font-bold text-blue-600 mt-1 hover:underline"
      >
        Responder
      </button>

      {replying && (
        <div className="mt-2 flex gap-2">
          <input
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Escribe una respuesta..."
            className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (!replyText.trim()) return;
              onReply(comment.id, replyText.trim());
              setReplyText('');
              setReplying(false);
            }}
            className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700"
          >
            Enviar
          </button>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map(reply => (
            <div key={reply.id} className="border-l-2 border-slate-100 pl-4">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-sm text-slate-800">{reply.user.name}</span>
                <span className="text-xs text-slate-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentThreadCard({ viewId, thread }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>(thread.comments);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!CacheService.get<{ token: string }>('lasdoscaras_auth')?.token) {
      console.warn('Debe iniciar sesión para comentar');
      return;
    }
    try {
      const { comment } = await CommentService.createComment(viewId, thread.id, { content, parentId });
      if (parentId) {
        setComments(prev => prev.map(c => c.id === parentId ? { ...c, replies: [...(c.replies ?? []), comment] } : c));
      } else {
        setComments(prev => [...prev, comment]);
      }
    } catch (err) {
      console.error('Error al comentar', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
      {thread.title && <h4 className="font-bold text-slate-800 mb-3">{thread.title}</h4>}

      <div className="space-y-3">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={(parentId, content) => handleAddComment(content, parentId)}
          />
        ))}
      </div>

      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        <input
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            if (!newComment.trim()) return;
            handleAddComment(newComment.trim());
            setNewComment('');
          }}
          className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Comentar
        </button>
      </div>
    </div>
  );
}