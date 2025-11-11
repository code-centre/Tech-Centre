'use client';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

type Status = 'student' | 'instructor' | 'admin' | 'lead' | 'all';

interface StudentsFilterProps {
  onFilter: (filters: {
    searchTerm?: string;
    status?: 'student' | 'instructor' | 'admin' | 'lead';
    startDate?: string;
    endDate?: string;
  }) => void;
}

export function StudentsFilter({ onFilter }: StudentsFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<Status>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Aplicar filtros con un pequeño retraso para evitar múltiples llamadas
    const timer = setTimeout(() => {
      const filters: any = {};
      
      if (searchTerm) filters.searchTerm = searchTerm;
      if (status !== 'all') filters.status = status;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      onFilter(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, status, startDate, endDate, onFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatus('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 mt-28 flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Búsqueda por nombre o email */}
        <div className="lg:col-span-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar por nombre o email
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nombre o email..."
          />
        </div>

        {/* Filtro por rol */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Rol
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los roles</option>
            <option value="student">Estudiante</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Administrador</option>
            <option value="lead">Lead</option>
          </select>
        </div>

        {/* Filtro por fecha de inicio */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha desde
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtro por fecha de fin */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha hasta
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}