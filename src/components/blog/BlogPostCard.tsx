'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Calendar, ArrowUpRight } from 'lucide-react';
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
  featured?: boolean;
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

export default function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const authorName = post.author
    ? `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim() || 'Anónimo'
    : 'Anónimo';

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-color bg-[var(--card-background)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl ${
        featured ? 'md:flex-row' : ''
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100"
      />
      <Link
        href={`/blog/${post.slug}`}
        className={`flex flex-1 flex-col ${featured ? 'md:flex-row' : ''}`}
        aria-label={post.title}
      >
        <div
          className={`relative overflow-hidden bg-bg-secondary ${
            featured ? 'aspect-video md:aspect-auto md:w-1/2' : 'aspect-video'
          }`}
        >
          {post.cover_image ? (
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10">
              <span className="font-highlight text-5xl text-primary/40">“</span>
            </div>
          )}
        </div>

        <div className={`flex flex-1 flex-col p-5 ${featured ? 'md:justify-center md:p-8' : ''}`}>
          <h2
            className={`line-clamp-2 font-semibold text-text-primary transition-colors group-hover:text-primary ${
              featured ? 'text-2xl md:text-3xl' : 'text-lg'
            }`}
          >
            {post.title}
          </h2>
          {post.excerpt && (
            <p
              className={`mt-2 flex-1 text-sm text-text-muted ${
                featured ? 'line-clamp-3 md:text-base' : 'line-clamp-3'
              }`}
            >
              {post.excerpt}
            </p>
          )}

          <footer className="mt-auto flex items-center justify-between gap-3 border-t border-border-color pt-4">
            <div className="flex min-w-0 items-center gap-2">
              {post.author?.profile_image ? (
                <Image
                  src={post.author.profile_image}
                  alt={authorName}
                  width={28}
                  height={28}
                  className="flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-medium text-primary">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate text-xs text-text-muted">{authorName}</span>
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              {(post.likes_count ?? 0) > 0 && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Heart className="h-3.5 w-3.5 fill-current" />
                  {post.likes_count}
                </span>
              )}
            </div>
          </footer>

          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Leer artículo
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}
