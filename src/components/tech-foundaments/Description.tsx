import React, { useState } from 'react'
import { EditIcon, Loader2 } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import Editor from '../Editor'
import { db } from '../../../firebase'
import { doc, updateDoc } from 'firebase/firestore'
import useUserStore from '../../../store/useUserStore'

interface Props {
  description: string
  eventId?: string
}
export function Description({ description, eventId }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [descriptionContent, setDescriptionContent] = useState(description)
  const [isSaving, setIsSaving] = useState(false)
  const { user } = useUserStore()
  
  const isAdmin = user?.rol === 'admin'
  
  const handleSave = async () => {
    if (!eventId) {
      console.error("No se puede guardar sin un ID de evento")
      return
    }
    
    try {
      setIsSaving(true)
      const eventDocRef = doc(db, "events", eventId)
      await updateDoc(eventDocRef, {
        description: descriptionContent,
        updatedAt: new Date().toISOString()
      })
      
      setIsEditing(false)
    } catch (error) {
      console.error("Error al actualizar la descripción:", error)
      alert("Ocurrió un error al guardar los cambios. Por favor, intenta de nuevo.")
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
            </div>
          ) : (            <div className="text-gray-300 leading-relaxed">
              {HTMLReactParser(description || '')}
            </div>
          )}
        </>
      )}    </div>
  )
}
