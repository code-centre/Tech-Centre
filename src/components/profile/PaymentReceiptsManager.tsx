'use client'

import { useState, useEffect } from 'react'
import { useUser, useSupabaseClient } from '@/lib/supabase'
import { 
  FileText, Upload, Calendar, DollarSign, CheckCircle, 
  Clock, AlertCircle, Loader2, Download, X,
  Receipt, CreditCard
} from 'lucide-react'
import { toast } from 'sonner'
import { formatMoney } from '@/lib/students'
import NextImage from 'next/image'

interface Invoice {
  id: number
  enrollment_id: number
  label: string
  amount: number
  due_date: string
  status: string
  meta: any
  created_at: string
  paid_at: string | null
  url_recipe: string | null
}

interface Enrollment {
  id: number
  student_id: string
  status: string
  agreed_price: number
  cohort?: unknown
}


export default function PaymentReceiptsManager() {
  const { user } = useUser()
  const supabase = useSupabaseClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingInvoiceId, setUploadingInvoiceId] = useState<number | null>(null)
  const [creatingPaymentLinkId, setCreatingPaymentLinkId] = useState<number | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserEnrollmentsAndInvoices()
    }
  }, [user])

  const fetchUserEnrollmentsAndInvoices = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch user's enrollments
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(
          'id, student_id, status, agreed_price, cohort:cohorts!cohort_id(id, name, start_date, end_date, program:programs!program_id(id, name))'
        )
        .eq('student_id', user?.id)

      if (enrollmentError) throw enrollmentError
      setEnrollments(enrollmentData || [])

      // Fetch invoices for those enrollments
      const enrollmentIds = enrollmentData?.map(e => e.id) || []
      if (enrollmentIds.length === 0) {
        setInvoices([])
        return
      }

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .in('enrollment_id', enrollmentIds)
        .order('due_date', { ascending: true })

      if (invoiceError) throw invoiceError
      setInvoices(invoiceData || [])

    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError('Error al cargar las facturas. Por favor, inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const uploadReceipt = async (file: File, invoiceId: number) => {
    if (!file || !user) return

    try {
      setUploadingInvoiceId(invoiceId)

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten archivos de imagen')
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo no debe superar los 5MB')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `receipts/${user.id}/${invoiceId}/${fileName}`

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('activities')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('activities')
        .getPublicUrl(filePath)

      // Update invoice with receipt URL for admin review
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          url_recipe: publicUrl,
          status: 'pending_review',
        })
        .eq('id', invoiceId)

      if (updateError) throw updateError

      // Refresh invoices list
      await fetchUserEnrollmentsAndInvoices()
      
      toast.success('Recibo subido correctamente')
      
    } catch (error: any) {
      console.error('Error uploading receipt:', error)
      toast.error(error.message || 'Error al subir el recibo. Por favor, inténtalo de nuevo.')
    } finally {
      setUploadingInvoiceId(null)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, invoiceId: number) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadReceipt(file, invoiceId)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLElement>, invoiceId: number) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      uploadReceipt(file, invoiceId)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault()
  }

  const handlePayOnPlatform = async (invoiceId: number) => {
    try {
      setCreatingPaymentLinkId(invoiceId)
      const res = await fetch(`/api/invoices/${invoiceId}/payment-link`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al generar el link de pago')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No se recibió la URL de pago')
      }
    } catch (err: unknown) {
      console.error('Error al pagar en plataforma:', err)
      toast.error(err instanceof Error ? err.message : 'Error al generar el link de pago')
    } finally {
      setCreatingPaymentLinkId(null)
    }
  }

  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

  /** «5 sep»: la columna es angosta y el año casi nunca aporta. */
  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString)
    const date = parts
      ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
      : new Date(dateString)
    if (isNaN(date.getTime())) return '—'
    return `${date.getDate()} ${MESES[date.getMonth()]}`
  }

  /** Cómo se pagó, si quedó registrado. */
  const paymentMethodOf = (invoice: Invoice): string => {
    const meta = invoice.meta as Record<string, unknown> | null
    const method = meta?.admin_payment_method
    if (method === 'transfer') return 'transferencia'
    if (method === 'cash') return 'efectivo'
    if (meta?.payment_id) return 'tarjeta'
    if (invoice.url_recipe) return 'transferencia'
    return ''
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-secondary" />
          <p className="text-text-muted text-sm">Cargando facturas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const unwrap = <T,>(value: T | T[] | null | undefined): T | null =>
    Array.isArray(value) ? value[0] ?? null : value ?? null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isOverdue = (invoice: Invoice) =>
    invoice.status !== 'paid' &&
    invoice.status !== 'pending_review' &&
    Boolean(invoice.due_date) &&
    new Date(`${invoice.due_date}T23:59:59`) < today
  const daysLate = (invoice: Invoice) =>
    Math.floor((today.getTime() - new Date(`${invoice.due_date}T00:00:00`).getTime()) / 86400000)

  const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid')
  const openInvoices = invoices.filter((invoice) => invoice.status !== 'paid')
  const overdueInvoices = invoices.filter(isOverdue)

  const paidTotal = paidInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0)
  const openTotal = openInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0)
  const overdueTotal = overdueInvoices.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0)
  const worstDays = overdueInvoices.reduce((worst, invoice) => Math.max(worst, daysLate(invoice)), 0)

  // Agrupadas por curso: una cuota suelta no dice nada sin saber de qué es.
  const groups = enrollments
    .map((enrollment) => {
      const cohort = unwrap(enrollment.cohort as never) as
        | { name?: string; end_date?: string | null; program?: unknown }
        | null
      const program = unwrap(cohort?.program as never) as { name?: string } | null
      const rows = invoices.filter((invoice) => invoice.enrollment_id === enrollment.id)

      return {
        id: enrollment.id,
        title: `${program?.name ?? 'Curso'}${cohort?.name ? ` · ${cohort.name}` : ''}`,
        rows,
        groupPaid: rows
          .filter((invoice) => invoice.status === 'paid')
          .reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
        groupTotal: rows.reduce((sum, invoice) => sum + (invoice.amount ?? 0), 0),
        finished: cohort?.end_date ? new Date(`${cohort.end_date}T23:59:59`) < today : false,
      }
    })
    .filter((group) => group.rows.length > 0)

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-[27px] font-bold tracking-tight text-text-primary">Mis pagos</h1>
        <p className="text-sm text-text-muted">
          Tus cuotas de cada curso, con su fecha y su comprobante.
        </p>
      </header>

      {invoices.length === 0 ? (
        <section className="rounded-xl border border-border-color bg-[var(--card-background)] px-10 py-14 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-text-muted/10 text-text-muted">
            <Receipt size={24} strokeWidth={1.8} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-text-primary">Todavía no tienes cuotas</h2>
          <p className="mx-auto mt-2 max-w-[400px] text-sm leading-relaxed text-text-muted">
            Cuando te matricules en un curso, aquí verás lo que va quedando por pagar.
          </p>
        </section>
      ) : (
        <>
          {overdueInvoices.length > 0 && (
            <section
              className="flex flex-wrap items-center justify-between gap-5 rounded-xl border p-[16px_20px]"
              style={{
                borderColor: 'color-mix(in srgb, var(--pay-critico) 35%, transparent)',
                background: 'color-mix(in srgb, var(--pay-critico) 6%, transparent)',
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <AlertCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--pay-critico)' }} />
                <span className="text-sm text-text-primary">
                  {overdueInvoices.length === 1 ? (
                    <>
                      Tienes una cuota vencida hace {worstDays} días:{' '}
                      <strong className="font-semibold">{overdueInvoices[0].label}</strong>,{' '}
                      {formatMoney(overdueInvoices[0].amount)}.
                    </>
                  ) : (
                    <>
                      Tienes {overdueInvoices.length} cuotas vencidas por{' '}
                      <strong className="font-semibold">{formatMoney(overdueTotal)}</strong>.
                    </>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handlePayOnPlatform(overdueInvoices[0].id)}
                disabled={creatingPaymentLinkId === overdueInvoices[0].id}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-secondary px-[18px] text-sm font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90 disabled:opacity-50"
              >
                {creatingPaymentLinkId === overdueInvoices[0].id && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Pagar ahora
              </button>
            </section>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat
              label="Ya pagaste"
              value={formatMoney(paidTotal)}
              note={`${paidInvoices.length} de ${invoices.length} ${invoices.length === 1 ? 'cuota' : 'cuotas'}`}
            />
            <Stat
              label="Te falta"
              value={formatMoney(openTotal)}
              note={
                openInvoices.length === 0
                  ? 'Estás al día'
                  : `${openInvoices.length} ${openInvoices.length === 1 ? 'cuota por pagar' : 'cuotas por pagar'}`
              }
            />
            <Stat
              label="Vencido"
              value={formatMoney(overdueTotal)}
              note={
                overdueInvoices.length === 0
                  ? 'Nada vencido'
                  : `${overdueInvoices.length === 1 ? 'Una cuota' : `${overdueInvoices.length} cuotas`}, hace ${worstDays} días`
              }
              alert={overdueTotal > 0}
            />
          </div>

          {groups.map((group) => (
            <section
              key={group.id}
              className="overflow-hidden rounded-xl border border-border-color bg-[var(--card-background)]"
            >
              <div className="flex items-center justify-between gap-4 border-b border-border-color px-5 py-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h2 className="text-base font-semibold text-text-primary">{group.title}</h2>
                  <p className="text-[12.5px] text-text-muted">
                    {formatMoney(group.groupPaid)} pagados de {formatMoney(group.groupTotal)}
                  </p>
                </div>
                <span
                  className="inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold"
                  style={
                    group.finished
                      ? {
                          background: 'color-mix(in srgb, var(--pay-serie-porcobrar) 14%, transparent)',
                          color: 'var(--pay-serie-porcobrar)',
                        }
                      : {
                          background: 'color-mix(in srgb, var(--pay-serie-cobrado) 14%, transparent)',
                          color: 'var(--pay-serie-cobrado)',
                        }
                  }
                >
                  {group.finished ? 'Terminado' : 'En curso'}
                </span>
              </div>

              <div className="hidden grid-cols-[minmax(0,1fr)_116px_122px_230px] items-center gap-3.5 border-b border-border-color bg-bg-secondary px-5 py-[11px] lg:grid">
                <HeadCell>Concepto</HeadCell>
                <HeadCell>Vence</HeadCell>
                <HeadCell right>Monto</HeadCell>
                <span />
              </div>

              {group.rows.map((invoice, index) => {
                const late = isOverdue(invoice)
                const review = invoice.status === 'pending_review'
                const isPaid = invoice.status === 'paid'

                return (
                  <div
                    key={invoice.id}
                    className={`grid grid-cols-[minmax(0,1fr)_116px_122px_230px] items-center gap-3.5 px-5 py-[13px] max-lg:flex max-lg:flex-col max-lg:items-start max-lg:gap-2 ${
                      index < group.rows.length - 1 ? 'border-b border-border-color/50' : ''
                    }`}
                    style={
                      late ? { background: 'color-mix(in srgb, var(--pay-critico) 5%, transparent)' } : undefined
                    }
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm text-text-primary">{invoice.label}</span>
                      <span className="truncate text-[12.5px] text-text-muted">
                        {isPaid
                          ? `Pagada el ${formatDate(invoice.paid_at ?? invoice.due_date)}${
                              paymentMethodOf(invoice) ? ` · ${paymentMethodOf(invoice)}` : ''
                            }`
                          : review
                            ? 'Subiste el comprobante, lo estamos verificando'
                            : invoice.url_recipe
                              ? 'Comprobante enviado'
                              : 'Todavía sin comprobante'}
                      </span>
                    </div>

                    <span
                      className="text-[13px]"
                      style={{ color: late ? 'var(--pay-critico)' : 'var(--text-muted)' }}
                    >
                      {late
                        ? `venció hace ${daysLate(invoice)} d`
                        : isPaid
                          ? formatDate(invoice.due_date)
                          : `vence ${formatDate(invoice.due_date)}`}
                    </span>

                    <span className="text-right text-sm font-semibold text-text-primary">
                      {formatMoney(invoice.amount)}
                    </span>

                    <div className="flex justify-end gap-2">
                      {isPaid ? (
                        <>
                          <span
                            className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold"
                            style={{
                              background: 'color-mix(in srgb, var(--pay-serie-cobrado) 14%, transparent)',
                              color: 'var(--pay-serie-cobrado)',
                            }}
                          >
                            Pagada
                          </span>
                          {invoice.url_recipe && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(invoice.url_recipe)}
                              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-secondary hover:underline"
                            >
                              <Receipt className="h-[15px] w-[15px]" />
                              Recibo
                            </button>
                          )}
                        </>
                      ) : review ? (
                        <span
                          className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold"
                          style={{
                            background: 'color-mix(in srgb, var(--pay-aviso) 14%, transparent)',
                            color: 'var(--pay-aviso)',
                          }}
                        >
                          En revisión
                        </span>
                      ) : (
                        <>
                          <label
                            onDrop={(event) => handleDrop(event, invoice.id)}
                            onDragOver={handleDragOver}
                            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border-color bg-bg-secondary px-[11px] text-[12.5px] font-medium text-text-primary transition-colors hover:border-secondary/50"
                          >
                            {uploadingInvoiceId === invoice.id ? (
                              <Loader2 className="h-[15px] w-[15px] animate-spin" />
                            ) : (
                              <Upload className="h-[15px] w-[15px]" />
                            )}
                            Comprobante
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(event) => handleFileSelect(event, invoice.id)}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handlePayOnPlatform(invoice.id)}
                            disabled={creatingPaymentLinkId === invoice.id}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-secondary px-[13px] text-[12.5px] font-semibold text-[#0E1116] transition-colors hover:bg-secondary/90 disabled:opacity-50"
                          >
                            {creatingPaymentLinkId === invoice.id && (
                              <Loader2 className="h-[15px] w-[15px] animate-spin" />
                            )}
                            Pagar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </section>
          ))}
        </>
      )}


      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <NextImage
              src={previewImage}
              alt="Recibo de pago"
              width={800}
              height={600}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}


function Stat({
  label,
  value,
  note,
  alert = false,
}: {
  label: string
  value: string
  note: string
  alert?: boolean
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-xl border bg-[var(--card-background)] p-[18px_20px]"
      style={{
        borderColor: alert
          ? 'color-mix(in srgb, var(--pay-critico) 32%, transparent)'
          : 'var(--border-color)',
      }}
    >
      <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
        {label}
      </span>
      <span
        className="text-2xl font-bold text-text-primary"
        style={alert ? { color: 'var(--pay-critico)' } : undefined}
      >
        {value}
      </span>
      <span className="text-[12.5px] text-text-muted">{note}</span>
    </div>
  )
}

function HeadCell({ children, right = false }: { children: React.ReactNode; right?: boolean }) {
  return (
    <span
      className={`text-[11px] font-medium uppercase tracking-[0.06em] text-text-muted ${right ? 'text-right' : ''}`}
    >
      {children}
    </span>
  )
}
