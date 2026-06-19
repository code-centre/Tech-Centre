import { createClient } from '@/lib/supabase/server';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogEyebrow from '@/components/blog/BlogEyebrow';
import { CollectionPageSchema } from '@/components/seo/StructuredData';
import type { BlogPost } from '@/types/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://techcentre.co';

interface BlogPostWithMeta extends BlogPost {
  author: {
    first_name: string;
    last_name: string;
    profile_image: string | null;
  } | null;
  likes_count: number;
}

export const metadata = {
  title: 'Blog | Tech-Centre',
  description: 'Artículos y recursos sobre tecnología y formación profesional',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: `${BASE_URL}/blog`,
    siteName: 'Tech Centre',
    title: 'Blog | Tech-Centre',
    description: 'Artículos y recursos sobre tecnología y formación profesional',
    images: [
      {
        url: `${BASE_URL}/tech-center-logos/TechCentreLogoColor.png`,
        width: 1200,
        height: 630,
        alt: 'Tech Centre - Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Tech-Centre',
    description: 'Artículos y recursos sobre tecnología y formación profesional',
    images: [`${BASE_URL}/tech-center-logos/TechCentreLogoColor.png`],
  },
};

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(
      `
      id,
      author_id,
      title,
      slug,
      excerpt,
      cover_image,
      is_published,
      published_at,
      created_at,
      updated_at,
      author:profiles!author_id(first_name, last_name, profile_image)
    `
    )
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error loading blog posts:', error);
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Error al cargar los artículos. Intenta más tarde.</p>
      </div>
    );
  }

  const postsWithLikes: BlogPostWithMeta[] = await Promise.all(
    (posts || []).map(async (post: Record<string, unknown>) => {
      const { count } = await supabase
        .from('blog_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id as string);

      const author = Array.isArray(post.author) ? post.author[0] : post.author;

      return {
        ...post,
        author: author ?? null,
        likes_count: count ?? 0,
      } as BlogPostWithMeta;
    })
  );

  const [featured, ...rest] = postsWithLikes;

  return (
    <article>
      <CollectionPageSchema
        name="Blog Tech-Centre"
        description="Artículos y recursos sobre tecnología y formación profesional"
        url={`${BASE_URL}/blog`}
        items={postsWithLikes.map((p) => ({
          name: p.title,
          url: `${BASE_URL}/blog/${p.slug}`,
          description: p.excerpt || undefined,
        }))}
      />
      <header className="mb-12 max-w-2xl">
        <BlogEyebrow>Blog</BlogEyebrow>
        <h1 className="font-highlight mt-4 text-4xl font-extrabold text-text-primary sm:text-5xl">
          Aprende y explora
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          Artículos, tutoriales y recursos sobre tecnología, inteligencia artificial y formación
          profesional, desde el Caribe.
        </p>
      </header>

      {postsWithLikes.length === 0 ? (
        <p className="py-16 text-center text-text-muted">
          Aún no hay artículos publicados. ¡Vuelve pronto!
        </p>
      ) : (
        <section className="space-y-6" aria-label="Lista de artículos del blog">
          {featured && <BlogPostCard post={featured} featured />}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      )}
    </article>
  );
}
