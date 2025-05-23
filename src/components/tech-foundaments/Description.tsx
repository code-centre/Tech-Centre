import React from 'react'
import { EditIcon } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'

interface Props {
  description: string
}
export function Description({ description }: Props) {
  return (
    <div className="mt-8">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold mb-4">Detalles de este Fundamento Tech</h2>
        <button className="ml-2 bg-blue-600 p-1 rounded">
          <EditIcon className="w-4 h-4" />
        </button>
      </div>
      <p className="text-gray-300 leading-relaxed">
        {HTMLReactParser(description)}
      </p>
    </div>
  )
}
