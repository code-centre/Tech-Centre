"use client"

import type React from "react"
import { useCollection } from "react-firebase-hooks/firestore"
import { useState, useEffect } from "react"
import { collection } from "firebase/firestore"
import { db } from "@/../firebase"

interface Movement {
  id: string
  discount: number
  subtotal: number
  total: number
  date: string
  userID: string
  type: string
  status: string
}

export const Dashboard: React.FC = () => {
  const [movementsData, setMovementsData] = useState<Movement[]>([])
  const [movements, loadingMovements, errorMovements] = useCollection(collection(db, "movements"))
  const [eventsSnapshot, loadingEvents, errorEvents] = useCollection(collection(db, "events"));
  const [eventsMap, setEventsMap] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (!eventsSnapshot) return;

    const newEventsMap = new Map();
    eventsSnapshot.docs.forEach((doc) => {
      const eventData = doc.data();
      newEventsMap.set(doc.id, {
        id: doc.id,
        name: eventData.name || "",
      });
    });
    setEventsMap(newEventsMap);
  }, [eventsSnapshot]);

  useEffect(() => {
    if (movements && !loadingMovements && !errorMovements) {
      const fetchedMovements = movements.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          date: data.date || "",
          userID: data.userID || "",
          subtotal: Number(data.subtotal) || 0,
          type: data.type || "event",
          discount: Number(data.discount) || 0,
          total: Number(data.total) || 0,
          status:
            data.status === "APPROVED"
              ? "APROBADO"
              : data.status === "PENDING"
                ? "PENDIENTE"
                : data.status || "Desconocido",
        }
      })
      setMovementsData(fetchedMovements)
    }
  }, [movements, loadingMovements, errorMovements, eventsMap])

  const approvedMovements = movementsData.filter(
    (movement) => movement.status === "APROBADO"
  );

  const pendingMovements = movementsData.filter(
    (movement) => movement.status === "PENDIENTE"
  );

  const getTotalAmount = () => {
    return approvedMovements.reduce((acc, movement) => acc + movement.subtotal, 0)
  }

  const getTotalDiscounts = () => {
    return approvedMovements.reduce((acc, movement) => acc + movement.discount, 0)
  }

  const getNetTotal = () => {
    return approvedMovements.reduce((acc, movement) => acc + movement.total, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loadingMovements) {
    return <div className="p-4">Cargando datos...</div>
  }

  if (errorMovements) {
    return <div className="p-4 text-red-500">Error al cargar datos: {errorMovements.message}</div>
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Estadísticas del Periodo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Movimientos */}
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
          <h3 className="text-blue-600 text-sm font-medium mb-2">Total Movimientos</h3>
          <div className="flex justify-between">
            <div className="text-center">
              <p className="text-blue-600 text-xs font-medium">Movimientos aprobados</p>
              <p className="text-blue-800 text-xl font-bold">{approvedMovements.length}</p>
            </div>
            <div className="text-center">
              <p className="text-blue-600 text-xs font-medium">Movimientos pendientes</p>
              <p className="text-blue-800 text-xl font-bold">{pendingMovements.length}</p>
            </div>
          </div>
          <div className="h-2 bg-blue-100 rounded-full mt-3">
            <div className="h-full bg-blue-500 rounded-full w-full"></div>
          </div>
          <p className="text-blue-600 text-xs mt-2">{movementsData.length} registrados</p>
        </div>
        {/* Total de Montos */}
        <div className="bg-green-50 rounded-lg p-4 shadow-sm">
          <h3 className="text-green-600 text-sm font-medium mb-2">Ingresos Totales</h3>
          <p className="text-green-800 text-2xl font-bold">{formatCurrency(getTotalAmount())}</p>
          <div className="h-2 bg-green-100 rounded-full mt-3">
            <div className="h-full bg-green-500 rounded-full w-full"></div>
          </div>
          <p className="text-green-600 text-xs mt-2">{movementsData.length} movimientos registrados</p>
        </div>
        {/* Total de Descuentos */}
        <div className="bg-purple-50 rounded-lg p-4 shadow-sm">
          <h3 className="text-purple-600 text-sm font-medium mb-2">Descuentos Aplicados</h3>
          <p className="text-purple-800 text-2xl font-bold">{formatCurrency(getTotalDiscounts())}</p>
          <div className="h-2 bg-purple-100 rounded-full mt-3">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{
                width: `${getTotalAmount() > 0 ? (getTotalDiscounts() / getTotalAmount()) * 100 : 0}%`,
              }}
            ></div>
          </div>
          <p className="text-purple-600 text-xs mt-2">
            {getTotalAmount() > 0
              ? `${Math.round((getTotalDiscounts() / getTotalAmount()) * 100)}% del total`
              : "0% del total"}
          </p>
        </div>
        {/* Total Neto */}
        <div className="bg-amber-50 rounded-lg p-4 shadow-sm">
          <h3 className="text-amber-600 text-sm font-medium mb-2">Total Neto</h3>
          <p className="text-amber-800 text-2xl font-bold">{formatCurrency(getNetTotal())}</p>
          <div className="h-2 bg-amber-100 rounded-full mt-3">
            <div className="h-full bg-amber-500 rounded-full w-full"></div>
          </div>
          <p className="text-amber-600 text-xs mt-2">después de descuentos</p>
        </div>
      </div>
    </div>
  )
}
