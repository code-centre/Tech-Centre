'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff, Newspaper, SearchX } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminFilterTabs from '@/components/admin/AdminFilterTabs';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import {
  adminTableClass,
  adminTableHeadCellClass,
  adminTableRowClass,
} from '@/components/admin/admin-table';
import { useUser, useSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import type { BlogPost } from '@/types/supabase';

interface BlogPostWithAuthor extends BlogPost {
  author?: {
    first_name?: string;
    last_name?: string;
  } | null;
}

type FilterType = 'all' | 'published' | 'draft';

export default function AdminBlogPage() {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [posts, setPosts] = useState<BlogPostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BlogPostWithAuthor | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const userId = user?.user_id || user?.id;
      let query = supabase
        .from('blog_posts')
        .select(
          `
          id,
          author_id,
          title,
          slug,
          excerpt,
          is_published,
          published_at,
          created_at,
          updated_at,
          author:profiles!author_id(first_name, last_name)
        `
        )
        .order('created_at', { ascending: false });

      if (user?.role === 'instructor' && userId) {
        query = query.eq('author_id', userId);
      }
      const { data, error } = await query;

      if (error) throw error;

      setPosts(
        (data || []).map((p: Record<string, unknown>) => ({
          ...p,
          author: Array.isArray(p.author) ? p.author[0] ?? null : p.author ?? null,
        })) as BlogPostWithAuthor[]
      );
    } catch (err: unknown) {
      console.error(err);
      toast.error('Error al cargar los artículos');
    } finally {
      setLoading(false);
    }
  }, [supabase, user?.role, user?.user_id, user?.id]);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user, fetchPosts]);

  const handleDelete = async (post: BlogPostWithAuthor) => {
    if (!confirmDelete || confirmDelete.id !== post.id) return;

    setDeletingId(post.id);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setConfirmDelete(null);
      toast.success('Artículo eliminado');
    } catch (err: unknown) {
      console.error(err);
      toast.error('Error al eliminar el artículo');
    } finally {
      setDeletingId(null);
    }
  };

  const canEdit = (post: BlogPostWithAuthor) => {
    const userId = user?.user_id || user?.id;
    return user?.role === 'admin' || (user?.role === 'instructor' && post.author_id === userId);
  };

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.is_published).length,
    draft: posts.filter((p) => !p.is_published).length,
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === 'published') return post.is_published;
    if (filter === 'draft') return !post.is_published;
    return true;
  });

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (!user || (user?.role !== 'admin' && user?.role !== 'instructor')) {
    return (
      <div className="p-8 text-center text-text-primary">
        No tienes permisos para ver esta sección
      </div>
    );
  }

  if (loading) {
    return (
      <main className="container mx-auto">
        <AdminPageSkeleton />
      </main>
    );
  }

  const filterTabs = [
    { value: 'all', label: 'Todos', count: stats.total },
    { value: 'published', label: 'Publicados', count: stats.published },
    { value: 'draft', label: 'Borradores', count: stats.draft },
  ];

  return (
    <main className="container mx-auto space-y-6">
      <AdminPageHeader
        icon={Newspaper}
        title="Blog"
        subtitle={`${stats.total} ${stats.total === 1 ? 'artículo' : 'artículos'} · ${stats.published} publicados · ${stats.draft} borradores`}
        action={
          <Link href="/admin/blog/nuevo" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Nuevo artículo
          </Link>
        }
      />

      <AdminFilterTabs
        tabs={filterTabs}
        value={filter}
        onChange={(value) => setFilter(value as FilterType)}
        ariaLabel="Filtrar artículos"
      />

      {filteredPosts.length === 0 ? (
        <AdminEmptyState
          icon={SearchX}
          title={posts.length === 0 ? 'Aún no hay artículos' : 'No hay artículos en esta categoría'}
          description="Crea tu primer artículo para publicarlo en el blog."
          actions={
            posts.length === 0 ? (
              <Link href="/admin/blog/nuevo" className="btn-primary inline-flex items-center gap-2">
                <Plus size={20} />
                Crear primer artículo
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className={adminTableClass}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color bg-bg-secondary">
                  <th scope="col" className={adminTableHeadCellClass}>Título</th>
                  <th scope="col" className={adminTableHeadCellClass}>Estado</th>
                  <th scope="col" className={adminTableHeadCellClass}>Fecha</th>
                  <th scope="col" className={`${adminTableHeadCellClass} text-right`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} className={adminTableRowClass}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-text-primary hover:text-secondary"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        post.is_published
                          ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {post.is_published ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Publicado
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          Borrador
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-muted">
                    {formatDate(post.published_at || post.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canEdit(post) ? (
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/blog/${post.id}/editar`}
                          className="p-2 rounded-lg text-text-muted hover:bg-bg-primary hover:text-secondary transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDelete(confirmDelete?.id === post.id ? null : post)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            confirmDelete?.id === post.id
                              ? 'bg-red-500/20 text-red-500'
                              : 'text-text-muted hover:bg-bg-primary hover:text-red-500'
                          }`}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {confirmDelete?.id === post.id && (
                          <button
                            type="button"
                            onClick={() => handleDelete(post)}
                            disabled={deletingId === post.id}
                            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                          >
                            {deletingId === post.id ? '...' : 'Confirmar'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </main>
  );
}
