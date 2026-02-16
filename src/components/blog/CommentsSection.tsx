'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MessageCircle, Trash2 } from 'lucide-react';
import { useUser, useSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

interface CommentWithAuthor {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: {
    first_name?: string;
    last_name?: string;
    profile_image?: string | null;
  } | null;
}

interface CommentsSectionProps {
  postId: string;
  initialComments: CommentWithAuthor[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CommentsSection({
  postId,
  initialComments,
}: CommentsSectionProps) {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('blog_comments')
      .select(
        `
        id,
        post_id,
        user_id,
        content,
        created_at,
        author:profiles!user_id(first_name, last_name, profile_image)
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(
        data.map((c: Record<string, unknown>) => ({
          ...c,
          author: Array.isArray(c.author) ? c.author[0] ?? null : c.author ?? null,
        })) as CommentWithAuthor[]
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('blog_comments').insert({
        post_id: postId,
        user_id: user.user_id || user.id,
        content: newComment.trim(),
      });

      if (error) throw error;
      setNewComment('');
      await fetchComments();
      toast.success('Comentario publicado');
    } catch (error: unknown) {
      console.error('Error al publicar comentario:', error);
      toast.error('No se pudo publicar el comentario');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    setDeletingId(commentId);
    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.user_id || user.id);

      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comentario eliminado');
    } catch (error: unknown) {
      console.error('Error al eliminar comentario:', error);
      toast.error('No se pudo eliminar el comentario');
    } finally {
      setDeletingId(null);
    }
  };

  const currentUserId = user?.user_id || user?.id;

  return (
    <section className="mt-12 pt-8 border-t border-border-color">
      <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-secondary" />
        Comentarios ({comments.length})
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              {user.profile_image ? (
                <Image
                  src={user.profile_image}
                  alt={user.first_name || 'Usuario'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-secondary font-medium">
                  {(user.first_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-border-color bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="self-end px-4 py-2 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-text-muted">
          <Link href="/iniciar-sesion" className="text-secondary hover:underline">
            Inicia sesión
          </Link>{' '}
          para dejar un comentario.
        </p>
      )}

      <ul className="space-y-6">
        {comments.map((comment) => {
          const authorName = comment.author
            ? `${comment.author.first_name || ''} ${comment.author.last_name || ''}`.trim() ||
              'Anónimo'
            : 'Anónimo';
          const canDelete = currentUserId === comment.user_id;

          return (
            <li
              key={comment.id}
              className="flex gap-3 p-4 rounded-lg bg-bg-secondary border border-border-color"
            >
              <div className="flex-shrink-0">
                {comment.author?.profile_image ? (
                  <Image
                    src={comment.author.profile_image}
                    alt={authorName}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-secondary font-medium">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-text-primary">{authorName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                      {formatDate(comment.created_at)}
                    </span>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="p-1 text-text-muted hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Eliminar comentario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-text-primary whitespace-pre-wrap">{comment.content}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {comments.length === 0 && (
        <p className="text-text-muted text-center py-8">
          Aún no hay comentarios. ¡Sé el primero en comentar!
        </p>
      )}
    </section>
  );
}
