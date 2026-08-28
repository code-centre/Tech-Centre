import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { sendCohortReminderEmail } from './enrollment-emails';

function bogotaDateParts(date = new Date()): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { y: get('year'), m: get('month'), d: get('day') };
}

function addDays(y: number, m: number, d: number, days: number): string {
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function extractDatePart(dateStr: string): string {
  return dateStr?.split('T')[0] ?? '';
}

export interface CohortReminderRunResult {
  sent7d: number;
  sent1d: number;
  skipped: number;
  errors: string[];
}

export async function sendCohortStartReminders(): Promise<CohortReminderRunResult> {
  const supabase = createServiceRoleClient();
  const today = bogotaDateParts();
  const target7 = addDays(today.y, today.m, today.d, 7);
  const target1 = addDays(today.y, today.m, today.d, 1);

  const result: CohortReminderRunResult = {
    sent7d: 0,
    sent1d: 0,
    skipped: 0,
    errors: [],
  };

  const { data: cohortsData, error: cohortError } = await supabase
    .from('cohorts')
    .select('id, start_date')
    .not('start_date', 'is', null);

  const cohorts = (cohortsData ?? []) as { id: number; start_date: string }[];

  if (cohortError) {
    result.errors.push(cohortError.message);
    return result;
  }

  if (cohorts.length === 0) {
    return result;
  }

  for (const cohort of cohorts) {
    const startPart = extractDatePart(cohort.start_date);
    let templateSlug: 'cohort_starts_7d' | 'cohort_starts_1d' | null = null;
    let daysUntil = 0;

    if (startPart === target7) {
      templateSlug = 'cohort_starts_7d';
      daysUntil = 7;
    } else if (startPart === target1) {
      templateSlug = 'cohort_starts_1d';
      daysUntil = 1;
    }

    if (!templateSlug) continue;

    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('cohort_id', cohort.id)
      .eq('status', 'enrolled');

    if (enrollError) {
      result.errors.push(enrollError.message);
      continue;
    }

    for (const enrollment of enrollments ?? []) {
      const sendResult = await sendCohortReminderEmail(
        (enrollment as { id: number }).id,
        templateSlug,
        daysUntil,
      );

      if (sendResult.sent) {
        if (templateSlug === 'cohort_starts_7d') result.sent7d += 1;
        else result.sent1d += 1;
      } else if (sendResult.skipped) {
        result.skipped += 1;
      } else if (sendResult.error && !sendResult.error.includes('inactivo')) {
        result.errors.push(`enrollment ${(enrollment as { id: number }).id}: ${sendResult.error}`);
      }
    }
  }

  return result;
}
