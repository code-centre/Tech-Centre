'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Calendar } from 'lucide-react';
import type { BlogPost } from '@/types/supabase';

interface BlogPostWithAuthor extends BlogPost {
  author?: {
    first_name?: string;
    last_name?: string;
    profile_image?: string | null;
  } | null;
  likes_count?: number;
}

interface BlogPostCardProps {
  post: BlogPostWithAuthor;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const authorName = post.author
    ? `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim() || 'Anónimo'
    : 'Anónimo';

  return (
    <article className="group rounded-xl border border-border-color overflow-hidden bg-[var(--card-background)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
      <Link href={`/blog/${post.slug}`} className="block flex-1 flex flex-col">
        <div className="relative aspect-video overflow-hidden bg-bg-secondary">
          {post.cover_image ? (
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
              <span className="text-4xl text-secondary/40 font-serif">“</span>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-5">
          <h2 className="text-lg font-semibold text-text-primary line-clamp-2 group-hover:text-secondary transition-colors mb-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-sm text-text-muted line-clamp-3 mb-4 flex-1">
              {post.excerpt}
            </p>
          )}
          <footer className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-border-color">
            <div className="flex items-center gap-2 min-w-0">
              {post.author?.profile_image ? (
                <Image
                  src={post.author.profile_image}
                  alt={authorName}
                  width={28}
                  height={28}
                  className="rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-secondary/30 flex items-center justify-center text-secondary text-xs font-medium flex-shrink-0">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs text-text-muted truncate">{authorName}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              {(post.likes_count ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  {post.likes_count}
                </span>
              )}
            </div>
          </footer>
        </div>
      </Link>
    </article>
  );
}
