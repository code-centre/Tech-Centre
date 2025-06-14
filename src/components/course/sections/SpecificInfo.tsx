import useUserStore from '../../../../store/useUserStore';
import React, { useState } from 'react'
import ContainerButtonsEdit from '../ContainerButtonsEdit'
import ButtonToEdit from '../ButtonToEdit'
import Link from 'next/link'
import {
  ClockIcon,
  BookOpenIcon,
  PencilIcon,
  MessageCircleIcon,
  UsersIcon,
} from 'lucide-react'

interface Props {
  course: Program,
  saveChanges: (propertyName: string, content: any, index?: number) => void
}

export default function SpecificInfo({ course, saveChanges }: Props) {
  const { user } = useUserStore()
  const [updatePrice, setUpdatePrice] = useState(false)
  const [contentPrice, setContentPrice] = useState(course.price)
  const [schedule, setSchedule] = useState<ScheduleProgram[]>(course.schedule)
  const [teachers, setTeachers] = useState(course.teacher)
  const [updateTeacherIndex, setUpdateTeacherIndex] = useState<null | number | boolean>(null)
  const [updateDayIndex, setUpdateDayIndex] = useState<null | number | boolean>(null)
  const [updateTimeIndex, setUpdateTimeIndex] = useState<null | number | boolean>(null)
  const [updateDiscount, setUpdateDiscount] = useState(false)
  const [contentDiscount, setContentDiscount] = useState(course.discount)
  const [updateDuration, setUpdateDuration] = useState(false)
  const [contentDuration, setContentDuration] = useState(course.duration)
  const [contentLevel, setContentLevel] = useState(course.level)
  const [updateLevel, setUpdateLevel] = useState(false)
  const [updateHours, setUpdateHours] = useState(false)
  const [contentHours, setContentHours] = useState(course.duration)

  const addTeacher = () => {
    setTeachers([...teachers, ""]);
  };

  const addDaySchedule = () => {
    setSchedule([...schedule, { day: "", time: "", modality: "" }]);
  };  return (
    <div className="max-w-xl w-full bg-bgCard rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-zinc-800/30">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-bgCard via-zinc-700 to-zinc-900 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1 tracking-tight">{course.type} en {course.name}</h2>
      </div>
      
      {/* Course details */}
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between py-3 border-b border-zinc-700/50 group hover:border-zinc-600/70 transition-all">
          <div className="flex items-center gap-3 text-gray-700">
            <div className="bg-zinc-900 p-2 rounded-lg shadow-inner border border-zinc-800 group-hover:border-blueApp/30 transition-all">
              <ClockIcon size={18} className="text-blueApp" />
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
            <span className="font-medium text-white text-base">Duración</span>
          </div>
          {updateDuration ? (
            <div className="flex flex-col gap-2">
              <input 
                type="text"
                onChange={(e) => setContentDuration(e.target.value)}
                defaultValue={course.duration}
                className="px-3 py-2 border border-zinc-700 rounded-lg text-white bg-zinc-800
                  focus:outline-none focus:ring-2 focus:ring-blueApp/20 focus:border-blueApp
                  transition-all duration-200"
              />
              <ContainerButtonsEdit
                setFinishEdit={setUpdateDuration}
                onSave={() => {
                  setUpdateDuration(false)
                  saveChanges('duration', contentDuration)
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-white">{course.duration}</span>
              {user?.rol === 'admin' && (
                <PencilIcon size={14} className="text-blueApp cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setUpdateDuration(true)} />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between py-3 border-b border-zinc-700/50 group hover:border-zinc-600/70 transition-all">
          <div className="flex items-center gap-3 text-gray-700">
            <div className="bg-zinc-900 p-2 rounded-lg shadow-inner border border-zinc-800 group-hover:border-blueApp/30 transition-all">
              <BookOpenIcon size={18} className="text-blueApp" />
            </div>
            <span className="font-medium text-white text-base">Nivel</span>
          </div>
          {updateLevel ? (
            <div className="flex flex-col gap-2">
              <select 
                defaultValue={contentLevel} 
                onChange={(e) => setContentLevel(e.target.value as LevelProgram)}
                className="px-3 py-2 border border-zinc-700 rounded-lg text-white bg-zinc-800
                  focus:outline-none focus:ring-2 focus:ring-blueApp/20 focus:border-blueApp
                  transition-all duration-200"
              >
                <option value="Introducción">Introducción</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Experto">Experto</option>
              </select>
              <ContainerButtonsEdit
                setFinishEdit={setUpdateLevel}
                onSave={() => {
                  setUpdateLevel(false)
                  saveChanges('level', contentLevel)
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-white">{course?.level}</span>
              {user?.rol === 'admin' && (
                <PencilIcon size={14} className="text-blueApp cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setUpdateLevel(true)} />
              )}
            </div>
          )}
        </div>       
         {/* Pricing section */}
        <div className="mt-6 bg-zinc-900 p-5 rounded-xl shadow-lg border border-zinc-800/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white text-sm font-medium tracking-wide">Precio regular</span>
            {updatePrice ? (
              <div className="flex flex-col gap-2">                
              <input
                  type="text"
                  onChange={(e) => setContentPrice(Number(e.target.value))}
                  defaultValue={contentPrice.toString()}
                  className="px-3 py-2 border border-zinc-700 rounded-lg text-blueApp font-semibold
                    focus:outline-none focus:ring-2 focus:ring-blueApp/30 focus:border-blueApp bg-zinc-800
                    transition-all duration-200"
                />
                <ContainerButtonsEdit
                  setFinishEdit={setUpdatePrice}
                  onSave={() => {
                    setUpdatePrice(false)
                    saveChanges('price', contentPrice)
                  }}
                />
              </div>
            ) : (
              course.discount ? (
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 line-through text-base">
                    ${Number(course.price)?.toLocaleString()}
                  </span>
                  {user?.rol === 'admin' && (
                    <PencilIcon size={14} className="text-blueApp cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setUpdatePrice(true)} />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-white text-lg font-bold">
                    ${Number(course.price)?.toLocaleString()}
                  </span>
                  {user?.rol === 'admin' && (
                    <PencilIcon size={14} className="text-blueApp cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setUpdatePrice(true)} />
                  )}
                </div>
              )
            )}
          </div>
          
          {course.discount && (
            <div className="flex items-center justify-between py-2 px-3 bg-zinc-800/70 rounded-lg border border-zinc-700/30 shadow-inner mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-300">Precio oferta</span>
                <div className="bg-green-900/70 text-green-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-green-700/30">
                  -{Math.round(((Number(course.price) - Number(course.discount)) / Number(course.price)) * 100)}%
                </div>
              </div>
              {updateDiscount ? (
                <div className="flex flex-col gap-2">                 
                 <input
                    type="text"
                    onChange={(e) => setContentDiscount(Number(e.target.value))}
                    defaultValue={contentDiscount?.toString() || ''}
                    className="px-3 py-2 border border-zinc-700 rounded-lg text-blueApp font-semibold
                      focus:outline-none focus:ring-2 focus:ring-blueApp/30 focus:border-blueApp bg-zinc-800
                      transition-all duration-200"
                  />
                  <ContainerButtonsEdit
                    setFinishEdit={setUpdateDiscount}
                    onSave={() => {
                      setUpdateDiscount(false)
                      saveChanges('discount', contentDiscount)
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xl text-blueApp">
                    ${Number(course.discount)?.toLocaleString()}
                  </span>
                  {user?.rol === 'admin' && (
                    <PencilIcon size={14} className="text-blueApp cursor-pointer hover:text-blue-400 transition-colors" onClick={() => setUpdateDiscount(true)} />
                  )}
                </div>
              )}
            </div>
          )}        
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
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-200">4 cuotas</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-blueApp">
                  ${Math.round((course.discount || course.price) / 4).toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-1">c/u</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2.5 px-4 bg-zinc-800/80 hover:bg-zinc-800 rounded-lg shadow-sm border border-zinc-700/20 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-blueApp rounded-full"></div>
                <span className="text-sm font-medium text-gray-200">8 cuotas</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-blueApp">
                  ${Math.round((course.discount || course.price) / 8).toLocaleString()}
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
            href={`/checkout?slug=${course.slug}&program=${true}`}
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
          
          {user?.rol === 'admin' && (
            <Link
              href={`/cursos/${course.slug}/inscritos`}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700
                hover:from-green-700 hover:to-green-600 text-white font-medium py-3.5 px-5 rounded-xl 
                transition-all duration-300 shadow-md shadow-green-900/20 hover:shadow-green-900/30
                border border-green-600/30 transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
            >
              <UsersIcon size={20} />
              Ver inscritos
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
