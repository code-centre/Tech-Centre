'use client'
import React, { useState, useEffect } from 'react'
import HTMLReactParser from 'html-react-parser/lib/index'
import Editor from '../Editor'
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
    <section>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalles de este programa</h2>
          {isAdmin && !isEditing && (
            <ButtonToEdit startEditing={handleStartEdit} />
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <Editor
              value={descriptionContent}
              onChange={(content) => setDescriptionContent(content)}
              onSave={handleSave}
              onCancel={handleCancel}
            />
            {isSaving && (
              <p className="text-gray-400 text-sm">Guardando...</p>
            )}
            {error && (
              <div className="p-3 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-800">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-300 text-md leading-relaxed text-left">
            {descriptionContent ? (
              HTMLReactParser(descriptionContent)
            ) : (
              <p className="text-gray-500 italic">No hay descripción disponible.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
