'use client'
import React, { useState, useEffect } from 'react'
import HTMLReactParser from 'html-react-parser/lib/index'
import ContainerButtonsEdit from '../ContainerButtonsEdit'
import { ArrowDown, Trash2, Plus } from 'lucide-react'
import ButtonToEdit from '../ButtonToEdit'
import TiptapEditor from '../TiptapEditor'
import { useSupabaseClient, useUser } from '@/lib/supabase'

interface FaqItem {
  id?: number;
  pregunta: string;
  respuesta: string;
}

interface Props {
  shortCourse: FaqItem[] | { faqs?: FaqItem[] };
  programId: number;
  onFAQsUpdate?: (updatedFAQs: FaqItem[]) => void;
}

export default function ProgramFAQs({ shortCourse = [], programId, onFAQsUpdate }: Props) {
  const supabase = useSupabaseClient()
  const { user } = useUser()
  const isAdmin = user?.role === 'admin'
  
  const [editingFAQIndex, setEditingFAQIndex] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [editedFAQs, setEditedFAQs] = useState<FaqItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Normalizar los datos de entrada (no sobrescribir si estamos editando para evitar pérdida de contenido)
  useEffect(() => {
    if (editingFAQIndex !== null) return
    if (Array.isArray(shortCourse)) {
      setFaqs(shortCourse)
      setEditedFAQs(shortCourse)
    } else if (shortCourse && typeof shortCourse === 'object' && 'faqs' in shortCourse) {
      const faqsArray = Array.isArray(shortCourse.faqs) ? shortCourse.faqs : []
      setFaqs(faqsArray)
      setEditedFAQs(faqsArray)
    } else {
      setFaqs([])
      setEditedFAQs([])
    }
  }, [shortCourse, editingFAQIndex])

  const handleQuestionChange = (index: number, newQuestion: string) => {
    const updated = [...editedFAQs]
    updated[index] = { ...updated[index], pregunta: newQuestion }
    setEditedFAQs(updated)
  }

  const handleAnswerChange = (index: number, newAnswer: string) => {
    const updated = [...editedFAQs]
    updated[index] = { ...updated[index], respuesta: newAnswer }
    setEditedFAQs(updated)
  }

  const handleAddFAQ = () => {
    const newFAQ: FaqItem = {
      pregunta: '',
      respuesta: ''
    }
    setEditedFAQs([...editedFAQs, newFAQ])
    setEditingFAQIndex(editedFAQs.length) // Editar el nuevo FAQ inmediatamente
  }

  const handleRemoveFAQ = async (index: number) => {
    // Crear una copia actualizada sin el elemento eliminado
    const updated = editedFAQs.filter((_, i) => i !== index)
    
    // Actualizar estado inmediatamente para reflejar el cambio en la UI
    setEditedFAQs(updated)
    
    // Ajustar el índice de edición si es necesario
    if (editingFAQIndex === index) {
      // Si eliminamos el FAQ que estábamos editando, cerrar edición
      setEditingFAQIndex(null)
    } else if (editingFAQIndex !== null && editingFAQIndex > index) {
      // Si eliminamos un FAQ antes del que estábamos editando, ajustar el índice
      setEditingFAQIndex(editingFAQIndex - 1)
    }
    
    // Si no hay FAQs después de eliminar, cerrar edición
    if (updated.length === 0) {
      setEditingFAQIndex(null)
    }

    // Guardar inmediatamente en Supabase
    if (isAdmin) {
      setIsSaving(true)
      setError('')
      
      try {
        // Filtrar FAQs vacías
        const cleanedFAQs = updated.filter(
          faq => faq.pregunta.trim() !== '' && (faq.respuesta?.trim() ?? '').replace(/<[^>]*>/g, '').trim() !== ''
        )

        const { error: updateError } = await supabase
          .from('programs')
          .update({
            faqs: cleanedFAQs,
            updated_at: new Date().toISOString()
          })
          .eq('id', programId)

        if (updateError) {
          setError('Error al eliminar la pregunta. Por favor, inténtalo de nuevo.')
          // Revertir el cambio si hay error
          setEditedFAQs(editedFAQs)
          return
        }

        // Actualizar estado local con los datos guardados
        setFaqs(cleanedFAQs)
        setEditedFAQs(cleanedFAQs)
        
        // Notificar al componente padre
        if (onFAQsUpdate) {
          onFAQsUpdate(cleanedFAQs)
        }
      } catch (err) {
        setError('Error al eliminar la pregunta.')
        // Revertir el cambio si hay error
        setEditedFAQs(editedFAQs)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleSave = async () => {
    if (!isAdmin) return
    
    setIsSaving(true)
    setError('')
    
    try {
      // Filtrar FAQs vacías
      const cleanedFAQs = editedFAQs.filter(
        faq => faq.pregunta.trim() !== '' && (faq.respuesta?.trim() ?? '').replace(/<[^>]*>/g, '').trim() !== ''
      )

      // Actualizar en Supabase
      const { error: updateError } = await (supabase as any)
        .from('programs')
        .update({
          faqs: cleanedFAQs,
          updated_at: new Date().toISOString()
        })
        .eq('id', programId)

      if (updateError) {
        setError('Error al guardar los cambios. Por favor, inténtalo de nuevo.')
        return
      }

      // Actualizar estado local
      setFaqs(cleanedFAQs)
      setEditedFAQs(cleanedFAQs)
      setEditingFAQIndex(null)
      
      // Notificar al componente padre si existe el callback
      if (onFAQsUpdate) {
        onFAQsUpdate(cleanedFAQs)
      }
    } catch (err) {
      setError('Error al guardar los cambios.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedFAQs(faqs)
    setEditingFAQIndex(null)
    setError('')
  }

  const handleStartEdit = (index: number) => {
    setEditedFAQs([...faqs])
    setEditingFAQIndex(index)
    setError('')
  }

  const hasUnsavedChanges = editingFAQIndex !== null && (
    JSON.stringify(editedFAQs) !== JSON.stringify(faqs)
  )

  useEffect(() => {
    if (!hasUnsavedChanges) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  return (
    <section className="faq-section">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold card-text-primary">Preguntas Frecuentes</h2>
        {isAdmin && editingFAQIndex === null && (
          <button
            onClick={handleAddFAQ}
            type="button"
            className="btn-faq-add px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 cursor-pointer" />
            Agregar pregunta
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {editedFAQs.length === 0 && !isAdmin ? (
        <p className="card-text-primary italic">No hay preguntas frecuentes disponibles.</p>
      ) : (
        <div className="space-y-5">
          {editedFAQs.map((item, i) => (
            <div key={`faq-${i}-${item.pregunta?.substring(0, 10) || i}`} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              {editingFAQIndex === i ? (
                <div className="flex flex-col gap-4 bg-bg-secondary dark:bg-gray-800/30 p-4 rounded-lg border border-border-color dark:border-gray-700">
                  <input
                    value={item.pregunta}
                    onChange={(e) => handleQuestionChange(i, e.target.value)}
                    className="w-full px-4 py-3 font-medium text-text-primary dark:text-white bg-bg-secondary dark:bg-gray-800 border border-border-color dark:border-gray-600 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary
                    placeholder:text-text-muted
                    transition-all duration-200"
                    type="text"
                    placeholder="Escribe la pregunta..."
                  />
                  <TiptapEditor
                    value={item.respuesta}
                    onChange={(content) => handleAnswerChange(i, content)}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    placeholder="Escribe la respuesta..."
                    variant="simple"
                    showActions={false}
                  />
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleRemoveFAQ(i)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                    <ContainerButtonsEdit
                      setFinishEdit={handleCancel}
                      onSave={handleSave}
                    />
                  </div>
                  {isSaving && (
                    <p className="text-text-muted dark:text-gray-400 text-sm">Guardando...</p>
                  )}
                </div>
              ) : (
                <details className="group border-b border-border-color dark:border-gray-700 pb-4">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none py-2">
                    <h3 className="text-xl card-text-primary font-semibold pr-8">
                      {i + 1}. {item.pregunta}
                    </h3>
                    <div className="flex gap-2 items-center">
                      <span className="card-text-primary transform group-open:rotate-180 transition-transform duration-300">
                        <ArrowDown />
                      </span>
                      {isAdmin && (
                        <ButtonToEdit startEditing={() => handleStartEdit(i)} />
                      )}
                    </div>
                  </summary>
                  <div className="mt-4 prose-content card-text-primary leading-relaxed pl-1">
                    {item.respuesta ? (
                      item.respuesta.trim().startsWith('<')
                        ? HTMLReactParser(item.respuesta)
                        : <p>{item.respuesta}</p>
                    ) : null}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
