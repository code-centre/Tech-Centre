'use client'

import React from 'react'
import { GraduationCap } from 'lucide-react'

interface Props {
  amount: number
  description: string
}

export default function MatriculaItem({ amount, description }: Props) {
  return (
    <div className="p-4 bg-bg-card rounded-lg border border-border-color">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-secondary/20 rounded-lg">
          <GraduationCap className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1">
          <p className="text-text-primary font-semibold mb-0.5">Matrícula anual</p>
          <p className="text-xs text-text-muted">
            {description}
          </p>
          <p className="text-secondary font-bold mt-1">
            ${amount.toLocaleString()} COP
          </p>
        </div>
      </div>
    </div>
  )
}

