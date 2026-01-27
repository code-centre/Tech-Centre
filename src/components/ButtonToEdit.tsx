'use client'
import { Pencil } from 'lucide-react'
import React from 'react'

interface Props {
  startEditing: () => void
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'subtle' | 'icon-only'
}

export default function ButtonToEdit({ 
  startEditing, 
  label,
  size = 'md',
  variant = 'default'
}: Props) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (variant === 'icon-only') {
    return (
      <button
        onClick={startEditing}
        className={`${sizeClasses[size]} text-gray-400 hover:text-zuccini bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-zuccini/50 rounded-md transition-all duration-200 flex items-center justify-center`}
        type="button"
        aria-label="Editar"
      >
        <Pencil className={iconSizes[size]} />
      </button>
    )
  }

  if (variant === 'subtle') {
    return (
      <button
        onClick={startEditing}
        className={`${sizeClasses[size]} text-gray-400 hover:text-zuccini bg-transparent hover:bg-gray-800/30 border border-gray-700/50 hover:border-gray-600 rounded-md transition-all duration-200 flex items-center gap-2 text-sm font-medium`}
        type="button"
      >
        <Pencil className={iconSizes[size]} />
        {label && <span>{label}</span>}
      </button>
    )
  }

  return (
    <button
      onClick={startEditing}
      className={`${sizeClasses[size]} text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-zuccini/50 rounded-md transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md`}
      type="button"
    >
      <Pencil className={iconSizes[size]} />
    </button>
  )
}

