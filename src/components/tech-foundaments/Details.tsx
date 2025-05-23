import React from 'react'
import { EditIcon } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'

interface Props {
  details?: string
}
export default function Details({ details }: Props) {
  return (
    <div className="mt-8">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold mb-4">¿Qué aprenderás?</h2>
        <button className="ml-2 bg-blue-600 p-1 rounded">
          <EditIcon className="w-4 h-4" />
        </button>
      </div>
      <p className="text-gray-300 leading-relaxed">
        {HTMLReactParser(details || '')}
      </p>
    </div>
  )
}
