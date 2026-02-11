'use client'

import { useState } from 'react'
import { Pencil, Check, X, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface EditableFieldProps {
  label: string
  value: string | null | undefined
  name: string
  onSave: (name: string, value: string) => Promise<void>
  type?: 'text' | 'tel' | 'date' | 'textarea' | 'select' | 'email'
  options?: { value: string; label: string }[]
  readonly?: boolean
  icon?: React.ReactNode
  placeholder?: string
  validate?: (value: string) => string | null // Returns error message or null
}

export default function EditableField({
  label,
  value,
  name,
  onSave,
  type = 'text',
  options,
  readonly = false,
  icon,
  placeholder,
  validate
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)

  const hasValue = value && value.trim() !== ''

  const handleStartEdit = () => {
    setEditValue(value || '')
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
  }

  const handleSave = async () => {
    const trimmedValue = editValue.trim()

    // Validate if validator provided
    if (validate) {
      const error = validate(trimmedValue)
      if (error) {
        toast.error(error)
        return
      }
    }

    setIsSaving(true)
    try {
      await onSave(name, trimmedValue)
      setIsEditing(false)
      toast.success('Guardado correctamente')
    } catch (error) {
      toast.error('Error al guardar. Por favor, inténtalo de nuevo.')
      console.error('Error saving field:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Readonly mode - just display
  if (readonly) {
    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-text-muted dark:text-gray-300">
          {icon}
          {label}
        </label>
        <div className="px-4 py-2 text-text-primary dark:text-white bg-bg-secondary dark:bg-gray-800/30 rounded-lg border border-border-color dark:border-gray-700/50 min-h-[42px] flex items-center">
          {hasValue ? (
            <span className="flex items-center gap-2">
              {value}
              <span className="ml-auto text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                Verificado
              </span>
            </span>
          ) : (
            <span className="text-text-muted dark:text-gray-500 italic">No especificado</span>
          )}
        </div>
      </div>
    )
  }

  // Editing mode
  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-text-muted dark:text-gray-300">
          {icon}
          {label}
        </label>
        <div className="space-y-2">
          {type === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={3}
              placeholder={placeholder}
              className="w-full px-4 py-2 bg-bg-secondary dark:bg-gray-800/50 border border-border-color dark:border-gray-700 rounded-lg text-text-primary dark:text-white placeholder-text-muted dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-none"
            />
          ) : type === 'select' && options ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-4 py-2 bg-bg-secondary dark:bg-gray-800/50 border border-border-color dark:border-gray-700 rounded-lg text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-2 bg-bg-secondary dark:bg-gray-800/50 border border-border-color dark:border-gray-700 rounded-lg text-text-primary dark:text-white placeholder-text-muted dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-secondary hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-muted dark:text-gray-400 bg-bg-secondary dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-border-color dark:border-gray-700 rounded-md transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // View mode - empty
  if (!hasValue) {
    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-text-muted dark:text-gray-300">
          {icon}
          {label}
        </label>
        <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary dark:bg-gray-800/30 rounded-lg border border-border-color dark:border-gray-700/50 min-h-[42px]">
          <span className="text-text-muted dark:text-gray-500 italic">Aún no agregado</span>
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted dark:text-gray-300 hover:text-text-primary dark:hover:text-white bg-bg-primary dark:bg-gray-800/50 hover:bg-bg-secondary dark:hover:bg-gray-800 border border-border-color dark:border-gray-700 hover:border-secondary/50 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar
          </button>
        </div>
      </div>
    )
  }

  // Helper para mostrar dominio de URLs
  const getDisplayValue = (val: string): string => {
    if (!val) return val
    // Si parece una URL, mostrar solo el dominio
    if (val.includes('http://') || val.includes('https://') || val.includes('www.')) {
      try {
        const urlObj = new URL(val.startsWith('http') ? val : `https://${val}`)
        return urlObj.hostname.replace('www.', '')
      } catch {
        return val
      }
    }
    return val
  }

  // View mode - has value
  const displayValue = getDisplayValue(value || '')
  const isUrl = displayValue !== value && (value?.includes('http') || value?.includes('www.'))

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-text-muted dark:text-gray-300">
        {icon}
        {label}
      </label>
      <div className="flex items-center justify-between px-4 py-2 bg-bg-secondary dark:bg-gray-800/30 rounded-lg border border-border-color dark:border-gray-700/50 min-h-[42px]">
        {isUrl ? (
          <a
            href={value?.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-blue-400 flex items-center gap-2 flex-1 min-w-0"
          >
            <span className="truncate">{displayValue}</span>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <span className="text-text-primary dark:text-white flex-1">{value}</span>
        )}
        <button
          onClick={handleStartEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted dark:text-gray-400 hover:text-secondary bg-bg-primary dark:bg-gray-800/50 hover:bg-bg-secondary dark:hover:bg-gray-800 border border-border-color dark:border-gray-700 hover:border-secondary/50 rounded-md transition-colors ml-2"
        >
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </button>
      </div>
    </div>
  )
}
