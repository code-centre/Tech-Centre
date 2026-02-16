'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, GraduationCap, Clock, DollarSign, BookOpen } from 'lucide-react';
import type { Program } from '@/types/programs';

interface ProgramHeaderProps {
  program: Program;
}

function formatPrice(price?: number): string {
  if (price == null || price === 0) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProgramHeader({ program }: ProgramHeaderProps) {
  const publicUrl = program.code ? `/programas-academicos/${program.code}` : null;

  return (
    <article
      className="bg-[var(--card-background)] rounded-lg shadow-lg border border-border-color overflow-hidden"
      aria-labelledby="program-header-title"
    >
      <div className="p-6 flex flex-col sm:flex-row gap-6">
        {/* Image */}
        <div className="shrink-0">
          {program.image ? (
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-bg-secondary border border-border-color">
              <Image
                src={program.image}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-bg-secondary border border-border-color flex items-center justify-center">
              <GraduationCap className="w-12 h-12 text-text-muted" aria-hidden />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href="/admin/programas"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a programas
              </Link>
              <h1 id="program-header-title" className="text-2xl font-bold text-text-primary">
                {program.name}
              </h1>
              {program.code && (
                <p className="text-sm text-text-muted mt-0.5">Código: {program.code}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  program.is_active
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                    : 'bg-gray-500/20 text-text-muted border border-border-color'
                }`}
              >
                {program.is_active ? 'Activo' : 'Inactivo'}
              </span>
              {program.kind && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30 capitalize">
                  {program.kind}
                </span>
              )}
              {program.difficulty && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-bg-secondary text-text-muted border border-border-color capitalize">
                  {String(program.difficulty)}
                </span>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-4 text-sm text-text-muted">
            {program.total_hours != null && program.total_hours > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-secondary" />
                {program.total_hours} horas
              </span>
            )}
            {program.duration && (
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-secondary" />
                {program.duration}
              </span>
            )}
            {(program.default_price != null && program.default_price > 0) && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-secondary" />
                {formatPrice(program.default_price)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4">
            {publicUrl ? (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Ver página pública
              </a>
            ) : (
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary text-text-muted border border-border-color cursor-not-allowed text-sm font-medium"
                title="Agrega un código al programa para ver la página pública"
              >
                <ExternalLink className="w-4 h-4" />
                Ver página pública (requiere código)
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
