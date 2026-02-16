// src/app/admin/pagos/page.tsx
'use client';

import { useState } from 'react';
import { EnrollmentList, Enrollment } from '@/components/adminspage/EnrollmentList';
import { Invoices } from '@/components/adminspage/Invoices';

export default function PagosPage() {
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  const handleEnrollmentSelect = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
  };


  return (
    <main className="container mx-auto" aria-label="Gestión de pagos">
      <h1 className="text-2xl font-bold text-center text-secondary mb-8">Gestión de Pagos</h1>
      
      <div className="flex flex-col gap-6">
        <section aria-labelledby="enrollments-heading">
          <h2 id="enrollments-heading" className="sr-only">Lista de inscripciones</h2>
          <EnrollmentList onEnrollmentSelect={handleEnrollmentSelect} />
        </section>

        <section className="border-2 border-border-color rounded-lg p-6" aria-labelledby="payment-panel-heading">
          <h2 id="payment-panel-heading" className="sr-only">Panel de pago y facturas</h2>
          <div className="bg-bg-card rounded-lg shadow p-6 text-center h-full flex items-center justify-center">
            <div>
              <svg
                className="mx-auto h-12 w-12 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-text-primary">Selecciona un estudiante</h3>
              <p className="mt-1 text-sm text-text-muted">
                Haz clic en &quot;Registrar Pago&quot; junto al nombre de un estudiante para comenzar.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Invoices enrollment={selectedEnrollment} />
          </div>
        </section>
      </div>
    </main>
  );
}