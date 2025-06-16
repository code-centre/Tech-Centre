import React from 'react'
import { SearchIcon } from 'lucide-react'
interface UserFilterProps {
  filterText: string
  setFilterText: (text: string) => void
}
const UserFilter: React.FC<UserFilterProps> = ({
  filterText,
  setFilterText,
}) => {
  return (
    <div className="relative rounded-md shadow-sm max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-12 py-3 sm:text-sm border-gray-300 rounded-md bg-white border"
        placeholder="Buscar por nombre, email o rol..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
      {filterText && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={() => setFilterText('')}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Limpiar</span>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
export default UserFilter
