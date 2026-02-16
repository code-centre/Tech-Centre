// src/components/adminspage/Invoices.tsx
'use client';

import { useState, useEffect } from 'react';
import { Enrollment } from './EnrollmentList';
import { useSupabaseClient } from '@/lib/supabase';

interface Invoice {
  id: number;
  enrollment_id: number;
  label: string;
  amount: number;
  due_date: string;
  status: string;
  meta: any;
  created_at: string;
  paid_at: string | null;
  url_recipe: string | null;
}

interface InvoicesProps {
  enrollment: Enrollment | null;
}

export function Invoices({ enrollment }: InvoicesProps) {
  const supabase = useSupabaseClient()
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!enrollment) {
        setInvoices([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('enrollment_id', enrollment.id)
          .order('due_date', { ascending: true });

        if (error) throw error;
        setInvoices(data || []);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Error al cargar las facturas');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [enrollment, supabase]);

  if (!enrollment) {
    return <div className="p-4 bg-bg-secondary rounded-lg text-text-muted">Selecciona una matrícula para ver las facturas</div>;
  }

  if (loading) {
    return <div className="p-4 text-secondary">Cargando facturas...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 border border-border-color rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">Facturas para {enrollment.profile?.first_name}</h2>
      
      {invoices.length === 0 ? (
        <p className="text-text-muted">No hay facturas para esta matrícula.</p>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-4 border border-border-color rounded-lg bg-bg-card shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-text-primary">{invoice.label}</p>
                  <p className="text-sm text-text-muted">
                    Vence: {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                  {invoice.paid_at && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Pagado: {new Date(invoice.paid_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    invoice.status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    ${invoice.amount.toLocaleString()}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
                  </span>
                </div>
              </div>
              {invoice.url_recipe && (
                <div className="mt-2">
                  <a 
                    href={invoice.url_recipe} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-secondary hover:text-secondary/80 underline"
                  >
                    Ver recibo de pago
                  </a>
                </div>
              )}
              {invoice.meta?.notes && (
                <p className="mt-2 text-sm text-text-muted">{invoice.meta.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}