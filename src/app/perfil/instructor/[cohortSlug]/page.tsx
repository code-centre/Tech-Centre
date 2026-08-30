'use client';

import { useParams } from 'next/navigation';
import InstructorCohortDetail from '@/components/instructor/InstructorCohortDetail';

export default function InstructorCohortPage() {
  const params = useParams();
  const cohortSlug = params?.cohortSlug as string;

  if (!cohortSlug) return null;

  return <InstructorCohortDetail cohortSlug={cohortSlug} />;
}
