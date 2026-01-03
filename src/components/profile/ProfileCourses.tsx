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
import type { Program } from '@/types/programs';


export default function ProfileEvents() {
  const { user } = useUserStore()
  const [courses, setCourses] = useState<Program[] | []>([])
  const [visibleCount, setVisibleCount] = useState(3)
  const [pastEvents, setPastEvents] = useState<Program[] | []>([])
  const [futureEvents, setFutureEvents] = useState<Program[] | []>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  const obtenerAsistenciasPorUsuario = async () => {
    const q = query(collection(db, "programRegister"), where("userId", "==", user?.id));
    const querySnapshot = await getDocs(q);

    const asistencias = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return asistencias;
  }

  const obtenerCoursesPorSlugs = async (programId: string[]) => {
    if (programId.length === 0) return []; // Si no hay eventos, devolver vacío
    if (programId.length > 10) {
      console.warn("Firestore solo permite 10 elementos en un 'in' query.");
      return [];
    }
    const q = query(collection(db, "programs"), where("slug", "in", programId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as Program[];
  }

  useEffect(() => {
    const get = async () => {
      const asistencias = (await obtenerAsistenciasPorUsuario()).map((item: any) => item.programId)

      const courses = await obtenerCoursesPorSlugs(asistencias)
      const now = new Date()
      setCourses(courses);

      setPastEvents(courses.filter((courses) => new Date(courses.startDate) < now))
      setFutureEvents(courses.filter((courses) => new Date(courses.startDate) > now))
      setLoadingEvents(false)
    }
    get()
  }, [])


  return (
    <div className="space-y-6">
      <div className=" rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-white mb-4">
            Diplomados realizados
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
                  {pastEvents.slice(0, visibleCount).map((diplomado) => (
                    <Link key={diplomado.id} className='w-fit' href={`/programas-academicos/${diplomado.slug}`}>
                      <CourseCard
                        key={diplomado.id}
                        title={diplomado.name}
                        description={diplomado.description}
                        image={diplomado.image}
                        level={(diplomado.level || '').toString().toUpperCase()}
                        duration={diplomado.duration}
                        instructor={(diplomado.teacher || []).join(", ")}
                        slug={diplomado.slug}
                      />
                    </Link>
                  ))}
                </div>
                {/* <ShowMoreButton count={3} items={pastEvents} setVisibleCount={setVisibleCount} visibleCount={visibleCount} /> */}
              </div>

            }
            {!loadingEvents && pastEvents.length === 0 &&
              <p className='text-center text-sm text-white'>Por el momento no hay diplomados terminados por ti, revisa el calendario y ¡Anímate a inscribirte! <Link className='text-blueApp font-semibold' href='/#cursos'>ver calendario</Link></p>}
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-lg font-medium text-white mb-4">
            Diplomados registrados
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
                  {futureEvents.map((diplomado) => (
                    <Link key={diplomado.id} className='w-fit' href={`/programas-academicos/${diplomado.slug}`}>
                      <CourseCard
                        key={diplomado.id}
                        title={diplomado.name}
                        description={diplomado.description}
                        image={diplomado.image}
                        level={(diplomado.level || '').toString().toUpperCase()}
                        duration={diplomado.duration}
                        instructor={(diplomado.teacher || []).join(", ")}
                        slug={diplomado.slug} />
                    </Link>
                  ))}
                </div>
                {/* <ShowMoreButton count={3} items={futureEvents} setVisibleCount={setVisibleCount} visibleCount={visibleCount} /> */}
              </div>
            }
            {!loadingEvents && futureEvents.length === 0 &&
              <p className='text-center text-sm text-white'>Por el momento no hay diplomados registrados, revisa el calendario y ¡Anímate a inscribirte! <Link className='text-blueApp font-semibold' href='/#cursos'>ver calendario</Link></p>}
          </div>
        </div>
      </div>
    </div>
  )
}
