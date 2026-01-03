'use client'
import React, { useState, useEffect } from 'react'
import ContainerButtonsEdit from '../ContainerButtonsEdit'
import { ArrowDown, Trash2, Plus } from 'lucide-react'
import ButtonToEdit from '../ButtonToEdit'
import { useUser } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

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
  const { user } = useUser()
  const isAdmin = user?.role === 'admin'
  
  const [editingFAQIndex, setEditingFAQIndex] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [editedFAQs, setEditedFAQs] = useState<FaqItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Normalizar los datos de entrada
  useEffect(() => {
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
  }, [shortCourse])

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
          faq => faq.pregunta.trim() !== '' && faq.respuesta.trim() !== ''
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
        faq => faq.pregunta.trim() !== '' && faq.respuesta.trim() !== ''
      )

      // Actualizar en Supabase
      const { error: updateError } = await supabase
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

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Preguntas Frecuentes</h2>
        {isAdmin && editingFAQIndex === null && (
          <button
            onClick={handleAddFAQ}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700 rounded-md hover:bg-gray-800 hover:border-gray-600 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 cursor-pointer" />
            Agregar pregunta
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-800">
          {error}
        </div>
      )}

      {editedFAQs.length === 0 && !isAdmin ? (
        <p className="text-gray-400 italic">No hay preguntas frecuentes disponibles.</p>
      ) : (
        <div className="space-y-5">
          {editedFAQs.map((item, i) => (
            <div key={`faq-${i}-${item.pregunta?.substring(0, 10) || i}`} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              {editingFAQIndex === i ? (
                <div className="flex flex-col gap-4 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                  <input
                    value={item.pregunta}
                    onChange={(e) => handleQuestionChange(i, e.target.value)}
                    className="w-full px-4 py-3 font-medium text-white bg-gray-800 border border-gray-600 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blueApp focus:border-blueApp
                    transition-all duration-200"
                    type="text"
                    placeholder="Escribe la pregunta..."
                  />
                  <textarea
                    value={item.respuesta}
                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                    className="w-full px-4 py-3 text-gray-200 bg-gray-800 border border-gray-600 rounded-lg min-h-[100px]
                    focus:outline-none focus:ring-2 focus:ring-blueApp focus:border-blueApp
                    transition-all duration-200 resize-y"
                    placeholder="Escribe la respuesta..."
                  />
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleRemoveFAQ(i)}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
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
                    <p className="text-gray-400 text-sm">Guardando...</p>
                  )}
                </div>
              ) : (
                <details className="group border-b border-gray-700 pb-4">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none py-2">
                    <h3 className="text-xl text-white font-semibold pr-8">
                      {i + 1}. {item.pregunta}
                    </h3>
                    <div className="flex gap-2 items-center">
                      <span className="text-blueApp transform group-open:rotate-180 transition-transform duration-300">
                        <ArrowDown />
                      </span>
                      {isAdmin && (
                        <ButtonToEdit startEditing={() => handleStartEdit(i)} />
                      )}
                    </div>
                  </summary>
                  <div className="mt-4 text-gray-300 leading-relaxed pl-1">
                    {item.respuesta}
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
