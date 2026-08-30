'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, GraduationCap, Search, SearchX, Check, AlertCircle } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import AdminErrorBanner from '@/components/admin/AdminErrorBanner';
import {
  adminTableClass,
  adminTableHeadCellClass,
  adminTableRowClass,
} from '@/components/admin/admin-table';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import { getProgramReadiness } from '@/lib/programReadiness';
import { formatPrice } from '../../../utils/formatCurrency';
import ProgramCreateDialog from './ProgramCreateDialog';
import ProgramDeleteDialog from './ProgramDeleteDialog';
import type { Program } from '@/types/programs';

interface CohortRow {
  id: number;
  end_date: string | null;
  offering: boolean | null;
}

type ProgramWithCohorts = Program & { cohorts?: CohortRow[] };

type Filtro = 'todos' | 'completos' | 'incompletos';

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'completos', label: 'Completos' },
  { id: 'incompletos', label: 'Incompletos' },
];

function difficultyDot(difficulty?: string): string {
  const d = (difficulty || '').toLowerCase();
  if (d.includes('principiante') || d.includes('básico') || d.includes('beginner')) return 'bg-emerald-400';
  if (d.includes('intermedio') || d.includes('intermediate')) return 'bg-amber-400';
  if (d.includes('avanzado') || d.includes('advanced')) return 'bg-red-400';
  return 'bg-blue-400';
}

export default function ProgramsAdmon() {
  const supabase = useSupabaseClient();
  const { user } = useUser();

  const [programs, setPrograms] = useState<ProgramWithCohorts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Program | null>(null);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoading(true);
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .order('updated_at', { ascending: false });

        if (programsError) throw programsError;

        const rows = (programsData as unknown as Program[]) || [];
        const withCohorts = await Promise.all(
          rows.map(async (program) => {
            const { data: cohorts } = await supabase
              .from('cohorts')
              .select('id, end_date, offering')
              .eq('program_id', program.id);
            return { ...program, cohorts: (cohorts as unknown as CohortRow[]) || [] };
          })
        );

        setPrograms(withCohorts);
      } catch (err) {
        console.error('Error al cargar los programas:', err);
        setError('Error al cargar los programas');
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, [supabase]);

  // La completitud de la página se calcula una vez y sirve para la columna,
  // para los contadores de los filtros y para el resumen del encabezado.
  const enriched = useMemo(
    () =>
      programs.map((program) => {
        const cohorts = program.cohorts || [];
        const readiness = getProgramReadiness(program, {
          offeringCohorts: cohorts.filter((c) => c.offering).length,
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
          program,
          readiness,
          active: cohorts.filter((c) => c.end_date && new Date(c.end_date) >= today).length,
          past: cohorts.filter((c) => !c.end_date || new Date(c.end_date) < today).length,
        };
      }),
    [programs]
  );

  const complete = enriched.filter((row) => row.readiness.missing.length === 0).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((row) => {
      const isComplete = row.readiness.missing.length === 0;
      if (filtro === 'completos' && !isComplete) return false;
      if (filtro === 'incompletos' && isComplete) return false;
      if (!q) return true;
      return `${row.program.name} ${row.program.code ?? ''}`.toLowerCase().includes(q);
    });
  }, [enriched, query, filtro]);

  if (!user || user?.role !== 'admin') {
    return <div className="p-8 text-center text-text-primary">No tienes permisos para ver esta sección</div>;
  }

  if (loading) {
    return <AdminPageSkeleton />;
  }

  const counts: Record<Filtro, number> = {
    todos: enriched.length,
    completos: complete,
    incompletos: enriched.length - complete,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={GraduationCap}
        title="Programas"
        subtitle={`${enriched.length} ${enriched.length === 1 ? 'programa' : 'programas'} · ${complete} con la página completa`}
        action={
          <button type="button" onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Nuevo programa
          </button>
        }
      />

      {error && <AdminErrorBanner message={error} />}

      {enriched.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative grow min-w-[280px] max-w-[420px]">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o código…"
              aria-label="Buscar programas"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
            />
          </div>

          <div className="flex gap-1 p-1 rounded-[10px] bg-bg-secondary border border-border-color">
            {FILTROS.map((item) => {
              const isActive = filtro === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFiltro(item.id)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-[7px] text-[13.5px] transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--card-background)] border border-border-color text-text-primary font-semibold'
                      : 'border border-transparent text-text-muted font-medium hover:text-text-primary'
                  }`}
                >
                  {item.label}
                  <span
                    className={`px-1.5 py-px rounded-full text-[11.5px] font-semibold ${
                      isActive ? 'bg-secondary/15 text-secondary' : 'bg-[var(--card-background)] text-text-muted'
                    }`}
                  >
                    {counts[item.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="ml-auto text-[13px] text-text-muted">
            {visible.length === enriched.length
              ? `Mostrando los ${enriched.length}`
              : `Mostrando ${visible.length} de ${enriched.length}`}
          </span>
        </div>
      )}

      {enriched.length === 0 ? (
        <AdminEmptyState
          icon={SearchX}
          title="No hay programas registrados"
          description="Crea tu primer programa académico para abrir cohortes."
          actions={
            <button type="button" onClick={() => setCreating(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Nuevo programa
            </button>
          }
        />
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 py-14 rounded-xl bg-[var(--card-background)] border border-border-color">
          <SearchX className="w-7 h-7 text-text-muted" aria-hidden />
          <span className="text-[14.5px] font-medium text-text-primary">Ningún programa coincide</span>
          <span className="text-[13px] text-text-muted">Prueba con otro término o quita el filtro.</span>
        </div>
      ) : (
        <div className={adminTableClass}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color bg-bg-secondary">
                  <th scope="col" className={adminTableHeadCellClass}>
                    Programa
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    Estado de la página
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    Nivel
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    Horas
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    Cohortes
                  </th>
                  <th scope="col" className={`${adminTableHeadCellClass} text-right`}>
                    Precio
                  </th>
                  <th scope="col" className={`${adminTableHeadCellClass} text-right`}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ program, readiness, active, past }) => {
                  const isComplete = readiness.missing.length === 0;
                  return (
                    <tr key={program.id} className={adminTableRowClass}>
                      <td className="px-4 py-3">
                        <Link href={`/admin/programas/${program.id}`} className="flex items-center gap-3 group">
                          <span className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-bg-secondary border border-border-color flex items-center justify-center">
                            {program.image ? (
                              <Image
                                src={program.image}
                                alt=""
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <GraduationCap className="w-5 h-5 text-text-muted" aria-hidden />
                            )}
                          </span>
                          <span className="flex flex-col min-w-0">
                            <span className="font-medium text-text-primary group-hover:text-secondary transition-colors">
                              {program.name}
                            </span>
                            {program.code && (
                              <span className="font-mono text-xs text-text-muted truncate">{program.code}</span>
                            )}
                          </span>
                        </Link>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            isComplete
                              ? 'bg-secondary/10 border border-secondary/30 text-secondary'
                              : 'bg-amber-400/10 border border-amber-400/30 text-amber-400'
                          }`}
                          title={isComplete ? undefined : readiness.missing.map((m) => m.missingLabel).join(' · ')}
                        >
                          {isComplete ? (
                            <Check className="w-3.5 h-3.5" aria-hidden />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5" aria-hidden />
                          )}
                          {isComplete ? 'Completa' : `Faltan ${readiness.missing.length}`}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-bg-secondary text-text-primary border border-border-color">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${difficultyDot(String(program.difficulty))}`}
                            aria-hidden
                          />
                          {String(program.difficulty || '—')}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-text-muted">
                        {program.total_hours ? `${program.total_hours} h` : '—'}
                      </td>

                      <td className="px-4 py-3 text-sm">
                        <span className={active > 0 ? 'text-text-primary' : 'text-text-muted'}>
                          {active} {active === 1 ? 'abierta' : 'abiertas'}
                        </span>
                        <span className="text-text-muted"> · {past} pasadas</span>
                      </td>

                      <td className="px-4 py-3 text-right text-sm tabular-nums text-text-muted">
                        {program.default_price
                          ? formatPrice(program.default_price, program.currency || 'COP')
                          : '—'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/programas/${program.id}`}
                            className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2"
                          >
                            Configurar
                          </Link>
                          <button
                            type="button"
                            onClick={() => setToDelete(program)}
                            className="p-2 bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 rounded-lg transition-all"
                            title={`Eliminar ${program.name}`}
                            aria-label={`Eliminar ${program.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProgramCreateDialog open={creating} onClose={() => setCreating(false)} />

      <ProgramDeleteDialog
        program={toDelete}
        onClose={() => setToDelete(null)}
        onDeleted={(programId) => {
          setPrograms((prev) => prev.filter((p) => p.id !== programId));
          setToDelete(null);
        }}
      />
    </div>
  );
}
