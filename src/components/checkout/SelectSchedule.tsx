import { Plus, X } from 'lucide-react'
import React from 'react'

interface Props {
  data: Program
  selectedSchedule: string | null
  setSelectedSchedule: (value: string | null) => void
}

export default function SelectSchedule({ data, selectedSchedule, setSelectedSchedule }: Props ) {
  console.log(data, 'data select schedule');
  
  return (
    <section className='flex flex-col gap-1'>
      {
        selectedSchedule
          ? <p className='text-blueApp font-semibold flex flex-col md:flex-row gap-2 md:items-center'>
            <span className='font-normal text-white'>Horario seleccionado:</span>
            {selectedSchedule}
            <button onClick={() => setSelectedSchedule(null)} className='rounded-md border-2 border-red-500 w-fit hover:bg-red-500 transition-colors group'>
              <X className='text-red-500  w-4 h-4 group-hover:text-white transition-colors' />
            </button>
          </p>
          : <>
            <p className='font-semibold'>Horarios disponibles</p>
            {
              data.schedule.map((item: ScheduleProgram, i: number) => (
                <div key={i} className='flex items-center justify-between '>
                  <p className=''><span className='text-blueApp font-semibold'>{item.time} | </span>{item.day}</p>
                  <button onClick={() => setSelectedSchedule(`${item.time} | ${item.day}`)} className='border-2 border-blueApp hover:bg-blueApp group transition-colors rounded-md'>
                    <Plus className='text-blueApp w-5 h-5 group-hover:text-white transition-colors' />
                  </button>
                </div>
              ))
            }
          </>
      }
    </section>
  )
}
