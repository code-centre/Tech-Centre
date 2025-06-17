import React, { useState } from 'react'
import { EditIcon, Loader2 } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import Editor from '../Editor'
import useUserStore from '../../../store/useUserStore'

interface Props {
  shortCourse: EventFCA,
  saveChanges: (propertyName: string, content: any, index?: number) => void
}
export function Description({ shortCourse, saveChanges }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [descriptionContent, setDescriptionContent] = useState(shortCourse?.description || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useUserStore()

  const isAdmin = user?.rol === 'admin'

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
          value={shortCourse?.description || ''}
          onChange={(content) => setDescriptionContent(content)}
          onSave={() => {
            saveChanges('description', descriptionContent)
            setIsEditing(false)
          }}      
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          {isSaving ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-blue-500">Guardando cambios...</span>
            </div>) : (
            <div className="text-gray-300 leading-relaxed">
              {HTMLReactParser(shortCourse?.description || '')}
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
