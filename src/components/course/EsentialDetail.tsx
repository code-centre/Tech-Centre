import useUserStore from '../../../store/useUserStore'
import React, { useState } from 'react'
import ButtonToEdit from './ButtonToEdit'
import Editor from '../Editor'
import HTMLReactParser from 'html-react-parser/lib/index'
import Benefits from './sections/Benefits'
import SpecificInfo from './sections/SpecificInfo'
import Faqs from './sections/Faqs'
import Syllabus from './sections/Syllabus'
import Schedules from './sections/Schedules'
import { GraduationCap, CalendarClock, Network, Clock } from 'lucide-react';
import ContainerButtonsEdit from './ContainerButtonsEdit'

interface Props {
  course: Program,
  newDetail: boolean,
  saveChanges: (propertyName: string, content: any, index?: number) => void
}

export default function EsentialDetail({ course, newDetail, saveChanges }: Props) {
  const [updateDetails, setUpdateDetails] = useState(false)
  const [updateLearns, setUpdateLearns] = useState<number | null>(null)
  const [updateProfile, setUpdateProfile] = useState<number | null>(null)
  const [contentUpdateDetails, setContentUpdateDetails] = useState(course.description)
  const [contentLearns, setContentLearns] = useState(course.learns)
  const [contentProfile, setContentProfile] = useState(course.profile)
  const { user } = useUserStore()

  const addLearns = () => {
    setContentLearns(contentLearns ? [...contentLearns, ""] : [""]);
  }
  const deleteLearns = (index: number) => {
    const updatedLearns = contentLearns.filter((_, i) => i !== index);
    setContentLearns(updatedLearns);
  }

  
  return (
    <div className="bg-background backdrop-blur-sm overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="flex gap-12 mb-16">
          {/* Main Content */}
          <div className="space-y-8">
            <div className="bg-bgCard backdrop-blur-sm p-8 rounded-2xl border border-blue-100/20 shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                    <GraduationCap className="w-6 h-6 text-blueApp" />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Tipo de curso</span>
                  <span className="text-xs text-white font-semibold">{course.type}</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                    <CalendarClock className="w-6 h-6 text-blueApp" />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Duración</span>
                  <span className="text-xs text-white font-semibold">{course.duration}</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                    <Network className="w-6 h-6 text-blueApp" />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Dificultad</span>
                  <span className="text-xs text-white font-semibold">{course.level}</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-zinc-600 rounded-xl border border-blue-100/30 hover:bg-blue-50/70 transition-all duration-300">
                  <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-blueApp" />
                  </div>
                  <span className="text-sm font-medium text-white mb-1">Dedicación</span>
                  <span className="text-xs text-white font-semibold">{course.hours || 'Por definir'}</span>
                </div>
              </div>
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
                  {user?.rol === 'admin' && (
                    <ButtonToEdit startEditing={setUpdateDetails} />
                  )}
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
            {contentLearns && (
              <>
                {contentLearns.map((item: any, i: number) => (
                  <div key={i} className="mt-5 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    {updateLearns === i ? (
                      <div className="flex flex-col gap-4 bg-gray-50/50 p-4 rounded-lg border border-grayApp">
                        <input
                          className="w-full px-4 py-3 font-medium text-gray-800 bg-white border border-grayApp rounded-lg
                                    focus:outline-none focus:ring-2 focus:ring-blueApp/20 focus:border-blueApp
                                    transition-all duration-200"
                          type="text"
                          placeholder="Escribe el aprendizaje..."
                          defaultValue={item}
                          onChange={(e) => setContentLearns(prevOptions => {
                            const newOptions = [...prevOptions];
                            newOptions[i] = e.target.value;
                            return newOptions;
                          })}
                        />
                        <ContainerButtonsEdit
                          setFinishEdit={() => setUpdateLearns(null)}
                          onSave={() => {
                            saveChanges('learns', contentLearns);
                            setUpdateLearns(null)
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-start justify-between space-x-3 bg-zinc-600 backdrop-blur-sm 
                    p-4 rounded-lg border border-blue-100/10 hover:bg-white/70 transition-all duration-300">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blueApp/90 
                        flex items-center justify-center mt-1">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-white">{item}</p>
                        </div>
                        <div className="flex space-x-2">
                          {user?.rol === 'admin' && (
                            <>
                              <button
                                className="text-blueApp hover:text-blue-700"
                                onClick={() => setUpdateLearns(i)}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                  deleteLearns(i);
                                  saveChanges('learns', contentLearns.filter((_, index) => index !== i));
                                }}>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
                }
              </>
            )}
            {user?.rol === 'admin' && (
              <div className='flex justify-center w-full bg-blueApp hover:bg-blue-600 hover:scale-105 transition-all duration-200 backdrop-blur-sm rounded-lg p-2 mt-4'>
                <button className='text-white hover:underline mt-2'
                  onClick={() => {
                    addLearns();
                    saveChanges('learns', [...contentLearns, ""]);
                  }}>
                  Añadir nuevo aprendizaje
                </button>
              </div>
            )}
          </section>

          {/* Target Audience with glassmorphism */}
          <section className="bg-bgCard backdrop-blur-sm p-8 rounded-2xl border border-blue-100/20 shadow-lg" id='para-quien' >
            <h2 className="text-2xl font-bold text-white mb-6">
              ¿Para quién es este {course.type.toLowerCase()}?
            </h2>
            {contentProfile.map((profile, index) => (
              updateProfile === index ? (
                <div key={index} className="flex flex-col gap-4 bg-gray-50/50 p-4 rounded-lg border border-grayApp">
                  <input
                    className="w-full px-4 py-3 font-medium text-gray-800 bg-white border border-grayApp rounded-lg
                                    focus:outline-none focus:ring-2 focus:ring-blueApp/20 focus:border-blueApp
                                    transition-all duration-200"
                    type="text"
                    placeholder="Escribe el perfil..."
                    defaultValue={profile}
                    onChange={(e) => setContentProfile(prevOptions => {
                      const newOptions = [...prevOptions];
                      newOptions[index] = e.target.value;
                      return newOptions;
                    })}
                  />
                  <ContainerButtonsEdit
                    setFinishEdit={() => setUpdateProfile(null)}
                    onSave={() => {
                      saveChanges('profile', contentProfile);
                      setUpdateProfile(null)
                    }}
                  />
                </div>
              ) : (
                <div key={index} className="flex items-start space-x-3 bg-zinc-600 backdrop-blur-sm 
                  p-4 rounded-lg border border-blue-100/10 hover:bg-white/70 transition-all duration-300">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blueApp/90 
                    flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white">{profile}</p>
                  {user?.rol === 'admin' && (
                    <button
                      className="text-blueApp hover:text-blue-700 ml-auto"
                      onClick={() => setUpdateProfile(index)}>
                      Editar
                    </button>
                  )}
                </div>
              )
            ))}
          </section>

          {/* Syllabus and FAQs maintain their own styling through their components */}
          <div id='programa'>
            <Syllabus saveChanges={saveChanges} course={course} />
          </div>
          <div id='horarios'>
            <Schedules data={course} saveChanges={saveChanges} />
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
