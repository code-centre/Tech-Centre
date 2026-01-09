"use client"

import { useState, useEffect } from "react"
import { ClockIcon, MessageCircleIcon, MapPinIcon, EditIcon, PlusCircle } from "lucide-react"
import useUserStore from "../../../store/useUserStore"
import { useRouter } from "next/navigation"
import AlertModal from "../AlertModal"
// import { supabase } from "@/lib/supabase"
import type { Ticket } from "@/types/programs"

interface ProgramData {
  id: number;
  code: string;
  name: string;
  // syllabus: SyllabusData; // O tipa esto según tu estructura real
  difficulty: string;
  kind: string;
  total_hours: number;
  default_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image: string;
  description: string;
  video: string;
  subtitle: string;
  faqs: any[];
}

interface Cohort {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  program_id: number;
  created_at: string;
  updated_at: string;
  modality: string;
}

interface PaymentPlan {
  id: number;
  program_id: string;
  name: string;
  description: string;
  installments: number;
  discount_percent: number;
}

interface Props {
  programData: ProgramData | null;
  cohort: Cohort | null;
  paymentPlans: PaymentPlan[];
}

export function TicketsSupa({
  programData,
  cohort,
  paymentPlans,
}: Props) {
  const [selectedTicket, setSelectedTicket] = useState(0)
  const [showEditMode, setShowEditMode] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingType, setIsEditingType] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [isEditingBenefits, setIsEditingBenefits] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedType, setEditedType] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedPrice, setEditedPrice] = useState(0)
  const [editedBenefits, setEditedBenefits] = useState<string[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [alertState, setAlertState] = useState({
    title: "",
    description: "",
    isOpen: false,
  })
  const router = useRouter()
  const { user } = useUserStore()

  const openTicketModal = (isCreating: boolean, ticketData: Ticket | null = null) => {
    if (!programData || !cohort) return

    setTicketToEdit(ticketData)
    setIsCreatingNew(isCreating)
    setIsModalOpen(true)
  }

  const handleBuyClick = async () => {
    if (user) {
      if (cohort?.id) {
        router.push(`/checkout?cohortId=${cohort.id}`)
      } else if (programData?.code) {
        // Fallback al método anterior si no hay cohortId
        router.push(`/checkout?slug=${programData.code}`)
      }
    } else {
      setIsAuthModalOpen(true)
    }
  }


  function calculateDurationInMonths(startDateStr: string, endDateStr: string): string {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Calculate difference in years and months
    const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthsDiff = (endDate.getMonth() - startDate.getMonth()) + (yearsDiff * 12);
    
    // Add 1 to include both start and end months
    const totalMonths = Math.max(1, monthsDiff + 1);
    
    return `${totalMonths} ${totalMonths === 1 ? 'mes' : 'meses'}`;
  }
  const duration = cohort ? calculateDurationInMonths(cohort.start_date, cohort.end_date) : 'No definido';
  // useEffect(() => {
  //   if (tickets && tickets.length > 0) setSelectedTicket(0)
  // }, [tickets])

  // useEffect(() => {
  //   if (tickets && tickets.length > 0 && tickets[selectedTicket]) {
  //     const ticket = tickets[selectedTicket]
  //     setEditedTitle(ticket.title || "")
  //     setEditedType(ticket.type || "General")
  //     setEditedDescription(ticket.description || "")
  //     setEditedPrice(ticket.price || 0)
  //     setEditedBenefits(ticket.benefits || [])
  //   }
  // }, [tickets, selectedTicket])

  // const handleEditTicket = () => {
  //   if (tickets && tickets[selectedTicket] && eventId) {
  //     openTicketModal(false, tickets[selectedTicket])
  //   }
  // }

  const handleCreateTicket = () => {
    openTicketModal(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTicketToEdit(null)
    setIsCreatingNew(false)
  }

  const toggleEditMode = () => {
    setShowEditMode(!showEditMode)
  }

  const handleLoginSuccess = () => {
    setIsAuthModalOpen(false)
    setTimeout(() => {
      setAlertState({
        isOpen: true,
        title: "Inicio de sesión exitoso",
        description: "¡Bienvenido de vuelta!",
      })
    }, 200)
  }

  // Si no hay tickets, mostrar solo el botón de crear
  if (paymentPlans.length === 0 ) {
    return (
      <>
        <div className="flex gap-4 ml-auto">
          {user?.rol === "admin" && (
            <button
              onClick={handleCreateTicket}
              className="flex items-center gap-2 px-3 py-1 bg-blueApp hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
            >
              <PlusCircle size={14} />
              <span>Nuevo Ticket</span>
            </button>
          )}
        </div>

        {/* Modal para crear ticket
        {isModalOpen && (
          <PricingCardCreationModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            eventId={eventId}
            ticket={isCreatingNew ? null : ticketToEdit}
            saveTicketData={saveTicketData}
            deleteTicketData={deleteTicketData}
          />
        )} */}
      </>
    )
  }

  // Obtener el ticket actual de forma segura
  // const currentTicket = tickets && tickets.length > 0 ? tickets[selectedTicket] : null

  // Si no hay currentTicket válido, no renderizar el contenido principal
  // if (!currentTicket) {
  //   return null
  // }

  return (
    <>
      {showEditMode ? (
        <div className="w-full">
          <button
            onClick={toggleEditMode}
            className="mb-4 px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
          >
            Volver a vista normal
          </button>
          {/* <PaymentEventCard eventId={eventId} saveTicketData={saveTicketData} deleteTicketData={deleteTicketData} /> */}
        </div>
      ) : (
        <div className="w-full items-center flex justify-center flex-col">
          <div className="flex justify-between items-center mb-4 w-full">
            {user?.rol === "admin" && (
              <button
                onClick={toggleEditMode}
                className="px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition-colors"
              >
                Ver todos los tickets
              </button>
            )}
            <div className="flex gap-4 ml-auto">
              {user?.rol === "admin" && (
                <>
                  <button
                    onClick={handleCreateTicket}
                    className="flex items-center gap-2 px-3 py-1 bg-blueApp hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
                  >
                    <PlusCircle size={14} />
                    <span>Nuevo Ticket</span>
                  </button>
                  <button
                    // onClick={handleEditTicket}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-md transition-colors"
                  >
                    <EditIcon size={16} />
                    <span>Editar</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="max-w-xl w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30">
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-bgCard via-zinc-700 to-zinc-900 p-6 text-white">
              {isEditingTitle && user?.rol === "admin" ? (
                <div className="flex flex-col mb-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-xl font-bold bg-zinc-800/80 text-white px-3 py-2 rounded mb-2"
                    placeholder="Título del ticket"
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-green-600 p-1 rounded hover:bg-green-700 text-white flex items-center"
                      // onClick={() => {
                      //   if (saveChanges && tickets && tickets[selectedTicket]) {
                      //     const updatedTickets = [...tickets]
                      //     updatedTickets[selectedTicket] = {
                      //       ...updatedTickets[selectedTicket],
                      //       title: editedTitle,
                      //       name: editedTitle,
                      //       ticketName: editedTitle,
                      //     }
                      //     saveChanges("tickets", updatedTickets)
                      //   }
                      //   setIsEditingTitle(false)
                      // }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Guardar
                    </button>
                    <button
                      className="bg-red-600 p-1 rounded hover:bg-red-700 text-white flex items-center"
                      // onClick={() => {
                      //   if (tickets && tickets[selectedTicket]) {
                      //     setEditedTitle(tickets[selectedTicket].title || tickets[selectedTicket].ticketName || "")
                      //   }
                      //   setIsEditingTitle(false)
                      // }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start">
                  <h2 className="text-2xl font-bold mb-1 tracking-tight flex-grow">
                    {programData?.name}
                  </h2>
                  {user?.rol === "admin" && (
                    <button
                      className="ml-3 bg-blue-600 p-1 rounded hover:bg-blue-700 self-start"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      <EditIcon className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Ticket selection tabs if more than one */}
            {/* {paymentPlans.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {paymentPlans.map((paymentPlan, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTicket(index)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap min-w-[100px] transition-all ${
                      selectedTicket === index
                        ? "bg-blueApp text-white shadow-lg shadow-blueApp/20"
                        : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                    }`}
                  >
                    {paymentPlan.name}
                  </button>
                ))}
              </div>
            )} */}

            {/* Course details */}
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between py-3 border-b border-zinc-700/50 group hover:border-zinc-600/70 transition-all">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="bg-zinc-900 p-2 rounded-lg shadow-inner border border-zinc-800 group-hover:border-blueApp/30 transition-all">
                    <MapPinIcon size={18} className="text-blueApp" />
                  </div>
                  <span className="font-medium text-white text-base">Modalidad</span>
                </div>
                <div className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-sm font-medium border border-zinc-800/80 shadow-sm hover:border-blueApp/20 transition-colors">
                  {cohort?.modality}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-700/50 group hover:border-zinc-600/70 transition-all">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="bg-zinc-900 p-2 rounded-lg shadow-inner border border-zinc-800 group-hover:border-blueApp/30 transition-all">
                    <ClockIcon size={18} className="text-blueApp" />
                  </div>
                  <span className="font-medium text-white text-base">Duración</span>
                </div>
                {isEditingType && user?.rol === "admin" ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={editedType}
                      onChange={(e) => setEditedType(e.target.value)}
                      className="bg-zinc-700 text-white px-2 py-1 rounded mr-2 text-sm"
                      placeholder="Tipo del ticket"
                    />
                    <div className="flex gap-1">
                      <button
                        className="bg-green-600 p-1 rounded hover:bg-green-700"
                        // onClick={() => {
                        //   if (saveChanges && tickets && tickets[selectedTicket]) {
                        //     const updatedTickets = [...tickets]
                        //     updatedTickets[selectedTicket] = {
                        //       ...updatedTickets[selectedTicket],
                        //       type: editedType,
                        //     }
                        //     saveChanges("tickets", updatedTickets)
                        //   }
                        //   setIsEditingType(false)
                        // }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button
                        className="bg-red-600 p-1 rounded hover:bg-red-700"
                        // onClick={() => {
                        //   if (tickets && tickets[selectedTicket]) {
                        //     setEditedType(tickets[selectedTicket].type || "General")
                        //   }
                        //   setIsEditingType(false)
                        // }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-sm font-medium border border-zinc-800/80 shadow-sm hover:border-blueApp/20 transition-colors">
                      {duration}
                    </div>
                    {/* {saveChanges && user?.rol === "admin" && (
                      <button
                        className="ml-2 bg-blue-600 p-1 rounded hover:bg-blue-700"
                        onClick={() => setIsEditingType(true)}
                      >
                        <EditIcon className="w-4 h-4 text-white" />
                      </button>
                    )} */}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between py-3 border-b border-zinc-700/50 group hover:border-zinc-600/70 transition-all">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="bg-zinc-900 p-2 rounded-lg shadow-inner border border-zinc-800 group-hover:border-blueApp/30 transition-all">
                    <ClockIcon size={18} className="text-blueApp" />
                  </div>
                  <span className="font-medium text-white text-base">Dificultad</span>
                </div>
                <div className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-sm font-medium border border-zinc-800/80 shadow-sm hover:border-blueApp/20 transition-colors">
                  {programData?.difficulty}
                </div>
              </div>
              {/* Descripción si existe */}
              {/* <div className="py-3 border-b border-zinc-700/50">
                {isEditingDescription ? (
                  <div className="flex flex-col mb-2">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="text-sm bg-zinc-800/80 text-white px-3 py-2 rounded mb-2 min-h-[80px]"
                      placeholder="Descripción del ticket"
                    />
                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 p-1 rounded hover:bg-green-700 text-white flex items-center"
                        // onClick={() => {
                        //   if (saveChanges && tickets && tickets[selectedTicket]) {
                        //     const updatedTickets = [...tickets]
                        //     updatedTickets[selectedTicket] = {
                        //       ...updatedTickets[selectedTicket],
                        //       description: editedDescription,
                        //     }
                        //     saveChanges("tickets", updatedTickets)
                        //   }
                        //   setIsEditingDescription(false)
                        // }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Guardar
                      </button>
                      <button
                        className="bg-red-600 p-1 rounded hover:bg-red-700 text-white flex items-center"
                        // onClick={() => {
                        //   if (tickets && tickets[selectedTicket]) {
                        //     setEditedDescription(tickets[selectedTicket].description || "")
                        //   }
                        //   setIsEditingDescription(false)
                        // }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <p className="text-white text-sm leading-relaxed flex-grow">
                      "Sin descripción"
                    </p>
                    {saveChanges && user?.rol === "admin" && (
                      <button
                        className="ml-3 bg-blue-600 p-1 rounded hover:bg-blue-700 self-start"
                        onClick={() => setIsEditingDescription(true)}
                      >
                        <EditIcon className="w-4 h-4 text-white" />
                      </button>
                    )} 
                  </div>
                )}
              </div> */}
              {/* Beneficios */}
              {/* <div className="py-3 border-b border-zinc-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">Lo que incluye:</h3>
                   {saveChanges && user?.rol === "admin" && (
                    <button
                      className="ml-2 bg-blue-600 p-1 rounded hover:bg-blue-700"
                      onClick={() => setIsEditingBenefits(true)}
                    >
                      <EditIcon className="w-4 h-4 text-white" />
                    </button>
                  )} 
                </div>

                {isEditingBenefits ? (
                  <div className="flex flex-col mb-2">
                    <div className="space-y-2 mb-3">
                      {editedBenefits.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={benefit}
                            onChange={(e) => {
                              const newBenefits = [...editedBenefits]
                              newBenefits[index] = e.target.value
                              setEditedBenefits(newBenefits)
                            }}
                            className="bg-zinc-800/80 text-white px-3 py-2 rounded flex-grow text-sm"
                            placeholder={`Beneficio ${index + 1}`}
                          />
                          <button
                            className="bg-red-600 p-1 rounded hover:bg-red-700"
                            onClick={() => {
                              const newBenefits = [...editedBenefits]
                              newBenefits.splice(index, 1)
                              setEditedBenefits(newBenefits)
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      className="bg-zinc-800 p-2 rounded hover:bg-zinc-700 text-white flex items-center justify-center mb-3"
                      onClick={() => setEditedBenefits([...editedBenefits, ""])}
                    >
                      <PlusCircle size={16} className="mr-2" />
                      Agregar beneficio
                    </button>

                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 p-1 rounded hover:bg-green-700 text-white flex items-center"
                        // onClick={() => {
                        //   if (saveChanges && tickets && tickets[selectedTicket]) {
                        //     const updatedTickets = [...tickets]
                        //     updatedTickets[selectedTicket] = {
                        //       ...updatedTickets[selectedTicket],
                        //       benefits: editedBenefits.filter((b) => b.trim() !== ""),
                        //     }
                        //     saveChanges("tickets", updatedTickets)
                        //   }
                        //   setIsEditingBenefits(false)
                        // }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Guardar
                      </button>
                      <button
                        className="bg-red-600 p-1 rounded hover:bg-red-700 text-white flex items-center"
                        // onClick={() => {
                        //   if (tickets && tickets[selectedTicket]) {
                        //     setEditedBenefits(tickets[selectedTicket].benefits || [])
                        //   }
                        //   setIsEditingBenefits(false)
                        // }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {/* {currentTicket.benefits && currentTicket.benefits.length > 0 ? (
                      currentTicket.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                          <span className="text-blueApp mt-0.5">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400 text-sm">No hay beneficios especificados</li>
                    )} 
                  </ul>
                )}
              </div> */}

              {/* Pricing section */}
              <div className="mt-6 bg-zinc-900 p-5 rounded-xl shadow-lg border border-zinc-800/40 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-sm font-medium tracking-wide">Precio regular</span>

                  {isEditingPrice ? (
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={editedPrice}
                        onChange={(e) => setEditedPrice(Number(e.target.value))}
                        className="bg-zinc-700 text-white px-2 py-1 rounded mr-2 text-sm w-32"
                        placeholder="Precio"
                      />
                      <div className="flex gap-1">
                        <button
                          className="bg-green-600 p-1 rounded hover:bg-green-700"
                          // onClick={() => {
                          //   if (saveChanges && tickets && tickets[selectedTicket]) {
                          //     const updatedTickets = [...tickets]
                          //     updatedTickets[selectedTicket] = {
                          //       ...updatedTickets[selectedTicket],
                          //       price: editedPrice,
                          //     }
                          //     saveChanges("tickets", updatedTickets)
                          //   }
                          //   setIsEditingPrice(false)
                          // }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button
                          className="bg-red-600 p-1 rounded hover:bg-red-700"
                          // onClick={() => {
                          //   if (tickets && tickets[selectedTicket]) {
                          //     setEditedPrice(tickets[selectedTicket].price || 0)
                          //   }
                          //   setIsEditingPrice(false)
                          // }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-white text-lg font-bold">
                          {/* ${Number(currentTicket.price)?.toLocaleString()} */}
                          {programData?.default_price}
                        </span>
                      </div>
                      {user?.rol === "admin" && (
                        <button
                          className="ml-2 bg-blue-600 p-1 rounded hover:bg-blue-700"
                          onClick={() => setIsEditingPrice(true)}
                        >
                          <EditIcon className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment options section */}
              <div className="mt-5 bg-zinc-900/90 p-5 rounded-xl shadow-lg border border-zinc-800/40 relative overflow-hidden group">
                {/* Línea decorativa */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blueApp"></div>

                {/* Efecto decorativo */}
                <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-blueApp/5 blur-2xl group-hover:bg-blueApp/10 transition-all duration-700"></div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-zinc-800 p-2 rounded-lg shadow-inner border border-zinc-700/40">
                    <svg className="w-4 h-4 text-blueApp" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <span className="font-semibold text-white tracking-wide">Opciones de Pago</span>
                </div>
                <div className="space-y-3">
                  {paymentPlans.length > 0 && (
                    paymentPlans.map((plan, index) => (
                  <div key={index} className="flex items-center justify-between py-2.5 px-4 bg-zinc-800/80 hover:bg-zinc-800 rounded-lg shadow-sm border border-zinc-700/20 transition-colors duration-200">
                    <div className="flex items-center gap-3" >
                        <div className="w-2.5 h-2.5 bg-blueApp rounded-full"></div>
                        <span className="text-sm font-medium text-gray-200">{plan.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blueApp">
                            {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0,
                            }).format((programData?.default_price ?? 0) / plan.installments)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">c/u</span>
                      </div>
                  </div>
                  )))}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-700/30">
                  <p className="text-xs text-blueApp text-center font-medium">
                    💳 Acepta todas las tarjetas de crédito
                  </p>
                </div>
              </div>

              {/* Call to action buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleBuyClick}
                  className="w-full bg-gradient-to-r from-blueApp to-blue-600 hover:from-blue-600 hover:to-blueApp 
                    text-white font-medium py-3.5 px-5 rounded-xl transition-all duration-300 block text-center
                    shadow-lg shadow-blueApp/20 hover:shadow-blueApp/30 border border-blue-500/30
                    transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                >
                  Inscribirme ahora
                </button>

                <a
                  href="https://api.whatsapp.com/send?phone=573005523872"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-zinc-800 border border-zinc-700/50 
                    hover:bg-zinc-800/80 text-white font-medium py-3.5 px-5 rounded-xl transition-all duration-300
                    shadow-md hover:shadow-lg active:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MessageCircleIcon size={20} className="text-green-500" />
                  Hablar con un asesor
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLoginSuccess} /> */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({ isOpen: false, title: "", description: "" })}
        title={alertState.title}
        description={alertState.description}
      />
      {/* Modal para editar o crear un ticket */}
      {/* {isModalOpen && eventId && (
        <PricingCardCreationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          eventId={eventId}
          ticket={isCreatingNew ? null : ticketToEdit}
          saveTicketData={saveTicketData}
          deleteTicketData={deleteTicketData}
        />
      )} */}
    </>
  )
}
