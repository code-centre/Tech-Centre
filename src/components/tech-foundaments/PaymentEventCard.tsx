"use client"

import { useState } from "react"
import { doc } from "firebase/firestore"
import { useDocument } from "react-firebase-hooks/firestore"
import { db } from "../../../firebase"
import PricingCardCreationModal from "./PricingCardCreationModal"
import PricingCard from "./PricingCard"
import { PlusCircle } from "lucide-react"

interface Ticket {
  type: string
  ticketName: string
  title: string
  description: string
  price: number
  name: string
  benefits: string[]
}

interface PaymentEventCardProps {
  eventId: string
  saveTicketData?: (updatedTicket: Ticket, oldTicket?: Ticket) => Promise<{success: boolean, error?: string}>
  deleteTicketData?: (ticketToDelete: Ticket) => Promise<{success: boolean, error?: string}>
}

export default function PaymentEventCard({ eventId, saveTicketData, deleteTicketData }: PaymentEventCardProps) {
  const eventRef = doc(db, "events", eventId)
  const [eventDoc, loading, error] = useDocument(eventRef)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  if (loading) {
    return <div className="p-6 text-center text-white bg-zinc-800 rounded-xl">Cargando tickets...</div>
  }

  if (error) {
    return <div className="p-6 text-center text-red-500 bg-zinc-800 rounded-xl">Error al obtener los tickets: {error.message}</div>
  }

  const eventData = eventDoc?.data()
  const tickets = eventData?.tickets || []

  const organizeTickets = (tickets: Ticket[]) => {
    const premiumTickets = tickets.filter((ticket) => ticket.type === "premium")
    const regularTickets = tickets.filter((ticket) => ticket.type !== "premium")

    if (premiumTickets.length === 0) {
      return tickets
    }

    // Calculate how many regular tickets should be on each side
    const leftCount = Math.floor(regularTickets.length / 2)
    const rightCount = regularTickets.length - leftCount

    const leftSide = regularTickets.slice(0, leftCount)
    const rightSide = regularTickets.slice(leftCount, leftCount + rightCount)

    return [...leftSide, ...premiumTickets, ...rightSide]
  }

  const organizedTickets = organizeTickets(tickets)

  const handleEdit = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsCreating(false)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedTicket(null)
    setIsCreating(true)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedTicket(null)
    setIsCreating(false)
    setIsModalOpen(false)
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Gestión de Tickets</h2>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blueApp hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          <PlusCircle size={20} />
          <span>Crear Nuevo Ticket</span>
        </button>
      </div>
      
      <div className="w-full">
        {tickets.length === 0 ? (
          <div className="p-6 text-center text-gray-400 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
            No hay tickets agregados. Crea un ticket con el botón de arriba.
          </div>
        ) : (
          <div className="gap-6">
            {organizedTickets.map((ticket: Ticket, index: number) => (
              <PricingCard
                key={index}
                index={index}
                eventId={eventId}
                type={ticket.type}
                title={ticket.title}
                ticketName={ticket.ticketName}
                description={ticket.description}
                price={ticket.price}
                features={ticket.benefits || []}
                onClick={() => handleEdit(ticket)}
              />
            ))}
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <PricingCardCreationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          eventId={eventId}
          ticket={isCreating ? null : selectedTicket}
          saveTicketData={saveTicketData}
          deleteTicketData={deleteTicketData}
        />
      )}
    </div>
  )
}

