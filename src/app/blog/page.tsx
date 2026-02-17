import { createClient } from '@/lib/supabase/server';
import BlogPostCard from '@/components/blog/BlogPostCard';
import type { BlogPost } from '@/types/supabase';

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

  return (
    <article>
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Blog</h1>
        <p className="text-text-muted">
          Artículos, tutoriales y recursos sobre tecnología y formación profesional.
        </p>
      </header>

      {postsWithLikes.length === 0 ? (
        <p className="text-center py-16 text-text-muted">
          Aún no hay artículos publicados. ¡Vuelve pronto!
        </p>
      ) : (
        <section
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          aria-label="Lista de artículos del blog"
        >
          {postsWithLikes.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </section>
      )}
    </article>
  );
}
