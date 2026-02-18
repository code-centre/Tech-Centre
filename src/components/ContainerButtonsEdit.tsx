'use client'
import { Check, CircleX } from 'lucide-react'
import React from 'react'

interface Props {
  setFinishEdit: (value: boolean) => void
  onSave: () => void
}

export default function ContainerButtonsEdit({ setFinishEdit, onSave }: Props) {
  return (
    <div className="flex gap-3">
      <button 
        onClick={onSave} 
        type="button"
        className="btn-edit-save px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
      >
        <Check className="w-4 h-4" />
        Guardar
      </button>
      <button 
        onClick={() => setFinishEdit(false)} 
        type="button"
        className="btn-edit-cancel px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2"
      >
        <CircleX className="w-4 h-4" />
        Cancelar
      </button>
    </div>
  )
}

