'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Newspaper, X } from 'lucide-react';
import { useUser, useSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import BlogEditor, { type BlogEditorValues } from '@/components/blog/BlogEditor';

export default function NuevoBlogPage() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: BlogEditorValues) => {
    const userId = user?.user_id || user?.id;
    if (!userId) {
      toast.error('Debes iniciar sesión para crear artículos');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('blog_posts').insert({
        author_id: userId,
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt || null,
        content: values.content || null,
        cover_image: values.cover_image || null,
        is_published: values.is_published,
        published_at: values.is_published ? new Date().toISOString() : null,
      });

      if (error) throw error;
      toast.success(
        values.is_published ? 'Artículo publicado' : 'Borrador guardado'
      );
      router.push('/admin/blog');
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
        toast.error('Ya existe un artículo con ese slug. Usa otro.');
      } else {
        toast.error('Error al guardar el artículo');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto space-y-6">
      <nav>
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 text-text-muted hover:text-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al blog
        </Link>
      </nav>

      <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Newspaper className="text-secondary" size={24} />
              </div>
              Nuevo artículo
            </h1>
            <p className="text-text-muted text-sm mt-2">
              Crea un nuevo artículo para el blog
            </p>
          </div>
          <Link
            href="/admin/blog"
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <X size={24} />
          </Link>
        </div>

        <BlogEditor
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/blog')}
          submitLabel="Guardar artículo"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
