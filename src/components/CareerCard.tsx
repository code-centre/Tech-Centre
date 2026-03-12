'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, ArrowRight, CheckCircle2, BrainCircuit, Clock, Award, GraduationCap } from 'lucide-react'
import type { Career } from '@/types/careers'

interface CareerCardProps {
  career: Career
}

export default function CareerCard({ career }: CareerCardProps) {
  return (
    <article className="rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full bg-[var(--card-background)] border-border-color hover:border-secondary/60 hover:shadow-secondary/25">
      <div className="relative h-48 overflow-hidden bg-bg-secondary">
        {career.image ? (
          <Image
            src={career.image}
            alt={career.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <GraduationCap className="w-16 h-16 text-secondary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm bg-secondary/20 text-secondary border-secondary/40">
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>Carrera</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold card-text-primary mb-2 line-clamp-2 leading-tight">
          {career.name}
        </h3>

        <p className="text-sm card-text-secondary font-medium mb-4">
          {career.target_audience}
        </p>

        <ul className="space-y-2 mb-5 flex-1">
          {career.learning_points.map((point, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
              <span className="text-sm card-text-muted leading-relaxed">{point.title}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 pb-4 border-b card-border-subtle text-xs card-text-muted">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-secondary" />
            <span className="font-medium">{career.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-secondary" />
            <span className="font-medium">{career.level}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-secondary" />
            <span className="font-medium">{career.modality}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <Link
            href={`/programas-academicos/carreras/${career.slug}`}
            className="btn-primary group flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
          >
            <span>Explorar carrera</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  )
}
