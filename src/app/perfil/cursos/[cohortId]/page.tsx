'use client';

import { useParams } from 'next/navigation';
import CohortCourseDetail from '@/components/profile/CohortCourseDetail';

export default function CohortCoursePage() {
  const params = useParams();
  const cohortId = params?.cohortId as string;

  if (!cohortId) {
    return null;
  }

  return <CohortCourseDetail cohortId={cohortId} />;
}
