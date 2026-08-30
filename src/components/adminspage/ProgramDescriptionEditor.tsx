'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HTMLReactParser from 'html-react-parser/lib/index';
import { Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TiptapEditor from '../TiptapEditor';
import type { Program } from '@/types/programs';

interface Props {
  program: Program;
}

/**
 * `programs.description` es HTML de Tiptap. Ya se puede editar en línea desde
 * la página pública, pero desde el admin también hace falta: es donde se
 * prepara un programa que todavía no se quiere mostrar.
 */
export default function ProgramDescriptionEditor({ program }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState(program.description || '');

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('programs')
        .update({ description: content, updated_at: new Date().toISOString() })
        .eq('id', program.id);

      if (updateError) throw updateError;
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error('Error al guardar la descripción:', err);
      setError('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(program.description || '');
    setError('');
    setIsEditing(false);
  };

  return (
    <section
      className="bg-[var(--card-background)] rounded-lg shadow border border-border-color overflow-hidden"
      aria-labelledby="program-description-heading"
    >
      <div className="p-4 border-b border-border-color flex items-center justify-between gap-4">
        <h2 id="program-description-heading" className="text-xl font-semibold text-text-primary">
          Descripción del programa
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            type="button"
            className="shrink-0 px-3 py-2 text-sm font-medium text-text-primary bg-bg-secondary border border-border-color rounded-md hover:border-secondary/50 transition-all flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <TiptapEditor
              value={content}
              onChange={setContent}
              onSave={handleSave}
              onCancel={handleCancel}
              placeholder="Escribe la descripción del programa..."
              variant="full"
            />
            {isSaving && <p className="text-sm text-text-muted">Guardando...</p>}
          </div>
        ) : (
          <div className="prose-content text-text-primary leading-relaxed">
            {program.description ? (
              HTMLReactParser(program.description)
            ) : (
              <p className="text-text-muted">Sin descripción todavía.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
