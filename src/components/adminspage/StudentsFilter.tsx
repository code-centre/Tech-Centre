'use client';
import { useState, useEffect } from 'react';

interface FilterParams {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
}

interface StudentsFilterProps {
  onFilter: (filters: FilterParams) => void;
}

const inputClassName = "w-full border border-border-color rounded-md shadow-sm p-2 bg-bg-secondary text-text-primary placeholder-text-muted focus:ring-secondary focus:border-secondary";
const labelClassName = "block text-sm font-medium text-text-primary mb-1";

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
    <div className="bg-[var(--card-background)] border border-border-color p-4 rounded-xl shadow-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <label htmlFor="search" className={labelClassName}>
            Buscar
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClassName}
            placeholder="Nombre o email..."
          />
        </div>

        <div>
          <label htmlFor="startDate" className={labelClassName}>
            Fecha desde
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="endDate" className={labelClassName}>
            Fecha hasta
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn-primary w-full text-sm py-2.5"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
