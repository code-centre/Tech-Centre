"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { StaffForm } from "./StaffForm"
import { XIcon } from "lucide-react"
import { useCollection } from "react-firebase-hooks/firestore"
import { collection, where, query, doc, setDoc, getDoc, getDocs, deleteDoc } from "firebase/firestore"
import { db } from '../../../firebase'

interface StaffModalProps {
  eventId: string 
  isOpen: boolean
  onClose: () => void
  onAddStaff: (staff: any) => void
  onEditStaff: (staff: Staff) => void
  existingStaff: Staff[]
}

interface EventFCA {
  id: string
  title: string
  date: string
}

interface User {
  id: string
  name: string
  lastName: string
  email?: string
}

interface Staff {
  id: string
  firstName: string
  lastName: string
  email?: string
  userId?: string
  eventID: string
  assignedTo: string
  rol?: string
  createdAt?: string
}

export function StaffModal({
  eventId,
  isOpen,
  onClose,
  onAddStaff,
}: StaffModalProps) {
  const [events, setEvents] = useState<EventFCA[]>([])
  const [mode, setMode] = useState<"create" | "select">("create")
  const [users, setUsers] = useState<User[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const [eventsData, loading, error] = useCollection(
    query(collection(db, "events"), where("type", "in", ["hackatón", "meetup", "conferencia"])),
  )

  const [usersData, loadingUsers, errorUsers] = useCollection(
    query(collection(db, "users"), where("rol", "==", "admin")),
  )

  useEffect(() => {
    if (eventsData) {
      const eventsList = eventsData.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EventFCA[]
      setEvents(eventsList)
    }
    if (usersData) {
      const usersList = usersData.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]
      setUsers(usersList)
    }
  }, [eventsData, usersData])

  useEffect(() => {
    if (isOpen) {
      setMode("create")
      setSelectedStaffId("")
    }
  }, [isOpen])

  const handleSelectStaff = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStaffId(e.target.value)
  }

  const selectedStaff = users.find((u) => u.id === selectedStaffId)

  const handleSubmit = async (values: Omit<Staff, "id">) => {
    try {
      setIsLoading(true)

      if (mode === "select" && selectedStaffId) {
        const userDocRef = doc(db, "users", selectedStaffId)
        const userDoc = await getDoc(userDocRef)

        if (!userDoc.exists()) {
          console.error("No se encontró el usuario en la base de datos")
          alert("No se encontró el usuario en la base de datos")
          setIsLoading(false)
          return
        }

        const userData = userDoc.data()
        const staffDocRef = doc(collection(db, "eventStaff"))

        const eventDocRef = doc(db, "events", eventId)
        const eventDoc = await getDoc(eventDocRef)
        const eventTitle = eventDoc.exists() ? eventDoc.data().title : "Unknown Event"

        const staffData = {
          firstName: userData.name || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          userId: selectedStaffId,
          eventID: eventId,
          assignedTo: eventTitle,
          rol: "STAFF",
          createdAt: new Date().toISOString(),
        }

        await setDoc(staffDocRef, staffData)

        alert("Staff asignado correctamente")
        onAddStaff(staffData)
        onClose()
      }  else {
        const newDocRef = doc(collection(db, "eventStaff"))

        const eventDocRef = doc(db, "events", eventId)
        const eventDoc = await getDoc(eventDocRef)
        const eventTitle = eventDoc.exists() ? eventDoc.data().title : "Unknown Event"

        await setDoc(newDocRef, {
          ...values,
          eventID: eventId,
          assignedTo: eventTitle,
          rol: "STAFF",
          createdAt: new Date().toISOString(),
        })
        onAddStaff(values)
      }

      const now = new Date()
      const colombiaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }))

      const attendeeDocs = await getDocs(collection(db, "eventStaff"))
      attendeeDocs.forEach(async (doc) => {
        const attendeeData = doc.data()

        if (attendeeData.rol === "STAFF") {
          const activeEventIDs = (attendeeData.eventID || []).filter((eventId: string) => {
            const event = events.find((e) => e.id === eventId)
            return event && new Date(event.date) > colombiaTime
          })

          if (activeEventIDs.length > 0) {
            await setDoc(
              doc.ref,
              {
                eventID: activeEventIDs,
                assignedTo: activeEventIDs.map((id: string) => events.find((e) => e.id === id)?.title).join(", "),
                updatedAt: new Date().toISOString(),
              },
              { merge: true },
            )
          } else {
            await deleteDoc(doc.ref)
          }
        }
      })
    } catch (error) {
      console.error("Error al guardar el staff:", error)
      alert("Error al guardar")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon size={20} />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>
          <div className="p-4 border-b">
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-md ${mode === "create" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                onClick={() => setMode("create")}
              >
                Crear nuevo miembro
              </button>
              <button
                className={`px-4 py-2 rounded-md ${mode === "select" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                onClick={() => setMode("select")}
              >
                Selecciona un miembro del equipo FCA
              </button>
            </div>
          </div>
        {mode === "select" ? (
          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona un miembro del equipo FCA</label>
            <select
              value={selectedStaffId}
              onChange={handleSelectStaff}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              disabled={isLoading}
            >
              <option value="">-- Selecciona un miembro del personal --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.lastName}
                </option>
              ))}
            </select>

            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-700 mb-2">Información de asignación:</h3>
              <p>
                <span className="font-medium">Evento:</span>{" "}
                {events.find((e) => e.id === eventId)?.title || "Evento actual"}
              </p>
              {selectedStaff && (
                <p>
                  <span className="font-medium">Miembro:</span> {selectedStaff.name} {selectedStaff.lastName}
                </p>
              )}
            </div>

            <button
              onClick={() =>
                selectedStaff &&
                handleSubmit({
                  firstName: selectedStaff.name,
                  lastName: selectedStaff.lastName,
                  eventID: eventId,
                  assignedTo: events.find((e) => e.id === eventId)?.title || "Unknown Event",
                })
              }
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full flex justify-center items-center"
              disabled={!selectedStaffId || isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Asignando...
                </>
              ) : (
                "Asignar Miembro"
              )}
            </button>
          </div>
        ) : (
          <StaffForm
            onSubmit={(values) => {
              handleSubmit({
                ...values,
                eventID: eventId,
                assignedTo: events.find((e) => e.id === eventId)?.title || "Evento actual",
              });
            }}
            submitLabel={'Guardar'}
            isLoading={isLoading}
            hideEventSelection={true} // Add this prop to hide event selection
            eventName={events.find((e) => e.id === eventId)?.title || "Evento actual"} // Pass event name
          />
        )}
      </div>
    </div>
  )
}
