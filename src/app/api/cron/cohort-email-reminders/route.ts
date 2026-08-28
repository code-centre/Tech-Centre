import { NextRequest, NextResponse } from 'next/server';
import { sendCohortStartReminders } from '@/lib/email/cohort-reminders';

export const runtime = 'nodejs';
export const maxDuration = 60;

function authorizeCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendCohortStartReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error('[cron] cohort-email-reminders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 },
    );
  }
}
