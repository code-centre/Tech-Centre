'use server';

import { createClient } from '@/lib/supabase/server';
import { confirmEnrollmentPaid } from '@/lib/payments/confirm-enrollment-paid';

export interface MarkInvoicePaidResult {
  success: boolean;
  error?: string;
  enrollmentConfirmed?: boolean;
}

export async function markInvoicePaidAdmin(
  invoiceId: number,
  payload: {
    status: 'paid';
    paid_at: string;
    meta: Record<string, unknown>;
    url_recipe?: string | null;
  },
): Promise<MarkInvoicePaidResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if ((profile as { role?: string } | null)?.role !== 'admin') {
    return { success: false, error: 'Sin permisos' };
  }

  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('id, enrollment_id, status, meta')
    .eq('id', invoiceId)
    .single();

  if (fetchError || !invoice) {
    return { success: false, error: 'Factura no encontrada' };
  }

  const inv = invoice as {
    id: number;
    enrollment_id: number;
    status: string;
    meta?: Record<string, unknown> | null;
  };
  const wasPending = inv.status !== 'paid';

  const { error: updateError } = await supabase
    .from('invoices')
    .update(payload as never)
    .eq('id', invoiceId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  if (wasPending) {
    const mergedMeta = { ...(inv.meta ?? {}), ...payload.meta };
    const paymentNumber = Number(mergedMeta.payment_number ?? 1);
    if (paymentNumber === 1) {
      const result = await confirmEnrollmentPaid(supabase, inv.enrollment_id, payload.paid_at);
      if (result.error) {
        return { success: false, error: result.error };
      }
      return { success: true, enrollmentConfirmed: result.newlyEnrolled };
    }
  }

  return { success: true };
}

export interface CreateInvoiceResult {
  success: boolean;
  error?: string;
  invoiceId?: number;
}

/**
 * Registra una factura a mano desde el admin. La cobranza normal la crea el
 * checkout, así que esto es para los casos sueltos: un pago acordado por
 * fuera, una cuota extra, una corrección.
 */
export async function createInvoiceAdmin(payload: {
  enrollmentId: number;
  label: string;
  amount: number;
  dueDate: string;
  /** Si ya se pagó, se crea y se confirma en un solo paso. */
  markPaid?: boolean;
  paymentMethod?: string;
  notes?: string;
}): Promise<CreateInvoiceResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autenticado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if ((profile as { role?: string } | null)?.role !== 'admin') {
    return { success: false, error: 'Sin permisos' };
  }

  const label = payload.label.trim();
  if (!label) return { success: false, error: 'Falta el concepto' };
  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    return { success: false, error: 'El monto debe ser mayor que cero' };
  }
  if (!payload.dueDate) return { success: false, error: 'Falta la fecha de vencimiento' };

  // La matrícula tiene que existir: sin ella la factura queda huérfana y no
  // aparece en ninguna pantalla.
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('id', payload.enrollmentId)
    .single();

  if (enrollmentError || !enrollment) {
    return { success: false, error: 'No se encontró la matrícula' };
  }

  const meta: Record<string, unknown> = { created_by_admin: user.id };
  if (payload.notes?.trim()) meta.admin_notes = payload.notes.trim();
  if (payload.markPaid && payload.paymentMethod) meta.admin_payment_method = payload.paymentMethod;

  const { data: created, error: insertError } = await supabase
    .from('invoices')
    .insert({
      enrollment_id: payload.enrollmentId,
      label,
      amount: Math.round(payload.amount),
      due_date: payload.dueDate,
      status: 'pending',
      meta,
    } as never)
    .select('id')
    .single();

  if (insertError || !created) {
    return { success: false, error: insertError?.message ?? 'No se pudo crear la factura' };
  }

  const invoiceId = (created as { id: number }).id;

  if (payload.markPaid) {
    // Se reusa el mismo camino del modal: confirma la matrícula y avisa.
    const result = await markInvoicePaidAdmin(invoiceId, {
      status: 'paid',
      paid_at: new Date().toISOString(),
      meta,
    });
    if (!result.success) {
      return { success: false, error: `La factura quedó creada pero no se pudo marcar pagada: ${result.error}`, invoiceId };
    }
  }

  return { success: true, invoiceId };
}

/* -------------------------------------------------------------------------- */
/* Pagos a profesores                                                          */
/* -------------------------------------------------------------------------- */

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: 'No autenticado' as const };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if ((profile as { role?: string } | null)?.role !== 'admin') {
    return { supabase, user: null, error: 'Sin permisos' as const };
  }

  return { supabase, user, error: null };
}

/** Acuerda (o cambia) cómo se le paga a un profesor en una cohorte. */
export async function setInstructorRate(payload: {
  instructorId: string;
  cohortId: number;
  mode: 'per_session' | 'per_cohort' | 'monthly';
  amount: number;
  requiresAttendance: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { success: false, error: authError };

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    return { success: false, error: 'El monto debe ser mayor que cero' };
  }

  const { error } = await supabase.from('instructor_rates').upsert(
    {
      instructor_id: payload.instructorId,
      cohort_id: payload.cohortId,
      mode: payload.mode,
      amount: payload.amount,
      requires_attendance: payload.requiresAttendance,
    } as never,
    { onConflict: 'instructor_id,cohort_id' }
  );

  if (error) return { success: false, error: error.message || 'No se pudo guardar la tarifa' };
  return { success: true };
}

/**
 * Deja registrado un pago a un profesor y lo marca como hecho.
 *
 * El periodo es la llave: hay un único pago por profesor, cohorte y periodo,
 * así que volver a marcar el mismo mes no lo duplica.
 */
export async function payInstructor(payload: {
  instructorId: string;
  cohortId: number;
  concept: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  sessionCount: number;
  method?: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { supabase, user, error: authError } = await requireAdmin();
  if (authError || !user) return { success: false, error: authError ?? 'Sin permisos' };

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    return { success: false, error: 'El monto debe ser mayor que cero' };
  }
  if (!payload.periodStart || !payload.periodEnd) {
    return { success: false, error: 'Falta el periodo que cubre el pago' };
  }

  const { error } = await supabase.from('instructor_payments').upsert(
    {
      instructor_id: payload.instructorId,
      cohort_id: payload.cohortId,
      concept: payload.concept,
      amount: payload.amount,
      period_start: payload.periodStart,
      period_end: payload.periodEnd,
      session_count: payload.sessionCount,
      status: 'paid',
      paid_at: new Date().toISOString(),
      method: payload.method ?? null,
      notes: payload.notes ?? null,
      created_by: user.id,
    } as never,
    { onConflict: 'instructor_id,cohort_id,period_start,period_end' }
  );

  if (error) return { success: false, error: error.message || 'No se pudo registrar el pago' };
  return { success: true };
}
