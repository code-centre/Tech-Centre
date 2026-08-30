'use client'
import React, { useState, useEffect } from 'react'
import HTMLReactParser from 'html-react-parser/lib/index'
import TiptapEditor from '../TiptapEditor'
import ButtonToEdit from '../ButtonToEdit'
import { useSupabaseClient, useUser } from '@/lib/supabase'

interface Props {
  programData: string;
  programId: number;
  onDescriptionUpdate?: (updatedDescription: string) => void;
}

export function ProgramDescription({ programData, programId, onDescriptionUpdate }: Props) {
  const supabase = useSupabaseClient()
  const [isEditing, setIsEditing] = useState(false)
  const [descriptionContent, setDescriptionContent] = useState(programData || '')
  const [originalContent, setOriginalContent] = useState(programData || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useUser()

  const isAdmin = user?.role === 'admin'

  // Actualizar contenido cuando cambie programData
  useEffect(() => {
    setDescriptionContent(programData || '')
    setOriginalContent(programData || '')
  }, [programData])

  const handleSave = async () => {
    if (!isAdmin) return;
    
    setIsSaving(true);
    setError('');
    
    try {
      const { error: updateError } = await supabase
        .from('programs')
        .update({
          description: descriptionContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', programId);

      if (updateError) {
        setError('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
        return;
      }

      setOriginalContent(descriptionContent);
      setIsEditing(false);
      
      // Notificar al componente padre si existe el callback
      if (onDescriptionUpdate) {
        onDescriptionUpdate(descriptionContent);
      }

    } catch (err) {
      setError('Error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDescriptionContent(originalContent);
    setIsEditing(false);
    setError('');
  };

  const handleStartEdit = () => {
    setDescriptionContent(originalContent);
    setIsEditing(true);
    setError('');
  };

  return (
    <article className="flex flex-col">
      <header className="flex justify-between items-start gap-4 mb-6">
        <div className="flex flex-col gap-3 max-w-2xl">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
            De qué se trata
          </span>
          <h2 className="font-highlight text-3xl md:text-4xl font-extrabold tracking-tight card-text-primary text-balance">
            Descripción del programa
          </h2>
        </div>
        {isAdmin && !isEditing && (
          <ButtonToEdit startEditing={handleStartEdit} />
        )}
      </header>
      
      {isEditing ? (
        <div className="space-y-4">
          <TiptapEditor
            value={descriptionContent}
            onChange={(content) => setDescriptionContent(content)}
            onSave={handleSave}
            onCancel={handleCancel}
            placeholder="Escribe la descripción del programa..."
            variant="full"
          />
          {isSaving && (
            <p className="text-text-muted text-sm">Guardando...</p>
          )}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="prose-content program-description-content text-base md:text-lg leading-relaxed card-text-primary">
          {descriptionContent ? (
            HTMLReactParser(descriptionContent)
          ) : (
            <p className="text-text-muted italic">No hay descripción disponible.</p>
          )}
        </div>
      )}
    </article>
  )
}
