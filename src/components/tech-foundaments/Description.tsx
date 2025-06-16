import React, { useState } from 'react'
import { EditIcon, Loader2 } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import Editor from '../Editor'
import useUserStore from '../../../store/useUserStore'

interface Props {
  description: string
  eventId?: string
  saveChanges?: (content: string) => Promise<{success: boolean, error?: string}>
}
export function Description({ description, eventId, saveChanges }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [descriptionContent, setDescriptionContent] = useState(description)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useUserStore()
  
  const isAdmin = user?.rol === 'admin'
  
  const handleSave = async () => {
    if (!saveChanges) {
      console.error("No hay función de guardado disponible")
      setError("No se puede guardar: Función de guardado no disponible")
      return
    }
    
    try {
      setIsSaving(true)
      setError('')
      
      const result = await saveChanges(descriptionContent)
      
      if (result.success) {
        setIsEditing(false)
      } else {
        setError(result.error || "Error al guardar la descripción")
      }
    } catch (error) {
      console.error("Error al actualizar la descripción:", error)
      setError("Ocurrió un error al guardar los cambios")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold mb-4">Detalles de este curso especializado</h2>
        {isAdmin && (
          isEditing ? (
            <button 
              className="ml-2 bg-blue-600 p-1 rounded opacity-50" 
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              <EditIcon className="w-4 h-4" />
            </button>
          ) : (
            <button 
              className="ml-2 bg-blue-600 p-1 rounded hover:bg-blue-700 transition-colors" 
              onClick={() => setIsEditing(true)}
            >
              <EditIcon className="w-4 h-4" />
            </button>
          )
        )}
      </div>
      {isEditing ? (
        <Editor
          value={descriptionContent}
          onChange={(content) => setDescriptionContent(content)}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          {isSaving ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-blue-500">Guardando cambios...</span>
            </div>          ) : (
            <div className="text-gray-300 leading-relaxed">
              {HTMLReactParser(description || '')}
              {error && (
                <div className="p-2 mt-4 bg-red-900/50 text-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
