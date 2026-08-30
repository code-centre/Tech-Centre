'use client';

import { useEffect, useState } from 'react';
import { TriangleAlert, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Program } from '@/types/programs';

interface Props {
  program: Program | null;
  onClose: () => void;
  onDeleted: (programId: number) => void;
}

interface Cascade {
  cohorts: number;
  enrollments: number;
  invoices: number;
}

const FIELD =
  'w-full px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-border-color text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/60 transition-all';

/**
 * Borrar un programa arrastra sus cohortes, las matrículas y las facturas.
 * Antes eso pasaba detrás de un modal corriente: aquí se cuenta lo que se
 * pierde y se pide escribir el código.
 */
export default function ProgramDeleteDialog({ program, onClose, onDeleted }: Props) {
  const supabase = createClient();
  const [cascade, setCascade] = useState<Cascade | null>(null);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const expected = program?.code || program?.slug || '';

  useEffect(() => {
    if (!program) {
      setCascade(null);
      setTyped('');
      setError('');
      return;
    }

    let cancelled = false;

    async function countCascade(programId: number) {
      const { data: cohortRows } = await supabase
        .from('cohorts')
        .select('id')
        .eq('program_id', programId);
      const cohortIds = (cohortRows || []).map((c: { id: number }) => c.id);

      let enrollmentIds: number[] = [];
      if (cohortIds.length > 0) {
        const { data: enrollmentRows } = await supabase
          .from('enrollments')
          .select('id')
          .in('cohort_id', cohortIds);
        enrollmentIds = (enrollmentRows || []).map((e: { id: number }) => e.id);
      }

      let invoices = 0;
      if (enrollmentIds.length > 0) {
        const { count } = await supabase
          .from('invoices')
          .select('id', { count: 'exact', head: true })
          .in('enrollment_id', enrollmentIds);
        invoices = count ?? 0;
      }

      if (!cancelled) {
        setCascade({ cohorts: cohortIds.length, enrollments: enrollmentIds.length, invoices });
      }
    }

    countCascade(program.id).catch((err) => {
      console.error('No se pudo contar lo que se borraría:', err);
      if (!cancelled) setCascade({ cohorts: 0, enrollments: 0, invoices: 0 });
    });

    return () => {
      cancelled = true;
    };
  }, [program, supabase]);

  if (!program) return null;

  const confirmed = typed.trim() === expected && expected.length > 0;

  const handleDelete = async () => {
    if (!confirmed) return;
    setDeleting(true);
    setError('');
    try {
      const { data: cohortRows, error: cohortsSelectError } = await supabase
        .from('cohorts')
        .select('id')
        .eq('program_id', program.id);
      if (cohortsSelectError) throw cohortsSelectError;

      const cohortIds = (cohortRows || []).map((c: { id: number }) => c.id);

      if (cohortIds.length > 0) {
        const { data: enrollmentRows, error: enrollmentsSelectError } = await supabase
          .from('enrollments')
          .select('id')
          .in('cohort_id', cohortIds);
        if (enrollmentsSelectError) throw enrollmentsSelectError;

        const enrollmentIds = (enrollmentRows || []).map((e: { id: number }) => e.id);
        if (enrollmentIds.length > 0) {
          const { error: invoicesError } = await supabase
            .from('invoices')
            .delete()
            .in('enrollment_id', enrollmentIds);
          if (invoicesError) throw invoicesError;
        }

        const { error: enrollmentsError } = await supabase
          .from('enrollments')
          .delete()
          .in('cohort_id', cohortIds);
        if (enrollmentsError) throw enrollmentsError;

        const { error: cohortsError } = await supabase
          .from('cohorts')
          .delete()
          .eq('program_id', program.id);
        if (cohortsError) throw cohortsError;
      }

      const { error: programError } = await supabase.from('programs').delete().eq('id', program.id);
      if (programError) throw programError;

      onDeleted(program.id);
    } catch (err) {
      console.error('Error al eliminar:', err);
      const detalle = (err as { message?: string } | null)?.message;
      setError(detalle || 'No se pudo eliminar. Verifica que no tenga datos asociados.');
    } finally {
      setDeleting(false);
    }
  };

  const rows: { n: number; label: string }[] = cascade
    ? [
        { n: cascade.cohorts, label: cascade.cohorts === 1 ? 'cohorte' : 'cohortes' },
        { n: cascade.enrollments, label: cascade.enrollments === 1 ? 'matrícula de estudiante' : 'matrículas de estudiantes' },
        { n: cascade.invoices, label: cascade.invoices === 1 ? 'factura asociada' : 'facturas asociadas' },
      ].filter((row) => row.n > 0)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)]/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eliminar-programa-titulo"
    >
      <div className="w-full max-w-[540px] rounded-2xl bg-[var(--card-background)] border border-red-500/35 shadow-2xl overflow-hidden">
        <div className="flex items-start gap-3.5 p-6 border-b border-border-color">
          <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 text-red-400">
            <TriangleAlert className="w-5 h-5" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <h2 id="eliminar-programa-titulo" className="text-lg font-semibold text-text-primary">
              Eliminar {program.name}
            </h2>
            <p className="text-xs text-text-muted">Esta acción no se puede deshacer.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {error && (
            <p className="flex items-center gap-2 p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          )}

          {cascade === null ? (
            <p className="text-sm text-text-muted">Revisando qué se borraría…</p>
          ) : rows.length > 0 ? (
            <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <span className="text-[13.5px] font-semibold text-red-400">Se borrará también, en cascada:</span>
              <ul className="flex flex-col gap-1.5">
                {rows.map((row) => (
                  <li key={row.label} className="flex items-baseline gap-2.5 text-[13.5px] text-text-primary">
                    <span className="min-w-[26px] text-right font-bold tabular-nums text-red-400">{row.n}</span>
                    {row.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-text-muted">
              Este programa no tiene cohortes ni matrículas asociadas.
            </p>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-text-primary">
              Escribe <span className="font-mono text-red-400">{expected}</span> para confirmar
            </span>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Código del programa"
              autoComplete="off"
              className={FIELD}
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-bg-secondary border-t border-border-color">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2.5 rounded-lg border border-border-color text-[13.5px] font-medium text-text-primary hover:bg-[var(--card-background)] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!confirmed || deleting}
            className="px-5 py-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-[13.5px] font-semibold text-red-400 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {deleting ? 'Eliminando…' : 'Eliminar programa'}
          </button>
        </div>
      </div>
    </div>
  );
}
