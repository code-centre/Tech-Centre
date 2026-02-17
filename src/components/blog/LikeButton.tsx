'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useUser, useSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
}

export default function LikeButton({
  postId,
  initialCount,
  initialLiked,
}: LikeButtonProps) {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCount(initialCount);
    setLiked(initialLiked);
  }, [postId, initialCount, initialLiked]);

  const toggleLike = async () => {
    if (!user) {
      toast.error('Inicia sesión para dar like');
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      if (liked) {
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.user_id || user.id);

        if (error) throw error;
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        const { error } = await supabase.from('blog_likes').insert({
          post_id: postId,
          user_id: user.user_id || user.id,
        });

        if (error) throw error;
        setLiked(true);
        setCount((c) => c + 1);
      }
    } catch (error: unknown) {
      console.error('Error al actualizar like:', error);
      toast.error('No se pudo actualizar el like');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Link
        href="/iniciar-sesion"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color text-text-muted hover:bg-bg-secondary hover:text-secondary transition-colors"
      >
        <Heart className="w-5 h-5" />
        <span>{count} {count === 1 ? 'me gusta' : 'me gusta'}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
        liked
          ? 'border-secondary/50 bg-secondary/10 text-secondary'
          : 'border-border-color text-text-muted hover:bg-bg-secondary hover:text-secondary'
      } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      <Heart
        className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
      />
      <span>
        {count} {count === 1 ? 'me gusta' : 'me gusta'}
      </span>
    </button>
  );
}
