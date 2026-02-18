'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@/lib/supabase';
import { XIcon, Search, UserPlus, Loader2 } from 'lucide-react';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohortId: string;
  cohortName?: string;
  programDefaultPrice?: number;
  onEnrollmentCreated: () => void;
}

interface Profile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

function calculateInstallmentsFromDate(
  totalAmount: number,
  numInstallments: number,
  firstDueDate: string
): Array<{ number: number; amount: number; dueDate: string }> {
  if (numInstallments <= 1) {
    return [{ number: 1, amount: totalAmount, dueDate: firstDueDate }];
  }
  const baseAmount = Math.floor(totalAmount / numInstallments);
  const installments: Array<{ number: number; amount: number; dueDate: string }> = [];
  const startDate = new Date(firstDueDate);

  for (let i = 0; i < numInstallments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    const amount =
      i === numInstallments - 1
        ? totalAmount - baseAmount * (numInstallments - 1)
        : baseAmount;
    installments.push({
      number: i + 1,
      amount: Math.max(0, amount),
      dueDate: dueDate.toISOString().split('T')[0],
    });
  }
  return installments;
}

export default function EnrollmentModal({
  isOpen,
  onClose,
  cohortId,
  cohortName = 'Cohorte',
  programDefaultPrice,
  onEnrollmentCreated,
}: EnrollmentModalProps) {
  const supabase = useSupabaseClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [agreedPrice, setAgreedPrice] = useState('');
  const [numInstallments, setNumInstallments] = useState('1');
  const [firstDueDate, setFirstDueDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultPriceStr =
    programDefaultPrice != null && programDefaultPrice > 0
      ? programDefaultPrice.toLocaleString('es-CO')
      : '';

  const resetForm = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedStudent(null);
    setAgreedPrice(defaultPriceStr);
    setNumInstallments('1');
    setFirstDueDate(new Date().toISOString().split('T')[0]);
    setError(null);
  }, [defaultPriceStr]);

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
  }, [isOpen, resetForm]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data: enrolled } = await supabase
          .from('enrollments')
          .select('student_id')
          .eq('cohort_id', cohortId);
        const enrolledIds = enrolled?.map((e) => e.student_id) || [];

        const term = `%${searchQuery.trim()}%`;
        let query = supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`)
          .limit(10);

        if (enrolledIds.length > 0) {
          query = query.not('user_id', 'in', `(${enrolledIds.join(',')})`);
        }

        const { data, error: err } = await query;
        if (err) throw err;
        setSearchResults((data as Profile[]) || []);
      } catch (err) {
        console.error('Error searching profiles:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, cohortId, supabase]);

  const handleSelectStudent = (profile: Profile) => {
    setSelectedStudent(profile);
    setSearchQuery('');
    setSearchResults([]);
    if (defaultPriceStr && !agreedPrice) {
      setAgreedPrice(defaultPriceStr);
    }
  };

  const handleBack = () => {
    setSelectedStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const amount = agreedPrice
      ? parseFloat(agreedPrice.replace(/[.,\s]/g, ''))
      : 0;
    const num = Math.max(1, parseInt(numInstallments, 10) || 1);

    if (amount <= 0) {
      setError('El monto total debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: enrollment, error: insertError } = await supabase
        .from('enrollments')
        .insert({
          cohort_id: parseInt(cohortId, 10),
          student_id: selectedStudent.user_id,
          status: 'pending_payment',
          agreed_price: amount,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating enrollment:', insertError);
        setError('Error al crear la matrícula');
        return;
      }

      const installments = calculateInstallmentsFromDate(
        amount,
        num,
        firstDueDate
      );
      const cohortLabel = cohortName || `Cohorte ${cohortId}`;

      const invoices = installments.map((inst) => ({
        enrollment_id: enrollment.id,
        label: `Pago ${inst.number} de ${num} - ${cohortLabel}`,
        amount: inst.amount,
        due_date: inst.dueDate,
        status: 'pending',
        meta: {
          total_payments: num,
          payment_number: inst.number,
          product_type: 'admin_enrollment',
          cohort_id: cohortId,
        },
      }));

      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoices);

      if (invoiceError) {
        console.error('Error creating invoices:', invoiceError);
      }

      resetForm();
      onClose();
      onEnrollmentCreated();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Error al crear la matrícula');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputBase =
    'w-full rounded-lg border border-border-color bg-bg-secondary px-3 py-2 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary';
  const labelBase = 'block text-sm font-medium text-text-primary mb-1';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--card-background)] rounded-xl border border-border-color p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            Añadir Estudiante a la Cohorte
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
            type="button"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!selectedStudent ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="search" className={labelBase}>
                Buscar estudiante
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nombre o email..."
                  className={`${inputBase} pl-10`}
                  autoFocus
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-secondary" />
                )}
              </div>
            </div>

            {searchResults.length > 0 && (
              <ul className="border border-border-color rounded-lg divide-y divide-border-color max-h-48 overflow-y-auto">
                {searchResults.map((p) => (
                  <li key={p.user_id}>
                    <button
                      type="button"
                      onClick={() => handleSelectStudent(p)}
                      className="w-full px-4 py-3 text-left hover:bg-bg-secondary transition-colors flex items-center gap-3"
                    >
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <UserPlus className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">
                          {p.first_name} {p.last_name}
                        </p>
                        <p className="text-sm text-text-muted">{p.email}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {searchQuery.trim() && !searching && searchResults.length === 0 && (
              <p className="text-text-muted text-sm">
                No se encontraron resultados. Intenta con otro término.
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg border border-border-color">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <UserPlus className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </p>
                <p className="text-sm text-text-muted truncate">
                  {selectedStudent.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-secondary hover:text-secondary/80"
              >
                Cambiar
              </button>
            </div>

            <div>
              <label htmlFor="agreed_price" className={labelBase}>
                Monto total acordado (COP)
              </label>
              <input
                id="agreed_price"
                type="text"
                inputMode="numeric"
                value={agreedPrice}
                onChange={(e) =>
                  setAgreedPrice(e.target.value.replace(/[^0-9,]/g, ''))
                }
                className={inputBase}
                placeholder="0"
                required
              />
            </div>

            <div>
              <label htmlFor="num_installments" className={labelBase}>
                Número de cuotas
              </label>
              <input
                id="num_installments"
                type="number"
                min={1}
                value={numInstallments}
                onChange={(e) => setNumInstallments(e.target.value)}
                className={inputBase}
              />
            </div>

            <div>
              <label htmlFor="first_due_date" className={labelBase}>
                Fecha del primer pago
              </label>
              <input
                id="first_due_date"
                type="date"
                value={firstDueDate}
                onChange={(e) => setFirstDueDate(e.target.value)}
                className={inputBase}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Añadiendo...
                  </>
                ) : (
                  'Añadir Estudiante'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
