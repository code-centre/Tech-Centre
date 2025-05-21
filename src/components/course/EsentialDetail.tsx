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
    <>
      {
        newDetail
          ? <>
            <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[3fr_1.5fr] gap-10 px-5 w-full">
              <div className="flex flex-col gap-2  order-2 lg:order-1 w-full">

                <div className="flex gap-2 items-center">
                  <h2 className="text-3xl font-bold">Detalles del {course.type === 'Curso corto' ? 'curso' : 'diplomado'}</h2>
                  {
                    user?.rol === 'admin' &&
                    <ButtonToEdit startEditing={setUpdateDetails} />
                  }
                </div>

                {
                  updateDetails
                    ? <div className="flex flex-col gap-2 my-2 w-full">
                      <Editor
                        value={contentUpdateDetails}
                        onChange={(content: string) => setContentUpdateDetails(content)}
                        onSave={() => {
                          // saveChanges("description", editorContent.description)
                          setUpdateDetails(false)
                          saveChanges('description', contentUpdateDetails)
                        }}
                        onCancel={() => {
                          setUpdateDetails(false)
                          // handleEditorChange(eventData?.description || "", "description")
                        }}
                      />
                    </div>
                    : <p className="text-base text-white">
                      {HTMLReactParser(contentUpdateDetails)}
                    </p>
                }

                {
                  course.name === "Inteligencia Artificial para Negocios" && <p className="text-base text-[#5D5A6F] mt-5">⭐ Incluye certificado y guia de promts</p>
                }
              </div>

              <div className=" order-1 lg:order-2">
                <SpecificInfo saveChanges={saveChanges} course={course} />
              </div>


            </section>
            <div className="max-w-6xl h-1 border-b mx-auto border-dashed w-full"></div>

            <section className="max-w-6xl mx-auto w-full bg-black text-zinc-200 rounded-xl py-10 my-8">
              <SwiperComponent />
            </section>
            <Syllabus saveChanges={saveChanges} course={course} />
            <Benefits saveChanges={saveChanges} course={course} />
            <Faqs saveChanges={saveChanges} course={course} />
          </>
          : <>
            <section className=" max-w-6xl mx-auto w-full flex flex-col-reverse md:grid md:grid-cols-7 gap-14 md:gap-5">
              <div className="flex flex-col gap-10 md:col-span-5">
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold">Detalles del {course.type === 'Curso corto' ? 'curso' : 'diplomado'}</h2>
                  <p className="text-base text-[#5D5A6F]">
                    {course.description}
                  </p>
                  {
                    course.name === "Inteligencia Artificial para Negocios" && <p className="text-base text-[#5D5A6F] mt-5">⭐ Incluye certificado y guia de promts</p>
                  }
                </div>
                {course?.certificationDescription && (
                  <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Certificación</h2>
                    <p className="text-base text-[#5D5A6F]">
                      {course?.certificationDescription}
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold">
                    ¿Para quién está dirigido este {course.type === 'Curso corto' ? 'curso' : 'diplomado'}?
                  </h2>
                  <ul className="list-disc marker:text-[#00A1F9]  pl-5 flex flex-col gap-2 mt-2">
                    {course.profile.map((profile: any, i: number) => (
                      <li key={i}>{profile}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold">
                    ¿Cuáles son los beneficios de tomar este {course.type === 'Curso corto' ? 'curso' : 'diplomado'}?
                  </h2>
                  <ul className="list-disc marker:text-[#00A1F9]  pl-5 flex flex-col gap-2 mt-2">
                    {course.benefits.map((benefit: any, i: number) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                <Syllabus saveChanges={saveChanges} course={course} />
                <Faqs saveChanges={saveChanges} course={course} />
              </div>
              <SpecificInfo saveChanges={saveChanges} course={course} />
            </section>
          </>
      }
    </>
  )
}
