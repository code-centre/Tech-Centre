import useUserStore from '../../../store/useUserStore'
import React, { useState } from 'react'
import ButtonToEdit from './ButtonToEdit'
import Editor from '../Editor'
import HTMLReactParser from 'html-react-parser/lib/index'
import Benefits from './sections/Benefits'
import SpecificInfo from './sections/SpecificInfo'
import Faqs from './sections/Faqs'
import Syllabus from './sections/Syllabus'
import SwiperComponent from './SwiperComponent'

interface Props {
  course: Program,
  newDetail: boolean,
  saveChanges: (propertyName: string, content: any, index?: number) => void
}

export default function EsentialDetail({ course, newDetail, saveChanges }: Props) {
  const [updateDetails, setUpdateDetails] = useState(false)
  const [contentUpdateDetails, setContentUpdateDetails] = useState(course.description)
  const { user } = useUserStore()

  return (
    <div className="bg-white/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12 mb-16">
          {/* Main Content */}
          <div className="space-y-8">
            <div className="space-y-4 bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-blue-100/20 shadow-lg">
              <h1 className="text-4xl font-bold text-gray-900">
                {course.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-blueApp/10 text-blueApp font-medium
                  backdrop-blur-sm border border-blueApp/20">
                  {course.type}
                </span>
                <span className="text-gray-600">
                  {course.duration} horas
                </span>
              </div>
              {user?.rol === 'admin' && (
                <ButtonToEdit startEditing={setUpdateDetails} />
              )}
            </div>

            {/* Description with glassmorphism */}
            <div className="prose max-w-none bg-white/90 backdrop-blur-sm p-6 rounded-xl 
              border border-blue-100/20 shadow-lg">
              {updateDetails ? (
                <Editor
                  value={contentUpdateDetails}
                  onChange={setContentUpdateDetails}
                  onSave={() => {
                    setUpdateDetails(false)
                    saveChanges('description', contentUpdateDetails)
                  }}
                  onCancel={() => setUpdateDetails(false)}
                />
              ) : (
                <div className="text-lg text-gray-600 leading-relaxed">
                  {HTMLReactParser(contentUpdateDetails)}
                </div>
              )}
            </div>

            {/* Special Badge with glassmorphism */}
            {course.name === "Inteligencia Artificial para Negocios" && (
              <div className="flex items-center space-x-2 p-4 bg-blueApp/10 backdrop-blur-sm 
                rounded-lg border border-blueApp/20 text-blueApp shadow-lg">
                <span className="text-2xl">⭐</span>
                <p className="font-medium">
                  Incluye certificado y guía de prompts
                </p>
              </div>
            )}
          </div>

          {/* Course Info Card with sticky positioning */}
          <div className="lg:sticky lg:top-24 h-fit">
            <SpecificInfo saveChanges={saveChanges} course={course} />
          </div>
        </div>

        {/* Course Content Sections */}
        <div className="space-y-16">
          {/* Learning Path Section with glassmorphism */}
          <section className="bg-gradient-to-br from-white/80 to-lightBlue/30 backdrop-blur-sm 
            rounded-2xl p-8 border border-blue-100/20 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Lo que aprenderás
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {course.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 bg-white/50 backdrop-blur-sm 
                  p-4 rounded-lg border border-blue-100/10 hover:bg-white/70 transition-all duration-300">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blueApp/90 
                    flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Target Audience with glassmorphism */}
          <section className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-blue-100/20 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ¿Para quién es este {course.type.toLowerCase()}?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {course.profile.map((profile, index) => (
                <div key={index} className="flex items-start space-x-3 bg-blue-50/50 backdrop-blur-sm 
                  p-4 rounded-lg border border-blue-200/20 hover:bg-blue-50/70 transition-all duration-300">
                  <div className="flex-shrink-0 w-6 h-6 text-blueApp">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-700">{profile}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Syllabus and FAQs maintain their own styling through their components */}
          <Syllabus saveChanges={saveChanges} course={course} />
          <Faqs saveChanges={saveChanges} course={course} />
        </div>
      </div>
    </div>
  )
}
