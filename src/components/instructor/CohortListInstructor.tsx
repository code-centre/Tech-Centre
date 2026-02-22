'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ClipboardList, Award } from 'lucide-react';

interface ProfileInfo {
  first_name: string;
  last_name?: string;
  email: string;
  profile_image?: string | null;
}

interface EnrollmentWithProfile {
  id: number;
  student_id: string;
  profiles?: ProfileInfo | ProfileInfo[] | null;
  profile?: ProfileInfo | null;
}

interface CohortListInstructorProps {
  cohortId: number;
  enrollments: EnrollmentWithProfile[];
  sessions: { id: number }[];
  attendance: { session_id: number; enrollment_id: number; status: string }[];
  grades: { enrollment_id: number; value: number }[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase().slice(0, 2);
}

function getEnrollmentName(e: EnrollmentWithProfile): string {
  const p = e.profiles ?? e.profile;
  if (!p) return e.student_id;
  const prof = Array.isArray(p) ? p[0] : p;
  return `${prof?.first_name || ''} ${prof?.last_name || ''}`.trim() || prof?.email || e.student_id;
}

function getProfileImage(e: EnrollmentWithProfile): string | null {
  const p = e.profiles ?? e.profile;
  if (!p) return null;
  const prof = Array.isArray(p) ? p[0] : p;
  return prof?.profile_image ?? null;
}

export default function CohortListInstructor({
  cohortId,
  enrollments,
  sessions,
  attendance,
  grades,
}: CohortListInstructorProps) {
  const [students, setStudents] = useState<EnrollmentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const totalSessions = sessions.length;

  const getAttendanceCount = (enrollmentId: number): number => {
    return attendance.filter(
      (a) => a.enrollment_id === enrollmentId && ['present', 'late', 'excused'].includes(a.status)
    ).length;
  };

  const getAverageGrade = (enrollmentId: number): string => {
    const enrollmentGrades = grades
      .filter((g) => g.enrollment_id === enrollmentId)
      .map((g) => g.value);
    if (enrollmentGrades.length === 0) return '—';
    const avg = enrollmentGrades.reduce((a, b) => a + b, 0) / enrollmentGrades.length;
    return avg.toFixed(1);
  };

  useEffect(() => {
    if (enrollments.length > 0) {
      setStudents(enrollments);
    }
    setLoading(false);
  }, [enrollments]);

  if (loading) {
    return (
      <div className="mt-6 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="mt-6" aria-labelledby="students-list-heading">
      <h2 id="students-list-heading" className="text-xl font-semibold mb-4 text-text-primary">
        Estudiantes del cohorte
      </h2>

      {students.length === 0 ? (
        <p className="text-text-muted">No hay estudiantes inscritos en este cohorte.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
          {students.map((enrollment) => {
            const attended = getAttendanceCount(enrollment.id);
            const avgGrade = getAverageGrade(enrollment.id);
            const profileImage = getProfileImage(enrollment);
            const name = getEnrollmentName(enrollment);

            return (
              <li
                key={enrollment.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border-color bg-(--card-background) hover:bg-bg-secondary/50 transition-colors"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-secondary/20 shrink-0 flex items-center justify-center">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-secondary">
                      {getInitials(name)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-medium text-text-primary truncate">{name}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-secondary text-text-muted"
                      title="Asistencia"
                    >
                      <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                      {totalSessions > 0 ? (
                        <>
                          {attended}/{totalSessions}
                        </>
                      ) : (
                        '—'
                      )}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/10 text-secondary font-medium"
                      title="Promedio"
                    >
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      {avgGrade}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
