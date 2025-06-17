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
import { GraduationCap, CalendarClock, Network, Clock  } from 'lucide-react';

interface Props {
  course: Program,
  newDetail: boolean,
  saveChanges: (propertyName: string, content: any, index?: number) => void
}

export default function EsentialDetail({ course, newDetail, saveChanges }: Props) {
  const [updateDetails, setUpdateDetails] = useState(false)
  const [contentUpdateDetails, setContentUpdateDetails] = useState(course.description)
  const { user } = useUserStore()
  console.log(user);
  

  return (
    <div className="bg-background backdrop-blur-sm">
      <div className="max-w-7xl mx-10 px-4 py-12">
        {/* Hero Section */}
        <div className="flex gap-12 mb-16">
          {/* Main Content */}
          <div className="space-y-8">           
             <div className="bg-bgCard backdrop-blur-sm p-8 rounded-2xl border border-blue-100/20 shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                    <GraduationCap className="w-6 h-6 text-blueApp"/>
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Tipo de curso</span>
                  <span className="text-xs text-white font-semibold">{course.type}</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                    <CalendarClock className="w-6 h-6 text-blueApp"/>
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Duración</span>
                  <span className="text-xs text-white font-semibold">{course.duration}</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                    <Network className="w-6 h-6 text-blueApp"/>
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Dificultad</span>
                  <span className="text-xs text-white font-semibold">{course.level}</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-blueApp"/>
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Dedicación</span>
                  <span className="text-xs text-white font-semibold">{course.hours || 'Por definir'}</span>
                </div>
              </div>
              {user?.rol === 'admin' && (
                <ButtonToEdit startEditing={setUpdateDetails} />
              )}
            </div>

            {/* Description with glassmorphism */}
            <div className="prose max-w-none bg-bgCard backdrop-blur-sm p-6 rounded-xl 
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
                <div className="text-lg text-white leading-relaxed">
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

        </div>

        {/* Course Content Sections */}
        <div className="space-y-16" id='aprenderas'>
          {/* Learning Path Section with glassmorphism */}
          <section className="bg-bgCard backdrop-blur-sm 
            rounded-2xl p-8 border border-blue-100/20 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">
              Lo que aprenderás
            </h2>
            <div className="grid md:grid-cols-1 gap-4">
              {course.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 bg-zinc-600 backdrop-blur-sm 
                  p-4 rounded-lg border border-blue-100/10 hover:bg-white/70 transition-all duration-300">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blueApp/90 
                    flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white">{benefit}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Target Audience with glassmorphism */}
          <section className="bg-bgCard backdrop-blur-sm p-8 rounded-2xl border border-blue-100/20 shadow-lg" id='para-quien'>
            <h2 className="text-2xl font-bold text-white mb-6">
              ¿Para quién es este {course.type.toLowerCase()}?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {course.profile.map((profile, index) => (
                <div key={index} className="flex items-start space-x-3 bg-zinc-600 backdrop-blur-sm 
                  p-4 rounded-lg border border-blue-200/20 hover:bg-blue-50/70 transition-all duration-300">
                  <div className="flex-shrink-0 w-6 h-6 text-blueApp">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-white">{profile}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Syllabus and FAQs maintain their own styling through their components */}
          <div id='programa'>
            <Syllabus saveChanges={saveChanges} course={course} />
          </div>
          <div className="flex justify-center" id='precios'>
            <SpecificInfo saveChanges={saveChanges} course={course} />
          </div>
          <div id='beneficios'>
            <Benefits saveChanges={saveChanges} course={course} />
          </div>
          <div id='preguntas'>
            <Faqs saveChanges={saveChanges} course={course} />
          </div>
        </div>
      </div>
    </div>
  )
}
