'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar, Mail, Phone, Stethoscope } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPageSkeleton from '@/components/admin/AdminPageSkeleton';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import {
  adminTableClass,
  adminTableHeadCellClass,
  adminTableRowClass,
} from '@/components/admin/admin-table';
import { useSupabaseClient } from '@/lib/supabase';

interface DiagnosticoLead {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  source: string;
  stage: string | null;
  notes: string | null;
  created_at: string;
}

interface DiagnosticoLeadNotes {
  program?: string;
  message?: string;
  source?: string;
}

const STAGE_LABELS: Record<string, string> = {
  diagnostico: 'Diagnóstico agendado',
  apartar: 'Apartar cupo',
  dudas: 'Resolver dudas',
  pagos: 'Opciones de pago',
};

function parseNotes(raw: string | null): DiagnosticoLeadNotes {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as DiagnosticoLeadNotes;
  } catch {
    return {};
  }
}

function formatOrigen(source: string, notes: DiagnosticoLeadNotes): string {
  if (notes.source) return notes.source;
  return source.replace(/^diagnostico_/, '').replace(/-/g, ' ');
}

export default function DiagnosticoLeadsSection() {
  const supabase = useSupabaseClient();
  const [leads, setLeads] = useState<DiagnosticoLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('id, full_name, email, phone, source, stage, notes, created_at')
      .like('source', 'diagnostico%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar leads de diagnóstico:', error);
      setLeads([]);
    } else {
      setLeads((data ?? []) as DiagnosticoLead[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <section className="mt-12 space-y-4" aria-labelledby="diagnostico-leads-heading">
      <AdminPageHeader
        icon={Stethoscope}
        title="Interesados en diagnóstico"
        subtitle={`${leads.length} ${leads.length === 1 ? 'registro' : 'registros'} desde /agendar-diagnostico`}
      />

      {loading ? (
        <AdminPageSkeleton rows={3} />
      ) : leads.length === 0 ? (
        <AdminEmptyState
          icon={Stethoscope}
          title="Aún no hay interesados registrados"
          description="Los leads aparecerán aquí cuando alguien complete el formulario de diagnóstico."
        />
      ) : (
        <div className={adminTableClass}>
          <div className="overflow-x-auto">
            <table className="w-full" aria-labelledby="diagnostico-leads-heading">
              <thead>
                <tr className="border-b border-border-color bg-bg-secondary">
                  <th scope="col" className={adminTableHeadCellClass}>
                    Nombre
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    Email
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    Teléfono
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    Programa
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    Origen
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    Etapa
                  </th>
                  <th scope="col" className={adminTableHeadCellClass}>
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const notes = parseNotes(lead.notes);
                  return (
                    <tr key={lead.id} className={adminTableRowClass}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-text-primary text-sm">{lead.full_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${lead.email}`}
                          className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                          {lead.email}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        {lead.phone ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
                            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                            {lead.phone}
                          </span>
                        ) : (
                          <span className="text-sm text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-text-primary">{notes.program || '—'}</div>
                        {notes.message && (
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notes.message}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text-muted">
                          {formatOrigen(lead.source, notes)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          {(lead.stage && STAGE_LABELS[lead.stage]) || lead.stage || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
                          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                          {new Date(lead.created_at).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
