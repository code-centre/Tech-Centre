'use client';

import { useState } from 'react';

type Status = 'active' | 'inactive' | 'all';

interface Course {
  id: string;
  name: string;
}

interface StudentsFilterProps {
  onFilter: (filters: {
    searchTerm?: string;
    status?: 'active' | 'inactive';
    startDate?: string;
    endDate?: string;
    courseId?: string;
  }) => void;
}

export function StudentsFilter({ onFilter }: StudentsFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Datos de ejemplo para los cursos - en una aplicación real, esto vendría de una API
  const courses: Course[] = [
    { id: '1', name: 'Curso 1' },
    { id: '2', name: 'Curso 2' },
    { id: '3', name: 'Curso 3' },
    { id: '4', name: 'Curso 4' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      searchTerm: searchTerm || undefined,
      status: status === 'all' ? undefined : status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      courseId: selectedCourse === 'all' ? undefined : selectedCourse,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatus('all');
    setStartDate('');
    setEndDate('');
    setSelectedCourse('all');
    onFilter({});
  };

  return (
    <div className="container mx-auto px-4 py-4 mt-28">
      <h1 className="text-2xl font-bold text-center text-blueApp mb-6">Gestión de Estudiantes</h1>
      <form onSubmit={handleSubmit} className="bg-bgCard rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Búsqueda por nombre o email */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-white mb-1">
              Buscar estudiante
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre o email..."
              className="w-full px-3 py-2 border border-blueApp bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-white mb-1">
              Estado
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full px-3 py-2 border border-blueApp bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          {/* Filtro por curso */}
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-white mb-1">
              Curso
            </label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-blueApp bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los cursos</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por fecha */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Rango de fechas
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-blueApp bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-blueApp bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-background rounded-md shadow-sm text-sm font-medium text-white bg-red-400 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Limpiar filtros
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-background rounded-md shadow-sm text-sm font-medium text-white bg-blueApp hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Aplicar filtros
          </button>
        </div>
      </form>
    </div>
  );
}