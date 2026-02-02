import { SearchIcon } from "lucide-react";

interface SearchBarProps {
    onNameSearch?: (value: string) => void;
    onProductSearch?: (value: string) => void;
    setIsCreating: (value: boolean) => void;
}

export default function SearchBar({ onNameSearch, onProductSearch, setIsCreating }: SearchBarProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl p-4 lg:pl-0">
                <div className="flex-1">
                    <label htmlFor="nameSearch" className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar por nombre
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            id="nameSearch"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Ingrese un nombre..."
                            onChange={(e) => onNameSearch?.(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <label htmlFor="productSearch" className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar por producto
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            id="productSearch"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Ingrese un producto..."
                            onChange={(e) => onProductSearch?.(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <button onClick={() => setIsCreating(true)} className="bg-secondary hover:bg-secondary/80 text-white py-2 px-4 rounded-md">Crear Código</button>
        </div>
    )
}