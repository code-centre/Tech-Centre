'use client';

import { useState } from 'react';
import { StudentsFilter } from '@/components/adminspage/StudentsFilter';
import { StudentsList } from '@/components/adminspage/StudentsList';

export default function EstudiantesPage() {
  const [filters, setFilters] = useState({});

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
    // Aquí puedes hacer una llamada a la API con los filtros
    console.log('Aplicando filtros:', newFilters);
  };

  return (
    <main>
      <StudentsFilter onFilter={handleFilter} />
      <div className="container mx-auto px-4 py-4">
        <StudentsList filters={filters} />
      </div>
    </main>
  );
}