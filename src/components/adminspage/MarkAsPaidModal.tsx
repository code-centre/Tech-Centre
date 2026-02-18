'use client';

import { useState, useRef } from 'react';
import { useSupabaseClient, useUser } from '@/lib/supabase';
import { X, Upload, Loader2, CheckCircle, Landmark, Banknote } from 'lucide-react';
import { toast } from 'sonner';

export interface InvoiceForModal {
  id: number;
  label: string;
  amount: number;
  status: string;
  meta?: Record<string, unknown> | null;
}

interface MarkAsPaidModalProps {
  invoice: InvoiceForModal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'transfer' | 'cash';

export function MarkAsPaidModal({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}: MarkAsPaidModalProps) {
  const supabase = useSupabaseClient();
  const { user } = useUser();
  const [method, setMethod] = useState<PaymentMethod>('transfer');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setMethod('transfer');
    setNotes('');
    setFile(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async () => {
    if (!invoice || !user) return;

    if (method === 'transfer' && !file) {
      toast.error('Debes subir la imagen del comprobante de transferencia');
      return;
    }

    try {
      setIsSubmitting(true);

      let urlRecipe: string | null = null;

      if (method === 'transfer' && file) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('El archivo no debe superar los 5MB');
        }
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `receipts/admin/${invoice.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('activities')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('activities')
          .getPublicUrl(filePath);
        urlRecipe = publicUrl;
      }

      const updatePayload: Record<string, unknown> = {
        status: 'paid',
        paid_at: new Date().toISOString(),
        meta: {
          ...(invoice.meta || {}),
          admin_payment_method: method,
          admin_notes: notes.trim() || undefined,
        },
      };

      if (urlRecipe) {
        updatePayload.url_recipe = urlRecipe;
      }

      const { error: updateError } = await supabase
        .from('invoices')
        .update(updatePayload)
        .eq('id', invoice.id);

      if (updateError) throw updateError;

      toast.success('Factura marcada como pagada');
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      console.error('Error marking invoice as paid:', err);
      toast.error(err instanceof Error ? err.message : 'Error al marcar como pagada');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mark-paid-title"
    >
      <div className="bg-[var(--card-background)] rounded-xl border border-border-color shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border-color">
          <h2 id="mark-paid-title" className="text-xl font-semibold text-text-primary">
            Marcar como pagada
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
            title="Cerrar"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {invoice && (
          <div className="p-4 space-y-4">
            <div className="p-3 rounded-lg bg-bg-secondary/50 border border-border-color">
              <p className="font-medium text-text-primary">{invoice.label}</p>
              <p className="text-sm text-text-muted mt-1">
                ${invoice.amount.toLocaleString('es-CO')}
              </p>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-text-primary mb-2">
                Método de pago
              </legend>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="transfer"
                    checked={method === 'transfer'}
                    onChange={() => setMethod('transfer')}
                    className="w-4 h-4 text-secondary focus:ring-secondary"
                  />
                  <Landmark className="w-4 h-4 text-text-muted" />
                  <span className="text-text-primary">Transferencia</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="cash"
                    checked={method === 'cash'}
                    onChange={() => setMethod('cash')}
                    className="w-4 h-4 text-secondary focus:ring-secondary"
                  />
                  <Banknote className="w-4 h-4 text-text-muted" />
                  <span className="text-text-primary">Efectivo</span>
                </label>
              </div>
            </fieldset>

            {method === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Comprobante de transferencia (obligatorio)
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-secondary bg-secondary/10'
                      : 'border-border-color hover:border-secondary/50 hover:bg-bg-secondary/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {file ? (
                    <p className="text-text-primary font-medium">{file.name}</p>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-text-muted mx-auto mb-2" />
                      <p className="text-sm text-text-muted">
                        Arrastra una imagen o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-text-muted mt-1">Máx. 5MB</p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-text-primary mb-2">
                Notas (opcional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-secondary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                placeholder="Observaciones..."
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 p-4 border-t border-border-color">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (method === 'transfer' && !file)}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Confirmar pago
          </button>
        </div>
      </div>
    </div>
  );
}
