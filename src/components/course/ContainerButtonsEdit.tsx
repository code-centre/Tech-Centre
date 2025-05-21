'use client'
import { Check, CircleX } from 'lucide-react'
import React from 'react'

interface Props {
  setFinishEdit: (value: boolean) => void
  onSave: () => void
}

export default function ContainerButtonsEdit({ setFinishEdit, onSave }: Props) {
  return (
    <div className="flex gap-2">
      <button onClick={onSave} className="self-start bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        <Check className="w-5 h-5 inline mr-2" />
        Guardar
      </button>
      <button onClick={() => setFinishEdit(false)} className="self-start bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
        <CircleX className="w-5 h-5 inline mr-2" />
        Cancelar
      </button>
    </div>)
}
