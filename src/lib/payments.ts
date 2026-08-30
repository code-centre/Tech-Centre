/**
 * Derivaciones de la cartera para /admin/pagos.
 *
 * `invoices.due_date` siempre estuvo guardado, pero nada lo usaba: sin mora no
 * hay forma de saber a quién cobrarle. Aquí se calcula todo lo que la pantalla
 * necesita a partir de las facturas ya cargadas.
 */

export type PaymentStatus = 'paid' | 'pending' | 'pending_review' | string;

export interface PaymentInvoice {
  amount: number;
  due_date: string;
  status: PaymentStatus;
  paid_at: string | null;
}

/** Los estados que muestra la pantalla, ya resueltos. */
export type DerivedStatus = 'paid' | 'review' | 'overdue' | 'pending';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Medianoche local: comparar fechas, no instantes. */
function startOfDay(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

/** Días de retraso de una factura sin pagar. 0 si aún no vence o no aplica. */
export function daysLate(invoice: PaymentInvoice, today: Date = new Date()): number {
  if (invoice.status === 'paid' || !invoice.due_date) return 0;
  const due = new Date(invoice.due_date);
  if (isNaN(due.getTime())) return 0;
  const diff = startOfDay(today) - startOfDay(due);
  return diff > 0 ? Math.floor(diff / DAY_MS) : 0;
}

/**
 * Una factura vencida es la que ya pasó su fecha y sigue pendiente. Un
 * comprobante en revisión NO cuenta como mora: la pelota está del lado del
 * equipo, no del estudiante.
 */
export function derivedStatus(invoice: PaymentInvoice, today: Date = new Date()): DerivedStatus {
  if (invoice.status === 'paid') return 'paid';
  if (invoice.status === 'pending_review') return 'review';
  return daysLate(invoice, today) > 0 ? 'overdue' : 'pending';
}

export interface AgingBucket {
  id: 'current' | 'd1_30' | 'd31_60' | 'd60_plus';
  label: string;
  amount: number;
  count: number;
  /** Porcentaje del total por cobrar, redondeado. */
  share: number;
}

export interface PaymentsOverview {
  collected: number;
  receivable: number;
  overdue: number;
  /** Pagado sobre todo lo facturado hasta hoy, en porcentaje entero. */
  collectionRate: number;
  paidCount: number;
  openCount: number;
  overdueCount: number;
  reviewCount: number;
  /** Días de retraso de la factura más vieja. */
  worstDaysLate: number;
  buckets: AgingBucket[];
}

const BUCKET_DEFS: { id: AgingBucket['id']; label: string; min: number; max: number }[] = [
  { id: 'current', label: 'Aún no vence', min: 0, max: 0 },
  { id: 'd1_30', label: '1 a 30 días', min: 1, max: 30 },
  { id: 'd31_60', label: '31 a 60 días', min: 31, max: 60 },
  { id: 'd60_plus', label: 'Más de 60 días', min: 61, max: Infinity },
];

export function buildOverview<T extends PaymentInvoice>(
  invoices: T[],
  today: Date = new Date()
): PaymentsOverview {
  const paid = invoices.filter((i) => i.status === 'paid');
  const open = invoices.filter((i) => i.status !== 'paid');

  const sum = (list: T[]) => list.reduce((total, i) => total + (i.amount || 0), 0);

  const collected = sum(paid);
  const receivable = sum(open);
  const overdueList = open.filter((i) => daysLate(i, today) > 0);
  const overdue = sum(overdueList);
  const billed = collected + receivable;

  const buckets: AgingBucket[] = BUCKET_DEFS.map((def) => {
    const list = open.filter((i) => {
      const late = daysLate(i, today);
      return def.id === 'current' ? late === 0 : late >= def.min && late <= def.max;
    });
    const amount = sum(list);
    return {
      id: def.id,
      label: def.label,
      amount,
      count: list.length,
      share: receivable > 0 ? Math.round((amount / receivable) * 100) : 0,
    };
  });

  return {
    collected,
    receivable,
    overdue,
    collectionRate: billed > 0 ? Math.round((collected / billed) * 100) : 0,
    paidCount: paid.length,
    openCount: open.length,
    overdueCount: overdueList.length,
    reviewCount: invoices.filter((i) => i.status === 'pending_review').length,
    worstDaysLate: overdueList.reduce((worst, i) => Math.max(worst, daysLate(i, today)), 0),
    buckets,
  };
}

export type PeriodType = 'month' | 'quarter' | 'year';

export interface PeriodPoint {
  key: string;
  label: string;
  collected: number;
  receivable: number;
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function periodKey(date: Date, period: PeriodType): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (period === 'year') return `${year}`;
  if (period === 'quarter') return `Q${Math.floor(month / 3) + 1} ${year}`;
  return `${MONTH_NAMES[month]} ${year}`;
}

function periodOrder(date: Date, period: PeriodType): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (period === 'year') return year * 100;
  if (period === 'quarter') return year * 100 + Math.floor(month / 3);
  return year * 100 + month;
}

/**
 * Lo cobrado se agrupa por su fecha de pago; lo que falta, por su fecha de
 * vencimiento. Así cada barra responde «cuánto entró» y «cuánto debía entrar».
 */
export function buildPeriodSeries<T extends PaymentInvoice>(
  invoices: T[],
  period: PeriodType,
  limit = 6
): PeriodPoint[] {
  const byKey = new Map<string, PeriodPoint & { order: number }>();

  const touch = (date: Date) => {
    const key = periodKey(date, period);
    let point = byKey.get(key);
    if (!point) {
      point = { key, label: key, collected: 0, receivable: 0, order: periodOrder(date, period) };
      byKey.set(key, point);
    }
    return point;
  };

  for (const invoice of invoices) {
    if (invoice.status === 'paid') {
      const when = invoice.paid_at ? new Date(invoice.paid_at) : null;
      if (when && !isNaN(when.getTime())) touch(when).collected += invoice.amount || 0;
    } else {
      const when = invoice.due_date ? new Date(invoice.due_date) : null;
      if (when && !isNaN(when.getTime())) touch(when).receivable += invoice.amount || 0;
    }
  }

  return Array.from(byKey.values())
    .sort((a, b) => a.order - b.order)
    .slice(-limit)
    .map(({ key, label, collected, receivable }) => ({ key, label, collected, receivable }));
}
