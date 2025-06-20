'use client'
import { db } from '../../../firebase'
import useUserStore from '../../../store/useUserStore';
import { formatDate } from '../../../utils/formatDate';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useCollection } from 'react-firebase-hooks/firestore';
import { CourseCard } from '../CoursesCard';
import CourseCardPlaceholder from '../course/CourseCardPlaceholder';


export default function ProfileEvents() {
  const { user } = useUserStore()
  const [events, setEvents] = useState<EventFCA[] | []>([])
  const [visibleCount, setVisibleCount] = useState(3)
  const [pastEvents, setPastEvents] = useState<EventFCA[] | []>([])
  const [futureEvents, setFutureEvents] = useState<EventFCA[] | []>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  const obtenerAsistenciasPorUsuario = async () => {
    const q = query(collection(db, "eventAtendees"), where("userId", "==", user?.id));
    const querySnapshot = await getDocs(q);

    const asistencias = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return asistencias;
  }

  const obtenerEventosPorIds = async (eventIds: string[]) => {
    if (eventIds.length === 0) return []; // Si no hay eventos, devolver vacío
    if (eventIds.length > 10) {
      console.warn("Firestore solo permite 10 elementos en un 'in' query.");
      return [];
    }
    
    const q = query(collection(db, "events"), where("slug", "in", eventIds), where("type", "==", "curso especializado"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as EventFCA[];
  }

  useEffect(() => {
    const get = async () => {
      const asistencias = (await obtenerAsistenciasPorUsuario()).map((item: any) => item.eventId)

      const eventos = await obtenerEventosPorIds(asistencias)
      const now = new Date()
      setEvents(eventos);

      setPastEvents(eventos.filter((event) => new Date(event.date) < now))
      setFutureEvents(eventos.filter((event) => new Date(event.date) > now))
      setLoadingEvents(false)
    }
    get()
  }, [])


  return (
    <div className="space-y-6">
      <div className=" rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-white mb-4">
            Cursos realizados
          </h2>
          <div className="space-y-2">
            {
              loadingEvents &&
              <div className='grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                <CourseCardPlaceholder />
                <CourseCardPlaceholder />
                <CourseCardPlaceholder />
              </div>
            }
            {
              !loadingEvents && pastEvents.length > 0 &&
              <div>
                <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.slice(0, visibleCount).map((event) => (
                    <Link key={event.id} className='w-fit' href={`/programas-academicos/${event.slug}`}>
                      <CourseCard 
                        title={event.title}
                        description={event.description}
                        image={event.heroImage}
                        heroImage={event.heroImage}
                        isShort={true}
                        level={event.level || "BÁSICO"}   
                        date={event.date}
                        slug={event.slug} />
                    </Link>
                  ))}
                </div>
                {/* <ShowMoreButton count={3} items={pastEvents} setVisibleCount={setVisibleCount} visibleCount={visibleCount} /> */}
              </div>

            }
            {!loadingEvents && pastEvents.length === 0 &&
              <p className='text-center text-sm text-white'>Por el momento no hay cursos terminados por ti, revisa el calendario y ¡Anímate a inscribirte! <Link className='text-blueApp font-semibold' href='/#cursos'>ver calendario</Link></p>}
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-lg font-medium text-white mb-4">
            Cursos registrados
          </h2>
          <div className="space-y-2">
            {
              loadingEvents &&
              <div className='grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                <CourseCardPlaceholder />
                <CourseCardPlaceholder />
                <CourseCardPlaceholder />
              </div>
            }
            {
              !loadingEvents && futureEvents.length > 0 &&
              <div>

                <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {futureEvents.map((event) => (
                    <Link key={event.id} className='w-fit' href={`/programas-academicos/${event.slug}`}>
                      <CourseCard 
                        title={event.title}
                        description={event.description}
                        isShort={true}
                        image={event.heroImage}
                        heroImage={event.heroImage}
                        level={event.level || "BÁSICO"}   
                        date={event.date}
                        slug={event.slug} />
                    </Link>
                  ))}
                </div>
                {/* <ShowMoreButton count={3} items={futureEvents} setVisibleCount={setVisibleCount} visibleCount={visibleCount} /> */}
              </div>
            }
            {!loadingEvents && futureEvents.length === 0 &&
              <p className='text-center text-sm text-white'>Por el momento no hay cursos registrados, revisa el calendario y ¡Anímate a inscribirte! <Link className='text-blueApp font-semibold' href='/#cursos'>ver calendario</Link></p>}
          </div>
        </div>
      </div>
    </div>
  )
}
