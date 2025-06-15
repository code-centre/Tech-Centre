// import React, { useState } from 'react'
// import { Dashboard } from './movementsSection/Dashboard'
// import { MovementsTable } from './movementsSection/MovementsTable'
// import { DateRangePicker } from './movementsSection/DateRangePicker'
// import { FilterBar } from './movementsSection/FilterBar'
// import { CalendarIcon } from 'lucide-react'
// import { useCollection } from 'react-firebase-hooks/firestore'
// import { collection } from 'firebase/firestore'
// import { db } from '@/firebase'

// type MovementType = 'ingreso' | 'egreso' | 'transferencia'

// interface Movement {
//   id: string | number
//   date: string
//   user: string
//   amount: number
//   type: MovementType
//   discount: number
//   total: number
// }

// export default function MovementsSection() {
//   const [dateRange, setDateRange] = useState({
//     start: '2024-01-01',
//     end: '2024-05-31',
//   })
//   const [selectedType, setSelectedType] = useState<string | null>(null)
//   const [searchTerm, setSearchTerm] = useState('')

//   const [movements, loading, error] = useCollection(
//     collection(db, 'movements'))
    
//     const movementesData = movements?.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as any[] || [];

//   // Ajuste en el filtrado de movimientos para asegurar que los filtros se apliquen correctamente
//   const filteredMovements = movementesData.filter((movement: Movement) => {
//     // Asegurarse de que las fechas estén en el formato correcto
//     const movementDate = new Date(movement.date);
//     const startDate = new Date(dateRange.start);
//     const endDate = new Date(dateRange.end);

//     // Validar que las fechas sean válidas antes de comparar
//     const dateInRange = !isNaN(movementDate.getTime()) &&
//       movementDate >= startDate &&
//       movementDate <= endDate;

//     const searchMatch = searchTerm
//       ? (movement.user?.toLowerCase().includes(searchTerm.toLowerCase()))
//       : true;
//     return searchMatch;
//   });

//   const totalMovements = filteredMovements.length
//   const totalAmount = filteredMovements.reduce(
//     (sum, movement) => sum + movement.amount,
//     0,
//   )
//   const totalDiscounts = filteredMovements.reduce(
//     (sum, movement) => sum + movement.discount,
//     0,
//   )
//   const netTotal = totalAmount - totalDiscounts
//   const handleDateChange = (start: string, end: string) => {
//     setDateRange({
//       start,
//       end,
//     })
//   }
//   const handleTypeChange = (type: string | null) => {
//     setSelectedType(type)
//   }
//   const handleSearch = (term: string) => {
//     setSearchTerm(term)
//   }
//   return (
//     <div className="w-full bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">
//           Movimientos
//         </h1>
//         <div className="mb-6">
//           <FilterBar
//             onDateChange={handleDateChange}
//             onTypeChange={handleTypeChange}
//             onSearch={handleSearch}
//             dateRange={dateRange}
//             selectedType={selectedType}
//             searchTerm={searchTerm}
//           />
//         </div>
//         <Dashboard
//           totalMovements={totalMovements}
//           totalAmount={totalAmount}
//           totalDiscounts={totalDiscounts}
//           netTotal={netTotal}
//         />
//         <MovementsTable movements={filteredMovements} />
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { collection } from "firebase/firestore"
import { useCollection } from "react-firebase-hooks/firestore"
import { db } from '../../../firebase'
import { FilterBar } from "./movementsSection/FilterBar"
import { MovementsTable } from "./movementsSection/MovementsTable"
import { Dashboard } from "./movementsSection/Dashboard"

export default function MovementsSection() {
  // Estados para los filtros - Inicializa con fechas válidas para este mes
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0].substring(0, 7) + "-01", // Primer día del mes actual
    end: new Date().toISOString().split('T')[0], // Hoy
  })
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMovements, setFilteredMovements] = useState<any[]>([])

  // Obtener datos de Firestore
  const [movementsSnapshot, loadingMovements, errorMovements] = useCollection(collection(db, "movements"))
  const [usersSnapshot, loadingUsers, errorUsers] = useCollection(collection(db, "users"))

  // Crear un mapa de usuarios para búsqueda eficiente
  const [usersMap, setUsersMap] = useState<Map<string, any>>(new Map())

  // Procesar los datos de usuarios cuando cambia el snapshot
  useEffect(() => {
    if (!usersSnapshot) return

    const newUsersMap = new Map()
    usersSnapshot.docs.forEach((doc) => {
      const userData = doc.data()
      newUsersMap.set(doc.id, {
        id: doc.id,
        name: userData.name || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        fullName: `${userData.name || ""} ${userData.lastName || ""}`.toLowerCase(),
      })
    })
    setUsersMap(newUsersMap)
  }, [usersSnapshot])

  // Procesar y filtrar los movimientos cuando cambian los snapshots o los filtros
  useEffect(() => {
    if (!movementsSnapshot) return

    const movements = movementsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Aplicar filtros
    const filtered = movements.filter((movement: any) => {
      // Filtro por fecha
      let passesDateFilter = true
      if (dateRange.start && dateRange.end) {
        try {
          const movementDate = new Date(movement.date)
          const startDate = new Date(dateRange.start)
          const endDate = new Date(dateRange.end)
          
          // Ajustar la fecha final para incluir todo el día
          endDate.setHours(23, 59, 59, 999)
          
          if (!isNaN(movementDate.getTime())) {
            passesDateFilter = movementDate >= startDate && movementDate <= endDate
          }
        } catch (error) {
          console.error("Error al procesar fecha:", error)
          passesDateFilter = false
        }
      }

      // Filtro por tipo
      const passesTypeFilter = !selectedType || movement.type === selectedType

      // Filtro por término de búsqueda
      let passesSearchFilter = true
      if (searchTerm && searchTerm.trim() !== "") {
        const searchLower = searchTerm.toLowerCase()
        
        // Buscar en datos de usuario
        let userMatches = false
        if (movement.userID && usersMap.has(movement.userID)) {
          const user = usersMap.get(movement.userID)
          userMatches = 
            user.fullName.includes(searchLower) || 
            (user.email && user.email.toLowerCase().includes(searchLower))
        }
        
        // Buscar en otros campos del movimiento
        const otherFieldsMatch = 
          (movement.description && movement.description.toLowerCase().includes(searchLower)) ||
          (movement.status && movement.status.toLowerCase().includes(searchLower)) ||
          (movement.type && movement.type.toLowerCase().includes(searchLower))
        
        passesSearchFilter = userMatches || otherFieldsMatch
      }

      return passesDateFilter && passesTypeFilter && passesSearchFilter
    })

    setFilteredMovements(filtered)
  }, [movementsSnapshot, usersMap, dateRange, selectedType, searchTerm])

  // Calcular estadísticas para el Dashboard
  const totalMovements = filteredMovements.length
  const totalAmount = filteredMovements.reduce((sum, movement) => sum + (movement.amount || movement.subtotal || 0), 0)
  const totalDiscounts = filteredMovements.reduce((sum, movement) => sum + (movement.discount || 0), 0)
  const netTotal = filteredMovements.reduce((sum, movement) => sum + (movement.total || 0), 0)

  // Manejadores de eventos para los filtros
  const handleDateChange = (start: string, end: string) => {
    setDateRange({ start, end })
  }

  const handleTypeChange = (type: string | null) => {
    setSelectedType(type)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  if (loadingMovements || loadingUsers) {
    return <div className="text-center py-8">Cargando datos...</div>
  }

  if (errorMovements || errorUsers) {
    return <div className="text-center py-8 text-red-500">Error al cargar los datos: {errorMovements?.message || errorUsers?.message}</div>
  }

  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Movimientos</h1>
        <Dashboard/>

        <MovementsTable movements={filteredMovements} />
      </div>
    </div>
  )
}