'use client';
import { useState, useEffect } from 'react';

// Actualizamos la interfaz eliminando 'status'
interface FilterParams {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

interface StudentsFilterProps {
  onFilter: (filters: FilterParams) => void;
}

export function StudentsFilter({ onFilter }: StudentsFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: FilterParams = {};
      
      if (searchTerm) filters.searchTerm = searchTerm;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      onFilter(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, startDate, endDate, onFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  return (
    // CAMBIO: bg-white -> bg-black, y añadí text-white para herencia general
    <div className="bg-black p-4 rounded-lg shadow mb-6 mt-28">
      {/* CAMBIO: lg:grid-cols-5 -> lg:grid-cols-4 porque quitamos una columna */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Búsqueda */}
        <div className="lg:col-span-1">
          {/* CAMBIO: text-gray-700 -> text-gray-200 para contraste con fondo negro */}
          <label htmlFor="search" className="block text-sm font-medium text-gray-200 mb-1">
            Buscar
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-900 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nombre o email..."
          />
        </div>

        {/* (El campo Rol fue eliminado aquí) */}

        {/* 2. Fecha desde */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-200 mb-1">
            Fecha desde
          </label>
          {/* He oscurecido también los inputs (bg-gray-900) para que combinen mejor con el fondo negro, pero manteniendo legibilidad */}
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-900 text-white focus:ring-blue-500 focus:border-blue-500 color-scheme-dark"
          />
        </div>

        {/* 3. Fecha hasta */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-200 mb-1">
            Fecha hasta
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-900 text-white focus:ring-blue-500 focus:border-blue-500 color-scheme-dark"
          />
        </div>

        {/* 4. Botón Limpiar */}
        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>

      </div>
    </div>
  );
}