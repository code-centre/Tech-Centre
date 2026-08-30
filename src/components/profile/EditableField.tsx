'use client'

import { useState } from 'react'
import { Pencil, Check, X, ExternalLink } from 'lucide-react'
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
      <div className="flex flex-col gap-[3px] border-b border-border-color/50 py-[11px]">
        <label className="flex items-center gap-1.5 text-xs text-text-muted">
          {icon}
          {label}
        </label>
        <div className="flex items-center text-sm text-text-primary">
          {hasValue ? (
            <span className="flex items-center gap-2">
              {value}
              <span className="ml-auto text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                Verificado
              </span>
            </span>
          ) : (
            <span className="text-text-muted italic">No especificado</span>
          )}
        </div>
      </div>
    )
  }

  // Editing mode
  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 border-b border-border-color/50 py-[11px]">
        <label className="flex items-center gap-1.5 text-xs text-text-muted">
          {icon}
          {label}
        </label>
        <div className="flex flex-col gap-2">
          {type === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={3}
              placeholder={placeholder}
              className="w-full px-4 py-2 bg-bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent resize-none"
            />
          ) : type === 'select' && options ? (
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-4 py-2 bg-bg-secondary border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
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
              className="w-full px-4 py-2 bg-bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#0E1116] bg-secondary hover:bg-secondary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-muted bg-bg-secondary border border-border-color rounded-md transition-colors disabled:opacity-50"
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
      <div className="flex items-center justify-between gap-3 border-b border-border-color/50 py-[11px]">
        <span className="flex min-w-0 flex-col gap-[3px]">
          <span className="flex items-center gap-1.5 text-xs text-text-muted">
            {icon}
            {label}
          </span>
          <span className="text-sm text-text-muted/70">Sin registrar</span>
        </span>
        <button
          type="button"
          onClick={handleStartEdit}
          className="shrink-0 text-[12.5px] font-medium text-secondary transition-colors hover:underline"
        >
          Añadir
        </button>
      </div>
    )
  }

  const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]

  // Lo que se lee no siempre es lo que se guarda: un select guarda el código y
  // una fecha guarda el ISO, pero ninguno de los dos se lee bien así.
  const getDisplayValue = (val: string): string => {
    if (!val) return val
    if (type === 'select' && options) {
      return options.find((option) => option.value === val)?.label ?? val
    }
    if (type === 'date') {
      const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val.slice(0, 10))
      if (parts) {
        return `${Number(parts[3])} de ${MESES[Number(parts[2]) - 1]} de ${parts[1]}`
      }
    }
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
    <div className="group flex items-center justify-between gap-3 border-b border-border-color/50 py-[11px]">
      <span className="flex min-w-0 flex-col gap-[3px]">
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          {icon}
          {label}
        </span>
        {isUrl ? (
          <a
            href={value?.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 truncate text-sm text-secondary hover:underline"
          >
            {displayValue}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          <span className="text-sm text-text-primary [overflow-wrap:anywhere]">{displayValue}</span>
        )}
      </span>
      <button
        type="button"
        onClick={handleStartEdit}
        aria-label={`Editar ${label}`}
        className="shrink-0 text-text-muted/70 transition-colors hover:text-secondary"
      >
        <Pencil className="h-[15px] w-[15px]" />
      </button>
    </div>
  )
}
