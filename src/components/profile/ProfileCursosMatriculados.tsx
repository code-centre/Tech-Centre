'use client';

import { GraduationCap, Clock, BookOpen, Badge, Calendar, Sparkles, ArrowRight, Loader2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '../../../utils/formatDate';

interface ProfileCursosMatriculadosProps {
  user: any;
}
// Temporary interface - we'll replace this with your actual course type later
interface EnrolledCourse {
  id: string;
  cohort_id: string;
  student_id: string;
  status: string;
  agreed_price: number;
  cohorts: {
    id: string;
    program_id: string;
    name: string;
    modality: string;
    start_date: string | null;
    end_date: string | null;
    programs: {
      id: string;
      name: string;
      total_hours: number;
      difficulty: string;
      image: string;
    } | null;
  } | null;
}

export default function ProfileCursosMatriculados({ user }: ProfileCursosMatriculadosProps) {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const { data: enrollments, error } = await (supabase as any)
            .from('enrollments')
            .select(`
                *,
                cohorts (
                *,
                programs (*)
                )
            `)
            .eq('student_id', user?.id);

            if (error) throw error;

            // Transform the data to match EnrolledCourse type
            const transformedEnrollments = (enrollments || []).map((enrollment: any) => {
            // Take the first cohort if it's an array, or use the cohort object directly
            const cohort = Array.isArray(enrollment.cohorts) 
                ? enrollment.cohorts[0] 
                : enrollment.cohorts;
            
            // If programs is an array, take the first one
            const programs = cohort?.programs 
                ? (Array.isArray(cohort.programs) ? cohort.programs[0] : cohort.programs)
                : null;

            return {
                ...enrollment,
                cohorts: cohort ? { ...cohort, programs } : null
            };
            });

            setEnrolledCourses(transformedEnrollments);
        } catch (err) {
            console.error('Error fetching enrollments:', err);
            setError('Error al cargar los cursos. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
        };

    fetchEnrollments();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-zuccini/10 rounded-lg">
            <GraduationCap className="text-zuccini" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Mis Cursos Matriculados</h2>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-zuccini" />
            <p className="text-gray-400 text-sm">Cargando tus cursos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-zuccini/10 rounded-lg">
            <GraduationCap className="text-zuccini" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Mis Cursos Matriculados</h2>
        </div>
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zuccini/10 rounded-lg">
            <GraduationCap className="text-zuccini" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Mis Cursos Matriculados</h2>
            <p className="text-sm text-gray-400 mt-1">
              {enrolledCourses.length > 0 
                ? `${enrolledCourses.length} ${enrolledCourses.length === 1 ? 'curso matriculado' : 'cursos matriculados'}`
                : 'Gestiona tus cursos y avanza en tu aprendizaje'
              }
            </p>
          </div>
        </div>
      </div>
      
      {enrolledCourses.length === 0 ? (
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 overflow-hidden shadow-xl">
          <div className="px-8 py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-zuccini/20 to-blue-600/20 mb-6">
              <Sparkles className="w-10 h-10 text-zuccini" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              ¡Comienza tu viaje de aprendizaje!
            </h3>
            <p className="text-lg text-gray-400 mb-2 max-w-md mx-auto">
              Aún no te has matriculado en ningún curso, pero eso está a punto de cambiar.
            </p>
            <p className="text-base text-gray-500 mb-8 max-w-md mx-auto">
              Explora nuestra oferta académica y encuentra el programa perfecto para impulsar tu carrera profesional.
          </p>
            <Link 
              href="/programas-academicos"
              className="inline-flex items-center gap-2 px-8 py-4 bg-zuccini hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-zuccini/20 hover:-translate-y-1 active:translate-y-0"
            >
              <BookOpen className="w-5 h-5" />
              <span>Explorar Cursos Disponibles</span>
              <ArrowRight className="w-5 h-5" />
          </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => {
            const program = course.cohorts?.programs;
            const difficulty = program?.difficulty || 'BÁSICO';
            const startDate = course.cohorts?.start_date ? formatDate(course.cohorts.start_date) : null;
            const endDate = course.cohorts?.end_date ? formatDate(course.cohorts.end_date) : null;
            
            return (
              <Link
                key={course.id}
                href={`/programas-academicos/${program?.id || course.cohorts?.program_id}`}
                className="group block h-full"
              >
                <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl border border-zinc-700/50 overflow-hidden shadow-lg hover:shadow-xl hover:shadow-zuccini/20 transition-all duration-300 hover:-translate-y-2 hover:border-zuccini/50 h-full flex flex-col">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    {program?.image ? (
                      <Image
                        src={program.image}
                        alt={program.name || 'Curso'}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zuccini/20 to-blue-600/20 flex items-center justify-center">
                        <GraduationCap className="w-16 h-16 text-zuccini/50" />
                      </div>
                    )}
                    
                    {/* Difficulty Badge */}
                    <div className="absolute top-4 left-4">
                      <div
                        className={`${
                          difficulty === 'BÁSICO'
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            : difficulty === 'INTERMEDIO'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                              : difficulty === 'AVANZADO'
                                ? 'bg-gradient-to-r from-red-500 to-rose-600'
                                : 'bg-gradient-to-r from-zuccini to-blue-600'
                        } text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-white/20 flex items-center gap-1.5`}
                      >
                        <TrendingUp className="h-3 w-3" />
                        {difficulty}
                      </div>
              </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`${
                        course.status === 'active' || course.status === 'enrolled'
                          ? 'bg-green-500/90'
                          : course.status === 'completed'
                            ? 'bg-blue-500/90'
                            : 'bg-gray-500/90'
                      } text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-white/20`}>
                        {course.status === 'active' || course.status === 'enrolled' ? 'Activo' : 
                         course.status === 'completed' ? 'Completado' : course.status}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-zuccini transition-colors duration-200 line-clamp-2">
                      {program?.name || 'Curso sin nombre'}
                    </h3>
                    
                    {course.cohorts?.name && (
                      <p className="text-sm text-gray-400 mb-4">{course.cohorts.name}</p>
                    )}

                    {/* Dates */}
                    {(startDate || endDate) && (
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 pb-4 border-b border-zinc-700/50">
                        <Calendar className="w-4 h-4 text-zuccini flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          {startDate && (
                            <p className="truncate">
                              <span className="text-gray-500">Inicio: </span>
                              <span className="text-white">{startDate}</span>
                            </p>
                          )}
                          {endDate && (
                            <p className="truncate">
                              <span className="text-gray-500">Fin: </span>
                              <span className="text-white">{endDate}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="space-y-3 mt-auto">
                      {course.cohorts?.modality && (
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                          <div className="flex items-center justify-center w-8 h-8 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
                            <BookOpen className="w-4 h-4 text-zuccini" />
                          </div>
                          <span>{course.cohorts.modality}</span>
                        </div>
                      )}
                      
                      {program?.total_hours && (
                        <div className="flex items-center gap-3 text-sm text-gray-300">
                          <div className="flex items-center justify-center w-8 h-8 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
                            <Clock className="w-4 h-4 text-zuccini" />
                          </div>
                          <span>{program.total_hours} horas</span>
                  </div>
                      )}
                  </div>

                    {/* View Course Link */}
                    <div className="mt-6 pt-4 border-t border-zinc-700/50">
                      <div className="flex items-center gap-2 text-zuccini text-sm font-medium group-hover:gap-3 transition-all duration-200">
                        <span>Ver detalles del curso</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </div>
            </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
