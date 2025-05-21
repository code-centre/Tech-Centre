import { Pencil } from 'lucide-react'
import React from 'react'

interface Props {
  startEditing: (value: boolean) => void
}
export default function ButtonToEdit({ startEditing }: Props) {
  return (
    <button
      onClick={() => startEditing(true)}
      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
    >
      <Pencil className="w-5 h-5" />
    </button>
  )
}
