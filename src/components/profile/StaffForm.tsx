"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { db } from '../../../firebase'
import { collection, query, where } from "firebase/firestore"
import { useCollection } from "react-firebase-hooks/firestore"

interface Staff {
  id: string
  firstName: string
  lastName: string
  assignedTo: string
}

interface EventFCA {
  id: string
  title: string
  date: string
}

interface StaffFormProps {
  onSubmit: (values: Omit<Staff, "id">) => void
  submitLabel: string
  isLoading?: boolean
  hideEventSelection?: boolean
  eventName?: string
}

export function StaffForm({
  onSubmit,
  submitLabel,
  isLoading,
  hideEventSelection,
  eventName,
}: StaffFormProps) {
  const [events, setEvents] = useState<EventFCA[]>([])
  const [values, setValues] = useState<Omit<Staff, "id">>({
    firstName: "",
    lastName: "",
    assignedTo: "",
  })

  const [eventsData, loading, error] = useCollection(
    query(collection(db, "events"), where("type", "in", ["hackatón", "meetup", "conferencia"])),
  )

  useEffect(() => {
    if (eventsData) {
      const eventsList = eventsData.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EventFCA[]
      setEvents(eventsList)
    }
  }, [eventsData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="mb-4">
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
          disabled={isLoading}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
          Apellido
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
          disabled={isLoading}
        />
      </div>

      {hideEventSelection ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Evento</label>
          <div className="p-2 bg-gray-50 border border-gray-300 rounded-md">{eventName}</div>
          <input type="hidden" name="assignedTo" />
        </div>
      ) : (
        <div className="mb-4">
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
            Evento Asignado
          </label>
          <select
            id="assignedTo"
            name="assignedTo"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
            disabled={isLoading}
          >
            <option value="">-- Selecciona un evento --</option>
            {events
              .filter((event) => {
                const eventDate = new Date(event.date)
                const now = new Date()
                return eventDate > now
              })
              .map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex justify-center items-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Guardando...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  )
}
