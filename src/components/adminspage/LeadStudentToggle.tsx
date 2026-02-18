'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, GraduationCap, Loader2 } from 'lucide-react';
import { updateProfileAdmin } from '@/app/admin/actions';

interface LeadStudentToggleProps {
  user_id: string;
  currentRole: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    professional_title?: string;
    linkedin_url?: string;
  };
  canEdit: boolean;
}

export function LeadStudentToggle({
  user_id,
  currentRole,
  profile,
  canEdit,
}: LeadStudentToggleProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const isLead = currentRole === 'lead';
  const isStudent = currentRole === 'student';

  if (!canEdit || (!isLead && !isStudent)) {
    return null;
  }

  const handleToggle = async () => {
    const newRole = isLead ? 'student' : 'lead';
    setIsUpdating(true);
    setError('');
    try {
      const result = await updateProfileAdmin({
        user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone || null,
        role: newRole,
        professional_title: profile.professional_title || null,
        linkedin_url: profile.linkedin_url || null,
      });

      if (!result.success) throw new Error(result.error);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section
      className="bg-[var(--card-background)] rounded-lg shadow border border-border-color overflow-hidden"
      aria-labelledby="lead-student-toggle-heading"
    >
      <div className="p-4 border-b border-border-color">
        <h2 id="lead-student-toggle-heading" className="text-xl font-semibold text-text-primary">
          Tipo de usuario
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Cambia entre Lead y Estudiante según corresponda
        </p>
      </div>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                isLead
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  : 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
              }`}
            >
              {isLead ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Lead
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  Estudiante
                </>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isUpdating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-secondary text-secondary hover:bg-secondary/10 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLead ? (
              <>
                <GraduationCap className="w-4 h-4" />
                Cambiar a Estudiante
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Cambiar a Lead
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</p>
        )}
      </div>
    </section>
  );
}
