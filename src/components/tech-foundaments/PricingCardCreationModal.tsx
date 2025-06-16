"use client"

import type React from "react"

import { XIcon, Trash2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { db } from "../../../firebase"
import { doc, updateDoc, arrayUnion, arrayRemove, Timestamp } from "firebase/firestore"
import { useDocument } from "react-firebase-hooks/firestore"

interface PricingCardCreationModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  ticket?: Ticket | null
  saveTicketData?: (updatedTicket: Ticket, oldTicket?: Ticket) => Promise<{success: boolean, error?: string}>
  deleteTicketData?: (ticketToDelete: Ticket) => Promise<{success: boolean, error?: string}>
}

interface Ticket {
  type: string
  title: string
  ticketName: string
  description: string
  price: number
  name: string
  benefits: string[]
}

export default function PricingCardCreationModal({ isOpen, onClose, eventId, ticket, saveTicketData, deleteTicketData }: PricingCardCreationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPaid, setIsPaid] = useState(false)
  const [benefits, setBenefits] = useState<string[]>([])
  const [newBenefit, setNewBenefit] = useState("")
  const [price, setPrice] = useState(0)
  const [type, setType] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [ticketName, setTicketName] = useState("")

  const eventRef = doc(db, "events", eventId)
  const [eventDoc, loading, eventError] = useDocument(eventRef)
  const ticketNameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ticket) {
      setType(ticket.type)
      setTitle(ticket.title || "")
      setDescription(ticket.description)
      setTicketName(ticket.ticketName || ticket.name || "")
      setBenefits(ticket.benefits)
      setPrice(ticket.price)
      setIsPaid(ticket.price > 0)
    }
  }, [ticket])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const ticketData = {
        type,
        title: title || "",
        ticketName: ticketName || "", 
        description,
        benefits,
        price: isPaid ? price : 0,
        name: ticketName || "", 
        createdAt: Timestamp.now(),
      }

      let result;
      if (saveTicketData) {
        result = await saveTicketData(ticketData, ticket || undefined);
      } else {
        if (ticket) {
          await updateDoc(eventRef, {
            tickets: arrayRemove(ticket),
          });
        }
        await updateDoc(eventRef, {
          tickets: arrayUnion(ticketData),
        });
        result = { success: true };
      }

      if (result.success) {
        setIsPaid(false);
        setType("");
        setTitle("");
        setDescription("");
        setTicketName("");
        setBenefits([]);
        setPrice(0);
        onClose();
      } else {
        setError(result.error || "Hubo un error al guardar el ticket.");
      }
    } catch (error) {
      console.error("Error al crear/actualizar el ticket:", error);
      setError("Hubo un error al procesar el ticket.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!ticket) return;
    setIsLoading(true);
    try {
      let result;
      if (deleteTicketData) {
        result = await deleteTicketData(ticket);
      } else {
        await updateDoc(eventRef, {
          tickets: arrayRemove(ticket),
        });
        result = { success: true };
      }

      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Hubo un error al eliminar el ticket.");
      }
    } catch (error) {
      console.error("Error al eliminar el ticket:", error);
      setError("Hubo un error al eliminar el ticket.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value
    setType(selectedType)
    setIsPaid(selectedType === "premium" || selectedType === "general" || selectedType === "virtual-paid")
  }

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit])
      setNewBenefit("")
    }
  }

  const handleTicketNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketName(e.target.value)
  }

  const clearTicketName = () => {
    setTicketName("")
    if (ticketNameInputRef.current) {
      ticketNameInputRef.current.focus()
    }
  }

  const handleRemoveBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index))
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-20 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-zinc-900 to-black rounded-xl p-6 md:p-8 max-w-md w-full relative border border-zinc-800/30 shadow-2xl">
        {/* Efecto decorativo */}
        <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-blueApp/5 blur-3xl"></div>
        <div className="absolute -left-10 bottom-10 w-24 h-24 rounded-full bg-blueApp/10 blur-2xl"></div>
        
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-sm flex items-center justify-center rounded-xl z-10 border border-zinc-800/50">
            <div className="text-center">
              <svg
                className="animate-spin h-10 w-10 text-blueApp mx-auto mb-4"
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
              <p className="text-blueApp font-medium">
                {ticket ? "Actualizando ticket..." : "Creando ticket..."}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800/50 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{ticket ? "Editar Ticket" : "Crear Nuevo Ticket"}</h2>
            <p className="text-zinc-400 text-sm mt-1">
              {ticket ? "Modifica los detalles del ticket seleccionado" : "Configura un nuevo ticket para este evento"}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors"
            disabled={isLoading}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-start">
            <div className="p-1 bg-red-500/20 rounded-full mr-3 mt-0.5">
              <XIcon className="w-3 h-3" />
            </div>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>            
            <label htmlFor="type" className="flex items-center text-sm font-medium text-white mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
              Tipo de ticket
            </label>
            <select
              name="tipos"
              id="type"
              className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-700/30 rounded-lg shadow-inner text-white focus:outline-none focus:ring-1 focus:ring-blueApp focus:border-blueApp/50 transition-colors"
              required
              disabled={isLoading}
              onChange={handleTypeChange}
              value={type}
            >
              <option value="" className="bg-zinc-900">Selecciona un tipo de ticket</option>
              <option value="gratis" className="bg-zinc-900">Gratis</option>
              <option value="premium" className="bg-zinc-900">Premium</option>
              <option value="general" className="bg-zinc-900">General</option>
              <option value="virtual-free" className="bg-zinc-900">Virtual Gratis</option>
              <option value="virtual-paid" className="bg-zinc-900">Virtual Pago</option>
            </select>
          </div>
          
          <div>            
            <label htmlFor="ticketName" className="flex items-center text-sm font-medium text-white mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
              Nombre personalizado del ticket
              <span className="ml-1 text-xs text-zinc-500">(opcional)</span>
            </label>
            <div className="flex items-center">
              <input
                ref={ticketNameInputRef}
                type="text"
                placeholder="Puedes usar el tipo de ticket por defecto"
                id="ticketName"
                value={ticketName}
                onChange={handleTicketNameChange}
                className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-700/30 rounded-lg shadow-inner text-white focus:outline-none focus:ring-1 focus:ring-blueApp focus:border-blueApp/50 transition-colors"
                disabled={isLoading}
              />
              {ticketName && (
                <button
                  type="button"
                  onClick={clearTicketName}
                  className="ml-2 p-2 text-zinc-400 hover:text-red-400 focus:outline-none bg-zinc-800/90 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Borrar nombre personalizado"
                  disabled={isLoading}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div>           
             <label htmlFor="description" className="flex items-center text-sm font-medium text-white mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
              Descripción
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-700/30 rounded-lg shadow-inner text-white focus:outline-none focus:ring-1 focus:ring-blueApp focus:border-blueApp/50 transition-colors"
              required
              disabled={isLoading}
              placeholder="Breve descripción del ticket"
            />
          </div>
          
          <div>            
            <label htmlFor="benefits" className="flex items-center text-sm font-medium text-white mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
              Beneficios
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="benefits"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/70 border border-zinc-700/30 rounded-lg shadow-inner text-white focus:outline-none focus:ring-1 focus:ring-blueApp focus:border-blueApp/50 transition-colors"
                disabled={isLoading}
                placeholder="Añade un beneficio y presiona 'Añadir'"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-4 py-2 bg-blueApp hover:bg-blue-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blueApp focus:ring-offset-1 focus:ring-offset-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !newBenefit.trim()}
              >
                Añadir
              </button>
            </div>
            
            <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30 max-h-48 overflow-y-auto hide-scrollbar">
              {benefits.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-2">No hay beneficios añadidos</p>
              ) : (
                <ul className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex justify-between items-center bg-zinc-800/80 p-2 rounded-lg border border-zinc-700/20 group">
                      <div className="flex items-center space-x-2 flex-1 mr-2">
                        <span className="text-blueApp">✓</span>
                        <span className="text-zinc-300 text-sm">{benefit}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(index)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-full hover:bg-zinc-700/50 transition-colors"
                        title="Eliminar beneficio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {isPaid && (
            <div className="bg-zinc-800/40 border border-zinc-700/20 rounded-lg p-4">              <label htmlFor="cost" className="flex items-center text-sm font-medium text-white mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blueApp mr-1.5"></span>
                Precio del ticket
              </label>
              <div className="flex items-center bg-zinc-800 rounded-lg border border-zinc-700/30 pl-4 pr-2 overflow-hidden">
                <span className="text-blueApp mr-2">$</span>
                <input
                  type="number"
                  id="cost"
                  value={price === 0 ? "" : price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full py-3 bg-transparent text-white focus:outline-none"
                  required
                  disabled={isLoading}
                  placeholder="Ingresa el precio"
                />
                <span className="text-zinc-400 font-medium ml-1">COP</span>
              </div>
            </div>
          )}
          
          <div className="pt-6 border-t border-zinc-800/50 flex justify-between items-center">
            {ticket && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 bg-zinc-800 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-lg transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Eliminar
              </button>
            )}
            
            <div className={ticket ? '' : 'ml-auto'}>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blueApp hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-blueApp/20 hover:shadow-blueApp/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : ticket ? "Guardar Cambios" : "Crear Ticket"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}