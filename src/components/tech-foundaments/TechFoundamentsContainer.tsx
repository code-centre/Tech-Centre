'use client'
import React from 'react'
import { Hero } from './Hero'
import { useState, useEffect } from 'react'
import { Description } from './Description'
import { Tickets } from './Tickets'
import { Professor } from './Professor'
import { useCollection } from 'react-firebase-hooks/firestore'
import { db } from '../../../firebase'
import { where, collection, query, getDocs } from 'firebase/firestore'
import LocationContainer from './LocationContainer'
import Details from './Details'

interface Ticket {
  title: string
  price: number
  benefits: string[]
  type: string
  description: string
}

interface EventFCA {
  id: string
  title: string
  subtitle: string
  description: string
  date: string | number | Date
  heroImage: string
  location?: any
  tickets: Ticket[]
  [key: string]: any
}

interface Props {
  slug: string
}

export default function TechFoundamentsContainer({ slug }: Props) {
  const [techs, setTechs] = useState<EventFCA[]>([])
  const [teacher, setTeacher] = useState<any[]>([])
  const [profesorData, setProfesorData] = useState<any[]>([])
  const eventsQuery = query(collection(db, "events"),
    where("type", "==", "taller"),
    where("status", "==", "published"),
    where("slug", "==", slug))
  const [value, loading, error] = useCollection(eventsQuery)

  useEffect(() => {
    if (value) {
      const data = value.docs.map((doc) => {
        const docData = doc.data()
        const tickets = (docData.tickets || []).map((ticket: any) => ({
          title: ticket.title ?? '',
          price: ticket.price ?? 0,
          benefits: ticket.benefits ?? [],
          type: ticket.type ?? '',
          description: ticket.description ?? '',
        }))
        return {
          ...docData,
          id: doc.id,
          tickets,
        }
      }) as EventFCA[]
      setTechs(data)
    }
  }, [value, slug])

  useEffect(() => {
    if (techs.length > 0) {
      const fetchSpeakers = async () => {
        const speakersRef = collection(db, "events", techs[0].id, "speakers")
        const speakersSnap = await getDocs(speakersRef)
        const speakersData = speakersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setTeacher(speakersData)
      }
      fetchSpeakers()
    }
  }, [techs])

  // Nuevo useEffect para buscar los datos completos de los speakers
  useEffect(() => {
    const fetchSpeakerDetails = async () => {
      if (teacher.length > 0) {
        // Buscar todos los speakers cuyo id esté en teacher[].speakerId
        const speakerIds = teacher.map(t => t.speakerId).filter(Boolean)
        if (speakerIds.length === 0) return setProfesorData([])
        // Firestore permite hasta 10 elementos en 'in'
        const chunks = []
        for (let i = 0; i < speakerIds.length; i += 10) {
          chunks.push(speakerIds.slice(i, i + 10))
        }
        let allSpeakers: any[] = []
        for (const chunk of chunks) {
          const q = query(collection(db, "speakers"), where("id", "in", chunk))
          const snap = await getDocs(q)
          allSpeakers = allSpeakers.concat(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        }
        setProfesorData(allSpeakers)
      } else {
        setProfesorData([])
      }
    }
    fetchSpeakerDetails()
  }, [teacher])

  //   const [profesor, profesorLoading, profesorError ] = useCollection(
  //   query(collection(db, "speakers"), where("id", "==", teacher[0]?.speakerId))
  // )
  // // useEffect(() => {
  // //   if (profesor) {
  // //     const data = profesor.docs.map((doc) => {
  // //       const docData = doc.data()
  // //       return {
  // //         ...docData,
  // //         id: doc.id,
  // //       }
  // //     }) as any[]
  // //     setProfesorData(data)
  // //   }
  // // }, [profesor])

  console.log('teacher', teacher);
  console.log('profesorData', profesorData);

  const description = techs.length > 0 ? techs[0].description : '';

  return (
    <div className="bg-gradient-to-b from-black via-zinc-900 to-black text-white min-h-screen w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Hero date={techs.length > 0 ? String(techs[0].date) : ''} title={techs.length > 0 ? techs[0].title : ''} subtitle={techs.length > 0 ? techs[0].subtitle : ''} heroImage={techs.length > 0 ? techs[0].heroImage : ''} />
        <Description description={description} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">
          <div className="lg:col-span-2 flex flex-col gap-8">
            {techs.length > 0 && techs[0].location && (
              <LocationContainer location={techs[0].location} />
            )}
            <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 p-8">
              <Details details={techs[0]?.details}/>
            </div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 p-8">
              <Professor speakers={profesorData} />
            </div>
            <div className="bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800 p-8">
              <Tickets tickets={techs[0]?.tickets || []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
