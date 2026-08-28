import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { formatDate } from '@/utils/formatDate';
import { sendTemplateEmail } from './send-template-email';
import type { TemplateVariables } from './types';

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.techcentre.co';
}

interface EnrollmentEmailContext {
  enrollmentId: number;
  studentId: string;
  cohortId: number;
  profile: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  cohort: {
    name: string;
    campus: string | null;
    modality: string | null;
    start_date: string;
  };
  program: {
    name: string;
  } | null;
}

async function loadEnrollmentContext(enrollmentId: number): Promise<EnrollmentEmailContext | null> {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      student_id,
      cohort_id,
      profile:profiles!enrollments_student_id_fkey(first_name, last_name, email),
      cohort:cohorts(name, campus, modality, start_date, program:programs(name))
    `)
    .eq('id', enrollmentId)
    .maybeSingle();

  if (error || !data) {
    console.error('[email] enrollment context error:', error);
    return null;
  }

  const row = data as Record<string, unknown>;
  const profileRaw = row.profile;
  const profile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;
  const cohortRaw = row.cohort;
  const cohort = Array.isArray(cohortRaw) ? cohortRaw[0] : cohortRaw;
  if (!profile || !cohort) return null;

  const programRaw = (cohort as { program?: unknown }).program;
  const program = Array.isArray(programRaw) ? programRaw[0] : programRaw;

  return {
    enrollmentId,
    studentId: String(row.student_id),
    cohortId: Number(row.cohort_id),
    profile: profile as EnrollmentEmailContext['profile'],
    cohort: cohort as EnrollmentEmailContext['cohort'],
    program: program as EnrollmentEmailContext['program'],
  };
}

function buildEnrollmentVariables(ctx: EnrollmentEmailContext, daysUntilStart?: number): TemplateVariables {
  const studentName =
    `${ctx.profile.first_name ?? ''} ${ctx.profile.last_name ?? ''}`.trim() ||
    ctx.profile.email;

  const siteUrl = getSiteUrl().replace(/\/$/, '');

  const vars: TemplateVariables = {
    student_name: studentName,
    student_email: ctx.profile.email,
    program_name: ctx.program?.name ?? 'Tu programa',
    cohort_name: ctx.cohort.name,
    start_date: formatDate(ctx.cohort.start_date) || ctx.cohort.start_date,
    campus: ctx.cohort.campus ?? 'Por confirmar',
    modality: ctx.cohort.modality ?? 'Por confirmar',
    profile_url: `${siteUrl}/perfil`,
    site_url: siteUrl,
  };

  if (daysUntilStart != null) {
    vars.days_until_start = String(daysUntilStart);
  }

  return vars;
}

export async function sendEnrollmentConfirmedEmail(
  enrollmentId: number,
): Promise<{ sent: boolean; skipped?: boolean; error?: string }> {
  const ctx = await loadEnrollmentContext(enrollmentId);
  if (!ctx?.profile.email) {
    return { sent: false, error: 'Contexto de matrícula incompleto' };
  }

  const result = await sendTemplateEmail({
    slug: 'enrollment_confirmed',
    to: ctx.profile.email,
    variables: buildEnrollmentVariables(ctx),
    dedupeKey: `enrollment_confirmed:${enrollmentId}`,
    enrollmentId,
    cohortId: ctx.cohortId,
    replyTo: undefined,
  });

  return { sent: result.sent, skipped: result.skipped, error: result.error };
}

export async function sendCohortReminderEmail(
  enrollmentId: number,
  templateSlug: 'cohort_starts_7d' | 'cohort_starts_1d',
  daysUntilStart: number,
): Promise<{ sent: boolean; skipped?: boolean; error?: string }> {
  const ctx = await loadEnrollmentContext(enrollmentId);
  if (!ctx?.profile.email) {
    return { sent: false, error: 'Contexto de matrícula incompleto' };
  }

  const result = await sendTemplateEmail({
    slug: templateSlug,
    to: ctx.profile.email,
    variables: buildEnrollmentVariables(ctx, daysUntilStart),
    dedupeKey: `${templateSlug}:${ctx.cohortId}:${ctx.studentId}`,
    enrollmentId,
    cohortId: ctx.cohortId,
  });

  return { sent: result.sent, skipped: result.skipped, error: result.error };
}

export { loadEnrollmentContext, buildEnrollmentVariables, getSiteUrl };
