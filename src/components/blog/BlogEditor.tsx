'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { useSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface BlogEditorValues {
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  content: string;
  is_published: boolean;
}

interface BlogEditorProps {
  initialValues?: Partial<BlogEditorValues>;
  onSubmit: (values: BlogEditorValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export default function BlogEditor({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Publicar',
  isSubmitting = false,
}: BlogEditorProps) {
  const supabase = useSupabaseClient();
  const editorRef = useRef(null);

  const [title, setTitle] = useState(initialValues.title ?? '');
  const [slug, setSlug] = useState(initialValues.slug ?? '');
  const [excerpt, setExcerpt] = useState(initialValues.excerpt ?? '');
  const [coverImage, setCoverImage] = useState(initialValues.cover_image ?? '');
  const [content, setContent] = useState(initialValues.content ?? '');
  const [isPublished, setIsPublished] = useState(initialValues.is_published ?? false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (initialValues.title !== undefined) setTitle(initialValues.title);
    if (initialValues.slug !== undefined) setSlug(initialValues.slug);
    if (initialValues.excerpt !== undefined) setExcerpt(initialValues.excerpt);
    if (initialValues.cover_image !== undefined) setCoverImage(initialValues.cover_image);
    if (initialValues.content !== undefined) setContent(initialValues.content);
    if (initialValues.is_published !== undefined) setIsPublished(initialValues.is_published);
  }, [initialValues]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setTitle(val);
      if (!initialValues.slug || slug === slugify(initialValues.title ?? '')) {
        setSlug(slugify(val));
      }
    },
    [initialValues.slug, initialValues.title, slug]
  );

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const uploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Formato no permitido. Use JPEG, PNG, GIF o WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    setUploadingCover(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('No autenticado');

      const ext = file.name.split('.').pop() || 'jpg';
      const path = `covers/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

      const { error } = await supabase.storage
        .from('blog-images')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('blog-images').getPublicUrl(path);
      setCoverImage(publicUrl);
      toast.success('Imagen subida');
    } catch (err: unknown) {
      console.error(err);
      toast.error('Error al subir la imagen');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  const removeCoverImage = () => setCoverImage('');

  const editorConfig = useMemo(
    () => ({
      toolbarButtonSize: 'middle' as const,
      toolbarAdaptive: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      buttons: [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'ul',
        'ol',
        'outdent',
        'indent',
        'align',
        'link',
        'image',
        'paragraph',
        'heading',
        'source',
      ],
      removeButtons: [
        'font',
        'fontsize',
        'brush',
        'copyformat',
        'table',
        'video',
        'file',
        'hr',
        'eraser',
        'fullsize',
        'print',
        'about',
      ],
      uploader: {
        url: '/api/blog/upload-image',
        imagesExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        headers: {},
        format: 'json',
        method: 'POST',
        prepareData: (formData: FormData) => {
          const file = formData.get('files[0]') as File;
          if (file) {
            const newFormData = new FormData();
            newFormData.append('file', file);
            return newFormData;
          }
          return formData;
        },
      },
    }),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }
    if (!slug.trim()) {
      toast.error('El slug es obligatorio');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        excerpt: excerpt.trim(),
        cover_image: coverImage,
        content,
        is_published: isPublished,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
          Título
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Título del artículo"
          className="w-full px-4 py-3 rounded-lg border border-border-color bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50"
          required
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-text-primary mb-2">
          Slug (URL)
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={handleSlugChange}
          placeholder="url-del-articulo"
          className="w-full px-4 py-3 rounded-lg border border-border-color bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50 font-mono text-sm"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-text-primary mb-2">
          Extracto
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Breve descripción del artículo"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-border-color bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Imagen de portada
        </label>
        {coverImage ? (
          <div className="relative inline-block">
            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-border-color">
              <Image
                src={coverImage}
                alt="Portada"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={removeCoverImage}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/90 text-white hover:bg-red-500 transition-colors"
              title="Quitar imagen"
              aria-label="Quitar imagen de portada"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full max-w-md aspect-video border-2 border-dashed border-border-color rounded-lg cursor-pointer hover:bg-bg-secondary transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={uploadCoverImage}
              disabled={uploadingCover}
              className="hidden"
            />
            {uploadingCover ? (
              <span className="text-text-muted">Subiendo...</span>
            ) : (
              <>
                <Upload className="w-10 h-10 text-text-muted mb-2" />
                <span className="text-sm text-text-muted">
                  Haz clic para subir imagen de portada
                </span>
              </>
            )}
          </label>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Contenido
        </label>
        <div className="text-text-primary">
          <JoditEditor
            ref={editorRef}
            value={content}
            config={editorConfig}
            onChange={handleContentChange}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded border-border-color text-secondary focus:ring-secondary/50"
          />
          <span className="text-sm text-text-primary">Publicar inmediatamente</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-medium bg-bg-secondary text-text-primary border border-border-color hover:bg-bg-secondary/80 hover:border-secondary/50 transition-all duration-200"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
