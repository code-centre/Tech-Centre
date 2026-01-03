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
        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700 rounded-md hover:bg-gray-800 hover:border-gray-600 transition-colors duration-200 flex items-center gap-2"
      >
        <Check className="w-4 h-4" />
        Guardar
      </button>
      <button 
        onClick={() => setFinishEdit(false)} 
        className="px-4 py-2 text-sm font-medium text-gray-400 bg-transparent border border-gray-700 rounded-md hover:bg-gray-800/30 hover:border-gray-600 transition-colors duration-200 flex items-center gap-2"
      >
        <CircleX className="w-4 h-4" />
        Cancelar
      </button>
    </div>
  )
}

