'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff, Newspaper, Filter, Loader2 } from 'lucide-react';
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

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Newspaper className="text-secondary" size={28} />
            </div>
            Blog
          </h1>
          <p className="text-text-muted mt-2">Gestiona los artículos del blog</p>
        </div>
        <Link
          href="/admin/blog/nuevo"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo artículo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Total artículos</p>
              <p className="text-3xl font-bold text-text-primary">{stats.total}</p>
            </div>
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Newspaper className="text-secondary" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Publicados</p>
              <p className="text-3xl font-bold text-green-400">{stats.published}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Eye className="text-green-400" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Borradores</p>
              <p className="text-3xl font-bold text-amber-400">{stats.draft}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <EyeOff className="text-amber-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="text-text-muted" size={20} />
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              type="button"
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                filter === filterType
                  ? 'btn-primary'
                  : 'bg-bg-secondary text-text-primary border border-border-color hover:bg-bg-secondary/80 hover:border-secondary/50'
              }`}
            >
              {filterType === 'all' ? 'Todos' : filterType === 'published' ? 'Publicados' : 'Borradores'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--card-background)] rounded-xl border border-border-color overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-secondary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center">
            <Newspaper className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted text-lg mb-4">
              {posts.length === 0
                ? 'Aún no hay artículos'
                : `No hay artículos ${filter !== 'all' ? 'en esta categoría' : ''}`}
            </p>
            {posts.length === 0 && (
              <Link
                href="/admin/blog/nuevo"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Crear primer artículo
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead className="bg-bg-secondary/50 border-b border-border-color">
                <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Título
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-bg-primary/50">
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
        )}
      </div>
    </div>
  );
}
