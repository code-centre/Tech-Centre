"use client"

import { EditIcon } from 'lucide-react'

interface PricingCardProps {
  index?: number
  type: string
  title: string
  ticketName?: string
  description: string
  price: number
  features: string[]
  onClick: () => void
  eventId?: string
}

export default function PricingCard({
  index,
  type,
  title,
  ticketName,
  description,
  price,
  features,
  onClick,
  eventId
}: PricingCardProps) {
  const isPremium = type === "premium"

  return (
    <div className={`relative flex flex-col w-full max-w-xs rounded-2xl overflow-hidden bg-linear-to-b ${
      isPremium ? "from-zinc-800 to-zinc-900 border-secondary" : "from-zinc-900 to-black border-zinc-700/40"
    } border p-1`}>
      {isPremium && (
        <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-secondary/5 blur-3xl"></div>
      )}
      
      {/* Edit button */}
      <button 
        onClick={onClick}
        className="absolute top-3 right-3 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white transition-colors z-10"
        title="Editar ticket"
      >
        <EditIcon size={18} />
      </button>

      <div className={`p-6 rounded-xl ${isPremium ? "bg-zinc-800/70" : "bg-zinc-900/70"}`}>
        {/* Tipo de ticket */}
        <div className="flex items-center justify-between">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isPremium ? "bg-secondary/20 text-blue-300" : "bg-zinc-800 text-gray-300"}`}>
            {type === "premium" 
              ? "Premium"
              : type === "general" 
                ? "General"
                : type === "gratis" 
                  ? "Gratis" 
                  : type === "virtual-free"
                    ? "Virtual Gratis"
                    : "Virtual Pago"}
          </div>
        </div>
      
        {/* Título y precio */}
        <div className="mt-4 mb-6">
          <h3 className="text-xl font-bold text-white mb-1">{ticketName || title}</h3>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-white">${Number(price).toLocaleString()}</span>
            <span className="text-sm text-gray-400">COP</span>
          </div>
        </div>
      
        {/* Descripción */}
        {description && (
          <p className="text-gray-300 text-sm mb-6">{description}</p>
        )}
      
        {/* Beneficios */}
        <ul className="space-y-3 mb-6">
          {features?.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className={`shrink-0 w-4 h-4 rounded-full ${isPremium ? "bg-secondary" : "bg-zinc-700"} flex items-center justify-center mt-0.5`}>
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
