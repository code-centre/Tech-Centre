import useUserStore from '../../../../store/useUserStore';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import ButtonToEdit from '../ButtonToEdit'
import ContainerButtonsEdit from '../ContainerButtonsEdit'
import BannerPromotion from '@/components/slug/BannerPromotion'
import { formatDate } from '../../../../utils/formatDate'
import { getDownloadURL, ref as storageRef } from 'firebase/storage';
import { useDownloadURL } from 'react-firebase-hooks/storage'
import { useUploadFile } from "react-firebase-hooks/storage";
import { db, storage } from '../../../../firebase'
import { doc, updateDoc } from 'firebase/firestore'
import UploadHeroVideo from '../UploadHeroVideo'

interface Props {
  course: Program,
  newDetail: boolean,
  saveChanges: (propertyName: string, content: any, index?: number) => void
}

export default function Hero({ course, newDetail, saveChanges }: Props) {
  const [updateName, setUpdateName] = useState(false)
  const [videoPortada, setVideoPortada] = useState<string | undefined>("");
  const [contentName, setContentName] = useState<string | null>(null)
  const [updateSubtitle, setUpdateSubtitle] = useState(false)
  const [contentSubtitle, setContentSubtitle] = useState<string | null>(null)
  const [updateDate, setUpdateDate] = useState(false)
  const [contentDate, setContentDate] = useState<string | null>(null)
  const [contentStatus, setContentStatus] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState(false)
  const ref = storageRef(storage, `programs/${course.slug}/video-portada`);
  const [selectedFile, setSelectedFile] = useState<File>();

  const handleVideoUpload = (url: string) => {
    setVideoPortada(url);
  };

  // useEffect(() => {
  //   const upload = async () => {
  //     if (selectedFile) {
  //       const result = await uploadFile(ref, selectedFile, {
  //         contentType: selectedFile.type,
  //       });
  //       if (result) {
  //         const downloadURL = await getDownloadURL(result.ref);
  //         await updateDoc(doc(db, "programs", course.slug), {
  //           heroVideo: downloadURL,
  //         });
  //         handleVideoUpload(downloadURL);
  //         // showModal(
  //         //   "Imagen de portada actualizada",
  //         //   "La imagen de portada ha sido actualizada exitosamente");
  //         // ;
  //       }
  //     }
  //   };
  //   upload();
  // }, [selectedFile]);

  useEffect(() => {
    setContentName(course?.name)
    setContentSubtitle(course.subtitle)
    setContentStatus(course.status)
  }, [])

  const { user } = useUserStore() as { user: User };

  return (
    <div>
      {
        newDetail
          ? <>
            <section className="max-w-6xl mx-auto w-full bg-black text-zinc-200 overflow-hidden rounded-xl grid grid-cols-1 lg:grid-cols-[1.5fr_2fr] items-center relative p-4 md:p-10 gap-5 lg:h-[500px] shadow-lg border border-zinc-800">
              {
                user?.rol === 'admin' &&
                <div className='absolute top-10 right-5 z-10'>
                  {
                    updateStatus
                      ? <div className='flex gap-2'>
                        <select defaultValue={course.status} onChange={(e) => setContentStatus(e.target.value)} className='px-3 py-2 rounded-md border bg-zinc-900 text-zinc-200' name="" id="">
                          <option value="Borrador">Borrador</option>
                          <option value="Publicado">Publicado</option>
                        </select>
                        <ContainerButtonsEdit setFinishEdit={setUpdateStatus} onSave={() => {
                          setUpdateStatus(false)
                          saveChanges('status', contentStatus)
                        }} />
                      </div>
                      : <div className='flex gap-2 items-center'>
                        <p className="bg-green-600 text-white border px-2 py-1 text-sm rounded-md font-semibold">{course.status}</p>
                        <ButtonToEdit startEditing={setUpdateStatus} />
                      </div>
                  }
                </div>
              }
              <div className="flex flex-col gap-5 z-10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-4 w-fit -top-7 left-0 right-0 bg-zinc-800/60 px-4 py-2 rounded-lg">
                    <Image src="/calendar.png" width={25} height={25} alt="" />
                    <div className="flex flex-col gap-1">
                      <p className="leading-tight font-bold text-base text-zinc-100">
                        Inscripciones Abiertas
                      </p>
                      <p className="text-sm -mt-1 text-zinc-300">Inicio de clases:
                        {
                          updateDate ?
                            <div className='flex flex-col gap-4 mt-2'>
                              <input
                                onChange={(e) => {
                                  setContentDate(e.target.value)
                                }}
                                defaultValue={course.startDate}
                                className='px-2 rounded-md py-1 bg-zinc-900 text-zinc-200 border border-zinc-700' type="date" name="" id=""
                              />
                              <ContainerButtonsEdit
                                setFinishEdit={setUpdateDate}
                                onSave={() => {
                                  setUpdateDate(false)
                                  saveChanges('startDate', contentDate)
                                }}
                              />
                            </div>
                            : <span className='ml-2 capitalize'>{formatDate(course.startDate)}</span>
                        }
                      </p>
                    </div>
                  </div>
                  {
                    user?.rol === 'admin' && !updateDate &&
                    <ButtonToEdit startEditing={setUpdateDate} />
                  }
                </div>
                <div>
                  <p className="lg:text-4xl text-3xl font-semibold drop-shadow-md text-shadow text-zinc-100">
                    {course.type} en
                  </p>
                  {
                    updateName ?
                      <div className="flex flex-col gap-2 my-2">
                        <input onChange={(e) => setContentName(e.target.value)} defaultValue={course.name} className="border w-full p-2 text-4xl font-bold rounded-md bg-zinc-900 text-zinc-100" />
                        <ContainerButtonsEdit
                          setFinishEdit={setUpdateName}
                          onSave={() => {
                            setUpdateName(false)
                            saveChanges('name', contentName)
                          }} />
                      </div>
                      :
                      <div className="flex items-center gap-2">
                        <h1 className="lg:text-5xl text-3xl font-semibold max-w-lg leading- text-zinc-500">
                          {course.name}
                        </h1>
                        {
                          user?.rol === 'admin' &&
                          <ButtonToEdit startEditing={setUpdateName} />
                        }
                      </div>
                  }
                  {
                    updateSubtitle
                      ? <div className="flex flex-col gap-2 my-2">
                        <textarea onChange={(e) => setContentSubtitle(e.target.value)} defaultValue={course.subtitle} className="border w-full p-2 text-2xl font-bold rounded-md bg-zinc-900 text-zinc-100" />
                        <ContainerButtonsEdit setFinishEdit={setUpdateSubtitle} onSave={() => {
                          setUpdateSubtitle(false)
                          saveChanges('subtitle', contentSubtitle)
                        }} />
                      </div>
                      : <div className="flex items-center gap-2">
                        <h2 className="lg:text-3xl text-xl font-medium inline-block max-w-lg text-zinc-300">
                          {course.subtitle}
                        </h2>
                        {
                          user?.rol === 'admin' &&
                          <ButtonToEdit startEditing={setUpdateSubtitle} />
                        }
                      </div>
                  }
                </div>
              </div>
              <div className="relative justify-center">
                {
                  course.heroVideo || videoPortada ?
                    <div className="relative justify-center lg:flex lg:flex-row">
                      <video
                        loop
                        playsInline
                        src={videoPortada || course.heroVideo}
                        className='h-[250px] lg:h-[320px] rounded-md lg:rounded-2xl mask w-full object-cover border border-zinc-800'
                        controls
                        muted
                        autoPlay
                      />
                    </div>
                    :
                    <Image
                      src="/sunday-corona.png"
                      className="hidden lg:flex lg:flex-col object-cover mask w-[210px] lg:w-[310px] mx-auto border border-zinc-800"
                      alt="Sunday - asesora educativa"
                      width={250}
                      height={300}
                    />
                }
              </div>
            </section>
          </>
          : <>
            <section className="max-w-6xl mx-auto w-full bg-black text-zinc-200 overflow-hidden rounded-xl h-[350px] lg:h-[500px] flex items-center relative p-6 md:p-10 shadow-lg border border-zinc-800">
              <div>
                {course.slug === "desarrollo-web-con-enfasis-en-ia" ? (
                  <Image
                    src="/sunday-corona.png"
                    className="absolute bottom-0 -right-10 md:right-0 object-cover block w-[210px] lg:w-[310px] border border-zinc-800"
                    alt="Sunday - asesora educativa"
                    width={250}
                    height={300}
                  />
                ) : (
                  <Image
                    src="/him-corona.png"
                    className="absolute bottom-0 -right-10 md:right-10 object-cover block w-[230px] lg:w-[340px] border border-zinc-800"
                    alt="him - asesora educativa"
                    width={250}
                    height={300}
                  />
                )}
              </div>
              <div className="flex flex-col gap-8 z-10">
                <div className="flex items-center gap-4 w-fit -top-7 left-0 right-0 bg-zinc-800/60 px-4 py-2 rounded-lg">
                  <Image src="/calendar.png" width={25} height={25} alt="" />
                  <div>
                    <p className="leading-tight font-bold text-base text-zinc-100">
                      {course.startDate}
                    </p>
                    <p className="text-sm -mt-1 text-zinc-300">Inicio de clases: 3 de Febrero</p>
                  </div>
                </div>
                <div>
                  <p className="lg:text-4xl text-3xl font-medium drop-shadow-md text-shadow text-zinc-100">
                    {course.type} en
                  </p>
                  <p className="lg:text-6xl text-3xl font-semibold max-w-lg leading- text-blue-400">
                    {course.name}
                  </p>
                  <p className="lg:text-3xl text-xl font-medium inline-block max-w-lg text-zinc-300">
                    {course.subtitle}
                  </p>
                  <BannerPromotion />
                </div>
              </div>
            </section>
          </>
      }
    </div>
  )
}
