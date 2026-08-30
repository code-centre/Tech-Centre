'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  X,
} from 'lucide-react';
import { updateProfileAdmin } from '@/app/admin/actions';
import { MarkAsPaidModal } from './MarkAsPaidModal';
import NewInvoiceModal from './NewInvoiceModal';
import EnrollStudentModal from './EnrollStudentModal';
import {
  daysBetween,
  formatDate,
  formatLongDate,
  formatMoney,
  formatShortDate,
  initialsOf,
  isCohortActive,
  summarizePayments,
  type PersonStatus,
  type StudentInvoice,
} from '@/lib/students';

const FIELD =
  'w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-color text-[13.5px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all';

const STATUS: Record<PersonStatus, { label: string; color: string }> = {
  active: { label: 'En curso', color: 'var(--pay-serie-cobrado)' },
  alumni: { label: 'Exalumno', color: 'var(--pay-serie-porcobrar)' },
  lead: { label: 'Lead', color: 'var(--pay-aviso)' },
};

const ROLE_LABEL: Record<string, string> = {
  student: 'Estudiante',
  lead: 'Lead',
  instructor: 'Instructor',
  admin: 'Admin',
};

const ID_TYPES = ['CC', 'TI', 'CE', 'PA', 'NIT'];

function tint(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

export interface DetailProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  role: string;
  professional_title: string | null;
  linkedin_url: string | null;
  birthdate: string | null;
  address: string | null;
  id_type: string | null;
  id_number: string | null;
  created_at: string;
}

export interface DetailEnrollment {
  id: number;
  agreedPrice: number | null;
  cohortId: number;
  cohortName: string;
  programName: string;
  startDate: string | null;
  endDate: string | null;
  modality: string | null;
  /** Sesiones ya dictadas y a cuántas asistió; null si aún no hay ninguna. */
  attendance: { present: number; total: number } | null;
}

export interface DetailInvoice extends StudentInvoice {
  id: number;
  label: string;
  url_recipe: string | null;
  meta: Record<string, unknown> | null;
  programName: string;
  cohortName: string;
}

export interface DetailLead {
  createdAt: string;
  origin: string;
  message: string | null;
  interest: string | null;
  intent: string | null;
}

interface Props {
  profile: DetailProfile;
  enrollments: DetailEnrollment[];
  invoices: DetailInvoice[];
  lead: DetailLead | null;
  canEditRole: boolean;
  openEnroll?: boolean;
}

export default function StudentDetail({
  profile,
  enrollments,
  invoices,
  lead,
  canEditRole,
  openEnroll = false,
}: Props) {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    professional_title: profile.professional_title || '',
    linkedin_url: profile.linkedin_url || '',
    birthdate: profile.birthdate || '',
    address: profile.address || '',
    id_type: profile.id_type || 'CC',
    id_number: profile.id_number || '',
  });

  const [changingRole, setChangingRole] = useState(false);
  const [charging, setCharging] = useState(false);
  const [enrolling, setEnrolling] = useState(openEnroll);
  const [markingInvoice, setMarkingInvoice] = useState<DetailInvoice | null>(null);

  const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Sin nombre';

  const active = enrollments.filter((e) => isCohortActive(e.endDate, today));
  const past = enrollments.filter((e) => !isCohortActive(e.endDate, today));
  const status: PersonStatus =
    active.length > 0 ? 'active' : past.length > 0 ? 'alumni' : 'lead';

  const payments = useMemo(() => summarizePayments(invoices, today), [invoices, today]);

  // La asistencia del encabezado es la de la cohorte en curso: mezclar varias
  // da un porcentaje que no describe ninguna. Sin cohorte activa, la última.
  const attendance =
    active.find((e) => e.attendance)?.attendance ??
    past.find((e) => e.attendance)?.attendance ??
    { present: 0, total: 0 };

  const nextDueDays = payments.nextDue ? -(daysBetween(payments.nextDue, today) ?? 0) : null;

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await updateProfileAdmin({
        user_id: profile.user_id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        role: profile.role,
        professional_title: form.professional_title || null,
        linkedin_url: form.linkedin_url || null,
        birthdate: form.birthdate || null,
        address: form.address || null,
        id_type: form.id_type || null,
        id_number: form.id_number || null,
      });
      if (!result.success) throw new Error(result.error);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (role: 'student' | 'lead') => {
    if (role === profile.role) return;
    setChangingRole(true);
    setError('');
    try {
      const result = await updateProfileAdmin({
        user_id: profile.user_id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        role,
        professional_title: profile.professional_title,
        linkedin_url: profile.linkedin_url,
      });
      if (!result.success) throw new Error(result.error);
      router.refresh();
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'No se pudo cambiar el rol');
    } finally {
      setChangingRole(false);
    }
  };

  const whatsapp = profile.phone ? `https://wa.me/${profile.phone.replace(/\D/g, '')}` : null;
  const backHref =
    profile.role === 'instructor'
      ? '/admin/instructores'
      : profile.role === 'admin'
        ? '/admin/admins'
        : '/admin/estudiantes';

  return (
    <div className="space-y-5">
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-2 text-[13.5px] text-text-muted transition-colors hover:text-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        {profile.role === 'instructor' ? 'Instructores' : profile.role === 'admin' ? 'Admins' : 'Estudiantes'}
      </Link>

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Identidad */}
      <div className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
        <div className="flex flex-wrap items-start justify-between gap-5 px-6 py-[22px]">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span
              className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[19px] font-semibold"
              style={{
                background: tint(STATUS[status].color, 13),
                color: STATUS[status].color,
              }}
              aria-hidden
            >
              {initialsOf(name)}
            </span>
            <div className="flex min-w-0 flex-col gap-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-[27px] font-bold tracking-tight text-text-primary">{name}</h1>
                <Pill color={STATUS[status].color}>{STATUS[status].label}</Pill>
                <Pill color="var(--text-muted)">{ROLE_LABEL[profile.role] ?? profile.role}</Pill>
              </div>
              <div className="flex flex-wrap gap-2">
                <ContactChip href={`mailto:${profile.email}`} icon={<Mail className="h-[15px] w-[15px] text-secondary" />}>
                  {profile.email}
                </ContactChip>
                {profile.phone && (
                  <ContactChip
                    href={whatsapp ?? undefined}
                    icon={<MessageSquare className="h-[15px] w-[15px] text-secondary" />}
                  >
                    {profile.phone}
                  </ContactChip>
                )}
                <ContactChip muted icon={<Calendar className="h-[15px] w-[15px]" />}>
                  Registrada el {formatLongDate(profile.created_at)}
                </ContactChip>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="inline-flex items-center gap-2 rounded-lg border border-border-color bg-bg-secondary px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-secondary/50"
            >
              <Pencil className="h-4 w-4" />
              Editar perfil
            </button>
            <button
              type="button"
              onClick={() => setCharging(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Registrar pago
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-border-color bg-bg-secondary xl:grid-cols-4">
          <Fact label="Programas">
            {enrollments.length === 0
              ? 'Ninguno todavía'
              : `${active.length} ${active.length === 1 ? 'activo' : 'activos'} · ${past.length} ${past.length === 1 ? 'terminado' : 'terminados'}`}
          </Fact>
          <Fact label="Asistencia">
            {attendance.total === 0 ? (
              'Sin sesiones dictadas'
            ) : (
              <>
                {Math.round((attendance.present / attendance.total) * 100)}%{' '}
                <span className="font-normal text-text-muted">
                  · {attendance.present} de {attendance.total} sesiones
                </span>
              </>
            )}
          </Fact>
          <Fact label="Pagado">
            {payments.count === 0 ? (
              'Sin facturas'
            ) : (
              <>
                <span className="tabular-nums">{formatMoney(payments.paid)}</span>{' '}
                <span className="font-normal text-text-muted tabular-nums">
                  de {formatMoney(payments.total)}
                </span>
              </>
            )}
          </Fact>
          <Fact label="Próximo vencimiento" last>
            {!payments.nextDue ? (
              payments.count === 0 ? 'Sin facturas' : 'Nada pendiente'
            ) : (
              <>
                {formatLongDate(payments.nextDue).replace(/ de \d{4}$/, '')}{' '}
                <span className="font-normal text-text-muted">
                  ·{' '}
                  {nextDueDays === null
                    ? ''
                    : nextDueDays < 0
                      ? `venció hace ${Math.abs(nextDueDays)} días`
                      : nextDueDays === 0
                        ? 'vence hoy'
                        : `en ${nextDueDays} días`}
                </span>
              </>
            )}
          </Fact>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_344px]">
        <div className="flex min-w-0 flex-col gap-5">
          {/* Trayectoria */}
          <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
            <CardHead
              title="Trayectoria"
              hint="Cohortes en las que está o estuvo matriculada."
              action={
                <button
                  type="button"
                  onClick={() => setEnrolling(true)}
                  className="inline-flex h-[34px] items-center gap-[7px] rounded-lg border border-border-color bg-bg-secondary px-[13px] text-[13.5px] font-medium text-text-primary transition-colors hover:border-secondary/50"
                >
                  <Plus className="h-[15px] w-[15px]" />
                  Matricular en otra cohorte
                </button>
              }
            />
            <div className="flex flex-col gap-3.5 px-5 py-[18px]">
              {enrollments.length === 0 ? (
                <p className="py-6 text-center text-[13.5px] text-text-muted">
                  Todavía no está matriculada en ninguna cohorte.
                </p>
              ) : (
                [...active, ...past].map((enrollment) => {
                  const isActive = isCohortActive(enrollment.endDate, today);
                  const color = isActive ? 'var(--secondary)' : 'var(--pay-serie-porcobrar)';
                  const enrollmentInvoices = invoices.filter((i) => i.enrollment_id === enrollment.id);
                  const summary = summarizePayments(enrollmentInvoices, today);
                  const rate = enrollment.attendance
                    ? Math.round((enrollment.attendance.present / enrollment.attendance.total) * 100)
                    : null;

                  return (
                    <article
                      key={enrollment.id}
                      className="flex flex-col gap-3.5 rounded-[10px] border p-4"
                      style={{
                        borderColor: isActive ? tint('var(--secondary)', 28) : 'var(--border-color)',
                        background: isActive ? tint('var(--secondary)', 5) : 'var(--bg-secondary)',
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-col gap-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[15.5px] font-semibold text-text-primary">
                              {enrollment.programName}
                            </span>
                            <Pill
                              color={isActive ? 'var(--pay-serie-cobrado)' : 'var(--pay-serie-porcobrar)'}
                            >
                              {isActive ? 'Activa' : 'Terminada'}
                            </Pill>
                          </div>
                          <span className="text-[13px] text-text-muted">
                            {[
                              enrollment.cohortName,
                              enrollment.startDate && enrollment.endDate
                                ? `${formatShortDate(enrollment.startDate)} – ${formatDate(enrollment.endDate)}`
                                : null,
                              enrollment.modality,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-[3px]">
                          <span className="text-[15px] font-semibold tabular-nums text-text-primary">
                            {enrollment.agreedPrice ? formatMoney(enrollment.agreedPrice) : '—'}
                          </span>
                          <span className="text-[12.5px] text-text-muted">
                            {summary.count === 0
                              ? 'Sin facturas'
                              : summary.pending === 0
                                ? 'Pagado completo'
                                : summary.overdueCount > 0
                                  ? `Debe ${formatMoney(summary.pending)}`
                                  : 'Precio acordado'}
                          </span>
                        </div>
                      </div>

                      {rate !== null && (
                        <div className="flex items-center gap-3">
                          <span className="w-[78px] shrink-0 text-[12.5px] text-text-muted">Asistencia</span>
                          <div className="h-1.5 grow overflow-hidden rounded-[3px] bg-border-color">
                            <span
                              className="block h-full rounded-[3px]"
                              style={{ width: `${rate}%`, background: color }}
                            />
                          </div>
                          <span className="w-24 text-right text-[12.5px] font-semibold tabular-nums text-text-primary">
                            {rate}% · {enrollment.attendance?.present}/{enrollment.attendance?.total}
                          </span>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </section>

          {/* Pagos */}
          <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
            <CardHead
              title="Pagos"
              hint={
                payments.count === 0
                  ? 'Todavía no tiene facturas.'
                  : `${formatMoney(payments.paid)} pagados de ${formatMoney(payments.total)} · ${
                      payments.overdueCount > 0
                        ? `${payments.overdueCount} ${payments.overdueCount === 1 ? 'cuota vencida' : 'cuotas vencidas'} hace ${payments.worstDaysLate} días`
                        : 'nada vencido'
                    }.`
              }
              action={
                <Link href="/admin/pagos" className="text-[13.5px] font-medium text-secondary hover:underline">
                  Ver en Pagos
                </Link>
              }
            />
            {invoices.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13.5px] text-text-muted">
                No hay facturas registradas.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-[minmax(0,1fr)_108px_128px_168px] items-center gap-3 border-b border-border-color/50 bg-bg-secondary px-5 py-2.5">
                  <HeadCell>Concepto</HeadCell>
                  <HeadCell>Vence</HeadCell>
                  <HeadCell right>Monto</HeadCell>
                  <HeadCell right>Estado</HeadCell>
                </div>
                {invoices.map((invoice) => {
                  const late = invoice.status !== 'paid' && (daysBetween(invoice.due_date, today) ?? 0) > 0;
                  const review = invoice.status === 'pending_review';
                  const color = invoice.status === 'paid'
                    ? 'var(--pay-serie-cobrado)'
                    : late
                      ? 'var(--pay-critico)'
                      : review
                        ? 'var(--pay-aviso)'
                        : 'var(--pay-neutro)';
                  const label = invoice.status === 'paid'
                    ? `Pagada ${formatShortDate(invoice.paid_at)}`
                    : review
                      ? 'Por revisar'
                      : late
                        ? `Vencida hace ${daysBetween(invoice.due_date, today)} d`
                        : 'Pendiente';

                  return (
                    <div
                      key={invoice.id}
                      className="grid grid-cols-[minmax(0,1fr)_108px_128px_168px] items-center gap-3 border-b border-border-color/50 px-5 py-3 last:border-b-0"
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-[13.5px] text-text-primary">{invoice.label}</span>
                        <span className="truncate text-[12.5px] text-text-muted">
                          {invoice.programName} · {invoice.cohortName}
                        </span>
                      </div>
                      <span
                        className="text-[13px] tabular-nums"
                        style={{ color: late ? 'var(--pay-critico)' : 'var(--text-muted)' }}
                      >
                        {formatDate(invoice.due_date)}
                      </span>
                      <span className="text-right text-[13.5px] font-semibold tabular-nums text-text-primary">
                        {formatMoney(invoice.amount)}
                      </span>
                      <div className="flex items-center justify-end gap-2">
                        <Pill color={color}>{label}</Pill>
                        {invoice.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => setMarkingInvoice(invoice)}
                            title="Marcar como pagada"
                            aria-label={`Marcar como pagada la factura ${invoice.label}`}
                            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border-color text-text-muted transition-colors hover:border-secondary/50 hover:text-secondary"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </section>
        </div>

        {/* Columna lateral */}
        <div className="flex flex-col gap-5">
          <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
            <CardHead
              title="Datos del perfil"
              action={
                editing ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                      aria-label="Cancelar la edición"
                      title="Cancelar"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-color bg-bg-secondary text-text-muted transition-colors hover:text-text-primary disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-secondary px-2.5 text-[13px] font-bold text-[#0E1116] disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Guardar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-color bg-bg-secondary px-2.5 text-[13px] font-medium text-text-primary transition-colors hover:border-secondary/50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                )
              }
            />

            {editing ? (
              <div className="flex flex-col gap-3 px-5 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nombre">
                    <input
                      className={FIELD}
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    />
                  </Field>
                  <Field label="Apellido">
                    <input
                      className={FIELD}
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-3">
                  <Field label="Tipo">
                    <select
                      className={FIELD}
                      value={form.id_type}
                      onChange={(e) => setForm({ ...form, id_type: e.target.value })}
                    >
                      {ID_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Documento">
                    <input
                      className={FIELD}
                      value={form.id_number}
                      onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Nacimiento">
                  <input
                    type="date"
                    className={FIELD}
                    value={form.birthdate}
                    onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    className={FIELD}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </Field>
                <Field label="Correo">
                  <input
                    type="email"
                    className={FIELD}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </Field>
                <Field label="Dirección">
                  <input
                    className={FIELD}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </Field>
                <Field label="Cargo">
                  <input
                    className={FIELD}
                    value={form.professional_title}
                    onChange={(e) => setForm({ ...form, professional_title: e.target.value })}
                  />
                </Field>
                <Field label="LinkedIn">
                  <input
                    className={FIELD}
                    value={form.linkedin_url}
                    onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/…"
                  />
                </Field>
              </div>
            ) : (
              <dl className="px-5 pb-4 pt-1.5">
                <DataRow label="Documento">
                  {profile.id_number ? `${profile.id_type ?? 'CC'} ${profile.id_number}` : 'Sin registrar'}
                </DataRow>
                <DataRow label="Nacimiento">
                  {profile.birthdate ? formatLongDate(profile.birthdate) : 'Sin registrar'}
                </DataRow>
                <DataRow label="Teléfono">{profile.phone || 'Sin registrar'}</DataRow>
                <DataRow label="Correo">{profile.email}</DataRow>
                <DataRow label="Dirección">{profile.address || 'Sin registrar'}</DataRow>
                <DataRow label="Cargo">{profile.professional_title || 'Sin registrar'}</DataRow>
                <DataRow label="LinkedIn" last>
                  {profile.linkedin_url ? (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-secondary hover:underline"
                    >
                      {profile.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com/, '')}
                      <ExternalLink className="h-[13px] w-[13px]" />
                    </a>
                  ) : (
                    'Sin registrar'
                  )}
                </DataRow>
              </dl>
            )}
          </section>

          {canEditRole && (profile.role === 'student' || profile.role === 'lead') && (
            <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
              <CardHead title="Rol y acceso" />
              <div className="flex flex-col gap-3 px-5 py-4">
                <div className="flex gap-1 rounded-[10px] border border-border-color bg-bg-secondary p-1">
                  {(['student', 'lead'] as const).map((role) => {
                    const isCurrent = profile.role === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleChange(role)}
                        disabled={changingRole}
                        className={`inline-flex h-[34px] grow items-center justify-center gap-1.5 rounded-[7px] border text-[13.5px] transition-colors disabled:opacity-60 ${
                          isCurrent
                            ? 'border-secondary/30 bg-secondary/10 font-semibold text-text-secondary'
                            : 'border-transparent font-medium text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {changingRole && !isCurrent && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {role === 'student' ? 'Estudiante' : 'Lead'}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[12.5px] leading-relaxed text-text-muted">
                  Como estudiante entra a la plataforma y ve sus cohortes. Como lead conserva sus
                  datos, pero pierde el acceso.
                </p>
              </div>
            </section>
          )}

          {lead && (
            <section className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]">
              <CardHead title="Cómo llegó" />
              <div className="flex flex-col gap-2.5 px-5 py-4">
                <p className="text-[13.5px] leading-relaxed text-text-primary">
                  {lead.intent ?? 'Dejó sus datos'} el {formatLongDate(lead.createdAt)} desde{' '}
                  {lead.origin}.
                  {lead.interest && !lead.origin.toLowerCase().includes(lead.interest.toLowerCase())
                    ? ` Le interesaba ${lead.interest}.`
                    : ''}
                </p>
                {lead.message && (
                  <p className="text-[12.5px] leading-relaxed text-text-muted">«{lead.message}»</p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <NewInvoiceModal
        open={charging}
        studentId={profile.user_id}
        onClose={() => setCharging(false)}
        onCreated={() => {
          setCharging(false);
          router.refresh();
        }}
      />

      <EnrollStudentModal
        open={enrolling}
        studentId={profile.user_id}
        studentName={name}
        enrolledCohortIds={enrollments.map((e) => e.cohortId)}
        onClose={() => setEnrolling(false)}
        onEnrolled={() => {
          setEnrolling(false);
          router.refresh();
        }}
      />

      <MarkAsPaidModal
        invoice={markingInvoice}
        isOpen={Boolean(markingInvoice)}
        onClose={() => setMarkingInvoice(null)}
        onSuccess={() => {
          setMarkingInvoice(null);
          router.refresh();
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function CardHead({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-color px-5 py-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {hint && <p className="text-[12.5px] text-text-muted">{hint}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex h-6 w-fit shrink-0 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: tint(color, 14), color }}
    >
      {children}
    </span>
  );
}

function ContactChip({
  href,
  icon,
  muted = false,
  children,
}: {
  href?: string;
  icon: React.ReactNode;
  muted?: boolean;
  children: React.ReactNode;
}) {
  const className = `inline-flex h-[30px] items-center gap-[7px] rounded-[7px] border border-border-color bg-bg-secondary px-[11px] text-[13px] ${
    muted ? 'text-text-muted' : 'text-text-primary'
  }`;

  if (!href) return <span className={className}>{icon}{children}</span>;

  return (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={`${className} transition-colors hover:border-secondary/50`}>
      {icon}
      {children}
    </a>
  );
}

function Fact({
  label,
  children,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-[3px] border-border-color px-6 py-3.5 ${last ? '' : 'border-r'}`}
    >
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </span>
      <span className="text-[15px] font-semibold text-text-primary">{children}</span>
    </div>
  );
}

function HeadCell({ children, right = false }: { children: React.ReactNode; right?: boolean }) {
  return (
    <span
      className={`text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted ${right ? 'text-right' : ''}`}
    >
      {children}
    </span>
  );
}

function DataRow({
  label,
  children,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[88px_minmax(0,1fr)] gap-3 py-2.5 ${last ? '' : 'border-b border-border-color/50'}`}
    >
      <dt className="text-[12.5px] text-text-muted">{label}</dt>
      <dd className="text-[13.5px] text-text-primary [overflow-wrap:break-word]">{children}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-text-muted">{label}</span>
      {children}
    </label>
  );
}
