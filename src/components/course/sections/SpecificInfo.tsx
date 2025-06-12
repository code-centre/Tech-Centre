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
  };
  return (
    <div className="max-w-xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blueApp to-blue-500 p-6 text-white">
        <h2 className="text-xl font-bold mb-1">{course.type} en {course.name}</h2>
      </div>
      
      {/* Course details */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="bg-blue-100 p-1.5 rounded-md">
              <ClockIcon size={18} className="text-blue-600" />
            </div>
            <span className="font-medium">Modalidad</span>
          </div>
          <div className="bg-blue-50 text-blueApp px-3 py-1 rounded-full text-sm font-medium">
            Presencial
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="bg-blue-100 p-1.5 rounded-md">
              <ClockIcon size={18} className="text-blue-600" />
            </div>
            <span className="font-medium">Duración</span>
          </div>
          {updateDuration ? (
            <div className="flex flex-col gap-2">
              <input 
                type="text"
                onChange={(e) => setContentDuration(e.target.value)}
                defaultValue={course.duration}
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-800
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
              <span className="font-semibold text-gray-800">{course.duration}</span>
              {user?.rol === 'admin' && (
                <PencilIcon size={14} className="text-blue-500 cursor-pointer" onClick={() => setUpdateDuration(true)} />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="bg-blue-100 p-1.5 rounded-md">
              <BookOpenIcon size={18} className="text-blue-600" />
            </div>
            <span className="font-medium">Nivel</span>
          </div>
          {updateLevel ? (
            <div className="flex flex-col gap-2">
              <select 
                defaultValue={contentLevel} 
                onChange={(e) => setContentLevel(e.target.value as LevelProgram)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-800
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
              <span className="font-semibold text-gray-800">{course?.level}</span>
              {user?.rol === 'admin' && (
                <PencilIcon size={14} className="text-blue-500 cursor-pointer" onClick={() => setUpdateLevel(true)} />
              )}
            </div>
          )}
        </div>

        {/* Pricing section */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Precio regular</span>
            {updatePrice ? (
              <div className="flex flex-col gap-2">                
              <input
                  type="text"
                  onChange={(e) => setContentPrice(Number(e.target.value))}
                  defaultValue={contentPrice.toString()}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-blueApp font-semibold
                    focus:outline-none focus:ring-2 focus:ring-blueApp/20 focus:border-blueApp
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
                  <span className="text-gray-500 line-through">
                    ${Number(course.price)?.toLocaleString()}
                  </span>
                  {user?.rol === 'admin' && (
                    <PencilIcon size={14} className="text-blue-500 cursor-pointer" onClick={() => setUpdatePrice(true)} />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">
                    ${Number(course.price)?.toLocaleString()}
                  </span>
                  {user?.rol === 'admin' && (
                    <PencilIcon size={14} className="text-blue-500 cursor-pointer" onClick={() => setUpdatePrice(true)} />
                  )}
                </div>
              )
            )}
          </div>
          
          {course.discount && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-700">Precio oferta</span>
                <div className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  -{Math.round(((Number(course.price) - Number(course.discount)) / Number(course.price)) * 100)}%
                </div>
              </div>
              {updateDiscount ? (
                <div className="flex flex-col gap-2">                 
                 <input
                    type="text"
                    onChange={(e) => setContentDiscount(Number(e.target.value))}
                    defaultValue={contentDiscount?.toString() || ''}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-blue-600 font-bold
                      focus:outline-none focus:ring-2 focus:ring-blueApp/20 focus:border-blueApp
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
                    <PencilIcon size={14} className="text-blue-500 cursor-pointer" onClick={() => setUpdateDiscount(true)} />
                  )}
                </div>
              )}
            </div>
          )}        
          </div>

        {/* Payment options section */}
        <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-100 p-1.5 rounded-md">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="font-semibold text-blueApp">Opciones de Pago</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-3 bg-white rounded-md shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">4 cuotas</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-blueApp">
                  ${Math.round((course.discount || course.price) / 4).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 ml-1">c/u</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 px-3 bg-white rounded-md shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">8 cuotas</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-blueApp">
                  ${Math.round((course.discount || course.price) / 8).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 ml-1">c/u</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-blue-100">
            <p className="text-xs text-blueApp text-center">
              💳 Acepta todas las tarjetas de crédito
            </p>
          </div>
        </div>

        {/* Call to action buttons */}
        <Link
          href={`/checkout?slug=${course.slug}&program=${true}`}
          className="w-full bg-blueApp hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-4 block text-center"
        >
          Inscribirme ahora
        </Link>
        
        <a
          href="https://api.whatsapp.com/send?phone=573005523872"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <MessageCircleIcon size={18} className="text-green-600" />
          Hablar con un asesor
        </a>
        
        {user?.rol === 'admin' && (
          <Link
            href={`/cursos/${course.slug}/inscritos`}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <UsersIcon size={18} />
            Ver inscritos
          </Link>
        )}
      </div>
    </div>
  )
}
