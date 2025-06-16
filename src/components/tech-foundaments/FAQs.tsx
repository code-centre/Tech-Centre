'use client'
import React, { useState } from 'react'
import { HelpCircle, EditIcon, Loader2, PlusCircle } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import Editor from '../Editor'
import useUserStore from '../../../store/useUserStore'

interface FAQItem {
  question: string
  answer: string
  id: string
}

interface Props {
  faqs?: FAQItem[]
  eventId?: string
  saveChanges?: (faqs: FAQItem[]) => Promise<{success: boolean, error?: string}>
}

export default function FAQs({ faqs = [], eventId, saveChanges }: Props) {
  const [isEditing, setIsEditing] = useState<string | boolean>(false)
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useUserStore()
  
  const isAdmin = user?.rol === 'admin'
  const hasFaqs = faqs && faqs.length > 0

  const handleAddNew = () => {
    const newId = `faq-${Date.now()}`
    setEditingFaq({
      question: '',
      answer: '',
      id: newId
    })
    setIsEditing('new')
  }
  
  const handleEdit = (faqId: string) => {
    const faq = faqs.find(f => f.id === faqId)
    if (faq) {
      setEditingFaq(faq)
      setIsEditing(faqId)
    }
  }
  
  const handleSave = async () => {
    if (!saveChanges || !editingFaq) {
      console.error("No hay función de guardado disponible o no hay FAQ para guardar")
      setError("No se puede guardar: Datos incompletos")
      return
    }
    
    try {
      setIsSaving(true)
      setError('')
      
      // Crear una copia actualizada del array de FAQs
      let updatedFaqs: FAQItem[]
      
      if (isEditing === 'new') {
        // Añadir la nueva FAQ
        updatedFaqs = [...faqs, editingFaq]
      } else {
        // Actualizar una FAQ existente
        updatedFaqs = faqs.map(faq => 
          faq.id === editingFaq.id ? editingFaq : faq
        )
      }
      
      const result = await saveChanges(updatedFaqs)
      
      if (result.success) {
        setIsEditing(false)
        setEditingFaq(null)
      } else {
        setError(result.error || "Error al guardar las preguntas frecuentes")
      }
    } catch (error) {
      console.error("Error al guardar las preguntas frecuentes:", error)
      setError("Ocurrió un error inesperado")
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleDelete = async (faqId: string) => {
    if (!saveChanges) {
      console.error("No hay función de guardado disponible")
      setError("No se puede eliminar: Función de guardado no disponible")
      return
    }
    
    try {
      setIsSaving(true)
      setError('')
      
      // Filtrar la FAQ a eliminar
      const updatedFaqs = faqs.filter(faq => faq.id !== faqId)
      
      const result = await saveChanges(updatedFaqs)
      
      if (!result.success) {
        setError(result.error || "Error al eliminar la pregunta frecuente")
      }
    } catch (error) {
      console.error("Error al eliminar la pregunta frecuente:", error)
      setError("Ocurrió un error inesperado")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30">
      {/* Header with gradient */}
      <div className="p-6 text-white flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <HelpCircle className="text-blueApp" size={24} />
          Preguntas frecuentes
        </h2>
        {isAdmin && !isEditing && (
          <div className="flex space-x-2">
            <button 
              onClick={handleAddNew}
              className="bg-blueApp hover:bg-blue-600 transition-colors p-2 rounded-full"
            >
              <PlusCircle className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>
      
      {/* Contenido */}      
      <div className="p-6">       
         {typeof isEditing === 'string' ? (
          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Pregunta
                </label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white"
                  value={editingFaq?.question || ''}
                  onChange={e => setEditingFaq(prev => prev ? {...prev, question: e.target.value} : null)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Respuesta
                </label>
                <Editor
                  value={editingFaq?.answer || ''}
                  onChange={(content) => setEditingFaq(prev => prev ? {...prev, answer: content} : null)}
                  onSave={handleSave}
                  onCancel={() => {
                    setIsEditing(false)
                    setEditingFaq(null)
                  }}
                />
              </div>
            </div>
            
            {error && (
              <div className="p-2 bg-red-900/50 text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        ): isSaving ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-blue-500">Guardando cambios...</span>
          </div>
        ) : hasFaqs ? (
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="border-b border-zinc-700 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-white mb-2">{faq.question}</h3>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(faq.id)} 
                        className="text-blue-500 hover:text-blue-400"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)} 
                        className="text-red-500 hover:text-red-400"
                      >
                        <span aria-hidden>×</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-gray-300 prose prose-invert max-w-none">
                  {HTMLReactParser(faq.answer || '')}
                </div>
              </div>
            ))}
            {error && (
              <div className="p-2 mt-4 bg-red-900/50 text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <HelpCircle className="h-12 w-12 text-zinc-500" />
              <p className="text-zinc-400 text-lg">
                Aún no hay preguntas frecuentes para este curso.
              </p>
              {isAdmin && (
                <button 
                  onClick={handleAddNew}
                  className="mt-2 px-4 py-2 bg-blueApp hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Añadir preguntas frecuentes
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
