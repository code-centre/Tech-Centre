'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Newspaper, X } from 'lucide-react';
import { useUser, useSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import BlogEditor, { type BlogEditorValues } from '@/components/blog/BlogEditor';

export default function EditarBlogPage() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<BlogEditorValues> | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!user || !id) return;

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        const userId = user.user_id || user.id;
        const isAdmin = user.role === 'admin';
        if (data.author_id !== userId && !isAdmin) {
          toast.error('No tienes permiso para editar este artículo');
          router.push('/admin/blog');
          return;
        }

        setInitialValues({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || '',
          cover_image: data.cover_image || '',
          content: data.content || '',
          is_published: data.is_published ?? false,
        });
      } catch (err: unknown) {
        console.error(err);
        toast.error('Error al cargar el artículo');
        router.push('/admin/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [user, id, supabase, router]);

  const handleSubmit = async (values: BlogEditorValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: values.title,
          slug: values.slug,
          excerpt: values.excerpt || null,
          content: values.content || null,
          cover_image: values.cover_image || null,
          is_published: values.is_published,
          published_at: values.is_published
            ? new Date().toISOString()
            : null,
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(
        values.is_published ? 'Artículo actualizado y publicado' : 'Borrador guardado'
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
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }
  if (!initialValues) return null;

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
              Editar artículo
            </h1>
            <p className="text-text-muted text-sm mt-2">
              Modifica el contenido del artículo
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
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/blog')}
          submitLabel="Guardar cambios"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
