import React, { useState } from 'react'
import { ClockIcon, BookOpenIcon, MessageCircleIcon, CalendarIcon, MapPinIcon } from 'lucide-react'
import Link from 'next/link'

interface Ticket {
  title: string
  price: number
  type: string
  benefits: string[]
  description?: string
}

interface EventFCA {
  tickets: Ticket[]
  eventId?: string
  eventSlug?: string
}

export function Tickets({ tickets, eventId, eventSlug }: EventFCA) {
  const [selectedTicket, setSelectedTicket] = useState(0);

  if (!tickets || tickets.length === 0) {
    return (
      <div className="p-6 text-center text-white bg-zinc-800 rounded-xl">
        No hay tickets disponibles para este evento.
      </div>
    );
  }

  const currentTicket = tickets[selectedTicket];

  return (
    <div className="max-w-xl w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-bgCard via-zinc-700 to-zinc-900 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1 tracking-tight">Tickets disponibles</h2>
      </div>

      {/* Ticket selection tabs if more than one */}
      {tickets.length > 1 && (
        <div className="flex gap-2 p-4 overflow-x-auto">
          {tickets.map((ticket, index) => (
            <button
              key={index}
              onClick={() => setSelectedTicket(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap min-w-[100px] transition-all ${selectedTicket === index
                  ? 'bg-blueApp text-white shadow-lg shadow-blueApp/20'
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                }`}
            >
              {ticket.title}
            </button>
          ))}
        </div>
      )}

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
            Presencial
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-zinc-700/50 group hover:border-zinc-600/70 transition-all">
          <div className="flex items-center gap-3 text-gray-700">
            <div className="bg-zinc-900 p-2 rounded-lg shadow-inner border border-zinc-800 group-hover:border-blueApp/30 transition-all">
              <ClockIcon size={18} className="text-blueApp" />
            </div>
            <span className="font-medium text-white text-base">Tipo</span>
          </div>
          <div className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-sm font-medium border border-zinc-800/80 shadow-sm hover:border-blueApp/20 transition-colors">
            {currentTicket?.type || "General"}
          </div>
        </div>

        {/* Descripción si existe */}
        {currentTicket.description && (
          <div className="py-3 border-b border-zinc-700/50">
            <p className="text-white text-sm leading-relaxed">{currentTicket.description}</p>
          </div>
        )}

        {/* Beneficios */}
        {currentTicket.benefits && currentTicket.benefits.length > 0 && (
          <div className="py-3 border-b border-zinc-700/50">
            <h3 className="font-medium text-white mb-3">Lo que incluye:</h3>
            <ul className="space-y-2">
              {currentTicket.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-blueApp mt-0.5">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing section */}
        <div className="mt-6 bg-zinc-900 p-5 rounded-xl shadow-lg border border-zinc-800/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white text-sm font-medium tracking-wide">Precio regular</span>
            <div className="flex items-center gap-1">
              <span className="text-white text-lg font-bold">
                ${Number(currentTicket.price)?.toLocaleString()}
              </span>
            </div>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-wide">Opciones de Pago</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2.5 px-4 bg-zinc-800/80 hover:bg-zinc-800 rounded-lg shadow-sm border border-zinc-700/20 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-blueApp rounded-full"></div>
                <span className="text-sm font-medium text-gray-200">2 cuotas</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-blueApp">
                  ${Math.round((currentTicket.price) / 2).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-1">c/u</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-700/30">
            <p className="text-xs text-blueApp text-center font-medium">
              💳 Acepta todas las tarjetas de crédito
            </p>
          </div>
        </div>

        {/* Call to action buttons */}
        <div className="mt-6 space-y-3">
          <Link
            href={`/checkout?eventId=${eventId || ''}&ticketId=${selectedTicket}&slug=${eventSlug || ''}`}
            className="w-full bg-gradient-to-r from-blueApp to-blue-600 hover:from-blue-600 hover:to-blueApp 
              text-white font-medium py-3.5 px-5 rounded-xl transition-all duration-300 block text-center
              shadow-lg shadow-blueApp/20 hover:shadow-blueApp/30 border border-blue-500/30
              transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
          >
            Inscribirme ahora
          </Link>

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
  )
}