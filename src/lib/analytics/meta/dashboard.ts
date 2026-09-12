import { createClient } from '@/lib/supabase/server';
import { isReservationDeposit } from '@/lib/payments/invoice-meta';
import {
  DEFAULT_MODULE_CAPACITY,
  MARKETING_EJECUTIVO_CODES,
  MARKETING_PROGRAM_CODES,
} from './types';

export interface MarketingFilters {
  from: string;
  to: string;
  campaign?: string;
  programId?: number | null;
  routeSlug?: string;
  audience?: string;
}

export interface FunnelStep {
  key: string;
  label: string;
  count: number;
  rate: number | null;
}

export interface CampaignRow {
  campaign: string;
  ad: string;
  program: string;
  leads: number;
  diagnostics: number;
  reservations: number;
  enrollments: number;
  revenue: number;
  spend: number;
  cpl: number | null;
  cac: number | null;
  roas: number | null;
}

export interface ProgramRow {
  programId: number;
  name: string;
  code: string;
  leads: number;
  diagnostics: number;
  reservations: number;
  enrollments: number;
  seats: number;
  occupancy: number | null;
  revenue: number;
  cac: number | null;
  seatsRemaining: number;
}

export interface MarketingReport {
  spend: number;
  leads: number;
  diagnosticsScheduled: number;
  diagnosticsCompleted: number;
  reservations: number;
  enrollments: number;
  attributedRevenue: number;
  cpl: number | null;
  cac: number | null;
  roas: number | null;
  funnel: FunnelStep[];
  campaigns: CampaignRow[];
  programs: ProgramRow[];
  campaignOptions: string[];
  programOptions: { id: number; name: string; code: string }[];
  routeOptions: { slug: string; name: string }[];
}

function ratio(num: number, den: number): number | null {
  if (!den) return null;
  return num / den;
}

function inRange(iso: string | null | undefined, from: string, to: string): boolean {
  if (!iso) return false;
  return iso.slice(0, 10) >= from && iso.slice(0, 10) <= to;
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

const PAGE_SIZE = 1000;
const MAX_ROWS = 20_000;

async function fetchAllPages<T>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await query(from, from + PAGE_SIZE - 1);
    if (error) break;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

export async function buildMarketingReport(filters: MarketingFilters): Promise<MarketingReport> {
  const supabase = await createClient();
  const from = filters.from;
  const to = filters.to;
  const fromStart = `${from}T00:00:00`;
  const toEnd = `${to}T23:59:59`;

  const [leads, events, attributions, invoices, enrollments, spendRows, programs, routes, offeringCohorts] =
    await Promise.all([
      fetchAllPages((rangeFrom, rangeTo) =>
        supabase
          .from('leads')
          .select('id, email, source, stage, interested_program_id, diagnostic_completed_at, created_at')
          .gte('created_at', fromStart)
          .lte('created_at', toEnd)
          .range(rangeFrom, rangeTo)
      ) as Promise<
        {
          id: number;
          email: string | null;
          source: string;
          stage: string | null;
          interested_program_id: number | null;
          diagnostic_completed_at: string | null;
          created_at: string;
        }[]
      >,
      fetchAllPages((rangeFrom, rangeTo) =>
        supabase
          .from('marketing_events')
          .select('event_name, event_id, lead_id, user_id, program_id, value, occurred_at')
          .gte('occurred_at', fromStart)
          .lte('occurred_at', toEnd)
          .range(rangeFrom, rangeTo)
      ) as Promise<
        {
          event_name: string;
          lead_id: number | null;
          user_id: string | null;
          program_id: number | null;
          value: number | null;
          occurred_at: string;
        }[]
      >,
      fetchAllPages((rangeFrom, rangeTo) =>
        supabase.from('marketing_attribution').select('*').range(rangeFrom, rangeTo)
      ),
      fetchAllPages((rangeFrom, rangeTo) =>
        supabase
          .from('invoices')
          .select('id, enrollment_id, amount, status, paid_at, meta')
          .eq('status', 'paid')
          .not('paid_at', 'is', null)
          .gte('paid_at', fromStart)
          .lte('paid_at', toEnd)
          .range(rangeFrom, rangeTo)
      ) as Promise<
        {
          id: number;
          enrollment_id: number;
          amount: number;
          status: string;
          paid_at: string | null;
          meta: Record<string, unknown> | null;
        }[]
      >,
      fetchAllPages((rangeFrom, rangeTo) =>
        supabase
          .from('enrollments')
          .select(
            'id, student_id, status, cohort_id, created_at, updated_at, cohort:cohorts(id, program_id, capacity, offering, program:programs(id, name, code))'
          )
          .range(rangeFrom, rangeTo)
      ) as Promise<
        {
          id: number;
          student_id: string;
          status: string;
          cohort_id: number;
          created_at: string;
          updated_at: string;
          cohort:
            | {
                id: number;
                program_id: number;
                capacity: number | null;
                offering: boolean;
                program:
                  | { id: number; name: string; code: string }
                  | { id: number; name: string; code: string }[]
                  | null;
              }
            | null;
        }[]
      >,
      fetchAllPages((rangeFrom, rangeTo) =>
        supabase.from('marketing_spend').select('*').range(rangeFrom, rangeTo)
      ) as Promise<
        {
          campaign_name: string;
          utm_campaign: string | null;
          utm_content: string | null;
          starts_on: string;
          ends_on: string;
          spend: number;
        }[]
      >,
      supabase.from('programs').select('id, name, code').then((res) => (res.data ?? []) as { id: number; name: string; code: string }[]),
      supabase.from('routes').select('id, slug, name').then((res) => (res.data ?? []) as { id: string; slug: string; name: string }[]),
      supabase
        .from('cohorts')
        .select('id, program_id, capacity, offering')
        .eq('offering', true)
        .then((res) => (res.data ?? []) as { id: number; program_id: number; capacity: number | null }[]),
    ]);

  const attrRows = attributions as Record<string, unknown>[];
  const attrByLead = new Map<number, Record<string, unknown>>();
  const attrByUser = new Map<string, Record<string, unknown>>();
  for (const row of attrRows) {
    if (typeof row.lead_id === 'number') attrByLead.set(row.lead_id, row);
    if (typeof row.user_id === 'string') attrByUser.set(row.user_id, row);
  }

  const programById = new Map(programs.map((p) => [p.id, p]));
  const routeProgramIds = new Set<number>();
  if (filters.routeSlug) {
    const route = routes.find((item) => item.slug === filters.routeSlug);
    if (route) {
      const { data: rp } = await supabase
        .from('route_programs')
        .select('program_id')
        .eq('route_id', route.id);
      for (const row of rp ?? []) {
        if (typeof (row as { program_id?: number }).program_id === 'number') {
          routeProgramIds.add((row as { program_id: number }).program_id);
        }
      }
    }
  }

  function matchesCampaign(attr: Record<string, unknown> | undefined): boolean {
    if (!filters.campaign) return true;
    const first = String(attr?.first_utm_campaign ?? '');
    const last = String(attr?.last_utm_campaign ?? '');
    return first === filters.campaign || last === filters.campaign;
  }

  function matchesAudience(attr: Record<string, unknown> | undefined): boolean {
    if (!filters.audience) return true;
    const values = [
      attr?.first_utm_content,
      attr?.last_utm_content,
      attr?.first_utm_term,
      attr?.last_utm_term,
    ].map((v) => String(v ?? ''));
    return values.includes(filters.audience);
  }

  function matchesProgram(programId: number | null | undefined): boolean {
    if (filters.programId && programId !== filters.programId) return false;
    if (filters.routeSlug && programId && !routeProgramIds.has(programId)) return false;
    if (filters.routeSlug && !programId) return false;
    return true;
  }

  const filteredLeads = leads.filter((lead) => {
    const attr = attrByLead.get(lead.id);
    return (
      matchesCampaign(attr) &&
      matchesAudience(attr) &&
      matchesProgram(lead.interested_program_id)
    );
  });

  const viewContent = events.filter((event) => {
    if (event.event_name !== 'ViewContent') return false;
    if (!matchesProgram(event.program_id)) return false;
    const attr =
      (event.lead_id != null ? attrByLead.get(event.lead_id) : undefined) ||
      (event.user_id ? attrByUser.get(event.user_id) : undefined);
    return matchesCampaign(attr) && matchesAudience(attr);
  });
  const diagnosticsScheduled = filteredLeads.filter(
    (lead) => lead.stage === 'diagnostico' || lead.source.startsWith('diagnostico_')
  );
  const diagnosticsCompleted = filteredLeads.filter((lead) => Boolean(lead.diagnostic_completed_at));

  const checkoutStarted = events.filter((event) => {
    if (event.event_name !== 'InitiateCheckout') return false;
    if (!matchesProgram(event.program_id)) return false;
    const attr =
      (event.lead_id != null ? attrByLead.get(event.lead_id) : undefined) ||
      (event.user_id ? attrByUser.get(event.user_id) : undefined);
    return matchesCampaign(attr) && matchesAudience(attr);
  }).length;

  const paidInRange = invoices.filter((invoice) => inRange(invoice.paid_at, from, to));
  const enrollmentById = new Map(enrollments.map((e) => [e.id, e]));

  function invoiceMatchesFilters(invoice: (typeof invoices)[number]): boolean {
    const enrollment = enrollmentById.get(invoice.enrollment_id);
    const program = one(enrollment?.cohort?.program);
    const attr = enrollment ? attrByUser.get(enrollment.student_id) : undefined;
    return matchesCampaign(attr) && matchesAudience(attr) && matchesProgram(program?.id);
  }

  const reservationInvoices = paidInRange.filter(
    (invoice) => isReservationDeposit(invoice.meta) && invoiceMatchesFilters(invoice)
  );

  const enrolled = enrollments.filter((enrollment) => {
    if (enrollment.status !== 'enrolled') return false;
    if (!inRange(enrollment.updated_at || enrollment.created_at, from, to)) return false;
    const program = one(enrollment.cohort?.program);
    const attr = attrByUser.get(enrollment.student_id);
    return matchesCampaign(attr) && matchesAudience(attr) && matchesProgram(program?.id);
  });

  const attributedRevenue = paidInRange.reduce((sum, invoice) => {
    if (!invoiceMatchesFilters(invoice)) return sum;
    return sum + Number(invoice.amount || 0);
  }, 0);

  const campaignsInScope = new Set<string>();
  if (filters.programId || filters.routeSlug) {
    for (const lead of filteredLeads) {
      const attr = attrByLead.get(lead.id);
      const name = String(attr?.first_utm_campaign || attr?.last_utm_campaign || '');
      if (name) campaignsInScope.add(name);
    }
    for (const invoice of paidInRange.filter(invoiceMatchesFilters)) {
      const enrollment = enrollmentById.get(invoice.enrollment_id);
      const attr = enrollment ? attrByUser.get(enrollment.student_id) : undefined;
      const name = String(attr?.first_utm_campaign || attr?.last_utm_campaign || '');
      if (name) campaignsInScope.add(name);
    }
    for (const enrollment of enrolled) {
      const attr = attrByUser.get(enrollment.student_id);
      const name = String(attr?.first_utm_campaign || attr?.last_utm_campaign || '');
      if (name) campaignsInScope.add(name);
    }
  }

  const filteredSpend = spendRows.filter((row) => {
    if (row.starts_on > to || row.ends_on < from) return false;
    if (filters.campaign && row.utm_campaign !== filters.campaign && row.campaign_name !== filters.campaign) {
      return false;
    }
    if (filters.audience && row.utm_content && row.utm_content !== filters.audience) return false;
    if (filters.programId || filters.routeSlug) {
      const key = row.utm_campaign || row.campaign_name;
      return campaignsInScope.has(key);
    }
    return true;
  });

  const spend = filteredSpend.reduce((sum, row) => sum + Number(row.spend || 0), 0);

  const leadsCount = filteredLeads.length;
  const reservations = reservationInvoices.length;
  const enrollmentsCount = enrolled.length;

  const funnel: FunnelStep[] = [
    { key: 'landing', label: 'Visitas a landing', count: viewContent.length, rate: null },
    {
      key: 'leads',
      label: 'Leads',
      count: leadsCount,
      rate: ratio(leadsCount, viewContent.length),
    },
    {
      key: 'scheduled',
      label: 'Diagnósticos agendados',
      count: diagnosticsScheduled.length,
      rate: ratio(diagnosticsScheduled.length, leadsCount),
    },
    {
      key: 'completed',
      label: 'Diagnósticos completados',
      count: diagnosticsCompleted.length,
      rate: ratio(diagnosticsCompleted.length, diagnosticsScheduled.length),
    },
    {
      key: 'checkout',
      label: 'Checkout iniciado',
      count: checkoutStarted,
      rate: ratio(checkoutStarted, leadsCount),
    },
    {
      key: 'reservations',
      label: 'Reservas pagadas',
      count: reservations,
      rate: ratio(reservations, checkoutStarted || leadsCount),
    },
    {
      key: 'enrollments',
      label: 'Matrículas',
      count: enrollmentsCount,
      rate: ratio(enrollmentsCount, reservations || leadsCount),
    },
  ];

  const campaignKeys = new Map<string, CampaignRow>();
  function campaignKey(attr: Record<string, unknown> | undefined, programName: string) {
    const campaign = String(attr?.first_utm_campaign || attr?.last_utm_campaign || 'orgánico / directo');
    const ad = String(attr?.first_utm_content || attr?.last_utm_content || '—');
    return `${campaign}||${ad}||${programName}`;
  }

  function ensureCampaign(attr: Record<string, unknown> | undefined, programName: string): CampaignRow {
    const key = campaignKey(attr, programName);
    const existing = campaignKeys.get(key);
    if (existing) return existing;
    const row: CampaignRow = {
      campaign: String(attr?.first_utm_campaign || attr?.last_utm_campaign || 'orgánico / directo'),
      ad: String(attr?.first_utm_content || attr?.last_utm_content || '—'),
      program: programName,
      leads: 0,
      diagnostics: 0,
      reservations: 0,
      enrollments: 0,
      revenue: 0,
      spend: 0,
      cpl: null,
      cac: null,
      roas: null,
    };
    campaignKeys.set(key, row);
    return row;
  }

  for (const lead of filteredLeads) {
    const attr = attrByLead.get(lead.id);
    const programName = programById.get(lead.interested_program_id ?? -1)?.name || 'Sin programa';
    const row = ensureCampaign(attr, programName);
    row.leads += 1;
    if (lead.stage === 'diagnostico' || lead.source.startsWith('diagnostico_')) row.diagnostics += 1;
  }

  for (const invoice of reservationInvoices) {
    const enrollment = enrollmentById.get(invoice.enrollment_id);
    const program = one(enrollment?.cohort?.program);
    const attr = enrollment ? attrByUser.get(enrollment.student_id) : undefined;
    const row = ensureCampaign(attr, program?.name || 'Sin programa');
    row.reservations += 1;
    row.revenue += Number(invoice.amount || 0);
  }

  for (const invoice of paidInRange) {
    if (isReservationDeposit(invoice.meta)) continue;
    if (!invoiceMatchesFilters(invoice)) continue;
    const enrollment = enrollmentById.get(invoice.enrollment_id);
    const program = one(enrollment?.cohort?.program);
    const attr = enrollment ? attrByUser.get(enrollment.student_id) : undefined;
    const row = ensureCampaign(attr, program?.name || 'Sin programa');
    row.revenue += Number(invoice.amount || 0);
  }

  for (const enrollment of enrolled) {
    const program = one(enrollment.cohort?.program);
    const attr = attrByUser.get(enrollment.student_id);
    const row = ensureCampaign(attr, program?.name || 'Sin programa');
    row.enrollments += 1;
  }

  for (const spendRow of filteredSpend) {
    const matching = [...campaignKeys.values()].filter(
      (row) =>
        row.campaign === (spendRow.utm_campaign || spendRow.campaign_name) &&
        (!spendRow.utm_content || row.ad === spendRow.utm_content || row.ad === '—')
    );
    if (matching.length === 0) {
      const row = ensureCampaign(
        { first_utm_campaign: spendRow.utm_campaign || spendRow.campaign_name, first_utm_content: spendRow.utm_content },
        '—'
      );
      row.spend += Number(spendRow.spend || 0);
    } else {
      const share = Number(spendRow.spend || 0) / matching.length;
      for (const row of matching) row.spend += share;
    }
  }

  const campaigns = [...campaignKeys.values()].map((row) => ({
    ...row,
    cpl: ratio(row.spend, row.leads),
    cac: ratio(row.spend, row.enrollments),
    roas: ratio(row.revenue, row.spend),
  }));

  const namedPrograms = programs.filter((program) => {
    const code = (program.code || '').toLowerCase();
    const name = (program.name || '').toLowerCase();
    return (
      MARKETING_PROGRAM_CODES.includes(code as (typeof MARKETING_PROGRAM_CODES)[number]) ||
      MARKETING_EJECUTIVO_CODES.includes(code as (typeof MARKETING_EJECUTIVO_CODES)[number]) ||
      name.includes('ejecutivo')
    );
  });

  const named =
    namedPrograms.length > 0
      ? namedPrograms
      : programs.filter((p) => MARKETING_PROGRAM_CODES.some((code) => (p.code || '').includes(code)));

  const seatsByProgram = new Map<number, number>();
  for (const cohort of offeringCohorts) {
    const cap = cohort.capacity && cohort.capacity > 0 ? cohort.capacity : DEFAULT_MODULE_CAPACITY;
    seatsByProgram.set(cohort.program_id, (seatsByProgram.get(cohort.program_id) ?? 0) + cap);
  }

  const programRows: ProgramRow[] = (named.length ? named : programs).map((program) => {
    const pLeads = filteredLeads.filter((l) => l.interested_program_id === program.id).length;
    const pDiag = filteredLeads.filter(
      (l) =>
        l.interested_program_id === program.id &&
        (l.stage === 'diagnostico' || l.source.startsWith('diagnostico_'))
    ).length;
    const pRes = reservationInvoices.filter((invoice) => {
      const enrollment = enrollmentById.get(invoice.enrollment_id);
      return one(enrollment?.cohort?.program)?.id === program.id;
    }).length;
    const pEnroll = enrolled.filter((e) => one(e.cohort?.program)?.id === program.id).length;
    const seats = seatsByProgram.get(program.id) ?? DEFAULT_MODULE_CAPACITY;
    const revenue = paidInRange.reduce((sum, invoice) => {
      if (!invoiceMatchesFilters(invoice)) return sum;
      const enrollment = enrollmentById.get(invoice.enrollment_id);
      return one(enrollment?.cohort?.program)?.id === program.id ? sum + Number(invoice.amount || 0) : sum;
    }, 0);
    const programSpend = campaigns
      .filter((c) => c.program === program.name)
      .reduce((sum, c) => sum + c.spend, 0);
    return {
      programId: program.id,
      name: program.name,
      code: program.code,
      leads: pLeads,
      diagnostics: pDiag,
      reservations: pRes,
      enrollments: pEnroll,
      seats,
      occupancy: seats ? pEnroll / seats : null,
      revenue,
      cac: ratio(programSpend, pEnroll),
      seatsRemaining: Math.max(0, seats - pEnroll),
    };
  });

  const campaignOptions = [
    ...new Set(
      attrRows
        .flatMap((a) => [a.first_utm_campaign, a.last_utm_campaign])
        .filter((v): v is string => typeof v === 'string' && v.length > 0)
    ),
  ].sort();

  return {
    spend,
    leads: leadsCount,
    diagnosticsScheduled: diagnosticsScheduled.length,
    diagnosticsCompleted: diagnosticsCompleted.length,
    reservations,
    enrollments: enrollmentsCount,
    attributedRevenue,
    cpl: ratio(spend, leadsCount),
    cac: ratio(spend, enrollmentsCount),
    roas: ratio(attributedRevenue, spend),
    funnel,
    campaigns,
    programs: programRows,
    campaignOptions,
    programOptions: programs.map((p) => ({ id: p.id, name: p.name, code: p.code })),
    routeOptions: routes.map((r) => ({ slug: r.slug, name: r.name })),
  };
}
