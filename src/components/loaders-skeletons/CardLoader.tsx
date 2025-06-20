import React from 'react'

export default function CardLoader() {
  return (
    <div className="w-full h-full bg-zinc-800/70 rounded-xl shadow-lg overflow-hidden animate-pulse border border-zinc-700">
      {/* Card image placeholder */}
      <div className="bg-zinc-700/60 h-48 w-full"></div>
      
      <div className="p-5">
        {/* Category and level indicators */}
        <div className="flex justify-between items-center text-sm mb-3">
          <div className="bg-zinc-700/60 h-6 w-24 rounded-full"></div>
          <div className="bg-zinc-700/60 h-6 w-32 rounded-full"></div>
        </div>
        
        {/* Title */}
        <div className="bg-zinc-700/60 h-8 w-full rounded-md mb-4"></div>
        
        {/* Description */}
        <div className="bg-zinc-700/60 h-6 w-full rounded-md mb-2"></div>
        <div className="bg-zinc-700/60 h-6 w-3/4 rounded-md mb-4"></div>
        
        {/* Price and date */}
        <div className="flex justify-between items-center mt-6">
          <div className="bg-zinc-700/60 h-7 w-28 rounded-md"></div>
          <div className="bg-zinc-700/60 h-7 w-32 rounded-md"></div>
        </div>
      </div>
      
      {/* Button area */}
      <div className="px-5 py-4 border-t border-zinc-700 text-center">
        <div className="bg-zinc-700/80 h-10 w-full rounded-md"></div>
      </div>
    </div>
  )
}
