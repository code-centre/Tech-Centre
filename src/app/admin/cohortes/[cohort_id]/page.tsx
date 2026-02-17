'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase';
import { StudentsList } from '@/components/adminspage/StudentsList';
import { StudentsFilter } from '@/components/adminspage/StudentsFilter';
import EnrollmentModal from '@/components/adminspage/EnrollmentModal';
// import AdminRoute from '@/components/auth/AdminRoute';
import Link from 'next/link';

interface Profile {
  user_id: string;
  first_name: string;
  email: string;
  phone?: string;
}

interface Enrollment {
  id: number;
  cohort_id: number;
  student_id: string;
  status: string;
  agreed_price: number;
  created_at: string;
  profile: Profile | null;
  cohort: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    program: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export default function CohortStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cohort, setCohort] = useState<any>(null);
  const [filters, setFilters] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);

  const cohortId = params.cohort_id as string;

  useEffect(() => {
    fetchCohortAndStudents();
  }, [cohortId]);

  const fetchCohortAndStudents = async () => {
    try {
      setLoading(true);
      
      // Fetch cohort information
      const { data: cohortData, error: cohortError } = await supabase
        .from('cohorts')
        .select(`
          *,
          programs:program_id (
            id,
            name
          )
        `)
        .eq('id', cohortId)
        .single();

      if (cohortError) {
        console.error('Error fetching cohort:', cohortError);
        setLoading(false);
        return;
      }

      setCohort(cohortData);

      // Fetch enrollments for this cohort
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          profiles:student_id (
            user_id,
            first_name,
            last_name,
            email,
            phone,
            role
          )
        `)
        .eq('cohort_id', cohortId)
        .order('created_at', { ascending: false });

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
      } else {
        setEnrollments(enrollmentsData || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in fetchCohortAndStudents:', error);
      setLoading(false);
    }
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
    console.log('Aplicando filtros:', newFilters);
  };

  const handleEnrollmentCreated = () => {
    fetchCohortAndStudents();
  };

  if (loading) {
    return (
    //   <AdminRoute>
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      // </AdminRoute>
    );
  }

  return (
    // <AdminRoute>
      <main className="container mx-auto px-4 py-8 mt-24">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-6 text-sm">
          <Link 
            href="/admin/cohortes" 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Volver a Cohortes
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-700 font-medium">
            {cohort?.name || `Cohorte ${cohortId}`}
          </span>
        </nav>

        {/* Cohort Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Estudiantes de la Cohorte: {cohort?.name || `Cohorte ${cohortId}`}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">ID:</span> {cohort?.id}
                </div>
                <div>
                  <span className="font-medium">Programa:</span> {cohort?.programs?.name}
                </div>
                <div>
                  <span className="font-medium">Fechas:</span> {cohort?.start_date} - {cohort?.end_date}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Añadir Estudiante
            </button>
          </div>
        </div>

        {/* Filters */}
        <StudentsFilter onFilter={handleFilter} />

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <StudentsList 
            filters={filters} 
            enrollments={enrollments}
            showCohortInfo={false}
          />
        </div>

        {/* Enrollment Modal */}
        <EnrollmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cohortId={cohortId}
          onEnrollmentCreated={handleEnrollmentCreated}
        />
      </main>
    // </AdminRoute>
  );
}