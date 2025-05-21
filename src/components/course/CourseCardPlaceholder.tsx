import React from 'react'

interface Props {
  styles?: string

}

export default function CourseCardPlaceholder({ styles }: Props) {
  return (
    <div className={`w-full md:w-[320px] xl:w-[360px] bg-white rounded-lg border overflow-hidden animate-pulse mx-auto ${styles}`}>
      <div className="bg-gray-300 h-48 w-full"></div>
      <div className="p-4">
        <div className="flex justify-between items-center text-sm text-gray-300 mb-2">
          <div className="bg-gray-300 h-6 w-24 rounded-md"></div>
          <div className="bg-gray-300 h-6 w-32 rounded-md"></div>
        </div>
        <div className="bg-gray-300 h-8 w-full rounded-md mb-4"></div>
        <div className="bg-gray-300 h-6 w-full rounded-md mb-2"></div>
        <div className="bg-gray-300 h-6 w-3/4 rounded-md mb-4"></div>
        <div className="flex justify-between items-center mt-4">
          <div className="bg-gray-300 h-6 w-20 rounded-md"></div>
          <div className="bg-gray-300 h-6 w-24 rounded-md"></div>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 text-center">
        <div className="bg-gray-300 h-10 w-full rounded-md"></div>
      </div>
    </div>
  )
}
