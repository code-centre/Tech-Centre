'use client'
import React, { useState } from 'react'
import { BookOpen, EditIcon, Loader2, PlusCircle, Trash2 } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import Editor from '../Editor'
import useUserStore from '../../../store/useUserStore'

interface SyllabusModule {
  id: string
  title: string
  content: string
}

interface Props {
  syllabus?: SyllabusModule[]
  eventId?: string
  saveChanges?: (syllabus: SyllabusModule[]) => Promise<{success: boolean, error?: string}>
}

export default function Syllabus({ syllabus = [], eventId, saveChanges }: Props) {
  const [isEditing, setIsEditing] = useState<string | boolean>(false)
  const [editingModule, setEditingModule] = useState<SyllabusModule | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useUserStore()
  
  const isAdmin = user?.rol === 'admin'
  const hasSyllabus = syllabus && syllabus.length > 0

  const handleAddNew = () => {
    const newId = `module-${Date.now()}`
    setEditingModule({
      id: newId,
      title: '',
      content: ''
    })
    setIsEditing('new')
  }
  
  const handleEdit = (moduleId: string) => {
    const module = syllabus.find(m => m.id === moduleId)
    if (module) {
      setEditingModule(module)
      setIsEditing(moduleId)
    }
  }
  
  const handleSave = async () => {
    if (!saveChanges || !editingModule) {
      console.error("No hay función de guardado disponible o no hay módulo para guardar")
      setError("No se puede guardar: Datos incompletos")
      return
    }
    
    try {
      setIsSaving(true)
      setError('')
      
      // Crear una copia actualizada del array de syllabus
      let updatedSyllabus: SyllabusModule[]
      
      if (isEditing === 'new') {
        // Añadir el nuevo módulo
        updatedSyllabus = [...syllabus, editingModule]
      } else {
        // Actualizar un módulo existente
        updatedSyllabus = syllabus.map(module => 
          module.id === editingModule.id ? editingModule : module
        )
      }
      
      const result = await saveChanges(updatedSyllabus)
      
      if (result.success) {
        setIsEditing(false)
        setEditingModule(null)
      } else {
        setError(result.error || "Error al guardar el syllabus")
      }
    } catch (error) {
      console.error("Error al guardar el syllabus:", error)
      setError("Ocurrió un error inesperado")
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleDelete = async (moduleId: string) => {
    if (!saveChanges) {
      console.error("No hay función de guardado disponible")
      setError("No se puede eliminar: Función de guardado no disponible")
      return
    }
    
    try {
      setIsSaving(true)
      setError('')
      
      // Filtrar el módulo a eliminar
      const updatedSyllabus = syllabus.filter(module => module.id !== moduleId)
      
      const result = await saveChanges(updatedSyllabus)
      
      if (!result.success) {
        setError(result.error || "Error al eliminar el módulo")
      }
    } catch (error) {
      console.error("Error al eliminar el módulo:", error)
      setError("Ocurrió un error inesperado")
    } finally {
      setIsSaving(false)
    }
  }
  
  const moveModule = async (moduleId: string, direction: 'up' | 'down') => {
    if (!saveChanges) {
      console.error("No hay función de guardado disponible")
      return
    }
    
    const currentIndex = syllabus.findIndex(module => module.id === moduleId)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= syllabus.length) return
    
    try {
      setIsSaving(true)
      setError('')
      
      const updatedSyllabus = [...syllabus]
      const temp = updatedSyllabus[currentIndex]
      updatedSyllabus[currentIndex] = updatedSyllabus[newIndex]
      updatedSyllabus[newIndex] = temp
      
      const result = await saveChanges(updatedSyllabus)
      
      if (!result.success) {
        setError(result.error || `Error al mover el módulo ${direction === 'up' ? 'arriba' : 'abajo'}`)
      }
    } catch (error) {
      console.error(`Error al mover el módulo ${direction === 'up' ? 'arriba' : 'abajo'}:`, error)
      setError("Ocurrió un error inesperado")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30">
      {/* Header */}
      <div className="p-6 text-white flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="text-blueApp" size={24} />
          Temario del curso
        </h2>
        {isAdmin && !isEditing && (
          <button 
            onClick={handleAddNew}
            className="bg-blueApp hover:bg-blue-600 transition-colors p-2 rounded-full"
          >
            <PlusCircle className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      
      {/* Contenido */}      
      <div className="p-6">       
         {typeof isEditing === 'string' ? (
          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Título del módulo
                </label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white"
                  value={editingModule?.title || ''}
                  onChange={e => setEditingModule(prev => prev ? {...prev, title: e.target.value} : null)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Contenido del módulo
                </label>
                <Editor
                  value={editingModule?.content || ''}
                  onChange={(content) => setEditingModule(prev => prev ? {...prev, content} : null)}
                  onSave={handleSave}
                  onCancel={() => {
                    setIsEditing(false)
                    setEditingModule(null)
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
        ) : hasSyllabus ? (
          <div className="space-y-8">
            {syllabus.map((module, index) => (
              <div key={module.id} className="border-b border-zinc-700 pb-6 last:border-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-medium text-blueApp mb-3">
                    Módulo {index + 1}: {module.title}
                  </h3>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => moveModule(module.id, 'up')} 
                        disabled={index === 0}
                        className={`text-gray-400 ${index > 0 ? 'hover:text-white' : 'opacity-50'}`}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveModule(module.id, 'down')} 
                        disabled={index === syllabus.length - 1}
                        className={`text-gray-400 ${index < syllabus.length - 1 ? 'hover:text-white' : 'opacity-50'}`}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => handleEdit(module.id)} 
                        className="text-blue-500 hover:text-blue-400"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(module.id)} 
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-gray-300 prose prose-invert max-w-none">
                  {HTMLReactParser(module.content || '')}
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
              <BookOpen className="h-12 w-12 text-zinc-500" />
              <p className="text-zinc-400 text-lg">
                Aún no hay información sobre el temario de este curso.
              </p>
              {isAdmin && (
                <button 
                  onClick={handleAddNew}
                  className="mt-2 px-4 py-2 bg-blueApp hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Añadir temario
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
