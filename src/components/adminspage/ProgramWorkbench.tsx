'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, GraduationCap, AlertCircle, Check } from 'lucide-react';
import { getProgramReadiness, type ProgramTab } from '@/lib/programReadiness';
import type { Program } from '@/types/programs';

interface Props {
  program: Program;
  offeringCohorts: number;
  panels: Record<ProgramTab, ReactNode>;
}

const TABS: { id: ProgramTab; label: string }[] = [
  { id: 'info', label: 'Información' },
  { id: 'contenido', label: 'Contenido' },
  { id: 'publica', label: 'Página pública' },
  { id: 'temario', label: 'Temario' },
  { id: 'cohortes', label: 'Cohortes' },
];

const KIND_LABEL: Record<string, string> = {
  curso: 'Curso',
  diplomado: 'Diplomado',
  certificación: 'Certificación',
  certificacion: 'Certificación',
};

function difficultyDot(difficulty?: string): string {
  const d = (difficulty || '').toLowerCase();
  if (d.includes('principiante') || d.includes('básico') || d.includes('beginner')) return 'bg-emerald-400';
  if (d.includes('intermedio') || d.includes('intermediate')) return 'bg-amber-400';
  if (d.includes('avanzado') || d.includes('advanced')) return 'bg-red-400';
  return 'bg-blue-400';
}

export default function ProgramWorkbench({ program, offeringCohorts, panels }: Props) {
  const [tab, setTab] = useState<ProgramTab>('info');
  const readiness = getProgramReadiness(program, { offeringCohorts });

  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const progress = (readiness.done / readiness.total) * circumference;

  const publicUrl = program.code ? `/programas-academicos/${program.code}` : null;
  const kind = program.kind ? (KIND_LABEL[program.kind.toLowerCase()] ?? program.kind) : null;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/programas"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-secondary transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Programas
      </Link>

      {/* Encabezado */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5 min-w-0">
          <span className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-bg-secondary border border-border-color flex items-center justify-center">
            {program.image ? (
              <Image src={program.image} alt="" width={56} height={56} className="w-full h-full object-cover" />
            ) : (
              <GraduationCap className="w-6 h-6 text-text-muted" aria-hidden />
            )}
          </span>
          <div className="flex flex-col gap-2 min-w-0">
            <h1 className="text-2xl sm:text-[27px] font-bold tracking-tight text-text-primary leading-tight">
              {program.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {program.code && (
                <span className="px-2.5 py-1 rounded-md bg-bg-secondary border border-border-color font-mono text-xs text-text-muted">
                  {program.code}
                </span>
              )}
              {kind && (
                <span className="px-2.5 py-1 rounded-full bg-bg-secondary border border-border-color text-xs text-text-primary">
                  {kind}
                </span>
              )}
              {program.difficulty && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-secondary border border-border-color text-xs text-text-primary">
                  <span className={`h-1.5 w-1.5 rounded-full ${difficultyDot(String(program.difficulty))}`} aria-hidden />
                  {String(program.difficulty)}
                </span>
              )}
              {program.total_hours ? (
                <span className="px-2.5 py-1 rounded-full bg-bg-secondary border border-border-color text-xs text-text-primary">
                  {program.total_hours} h
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {publicUrl && (
          <Link
            href={publicUrl}
            target="_blank"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm font-medium text-text-primary hover:border-secondary/50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver página pública
          </Link>
        )}
      </header>

      {/* Estado de publicación */}
      <section
        className="flex flex-col lg:flex-row lg:items-center gap-5 p-4 sm:p-5 rounded-xl bg-[var(--card-background)] border border-border-color"
        aria-label="Estado de la página pública"
      >
        <div className="flex items-center gap-3.5 shrink-0">
          <span className="relative w-11 h-11 shrink-0">
            <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
              <circle cx="22" cy="22" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="4" />
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="var(--secondary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progress.toFixed(1)} ${circumference.toFixed(1)}`}
                transform="rotate(-90 22 22)"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[12.5px] font-bold text-text-primary">
              {readiness.done}/{readiness.total}
            </span>
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-text-primary">
              {readiness.missing.length === 0 ? 'Listo para publicar' : 'Casi listo para publicar'}
            </span>
            <span className="text-[13px] text-text-muted">
              {readiness.missing.length === 0
                ? 'Nada pendiente en esta página.'
                : `Faltan ${readiness.missing.length} ${readiness.missing.length === 1 ? 'cosa' : 'cosas'} para que la página se vea completa.`}
            </span>
          </div>
        </div>

        {readiness.missing.length > 0 && (
          <>
            <span className="hidden lg:block w-px self-stretch bg-border-color" aria-hidden />
            <ul className="flex flex-wrap gap-2">
              {readiness.missing.map((check) => (
                <li key={check.id}>
                  <button
                    type="button"
                    onClick={() => setTab(check.tab)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/35 text-[13px] font-medium text-amber-400 hover:bg-amber-400/20 transition-colors cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden />
                    {check.missingLabel}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {readiness.missing.length === 0 && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 text-[13px] font-medium text-secondary">
            <Check className="w-3.5 h-3.5" aria-hidden />
            Todo completo
          </span>
        )}
      </section>

      {/* Pestañas */}
      <div className="flex items-center gap-1 border-b border-border-color overflow-x-auto" role="tablist">
        {TABS.map((item) => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 -mb-px text-sm whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'text-text-primary font-semibold border-secondary'
                  : 'text-text-muted font-medium border-transparent hover:text-text-primary'
              }`}
            >
              {item.label}
              {readiness.pendingTabs.has(item.id) && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-label="Tiene pendientes" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">{panels[tab]}</div>
    </div>
  );
}
