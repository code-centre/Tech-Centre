import React, { useState } from 'react'
import { EditIcon, Loader2 } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import Editor from '../Editor'
import useUserStore from '../../../store/useUserStore'
import { useUser } from '@/lib/supabase'

interface Props {
  programData: string,
}
export function DescriptionSupa({ programData}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [descriptionContent, setDescriptionContent] = useState(programData || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const { user } = useUser()

  const isAdmin = user?.rol === 'admin'

  return (
    <div className="mt-8">
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Detalles de este programa</h2>
        <div className="text-gray-300 text-md leading-relaxed text-left">
          {HTMLReactParser(programData || '')} 
          {error && (
            <div className="p-2 mt-4 bg-red-900/50 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
