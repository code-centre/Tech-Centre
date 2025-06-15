import React, { useState } from 'react'
import { SearchIcon, FilterIcon, CalendarIcon } from 'lucide-react'

interface FilterBarProps {
  onFiltersChange: (filters: {
    dateRange: { start: string; end: string };
    selectedType: string | null;
    searchTerm: string;
  }) => void;
  initialFilters: {
    dateRange: { start: string; end: string };
    selectedType: string | null;
    searchTerm: string;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onFiltersChange,
  initialFilters,
}) => {
  const [filters, setFilters] = useState(initialFilters);

  const handleDateChange = (start: string, end: string) => {
    const updatedFilters = { ...filters, dateRange: { start, end } };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleTypeChange = (type: string | null) => {
    const updatedFilters = { ...filters, selectedType: type };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleSearch = (term: string) => {
    const updatedFilters = { ...filters, searchTerm: term };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro de fecha */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rango de fechas
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateChange(e.target.value, filters.dateRange.end)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateChange(filters.dateRange.start, e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        {/* Filtro de tipo */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de movimiento
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filters.selectedType || ''}
              onChange={(e) =>
                handleTypeChange(e.target.value === '' ? null : e.target.value)
              }
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        </div>
        {/* Campo de búsqueda */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por usuario, fecha o tipo..."
              value={filters.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
