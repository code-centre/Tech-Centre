'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface AccordionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border-color last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 text-left flex justify-between items-center hover:text-secondary transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-text-primary">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-secondary shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
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
