import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import parse from 'html-react-parser';
import { ArrowLeft, Calendar } from 'lucide-react';
import CommentsSection from '@/components/blog/CommentsSection';
import LikeButton from '@/components/blog/LikeButton';
import { ArticleSchema, BreadcrumbListSchema } from '@/components/seo/StructuredData';

interface CommentWithAuthor {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: {
    first_name: string;
    last_name: string;
    profile_image: string | null;
  } | null;
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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://techcentre.co';
const DEFAULT_OG_IMAGE = `${BASE_URL}/tech-center-logos/TechCentreLogoColor.png`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('blog_posts')
    .select('title, excerpt, cover_image, published_at, updated_at, author:profiles!author_id(first_name, last_name)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!data) return { title: 'Artículo no encontrado' };

  const meta = data as {
    title: string;
    excerpt: string | null;
    cover_image: string | null;
    published_at: string | null;
    updated_at: string | null;
    author: unknown;
  };
  const author = Array.isArray(meta.author) ? meta.author[0] : meta.author;
  const authorName = author
    ? `${(author as { first_name?: string }).first_name || ''} ${(author as { last_name?: string }).last_name || ''}`.trim() || 'Tech Centre'
    : 'Tech Centre';
  const description = meta.excerpt || meta.title;
  const ogImage = meta.cover_image?.startsWith('http')
    ? meta.cover_image
    : meta.cover_image
      ? `${BASE_URL}${meta.cover_image.startsWith('/') ? '' : '/'}${meta.cover_image}`
      : DEFAULT_OG_IMAGE;

  const keywords = [
    ...meta.title.split(/\s+/).filter((w) => w.length > 3),
    ...(meta.excerpt ? meta.excerpt.slice(0, 200).split(/\s+/).filter((w) => w.length > 3).slice(0, 5) : []),
    'Tech Centre',
    'blog',
    'tecnología',
  ];

  return {
    title: `${meta.title} | Blog Tech-Centre`,
    description,
    keywords: [...new Set(keywords)].slice(0, 10),
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      type: 'article',
      locale: 'es_CO',
      url: `${BASE_URL}/blog/${slug}`,
      siteName: 'Tech Centre',
      title: `${meta.title} | Blog Tech-Centre`,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
      publishedTime: meta.published_at || meta.updated_at || undefined,
      modifiedTime: meta.updated_at || undefined,
      authors: [authorName],
      section: 'Tecnología',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.title} | Blog Tech-Centre`,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: postData, error } = await supabase
    .from('blog_posts')
    .select(
      `
      id,
      author_id,
      title,
      slug,
      excerpt,
      content,
      cover_image,
      published_at,
      updated_at,
      created_at,
      author:profiles!author_id(first_name, last_name, profile_image)
    `
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !postData) {
    notFound();
  }

  const post = postData as {
    id: string;
    author_id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    cover_image: string | null;
    published_at: string | null;
    updated_at: string | null;
    created_at: string;
    author: unknown;
  };

  const [{ count: likesCount }, { data: { user } }] = await Promise.all([
    supabase
      .from('blog_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id),
    supabase.auth.getUser(),
  ]);

  let initialLiked = false;
  if (user?.id) {
    const { data: userLike } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', user.id)
      .maybeSingle();
    initialLiked = !!userLike;
  }

  const { data: commentsData } = await supabase
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
    .eq('post_id', post.id)
    .order('created_at', { ascending: true });

  const comments: CommentWithAuthor[] = (commentsData || []).map(
    (c: Record<string, unknown>) => ({
      ...c,
      author: Array.isArray(c.author) ? c.author[0] ?? null : c.author ?? null,
    })
  ) as CommentWithAuthor[];

  const author = Array.isArray(post.author) ? post.author[0] : post.author;
  const authorName = author
    ? `${(author as { first_name?: string }).first_name || ''} ${(author as { last_name?: string }).last_name || ''}`.trim() || 'Anónimo'
    : 'Anónimo';

  const articleImage = post.cover_image?.startsWith('http')
    ? post.cover_image
    : post.cover_image
      ? `${BASE_URL}${post.cover_image.startsWith('/') ? '' : '/'}${post.cover_image}`
      : undefined;

  return (
    <article className="max-w-3xl mx-auto">
      <BreadcrumbListSchema
        items={[
          { name: 'Inicio', url: BASE_URL },
          { name: 'Blog', url: `${BASE_URL}/blog` },
          { name: post.title, url: `${BASE_URL}/blog/${slug}` },
        ]}
      />
      <ArticleSchema
        headline={post.title}
        description={post.excerpt || post.title}
        image={articleImage}
        datePublished={post.published_at || post.created_at || undefined}
        dateModified={post.updated_at || undefined}
        author={{ name: authorName }}
        mainEntityOfPage={`${BASE_URL}/blog/${slug}`}
        interactionStatistic={{ userInteractionCount: likesCount ?? 0 }}
        commentCount={comments.length}
      />
      <nav className="mb-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-text-muted hover:text-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al blog
        </Link>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-text-muted">
          <div className="flex items-center gap-2">
            {author?.profile_image ? (
              <Image
                src={(author as { profile_image: string }).profile_image}
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
            <span>{authorName}</span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(post.published_at || post.created_at)}
          </span>
        </div>
      </header>

      {post.cover_image && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mb-8 text-text-primary [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_img]:rounded-lg [&_img]:my-4 [&_a]:text-secondary [&_a]:hover:underline">
        {post.content ? (
          <div className="blog-content">
            {parse(post.content)}
          </div>
        ) : (
          <p className="text-text-muted">Este artículo no tiene contenido.</p>
        )}
      </div>

      <div className="mb-8">
        <LikeButton
          postId={post.id}
          initialCount={likesCount ?? 0}
          initialLiked={initialLiked}
        />
      </div>

      <CommentsSection postId={post.id} initialComments={comments} />
    </article>
  );
}
