'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ProfileAccordionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  icon?: React.ReactNode
}

export default function ProfileAccordion({ 
  title, 
  children, 
  defaultOpen = false,
  icon 
}: ProfileAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border-color last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 text-left flex justify-between items-center hover:text-secondary transition-colors group"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-text-primary flex items-center gap-2">
          {icon && <span className="text-text-muted group-hover:text-secondary transition-colors">{icon}</span>}
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-secondary shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted shrink-0 group-hover:text-text-primary transition-colors" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-text-primary">
          {children}
        </div>
      )}
    </div>
  )
}
