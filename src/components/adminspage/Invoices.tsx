// src/components/adminspage/Invoices.tsx
'use client';

import { useState, useEffect } from 'react';
import { Enrollment } from './EnrollmentList';
import { supabase } from '@/lib/supabase';

interface Invoice {
  id: number;
  enrollment_id: number;
  label: string;
  amount: number;
  due_date: string;
  status: string;
  meta: any;
  created_at: string;
}

interface InvoicesProps {
  enrollment: Enrollment | null;
}

export function Invoices({ enrollment }: InvoicesProps) {
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
  }, [enrollment]);

  if (!enrollment) {
    return <div className="p-4 bg-gray-100 rounded-lg">Selecciona una matrícula para ver las facturas</div>;
  }

  if (loading) {
    return <div className="p-4 text-blueApp">Cargando facturas...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-white">Facturas para {enrollment.profile?.first_name}</h2>
      
      {invoices.length === 0 ? (
        <p>No hay facturas para esta matrícula.</p>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{invoice.label}</p>
                  <p className="text-sm text-gray-500">
                    Vence: {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    invoice.status === 'paid' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    ${invoice.amount.toLocaleString()}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}
                  </span>
                </div>
              </div>
              {invoice.meta?.notes && (
                <p className="mt-2 text-sm text-gray-600">{invoice.meta.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}