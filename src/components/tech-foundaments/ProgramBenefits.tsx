'use client'
import React, { useState, useEffect } from 'react'
import { Book, ListChecks, Check, LightbulbIcon, EditIcon, Code, BrainCircuit, Loader2 } from 'lucide-react'
import HTMLReactParser from 'html-react-parser/lib/index'
import useUserStore from '../../../store/useUserStore'
import Editor from '../Editor'

interface Props {
}

export default function ProgramBenefits() {

  return (
    <div className="max-w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30">
      {/* Header with gradient */}
      <div className="p-8 text-white flex flex-col justify-between gap-4">
        <div className='flex items-center gap-4'>
          <BrainCircuit className="text-blueApp" size={32} />
          <h2 className="text-xl font-bold text-blueApp text-balance">
           Características del programa
          </h2>
        </div>
        <p className="text-lg font-semibold text-white">
          Somos pioneros en inteligencia artificial y tecnologías de vanguardia en la Costa.
        </p>

        <ul className="list-disc marker:text-[#00A1F9] pl-8 flex flex-col gap-5 mt-2">
          <li className="flex items-start gap-2 text-white">
            <div className='bg-blueApp rounded-full w-3 h-3 flex-shrink-0 mt-2'></div>
            Aprenderás desde una perspectiva actual, usando herramientas modernas, guiado por profesionales que aplican estos conocimientos en sus trabajos reales.</li>
          <li className="flex items-start gap-2 text-white">
            <div className='bg-blueApp rounded-full w-3 h-3 flex-shrink-0 mt-2'></div>
            Trabajarás en ejercicios y desafíos que simulan situaciones reales del desarrollo de software. Construirás soluciones útiles que podrás integrar directamente en tu portafolio profesional.</li>
          <li className="flex items-start gap-2 text-white">
            <div className='bg-blueApp rounded-full w-3 h-3 flex-shrink-0 mt-2'></div>
            Conectarás con una comunidad activa de estudiantes, mentores y expertos del ecosistema tech. Además, tendrás acceso a eventos gratuitos, talleres y espacios exclusivos organizados por Tech Centre y Fundación Código Abierto.</li>
          <li className="flex items-start gap-2 text-white">
            <div className='bg-blueApp rounded-full w-3 h-3 flex-shrink-0 mt-2'></div>
            El curso está diseñado para que avances de forma estructurada, desde lo más básico hasta aplicar conceptos complejos de forma natural, combinando teoría ligera con práctica constante.</li>
        </ul>

        <div className="my-4 pt-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <LightbulbIcon size={18} className="text-blueApp" />
            Beneficios adicionales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="mt-1 bg-zinc-800 rounded-full p-1">
                <Check size={16} className="text-green-400" />
              </div>
              <p className="text-gray-300 text-sm vertical-align-middle">Materiales y recursos de aprendizaje incluidos</p>
            </div>
            <div className="flex items-center gap-3 align-middle">
              <div className="mt-1 bg-zinc-800 rounded-full p-1">
                <Check size={16} className="text-green-400" />
              </div>
              <p className="text-gray-300 text-sm">Acceso a comunidad de aprendizaje</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="mt-1 bg-zinc-800 rounded-full p-1">
                <Check size={16} className="text-green-400" />
              </div>
              <p className="text-gray-300 text-sm">Certificado de participación</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="mt-1 bg-zinc-800 rounded-full p-1">
                <Check size={16} className="text-green-400" />
              </div>
              <p className="text-gray-300 text-sm">Asesoría personalizada durante el curso</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
