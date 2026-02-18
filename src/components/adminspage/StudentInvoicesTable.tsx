'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { MarkAsPaidModal } from './MarkAsPaidModal';

interface Invoice {
  id: number;
  enrollment_id: number;
  label: string;
  amount: number;
  due_date: string;
  status: string;
  paid_at: string | null;
  url_recipe: string | null;
  meta?: Record<string, unknown> | null;
}

function getPaymentTypeLabel(inv: Invoice): string {
  if (inv.status !== 'paid') return '—';
  const meta = inv.meta;
  const adminMethod = meta?.admin_payment_method as string | undefined;
  const paymentId = meta?.payment_id;
  if (adminMethod === 'transfer') return 'Transferencia';
  if (adminMethod === 'cash') return 'Efectivo';
  if (paymentId) return 'Tarjeta';
  if (inv.url_recipe) return 'Transferencia';
  return '—';
}

interface StudentInvoicesTableProps {
  invoices: Invoice[];
}

export function StudentInvoicesTable({ invoices }: StudentInvoicesTableProps) {
  const router = useRouter();
  const [markingInvoice, setMarkingInvoice] = useState<Invoice | null>(null);

  const handleSuccess = () => {
    router.refresh();
  };

  if (invoices.length === 0) {
    return (
      <p className="text-text-muted py-8 text-center">No hay facturas registradas.</p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-color">
          <thead className="bg-bg-secondary/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">
                Concepto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">
                Vence
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">
                Monto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">
                Tipo de pago
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">
                Pagado
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-bg-secondary/30">
                <td className="px-4 py-3 text-sm text-text-primary">{inv.label}</td>
                <td className="px-4 py-3 text-sm text-text-muted">
                  {new Date(inv.due_date).toLocaleDateString('es-CO')}
                </td>
                <td className="px-4 py-3 text-sm text-text-primary font-medium">
                  ${inv.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      inv.status === 'paid'
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {inv.status === 'paid' ? 'Pagada' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">
                  {getPaymentTypeLabel(inv)}
                </td>
                <td className="px-4 py-3 text-sm text-text-muted">
                  {inv.paid_at
                    ? new Date(inv.paid_at).toLocaleDateString('es-CO')
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  {inv.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => setMarkingInvoice(inv)}
                      title="Marcar como pagada"
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-green-500/50 text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
                      aria-label="Marcar como pagada"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MarkAsPaidModal
        invoice={markingInvoice}
        isOpen={!!markingInvoice}
        onClose={() => setMarkingInvoice(null)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
