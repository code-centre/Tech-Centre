"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ArrowUpDown, Trash2Icon, CheckSquareIcon } from 'lucide-react'


type MovementType = "ingreso" | "egreso" | "transferencia" | "event" | "program"

interface Movement {
    id: string | number
    date: string
    userID: string
    amount: number
    type: MovementType
    discount: number
    total: number
    subtotal: number
    status: string
}

interface User {
    id: string
    name?: string
    lastName?: string
    email?: string
}

interface MovementsTableProps {
    movements: Movement[]
}

export const MovementsTable: React.FC<MovementsTableProps> = ({ movements }) => {
    const [sortField, setSortField] = useState<keyof Movement>("date")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [movimientos, setMovimientos] = useState<Movement[]>(movements)
    const [usersData, setUsersData] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const getUserName = (userID: string) => {
        if (!userID) return "ID no disponible"

        const user = usersData.find((user) => user.id === userID)

        if (user) {
            if (user.name && user.lastName) {
                return `${user.name} ${user.lastName}`
            }
            else if (user.name) {
                return user.name
            }
            else if (user.email) {
                return user.email
            }
        }
        return userID
    }

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === "undefined" || dateString === "null") {
            return "Fecha no disponible"
        }

        try {
            let date: Date
            if (typeof dateString === "object" && dateString !== null && 'seconds' in dateString) {
                date = new Date((dateString as any).seconds * 1000)
            } else if (dateString.includes("T") || dateString.includes("-")) {
                date = new Date(dateString)
            } else if (!isNaN(Number(dateString))) {
                date = new Date(Number(dateString))
            } else {
                date = new Date(dateString)
            }
            if (isNaN(date.getTime())) {
                return "Fecha inválida"
            }
            return date.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
        } catch (error) {
            console.error("Error formatting date:", error)
            return "Fecha inválida"
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const handleSort = (field: keyof Movement) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const sortedMovements = [...movimientos].sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1
        if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1
        return 0
    })

    const getTypeColor = (type: MovementType) => {
        switch (type) {
            case "ingreso":
                return "text-green-600 bg-green-50"
            case "egreso":
                return "text-red-600 bg-red-50"
            case "transferencia":
                return "text-blue-600 bg-blue-50"
            case "event":
                return "text-purple-600 bg-purple-50"
            default:
                return "text-gray-600 bg-gray-50"
        }
    }

    const getTypeLabel = (type: MovementType) => {
        switch (type) {
            case "ingreso":
                return "Ingreso"
            case "egreso":
                return "Egreso"
            case "program":
                return "Programa"
            case "event":
                return "Evento"
        }
    }

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const paginatedMovements = sortedMovements.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(movimientos.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Movimientos</h2>
                <p className="text-gray-600">Total: {movimientos.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    #
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("date")}
                                >
                                    <div className="flex items-center">
                                        Fecha
                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("userID")}
                                >
                                    <div className="flex items-center justify-center">
                                        Usuario
                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("status")}
                                >
                                    <div className="flex items-center">
                                        Estado de Movimiento
                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("amount")}
                                >
                                    <div className="flex items-center">
                                        Monto
                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("type")}
                                >
                                    <div className="flex items-center">
                                        Tipo
                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("discount")}
                                >
                                    <div className="flex items-center">
                                        Descuento
                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort("total")}
                                >
                                    <div className="flex items-center">
                                        Total Final
                                        <ArrowUpDown className="ml-1 h-4 w-4" />
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedMovements.map((movement, index) => (
                                <tr
                                    key={movement.id}
                                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(movement.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {getUserName(movement.userID)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{movement.status}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(movement.subtotal)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(movement.type)}`}
                                        >
                                            {getTypeLabel(movement.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(movement.discount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(movement.total)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                className="text-red-600 hover:text-red-900"
                                                // onClick={() => handleDelete(String(movement.id))}
                                            >
                                                <Trash2Icon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedMovements.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-4 text-center text-sm text-gray-500"
                                    >
                                        No se encontraron movimientos para los filtros seleccionados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                    Anterior
                </button>
                <span className="text-gray-700">
                    Página {currentPage} de {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>
        </div>
    )
}
