'use client'

import React from 'react'
import Link from 'next/link'
import { Users, ArrowRight, BrainCircuit, Clock, Award } from 'lucide-react'
import type { Career } from '@/types/careers'

interface CareerCardProps {
  career: Career
}

export default function CareerCard({ career }: CareerCardProps) {
  return (
    <article className="md:col-span-2 rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col bg-[var(--card-background)] border-border-color hover:border-secondary/60 hover:shadow-secondary/25">
      <header className="relative px-6 py-5 bg-gradient-to-r from-[#0f9b58] via-[#2FB7C4] to-[#0f9b58]/80">
        <div className="absolute top-3 right-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm bg-white/15 text-white border-white/30">
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>Carrera</span>
          </div>
        </div>
        <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight pr-28">
          {career.name}
        </h3>
      </header>

      <div className="p-6 flex-1 flex flex-col">
        {career.description && (
          <p className="text-base card-text-muted leading-relaxed mb-5">
            {career.description}
          </p>
        )}

        <p className="text-sm card-text-secondary font-medium mb-5">
          <span className="text-secondary font-semibold">Pensado para:</span>{' '}
          {career.target_audience}
        </p>

        <div className="flex flex-wrap gap-4 mb-5 pb-5 border-b card-border-subtle text-sm card-text-muted">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-secondary" />
            <span className="font-medium">{career.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-secondary" />
            <span className="font-medium">{career.level}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-secondary" />
            <span className="font-medium">{career.modality}</span>
          </div>
        </div>

        <div className="mt-auto">
          <Link
            href={`/carreras/${career.slug}`}
            className="btn-primary group inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
          >
            <span>Explorar carrera</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  )
}
