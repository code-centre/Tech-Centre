import useUserStore from '../../../../store/useUserStore';
import React, { useState } from 'react'
import ContainerButtonsEdit from '../ContainerButtonsEdit'
import ButtonToEdit from '../ButtonToEdit'
import Link from 'next/link'

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
    <div className="flex flex-col gap-4 w-full font-medium bg-white rounded-xl p-6 
      border border-gray-200 shadow-lg divide-y divide-gray-100">
      
      {/* Course basic info */}
      <div className="space-y-4 pb-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Modalidad</p>
          <span className="px-3 py-1 bg-lightBlue text-blueApp rounded-full text-sm font-medium">
            Presencial
          </span>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-gray-600">Duración</p>
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
            <div className="flex items-center gap-2">
              <p className="text-gray-800 font-semibold">{course.duration}</p>
              {user?.rol === 'admin' && (
                <ButtonToEdit startEditing={setUpdateDuration} />
              )}
            </div>
          )}
        </div>

        {/* Level selector */}
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Nivel</p>
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
            <div className="flex items-center gap-2">
              <span className="text-gray-800 font-semibold">{course?.level}</span>
              {user?.rol === 'admin' && (
                <ButtonToEdit startEditing={setUpdateLevel} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price section */}
      <div className="space-y-4 py-4">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Precio regular</p>
          {updatePrice ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                onChange={(e) => setContentPrice(Number(e.target.value))}
                defaultValue={contentPrice}
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
            <div className="flex items-center gap-2">
              <p className="text-blueApp font-bold text-lg">
                ${Number(course.price)?.toLocaleString()}
              </p>
              {user?.rol === 'admin' && (
                <ButtonToEdit startEditing={setUpdatePrice} />
              )}
            </div>
          )}
        </div>

        {course.discount && (
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Precio oferta</p>
            <div className="flex items-center gap-2">
              <p className="text-blueApp font-bold text-lg">
                ${Number(course.discount)?.toLocaleString()}
              </p>
              {user?.rol === 'admin' && (
                <ButtonToEdit startEditing={setUpdateDiscount} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-3 pt-4">
        <Link
          href={`/checkout?slug=${course.slug}&program=${true}`}
          className="block w-full px-6 py-3 bg-blueApp text-white font-medium rounded-lg
            text-center hover:bg-darkBlue transform transition-all duration-300
            hover:shadow-lg active:scale-[0.98]"
        >
          Inscribirme ahora
        </Link>

        <a
          href="https://api.whatsapp.com/send?phone=573005523872"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg
            text-center hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          Hablar con un asesor
        </a>

        {user?.rol === 'admin' && (
          <Link
            href={`/cursos/${course.slug}/inscritos`}
            className="block w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg
              text-center hover:bg-green-700 transition-all duration-300"
          >
            Ver inscritos
          </Link>
        )}
      </div>
    </div>
  )
}
