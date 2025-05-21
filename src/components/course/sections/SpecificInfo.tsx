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
    <div className="flex flex-col gap-3 md:col-span-2 w-full font-medium bg-black text-zinc-200 rounded-xl p-6 border border-zinc-800 shadow-lg">
      <div className="flex justify-between">
        <p className="text-zinc-400">Modalidad</p>
        <p className="font-semibold">Presencial</p>
      </div>
      <div className="flex justify-between">
        <p className={`text-zinc-400 ${updateDuration && 'text-xs'}`}>Duración</p>
        {
          updateDuration
            ? <div className='flex flex-col gap-2'>
              <input onChange={(e) => setContentDuration(e.target.value)} className="border border-zinc-700 bg-zinc-900 text-zinc-200 px-2 py-1 ml-10 rounded-md" defaultValue={course.duration}></input>
              <ContainerButtonsEdit
                setFinishEdit={setUpdateDuration}
                onSave={() => {

                  setUpdateDuration(false)
                  saveChanges('duration', contentDuration)
                }} />
            </div>
            : <div className='flex gap-2 items-center'>
              <p className="font-semibold">{course.duration}</p>
              {
                user?.rol === 'admin' &&
                <ButtonToEdit startEditing={setUpdateDuration} />
              }
            </div>
        }
      </div>
      <div className="flex justify-between">
        <p className={`text-zinc-400 ${updateHours && 'text-xs'}`}>Intensidad horaria</p>
        {
          updateHours
            ? <div className='flex flex-col gap-2'>
              <input onChange={(e) => setContentHours(e.target.value)} className="border border-zinc-700 bg-zinc-900 text-zinc-200 px-2 py-1 ml-10 rounded-md" defaultValue={course.hours}></input>
              <ContainerButtonsEdit
                setFinishEdit={setUpdateHours}
                onSave={() => {
                  setUpdateHours(false)
                  saveChanges('hours', contentHours)
                }} />
            </div>
            : <div className='flex gap-2 items-center'>
              <p className="font-semibold">{course.hours}</p>
              {
                user?.rol === 'admin' &&
                < ButtonToEdit startEditing={setUpdateHours} />
              }
            </div>
        }
      </div>
      <div className="flex justify-between">
        <p className="text-zinc-400">Nivel</p>

        {
          updateLevel
            ? <div className="flex flex-col gap-2">
              <select defaultValue={contentLevel} onChange={(e) => setContentLevel(e.target.value as LevelProgram)} className="border border-[#00A1F9] rounded-md p-1 text-black">
                <option value="Introducción">Introducción</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Experto">Experto</option>
              </select>
              <ContainerButtonsEdit
                setFinishEdit={setUpdateLevel}
                onSave={() => {
                  setUpdateLevel(false)
                  saveChanges('level', contentLevel)
                }} />
            </div>
            : <div className="flex gap-2 items-center">
              <p className="font-semibold">{course?.level}</p>
              {
                user?.rol === 'admin' &&
                <ButtonToEdit startEditing={setUpdateLevel} />
              }
            </div>
        }
      </div>
      <div className="flex justify-between">
        <p className="text-zinc-400">Profesores</p>

        <div className="flex flex-col gap-2 items-center">
          {
            teachers.map((teacher: any, i: number) => (
              <div key={i} className="gap-2 items-center justify-between w-full">
                {
                  updateTeacherIndex === i
                    ? <div className="flex flex-col gap-2">
                      <input onChange={(e) => setTeachers(prevOptions => {
                        const newOptions = [...prevOptions];
                        newOptions[i] = e.target.value;
                        return newOptions;
                      })} defaultValue={teacher} type="text" className="border border-zinc-700 bg-zinc-900 text-zinc-200 px-2 py-1 ml-10 rounded-md" />
                      {user?.rol === 'admin' &&
                        <button onClick={addTeacher} className='bg-blue-600 px-5 font-semibold rounded-md ml-auto py-1 text-white w-fit'>Agregar</button>
                      }
                      <ContainerButtonsEdit
                        setFinishEdit={setUpdateTeacherIndex}
                        onSave={() => {
                          setUpdateTeacherIndex(false)
                          saveChanges('teacher', teachers)
                        }}
                      />
                    </div>
                    : <div className='flex justify-between gap-2 items-center'>
                      <p className="font-semibold underline text-right">
                        {teacher}
                      </p>
                      {
                        user?.rol === 'admin' &&
                        <ButtonToEdit startEditing={() => setUpdateTeacherIndex(i)} />
                      }
                    </div>
                }
              </div>
            ))
          }
        </div>


      </div>
      <div className="flex justify-between">
        <p className="text-zinc-400">Días de clase</p>
        <div className="flex flex-col gap-2">
          {
            schedule.map((item, i) => (
              <>
                {
                  updateDayIndex === i
                    ? <div className="flex flex-col gap-2 items-center">
                      <input onChange={(e) => setSchedule(prevOptions => {
                        const newOptions = [...prevOptions];
                        newOptions[i].day = e.target.value;
                        return newOptions;
                      })} defaultValue={item.day} type="text" className="border border-zinc-700 bg-zinc-900 text-zinc-200 px-2 py-1 ml-10 rounded-md" />
                      {user?.rol === 'admin' &&
                        <button onClick={addDaySchedule} className='bg-blue-600 px-5 font-semibold rounded-md ml-auto py-1 text-white w-fit'>Agregar</button>
                      }
                      <ContainerButtonsEdit
                        setFinishEdit={setUpdateDayIndex}
                        onSave={() => {
                          setUpdateDayIndex(false);
                          setUpdateTimeIndex(false);
                          saveChanges('schedule', schedule)
                        }}
                      />
                    </div>
                    : <div className='flex gap-2 justify-end'>
                      <p className="">
                        {item.day}
                      </p>
                      {
                        user?.rol === 'admin' &&
                        <ButtonToEdit startEditing={() => setUpdateDayIndex(i)} />
                      }
                    </div>
                }
              </>
            ))
          }
        </div>
      </div>
      <div className="flex justify-between">
        <p className="text-zinc-400">Horario</p>

        <div className="flex flex-col gap-2">
          {
            schedule.map((item, i) => (
              <>
                {
                  updateTimeIndex === i
                    ? <div className="flex flex-col gap-2 items-center">
                      <input onChange={(e) => setSchedule(prevOptions => {
                        const newOptions = [...prevOptions];
                        newOptions[i].time = e.target.value;
                        return newOptions;
                      })} defaultValue={item.time} type="text" className="border border-zinc-700 bg-zinc-900 text-zinc-200 px-2 py-1 ml-10 rounded-md" />
                      {user?.rol === 'admin' &&
                        <button onClick={addDaySchedule} className='bg-blue-600 px-5 font-semibold rounded-md ml-auto py-1 text-white w-fit'>Agregar</button>
                      }
                      <ContainerButtonsEdit
                        setFinishEdit={setUpdateTimeIndex}
                        onSave={() => {
                          setUpdateDayIndex(false);
                          setUpdateTimeIndex(false);
                          saveChanges('schedule', schedule)
                        }}
                      />
                    </div>
                    : <div className='flex gap-2 justify-end'>
                      <p className="">
                        {item.time}
                      </p>
                      {
                        user?.rol === 'admin' &&
                        <ButtonToEdit startEditing={() => setUpdateTimeIndex(i)} />
                      }
                    </div>
                }
              </>
            ))
          }
        </div>
      </div>
      <div className="flex justify-between">
        <p className={`text-zinc-400 ${updatePrice && 'text-sm'}`}>Precio regular</p>
        {
          updatePrice
            ? <div className="flex flex-col gap-2">
              <input
                onChange={(e) =>
                  setContentPrice(Number(e.target.value))
                }
                defaultValue={contentPrice}
                type="text"
                className="border border-zinc-700 bg-zinc-900 text-blue-400 font-semibold px-2 py-1 ml-10 rounded-md" />
              <ContainerButtonsEdit
                setFinishEdit={setUpdatePrice}
                onSave={() => {
                  setUpdatePrice(false)
                  saveChanges('price', contentPrice)
                }} />
            </div>
            : <div className="flex gap-2 items-center">
              <p className="font-semibold text-blue-400">
                ${Number(course.price)?.toLocaleString()}
              </p>
              {
                user?.rol === 'admin' &&
                <ButtonToEdit startEditing={setUpdatePrice} />
              }
            </div>
        }
      </div>
      {
        course.discount &&
        <div className="flex justify-between">
          <p className="text-zinc-400">Precio oferta</p>
          {
            updateDiscount
              ? <div className="flex flex-col gap-2">
                <input
                  onChange={(e) => setContentDiscount(Number(e.target.value))}
                  defaultValue={contentDiscount ? contentDiscount : 'Sin valor'}
                  type="text"
                  className="border border-zinc-700 bg-zinc-900 text-blue-400 px-2 py-1 ml-10 rounded-md"
                />
                <ContainerButtonsEdit
                  setFinishEdit={setUpdateDiscount}
                  onSave={() => {
                    setUpdateDiscount(false)
                    saveChanges('discount', contentDiscount)
                  }}
                />
              </div>
              : <div className="flex gap-2 items-center">
                <p className="text-blue-400">
                  ${Number(course.discount)?.toLocaleString()}
                </p>
                {
                  user?.rol === 'admin' &&
                  <ButtonToEdit startEditing={setUpdateDiscount} />
                }
              </div>
          }
        </div>
      }
      <Link
        href={`/checkout?slug=${course.slug}&program=${true}`}
        className="bg-blue-600 mt-2 text-center cursor-pointer text-white py-2 rounded-md block hover:bg-blue-700 transition-colors"
      >
        Inscribirme
      </Link>
      <a
        className="bg-zinc-800 mt-2 text-center cursor-pointer text-zinc-200 py-2 rounded-md block hover:bg-zinc-700 transition-colors"
        href="https://api.whatsapp.com/send?phone=573005523872"
        target="_blank"
      >
        Conoce a tu asesor académico
      </a>
      {
        user?.rol === 'admin' &&
        <Link
          href={`/cursos/${course.slug}/inscritos`}
          className="bg-green-600 mt-2 text-center cursor-pointer text-white py-2 rounded-md block hover:bg-green-800 transition-colors"
        >
          Ver inscritos
        </Link>
      }
    </div>
  )
}
