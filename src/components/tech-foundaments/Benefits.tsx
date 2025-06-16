'use client'
import React, { useState } from 'react'
import { GiftIcon, EditIcon, Loader2 } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import Editor from '../Editor'
import useUserStore from '../../../store/useUserStore'

interface Props {
  benefits?: string
  eventId?: string
  saveChanges?: (content: string) => Promise<{success: boolean, error?: string}>
}

export default function Benefits({ benefits, eventId, saveChanges }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(benefits || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useUserStore()
  
  const isAdmin = user?.rol === 'admin'
  const hasBenefits = benefits && benefits.trim() !== ''
  
  const handleSave = async () => {
    if (!saveChanges) {
      console.error("No hay función de guardado disponible")
      setError("No se puede guardar: Función de guardado no disponible")
      return
    }
    
    try {
      setIsSaving(true)
      setError('')
      
      const result = await saveChanges(content)
      
      if (result.success) {
        setIsEditing(false)
      } else {
        setError(result.error || "Error al guardar los beneficios")
      }
    } catch (error) {
      console.error("Error al guardar los beneficios:", error)
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
          <GiftIcon className="text-blueApp" size={24} />
          Beneficios del curso
        </h2>
        {isAdmin && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-blueApp hover:bg-blue-600 transition-colors p-2 rounded-full"
          >
            <EditIcon className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      
      {/* Contenido */}      
      <div className="p-6">       
         {isEditing ? (
          <div className="space-y-4">
            <Editor
              value={content}
              onChange={(newContent) => setContent(newContent)}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
            {error && (
              <div className="p-2 bg-red-900/50 text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        ): isSaving ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-blue-500">Guardando beneficios...</span>
          </div>
        ) : hasBenefits ? (
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 leading-relaxed prose-headings:text-blueApp prose-a:text-blue-400">
              {HTMLReactParser(benefits || '')}
            </div>
            {error && (
              <div className="p-2 mt-4 bg-red-900/50 text-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <GiftIcon className="h-12 w-12 text-zinc-500" />
              <p className="text-zinc-400 text-lg">
                Aún no hay información sobre los beneficios de este curso.
              </p>
              {isAdmin && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-2 px-4 py-2 bg-blueApp hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Añadir beneficios
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
