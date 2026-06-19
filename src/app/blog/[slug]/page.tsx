import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import parse, { Element } from 'html-react-parser';
import { ArrowLeft, Calendar, Clock, ArrowRight } from 'lucide-react';
import CommentsSection from '@/components/blog/CommentsSection';
import LikeButton from '@/components/blog/LikeButton';
import BlogEyebrow from '@/components/blog/BlogEyebrow';
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

function readingTimeMinutes(html: string | null): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.round(words / 200));
}

// Quita de los estilos en línea las propiedades de color y tipografía que
// rompen el tema (vienen pegadas desde editores como Google Docs). Conserva
// el resto (text-align, etc.).
const STRIPPED_STYLE_PROPS = new Set([
  'color',
  'background-color',
  'background',
  'font-family',
  'font-size',
  'line-height',
]);

function sanitizeInlineStyle(style: string): string | undefined {
  const kept = style
    .split(';')
    .map((decl) => decl.trim())
    .filter(Boolean)
    .filter((decl) => {
      const prop = decl.split(':')[0]?.trim().toLowerCase();
      return prop ? !STRIPPED_STYLE_PROPS.has(prop) : false;
    });
  return kept.length ? kept.join(';') : undefined;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://techcentre.co';
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
  const rawCoverUrl =
    meta.cover_image?.startsWith('http')
      ? meta.cover_image
      : meta.cover_image
        ? `${BASE_URL}${meta.cover_image.startsWith('/') ? '' : '/'}${meta.cover_image}`
        : null;
  // WhatsApp requires og:image under ~600KB. Use our resize API for cover images.
  const ogImage = rawCoverUrl
    ? `${BASE_URL}/api/og-image?url=${encodeURIComponent(rawCoverUrl)}`
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
    <article className="w-full max-w-3xl mx-auto min-w-0 overflow-x-hidden">
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
          className="inline-flex items-center gap-2 text-text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al blog
        </Link>
      </nav>

      <header className="mb-8">
        <BlogEyebrow>Artículo</BlogEyebrow>
        <h1 className="font-highlight mb-5 mt-4 text-3xl font-extrabold leading-tight text-text-primary md:text-5xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-text-muted">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-medium text-primary">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-text-primary">{authorName}</span>
          </div>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(post.published_at || post.created_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {readingTimeMinutes(post.content)} min de lectura
          </span>
        </div>
      </header>

      {post.cover_image && (
        <figure className="relative aspect-video rounded-xl overflow-hidden mb-8 w-full">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </figure>
      )}

      <div className="mb-8">
        {post.content ? (
          <div className="blog-prose blog-content overflow-x-hidden">
            {parse(post.content, {
              replace: (domNode) => {
                if (domNode instanceof Element && domNode.attribs) {
                  if (domNode.name === 'img') {
                    const { width: _w, height: _h, style: _s, ...rest } = domNode.attribs;
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        {...rest}
                        className="max-w-full h-auto rounded-lg my-4 block"
                        style={{ maxWidth: '100%', height: 'auto' }}
                        loading="lazy"
                      />
                    );
                  }
                  // Saneamos estilos en línea (p. ej. pegados desde Google Docs:
                  // color:#000000, font-family:Arial) para que mande el tema y se
                  // lea bien en modo claro y oscuro.
                  if (domNode.attribs.style) {
                    const cleaned = sanitizeInlineStyle(domNode.attribs.style);
                    if (cleaned) domNode.attribs.style = cleaned;
                    else delete domNode.attribs.style;
                  }
                }
                return undefined;
              },
            })}
          </div>
        ) : (
          <p className="text-text-muted">Este artículo no tiene contenido.</p>
        )}
      </div>

      <div className="mb-10">
        <LikeButton
          postId={post.id}
          initialCount={likesCount ?? 0}
          initialLiked={initialLiked}
        />
      </div>

      <aside className="mb-12 overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
        <h2 className="font-highlight text-2xl font-extrabold text-text-primary sm:text-3xl">
          ¿Listo para construir con IA?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-text-muted">
          Aprende a construir aplicaciones y agentes de IA de cero a desplegar, presencial en
          Barranquilla. Dos rutas: Construye (web) y Revela (datos).
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/programas"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 font-semibold text-[#0E1116] transition-transform hover:scale-[1.02]"
          >
            Ver programas
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/inscripcion"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border-color px-6 py-3 font-semibold text-text-primary transition-colors hover:border-primary hover:text-primary"
          >
            Inscríbete
          </Link>
        </div>
      </aside>

      <CommentsSection postId={post.id} initialComments={comments} />
    </article>
  );
}
