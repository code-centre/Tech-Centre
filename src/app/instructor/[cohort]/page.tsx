// src/app/instructor/[cohort]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useUser } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import SilaboInstructor from '@/components/instructor/SilaboInstructor';
import CohortListInstructor from '@/components/instructor/CohortListInstructor';

export default function CohortPage() {
  const params = useParams();
  const { user, loading } = useUser();
  const [cohortName, setCohortName] = useState('');

  // Decodificar el nombre del cohorte de la URL
  useEffect(() => {
    if (params.cohort) {
      setCohortName(decodeURIComponent(params.cohort as string));
    }
  }, [params.cohort]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !['admin', 'instructor'].includes(user.role)) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>No tienes permiso para ver esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-20">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {cohortName}
        </h2>
        <p className="text-gray-600 mb-4">
          Bienvenido al panel de administración del cohorte.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="font-medium">Información del cohorte:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Nombre: {cohortName}</li>
            {/* <li>Instructor: {user.name || user.email}</li> */}
          </ul>
        </div>
        <CohortListInstructor 
          cohortName={cohortName}      
        />
        <SilaboInstructor />
        
      </div>
    </div>
  );
}