// src/app/admin/pagos/page.tsx
'use client';

import { useState } from 'react';
import { PayCheck } from '@/components/adminspage/PayCheck';

export default function PagosPage() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const handlePaymentSuccess = () => {
    // Aquí podrías actualizar la lista de estudiantes o mostrar un mensaje de éxito
    console.log('Pago registrado exitosamente');
    setSelectedStudent(null);
  };

  return (
    <main>
      <div className="container mx-auto px-4 py-8 mt-20">
        <h1 className="text-2xl font-bold text-center text-blueApp mb-8">Gestión de Pagos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de estudiantes */}
          <div className="lg:col-span-2">
            <div className="bg-bgCard rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Lista de Estudiantes</h2>
            </div>
          </div>

          {/* Panel de pago */}
          <div>
            {selectedStudent ? (
              <PayCheck 
                studentId={selectedStudent} 
                onPaymentSuccess={handlePaymentSuccess} 
              />
            ) : (
              <div className="bg-bgCard rounded-lg shadow p-6 text-center">
                <p className="text-white">Selecciona un estudiante para registrar un pago</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}