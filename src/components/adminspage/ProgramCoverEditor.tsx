'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Pencil, Loader2, Trash2, ImageIcon } from 'lucide-react';
import type { Program } from '@/types/programs';

const BUCKET = 'blog-images';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 5;

interface ProgramCoverEditorProps {
  program: Program;
}

export default function ProgramCoverEditor({ program }: ProgramCoverEditorProps) {
  const [imageUrl, setImageUrl] = useState(program.image || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato no permitido. Use JPEG, PNG, GIF o WebP.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`La imagen no debe superar ${MAX_SIZE_MB}MB`);
      return;
    }

    setIsUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `program-covers/${program.id}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const { error: updateError } = await supabase
        .from('programs')
        .update({ image: publicUrl })
        .eq('id', program.id);

      if (updateError) throw updateError;

      setImageUrl(publicUrl);
      router.refresh();
    } catch (err: unknown) {
      console.error('Error al subir portada:', err);
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('programs')
        .update({ image: null })
        .eq('id', program.id);

      if (updateError) throw updateError;

      setImageUrl('');
      router.refresh();
    } catch (err: unknown) {
      console.error('Error al quitar portada:', err);
      setError(err instanceof Error ? err.message : 'Error al quitar la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section
      className="bg-[var(--card-background)] rounded-lg shadow border border-border-color overflow-hidden"
      aria-labelledby="program-cover-heading"
    >
      <div className="p-4 border-b border-border-color flex items-center justify-between">
        <h2 id="program-cover-heading" className="text-xl font-semibold text-text-primary">
          Portada del programa
        </h2>
      </div>
      <div className="p-6">
        {error && (
          <p className="mb-4 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</p>
        )}

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="shrink-0">
            {imageUrl ? (
              <div className="relative w-48 h-32 sm:w-64 sm:h-40 rounded-lg overflow-hidden bg-bg-secondary border border-border-color">
                <Image
                  src={imageUrl}
                  alt="Portada del programa"
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              </div>
            ) : (
              <div className="w-48 h-32 sm:w-64 sm:h-40 rounded-lg bg-bg-secondary border border-dashed border-border-color flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-text-muted" aria-hidden />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <p className="text-sm text-text-muted">
              La portada se muestra en las tarjetas de programas y en la página de detalle.
            </p>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary hover:bg-bg-primary hover:border-secondary/50 transition-colors cursor-pointer text-sm font-medium">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Pencil className="w-4 h-4" />
                )}
                <span>{imageUrl ? 'Cambiar imagen' : 'Subir imagen'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleUpload}
                  disabled={isUploading}
                  className="sr-only"
                  aria-label="Subir imagen de portada"
                />
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Quitar imagen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
