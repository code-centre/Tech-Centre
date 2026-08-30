/**
 * Derivaciones para /admin/estudiantes.
 *
 * La pantalla junta dos fuentes que hasta ahora vivían separadas: los perfiles
 * (rol `student` o `lead`) y la tabla `leads`, que guarda a quien llenó un
 * formulario y todavía no tiene cuenta. Aquí se normalizan a un mismo tipo de
 * fila y se calcula lo que la tabla necesita mostrar: en qué punto está la
 * persona, cómo va con sus pagos y hace cuánto llegó.
 */

export type PersonKind = 'profile' | 'lead';

/** El punto del recorrido, no el rol: se deduce de las cohortes. */
export type PersonStatus = 'active' | 'alumni' | 'lead';

export interface CohortRef {
  id: number | string;
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  modality?: string | null;
  program?: { id: number; name: string } | null;
}

export interface StudentEnrollment {
  id: number;
  student_id: string;
  status?: string | null;
  agreed_price?: number | null;
  created_at?: string | null;
  cohort: CohortRef | null;
}

export interface StudentInvoice {
  id?: number;
  enrollment_id: number;
  label?: string | null;
  amount: number;
  due_date: string;
  status: string;
  paid_at: string | null;
}

export interface ProfileRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone?: string | null;
  role: string;
  created_at: string;
}

export interface LeadRow {
  id: number;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  stage: string | null;
  notes: string | null;
  created_at: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Las columnas de fecha de Postgres llegan como «2026-08-14». `new Date` las
 * lee como medianoche UTC, que en Colombia es el día anterior: sin esto, toda
 * la pantalla muestra un día menos y una cuota que vence hoy sale vencida.
 */
export function parseLocalDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

export function daysBetween(from: string | null | undefined, today: Date): number | null {
  const date = parseLocalDate(from);
  if (!date) return null;
  return Math.floor((startOfDay(today) - startOfDay(date)) / DAY_MS);
}

/** Una cohorte sigue activa mientras no haya pasado su fecha de cierre. */
export function isCohortActive(endDate: string | null | undefined, today: Date): boolean {
  const end = parseLocalDate(endDate);
  if (!end) return false;
  return startOfDay(end) >= startOfDay(today);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '··';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* -------------------------------------------------------------------------- */
/* Pagos                                                                       */
/* -------------------------------------------------------------------------- */

export type SegmentState = 'paid' | 'overdue' | 'pending';

export interface PaymentSummary {
  count: number;
  paidCount: number;
  total: number;
  paid: number;
  pending: number;
  overdueCount: number;
  overdueAmount: number;
  worstDaysLate: number;
  /** Vencimiento más próximo entre las que siguen abiertas. */
  nextDue: string | null;
  segments: SegmentState[];
}

/** Cuántos días lleva vencida una factura sin pagar. 0 si aún no vence. */
export function invoiceDaysLate(invoice: StudentInvoice, today: Date): number {
  if (invoice.status === 'paid' || !invoice.due_date) return 0;
  const late = daysBetween(invoice.due_date, today);
  return late && late > 0 ? late : 0;
}

export function summarizePayments(invoices: StudentInvoice[], today: Date): PaymentSummary {
  const ordered = [...invoices].sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));

  let paid = 0;
  let pending = 0;
  let paidCount = 0;
  let overdueCount = 0;
  let overdueAmount = 0;
  let worstDaysLate = 0;
  let nextDue: string | null = null;
  const segments: SegmentState[] = [];

  for (const invoice of ordered) {
    const amount = invoice.amount || 0;
    if (invoice.status === 'paid') {
      paid += amount;
      paidCount += 1;
      segments.push('paid');
      continue;
    }

    pending += amount;
    const late = invoiceDaysLate(invoice, today);
    if (late > 0) {
      overdueCount += 1;
      overdueAmount += amount;
      worstDaysLate = Math.max(worstDaysLate, late);
      segments.push('overdue');
    } else {
      segments.push('pending');
    }
    if (invoice.due_date && (!nextDue || invoice.due_date < nextDue)) nextDue = invoice.due_date;
  }

  return {
    count: ordered.length,
    paidCount,
    total: paid + pending,
    paid,
    pending,
    overdueCount,
    overdueAmount,
    worstDaysLate,
    nextDue,
    segments,
  };
}

/* -------------------------------------------------------------------------- */
/* Filas                                                                       */
/* -------------------------------------------------------------------------- */

export interface PersonRow {
  key: string;
  kind: PersonKind;
  userId: string | null;
  leadId: number | null;
  name: string;
  email: string;
  phone: string | null;
  initials: string;
  status: PersonStatus;
  createdAt: string;
  /** Días desde el registro; sirve para decidir si se muestra fecha o «hace N días». */
  ageInDays: number;
  /** Perfiles: el programa que está cursando, o el último que cursó. */
  programLabel: string | null;
  cohortLabel: string | null;
  payments: PaymentSummary | null;
  activeCount: number;
  alumniCount: number;
  /** Leads: qué quiere y cómo llegó. */
  interest: string | null;
  intent: string | null;
  message: string | null;
  origin: string | null;
}

const STAGE_INTENT: Record<string, string> = {
  diagnostico: 'Pidió diagnóstico',
  apartar: 'Quiere apartar cupo',
  dudas: 'Quería resolver dudas',
  pagos: 'Preguntó por formas de pago',
};

interface LeadNotes {
  program?: string;
  message?: string;
  source?: string;
}

export function parseLeadNotes(raw: string | null): LeadNotes {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as LeadNotes) : { message: raw };
  } catch {
    return { message: raw };
  }
}

/** «diagnostico_ingenieria-de-datos» → «landing de ingenieria de datos». */
export function formatLeadOrigin(source: string, notes: LeadNotes): string {
  if (notes.source) return notes.source;
  const clean = (source || '')
    .replace(/^diagnostico_/, '')
    .replace(/^ruta_/, 'ruta ')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .trim();
  return clean || 'sitio web';
}

export function buildProfileRow(
  profile: ProfileRow,
  enrollments: StudentEnrollment[],
  invoicesByEnrollment: Map<number, StudentInvoice[]>,
  today: Date
): PersonRow {
  const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Sin nombre';

  const active = enrollments.filter((e) => isCohortActive(e.cohort?.end_date, today));
  const alumni = enrollments.filter(
    (e) => e.cohort?.end_date && !isCohortActive(e.cohort.end_date, today)
  );

  // El programa que se muestra es el que está cursando; si ya terminó todo, el
  // último que terminó. Sin cohortes no hay nada que mostrar.
  const featured =
    active[0] ??
    [...alumni].sort((a, b) =>
      (b.cohort?.end_date || '').localeCompare(a.cohort?.end_date || '')
    )[0] ??
    null;

  const status: PersonStatus =
    active.length > 0 ? 'active' : alumni.length > 0 ? 'alumni' : 'lead';

  const invoices = enrollments.flatMap((e) => invoicesByEnrollment.get(e.id) ?? []);

  const cohortBits: string[] = [];
  if (featured?.cohort?.name) cohortBits.push(featured.cohort.name);
  if (status === 'active' && featured?.cohort?.modality) cohortBits.push(featured.cohort.modality);
  if (status === 'alumni' && featured?.cohort?.end_date) {
    cohortBits.push(`terminó ${formatShortDate(featured.cohort.end_date)}`);
  }
  if (active.length > 0 && alumni.length > 0) {
    cohortBits.push(alumni.length === 1 ? 'y 1 programa terminado' : `y ${alumni.length} terminados`);
  }

  return {
    key: `p:${profile.user_id}`,
    kind: 'profile',
    userId: profile.user_id,
    leadId: null,
    name,
    email: profile.email || '',
    phone: profile.phone || null,
    initials: initialsOf(name),
    status,
    createdAt: profile.created_at,
    ageInDays: daysBetween(profile.created_at, today) ?? 0,
    programLabel: featured?.cohort?.program?.name ?? null,
    cohortLabel: cohortBits.length > 0 ? cohortBits.join(' · ') : null,
    payments: enrollments.length > 0 ? summarizePayments(invoices, today) : null,
    activeCount: active.length,
    alumniCount: alumni.length,
    interest: null,
    intent: null,
    message: null,
    origin: null,
  };
}

export function buildLeadRow(lead: LeadRow, today: Date): PersonRow {
  const notes = parseLeadNotes(lead.notes);
  const name = (lead.full_name || '').trim() || 'Sin nombre';

  return {
    key: `l:${lead.id}`,
    kind: 'lead',
    userId: null,
    leadId: lead.id,
    name,
    email: lead.email || '',
    phone: lead.phone || null,
    initials: initialsOf(name),
    status: 'lead',
    createdAt: lead.created_at,
    ageInDays: daysBetween(lead.created_at, today) ?? 0,
    programLabel: null,
    cohortLabel: null,
    payments: null,
    activeCount: 0,
    alumniCount: 0,
    interest: notes.program || null,
    intent: lead.stage ? STAGE_INTENT[lead.stage] ?? null : null,
    message: notes.message || null,
    origin: formatLeadOrigin(lead.source, notes),
  };
}

/**
 * Junta perfiles y leads en una sola lista. Un lead cuyo correo ya tiene perfil
 * se descarta: es la misma persona, y el perfil sabe más de ella.
 */
export function mergePeople(profileRows: PersonRow[], leadRows: PersonRow[]): PersonRow[] {
  const known = new Set(
    profileRows.map((row) => row.email.trim().toLowerCase()).filter(Boolean)
  );
  const leads = leadRows.filter((row) => {
    const email = row.email.trim().toLowerCase();
    return !email || !known.has(email);
  });
  return [...profileRows, ...leads];
}

/* -------------------------------------------------------------------------- */
/* Cifras de cabecera                                                          */
/* -------------------------------------------------------------------------- */

export interface StudentsOverview {
  total: number;
  activeCount: number;
  alumniCount: number;
  leadCount: number;
  overdueCount: number;
  overdueAmount: number;
  worstDaysLate: number;
  newLeads: number;
  newEnrollments: number;
  activeCohorts: number;
  endingSoon: number;
  nextClosing: { name: string; endDate: string } | null;
}

export function buildStudentsOverview(
  people: PersonRow[],
  enrollments: StudentEnrollment[],
  today: Date
): StudentsOverview {
  let overdueCount = 0;
  let overdueAmount = 0;
  let worstDaysLate = 0;

  for (const person of people) {
    if (!person.payments || person.payments.overdueCount === 0) continue;
    overdueCount += 1;
    overdueAmount += person.payments.overdueAmount;
    worstDaysLate = Math.max(worstDaysLate, person.payments.worstDaysLate);
  }

  const activeCohortIds = new Set<string>();
  const closing: { name: string; endDate: string }[] = [];
  const soonStudents = new Set<string>();

  for (const enrollment of enrollments) {
    const cohort = enrollment.cohort;
    if (!cohort?.end_date || !isCohortActive(cohort.end_date, today)) continue;
    activeCohortIds.add(String(cohort.id));

    const daysLeft = -(daysBetween(cohort.end_date, today) ?? 0);
    if (daysLeft <= 30) {
      soonStudents.add(enrollment.student_id);
      if (!closing.some((c) => c.endDate === cohort.end_date && c.name === cohort.name)) {
        closing.push({ name: cohort.name || 'Cohorte', endDate: cohort.end_date });
      }
    }
  }

  closing.sort((a, b) => a.endDate.localeCompare(b.endDate));

  return {
    total: people.length,
    activeCount: people.filter((p) => p.status === 'active').length,
    alumniCount: people.filter((p) => p.status === 'alumni').length,
    leadCount: people.filter((p) => p.status === 'lead').length,
    overdueCount,
    overdueAmount,
    worstDaysLate,
    newLeads: people.filter((p) => p.status === 'lead' && p.ageInDays <= 7).length,
    newEnrollments: enrollments.filter((e) => (daysBetween(e.created_at, today) ?? 999) <= 7).length,
    activeCohorts: activeCohortIds.size,
    endingSoon: soonStudents.size,
    nextClosing: closing[0] ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Formato                                                                     */
/* -------------------------------------------------------------------------- */

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** «4 ago» — sin año, para cuando el contexto ya lo deja claro. */
export function formatShortDate(value: string | null | undefined): string {
  const date = parseLocalDate(value);
  if (!date) return '—';
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** «14 ago 2026». */
export function formatDate(value: string | null | undefined): string {
  const date = parseLocalDate(value);
  if (!date) return '—';
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** «14 de agosto de 2026». */
export function formatLongDate(value: string | null | undefined): string {
  const date = parseLocalDate(value);
  if (!date) return '—';
  return `${date.getDate()} de ${MONTHS_LONG[date.getMonth()]} de ${date.getFullYear()}`;
}

/** Lo reciente se mide en días; lo viejo lleva fecha. */
export function formatRegistered(value: string, ageInDays: number): string {
  if (ageInDays <= 0) return 'hoy';
  if (ageInDays === 1) return 'ayer';
  if (ageInDays <= 21) return `hace ${ageInDays} días`;
  return formatDate(value);
}

export function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CO')}`;
}
