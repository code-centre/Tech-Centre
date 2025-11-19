import React from 'react'
import Image from 'next/image'
import sponsorsData from '../../data/aliados.json'

export const AliadosSection = () => {
  const allies = sponsorsData.allies
  return (
    <section className="w-full px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="py-16 mt-16 ">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <h3 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
                Aliados Estratégicos
              </h3>
            </div>
            <div className="w-64 h-0.5 bg-white mx-auto"></div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-10">
            {allies.map((ally, index) => (
              <div key={index} className="p-5 rounded-lg items-center flex justify-center">
                <Image src={ally.logo} alt={ally.name} width={100} height={100} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
