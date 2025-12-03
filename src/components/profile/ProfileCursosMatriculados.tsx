'use client';

import { GraduationCap, Clock, BookOpen, Badge } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfileCursosMatriculadosProps {
  user: User | null;
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

  
  console.log('User object en profile cursos:', user);

  useEffect(() => {
    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const { data: enrollments, error } = await supabase
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
            const transformedEnrollments = enrollments.map(enrollment => {
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
        <h2 className="text-2xl font-bold tracking-tight text-blueApp">Mis Cursos Matriculados</h2>
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-blueApp">Mis Cursos Matriculados</h2>
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-blueApp">Mis Cursos Matriculados</h2>
      
      {enrolledCourses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No estás matriculado en ningún curso</h3>
          <p className="mt-1 text-sm text-gray-500">
            Explora nuestros cursos y comienza tu aprendizaje hoy mismo.
          </p>
          <Link href="/programas-academicos" className="mt-2 text-sm font-medium text-blueApp hover:underline">
            Ver todos los cursos
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => (
            <div key={course.id} className="overflow-hidden transition-shadow hover:shadow-lg bg-bgCard rounded-lg">
              <div 
                className="h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${course.cohorts?.programs?.image})` }}
              />
              <div className='p-2'>
                <p className="text-lg text-blueApp"> {course.cohorts?.programs?.name}</p>
                <p className="text-sm text-white"> {course.cohorts?.name}</p>
              </div>
              <div className='p-2'>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-blueApp mb-1">
                      
                      <span className="font-medium">Inicio: {course.cohorts?.start_date}</span>
                      <span className="font-medium">Fin: {course.cohorts?.end_date}</span>
                    </div>
                    {/* <Progress value={course.progress} className="h-2" /> */}
                  </div>

                  <div className="flex items-center text-sm text-white">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {course.cohorts?.modality}
                  </div>
                  <div className="flex items-center text-sm text-white">
                    <Badge className="mr-2 h-4 w-4" />
                    {course.cohorts?.programs?.difficulty}
                  </div>
                  <div className="flex items-center text-sm text-white">
                    <Clock className="mr-2 h-4 w-4" />
                    {course.cohorts?.programs?.total_hours}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
