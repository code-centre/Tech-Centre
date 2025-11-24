// src/app/admin/pagos/page.tsx
'use client';

import { useState } from 'react';
import { PayCheck } from '@/components/adminspage/PayCheck';
import { EnrollmentList } from '@/components/adminspage/EnrollmentList';

export default function PagosPage() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');

  const handleStudentSelect = (studentId: string, studentName: string) => {
    setSelectedStudent(studentId);
    setSelectedStudentName(studentName);
  };

  const handlePaymentSuccess = () => {
    // Aquí podrías actualizar la lista de estudiantes o mostrar un mensaje de éxito
    console.log('Pago registrado exitosamente');
    setSelectedStudent(null);
    setSelectedStudentName('');
    // En una aplicación real, aquí podrías actualizar la lista de estudiantes
  };

  return (
    <main>
      <div className="container mx-auto px-4 py-8 mt-20">
        <h1 className="text-2xl font-bold text-center text-blueApp mb-8">Gestión de Pagos</h1>
        
        <div className="flex flex-col gap-6 ">
          {/* Lista de estudiantes */}
          <div className="">
            <EnrollmentList />
          </div>

          {/* Panel de pago */}
          {/* <div className="border-2 border-white">
            <PayCheck />
              <div className="bg-bgCard rounded-lg shadow p-6 text-center h-full flex items-center justify-center">
                <div>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
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
                  <h3 className="mt-2 text-sm font-medium text-white">Selecciona un estudiante</h3>
                  <p className="mt-1 text-sm text-gray-300">
                    Haz clic en "Registrar Pago" junto al nombre de un estudiante para comenzar.
                  </p>
                </div>
              </div>
            
          </div> */}
        </div>
      </div>
    </main>
  );
}