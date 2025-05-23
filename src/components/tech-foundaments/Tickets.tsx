import React from 'react'
import { DownloadIcon } from 'lucide-react'

interface Ticket {
  title: string
  price: number
  type: string
  benefits: string[]
}
interface EventFCA {
  tickets: Ticket[]
}
export function Tickets({ tickets }: EventFCA) {
  return (
    <div className="bg-gradient-to-br from-[#232e43] via-[#1a2233] to-[#151e2e] rounded-2xl p-8 mt-10 shadow-2xl max-w-md mx-auto">
      <div className="flex flex-col gap-8 items-center">
        {tickets.map((ticket, idx) => (
          <div
            key={idx}
            className="flex flex-col bg-black/90 rounded-2xl p-6 border border-[#232e43] shadow-lg w-[270px] min-h-[420px] items-start"
          >
            <h2 className="text-2xl font-extrabold mb-10 text-blue-500 tracking-wide uppercase w-full text-center ">
              {(ticket.title || ticket.type).charAt(0).toUpperCase() + (ticket.title || ticket.type).slice(1)}
            </h2>
            <ul className="mb-6 space-y-3 text-left w-full">
              {ticket.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start text-zinc-100">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center mb-5 w-full">
              <span className="text-3xl font-bold text-blue-500 mr-2">${ticket.price.toLocaleString()} COP</span>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition-all duration-150 mb-4">
              Reservar ahora
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}