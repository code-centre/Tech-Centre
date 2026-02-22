'use client';

import SessionsList from '@/components/adminspage/SessionsList';
import type { Session, ProgramModule } from '@/types/supabase';

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

interface InstructorSessionsProps {
  cohortId: string;
  sessions: Session[];
  modules: ProgramModule[];
  enrollments: EnrollmentWithProfile[];
  onDataChange: () => void;
}

export default function InstructorSessions({
  cohortId,
  sessions,
  modules,
  enrollments,
  onDataChange,
}: InstructorSessionsProps) {
  const normalizedEnrollments = enrollments.map((e) => ({
    id: e.id,
    student_id: e.student_id,
    profiles: Array.isArray(e.profiles) ? e.profiles[0] ?? null : e.profiles,
    profile: Array.isArray(e.profile) ? e.profile[0] ?? null : e.profile,
  }));

  return (
    <SessionsList
      sessions={sessions}
      modules={modules}
      enrollments={normalizedEnrollments}
      cohortId={cohortId}
      onDataChange={onDataChange}
    />
  );
}
