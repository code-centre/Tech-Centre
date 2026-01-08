'use client'

import React from 'react'
import { GraduationCap } from 'lucide-react'

interface Props {
  amount: number
  description: string
}

export default function MatriculaItem({ amount, description }: Props) {
  return (
    <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blueApp/20 rounded-lg">
          <GraduationCap className="w-5 h-5 text-blueApp" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold mb-0.5">Matrícula anual</p>
          <p className="text-xs text-gray-400">
            {description}
          </p>
          <p className="text-blueApp font-bold mt-1">
            ${amount.toLocaleString()} COP
          </p>
        </div>
      </div>
    </div>
  )
}

