import { redirect } from 'next/navigation';

export default async function InstructorCohortRedirect({
  params,
}: {
  params: Promise<{ cohortSlug: string }>;
}) {
  const { cohortSlug } = await params;
  redirect(`/perfil/instructor/${cohortSlug}`);
}
