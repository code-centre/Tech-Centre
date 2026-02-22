'use client';

import { useState } from 'react';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import type { ProgramModule, Grade } from '@/types/supabase';

interface ProfileInfo {
  first_name: string;
  last_name?: string;
  email: string;
}

interface EnrollmentWithProfile {
  id: number;
  student_id: string;
  profiles?: ProfileInfo | ProfileInfo[] | null;
  profile?: ProfileInfo | null;
}

interface InstructorGradesProps {
  enrollments: EnrollmentWithProfile[];
  modules: ProgramModule[];
  grades: Grade[];
  onDataChange: () => void;
}

function getEnrollmentName(e: EnrollmentWithProfile): string {
  const p = e.profiles ?? e.profile;
  if (!p) return e.student_id;
  const prof = Array.isArray(p) ? p[0] : p;
  return `${prof?.first_name || ''} ${prof?.last_name || ''}`.trim() || prof?.email || e.student_id;
}

export default function InstructorGrades({
  enrollments,
  modules,
  grades,
  onDataChange,
}: InstructorGradesProps) {
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const [saving, setSaving] = useState<{ key: string } | null>(null);

  const enrollmentIds = new Set(enrollments.map((e) => e.id));
  const cohortGrades = grades.filter((g) => enrollmentIds.has(g.enrollment_id));

  const getGrade = (enrollmentId: number, moduleId: number): Grade | undefined =>
    cohortGrades.find((g) => g.enrollment_id === enrollmentId && g.module_id === moduleId);

  const getValue = (enrollmentId: number, moduleId: number): string => {
    const g = getGrade(enrollmentId, moduleId);
    return g != null && g.value != null ? String(g.value) : '';
  };

  const getNotes = (enrollmentId: number, moduleId: number): string => {
    const g = getGrade(enrollmentId, moduleId);
    return g?.notes ?? '';
  };

  const saveGrade = async (
    enrollmentId: number,
    moduleId: number,
    value: string,
    notes: string
  ) => {
    const numValue = parseFloat(value);
    if (Number.isNaN(numValue) || numValue < 0 || numValue > 5) return;

    const key = `${enrollmentId}-${moduleId}`;
    setSaving({ key });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/76e8aa53-8cf3-4d20-8146-9e4e760dacdd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3f384'},body:JSON.stringify({sessionId:'e3f384',location:'InstructorGrades.tsx:saveGrade:entry',message:'saveGrade called',data:{enrollmentId,moduleId,value:numValue,userId:user?.id??null},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    try {
      const payload = {
        enrollment_id: enrollmentId,
        module_id: moduleId,
        value: numValue,
        notes: notes.trim() || null,
        graded_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      };

      const existing = cohortGrades.find(
        (g) => g.enrollment_id === enrollmentId && g.module_id === moduleId
      );

      let error = null;
      let op = '';
      if (existing) {
        op = 'update';
        const result = await supabase
          .from('grades')
          .update({
            value: numValue,
            notes: payload.notes,
            updated_at: payload.updated_at,
          })
          .eq('id', existing.id);
        error = result.error;
        // #region agent log
        if(error)fetch('http://127.0.0.1:7243/ingest/76e8aa53-8cf3-4d20-8146-9e4e760dacdd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3f384'},body:JSON.stringify({sessionId:'e3f384',location:'InstructorGrades.tsx:saveGrade:updateError',message:'Update failed',data:{op,existingId:existing.id,errMsg:(error as {message?:string})?.message,errDetails:(error as {details?:string})?.details,errCode:(error as {code?:string})?.code,errHint:(error as {hint?:string})?.hint},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      } else {
        op = 'insert';
        const result = await supabase.from('grades').insert({
          enrollment_id: enrollmentId,
          module_id: moduleId,
          value: numValue,
          notes: payload.notes,
        });
        error = result.error;
        // #region agent log
        if(error)fetch('http://127.0.0.1:7243/ingest/76e8aa53-8cf3-4d20-8146-9e4e760dacdd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3f384'},body:JSON.stringify({sessionId:'e3f384',location:'InstructorGrades.tsx:saveGrade:insertError',message:'Insert failed',data:{op,payload,errMsg:(error as {message?:string})?.message,errDetails:(error as {details?:string})?.details,errCode:(error as {code?:string})?.code,errHint:(error as {hint?:string})?.hint},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      }

      if (error) {
        console.error('Error saving grade:', (error as { message?: string })?.message ?? error);
        return;
      }
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/76e8aa53-8cf3-4d20-8146-9e4e760dacdd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3f384'},body:JSON.stringify({sessionId:'e3f384',location:'InstructorGrades.tsx:saveGrade:success',message:'Grade saved',data:{op},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      onDataChange();
    } catch (err) {
      const errObj = err as Error;
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/76e8aa53-8cf3-4d20-8146-9e4e760dacdd',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3f384'},body:JSON.stringify({sessionId:'e3f384',location:'InstructorGrades.tsx:saveGrade:catch',message:'Exception',data:{errMsg:errObj?.message,errStack:errObj?.stack},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.error('Error saving grade:', errObj?.message ?? err);
    } finally {
      setSaving(null);
    }
  };

  const sortedModules = [...modules].sort((a, b) => a.order_index - b.order_index);

  const getAverage = (enrollmentId: number): string => {
    const vals = sortedModules
      .map((m) => getGrade(enrollmentId, m.id)?.value)
      .filter((v): v is number => v != null && !Number.isNaN(v));
    if (vals.length === 0) return '—';
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return avg.toFixed(1);
  };

  return (
    <section
      className="bg-[var(--card-background)] rounded-xl border border-border-color overflow-hidden"
      aria-labelledby="grades-heading"
    >
      <h2 id="grades-heading" className="sr-only">
        Calificaciones por módulo
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-color bg-bg-secondary/50">
              <th className="text-left py-3 px-4 text-text-muted font-medium sticky left-0 bg-bg-secondary/50 z-10 min-w-[180px]">
                Estudiante
              </th>
              {sortedModules.map((mod) => (
                <th
                  key={mod.id}
                  className="text-left py-3 px-4 text-text-muted font-medium whitespace-nowrap"
                >
                  {mod.name}
                </th>
              ))}
              <th className="text-left py-3 px-4 text-text-muted font-medium whitespace-nowrap">
                Promedio
              </th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-b border-border-color/50 hover:bg-bg-secondary/30">
                <td className="py-3 px-4 text-text-primary font-medium sticky left-0 bg-[var(--card-background)] z-10">
                  {getEnrollmentName(e)}
                </td>
                {sortedModules.map((mod) => {
                  const key = `${e.id}-${mod.id}`;
                  const isSaving = saving?.key === key;
                  return (
                    <td key={mod.id} className="py-2 px-4">
                      <div className="flex flex-col gap-1">
                        <input
                          type="number"
                          min={0}
                          max={5}
                          step={0.1}
                          defaultValue={getValue(e.id, mod.id)}
                          onBlur={(ev) => {
                            const v = ev.target.value.trim();
                            const notes = getNotes(e.id, mod.id);
                            if (v) saveGrade(e.id, mod.id, v, notes);
                          }}
                          disabled={isSaving}
                          className="w-16 rounded border border-border-color bg-bg-secondary px-2 py-1.5 text-text-primary text-center disabled:opacity-60"
                          aria-label={`Calificación ${mod.name} para ${getEnrollmentName(e)}`}
                        />
                        {isSaving && (
                          <Loader2 className="w-4 h-4 animate-spin text-secondary mx-auto" />
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="py-3 px-4 text-text-primary font-semibold">
                  {getAverage(e.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {enrollments.length === 0 && (
        <p className="p-8 text-center text-text-muted">No hay estudiantes inscritos.</p>
      )}
    </section>
  );
}
