import type { Metadata } from 'next';
import { StudentsList } from '@/components/adminspage/StudentsList';
import DiagnosticoLeadsSection from '@/components/adminspage/DiagnosticoLeadsSection';

export const metadata: Metadata = {
  title: 'Administración de Usuarios',
  description: 'Panel de administración para gestionar estudiantes, leads y exalumnos.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EstudiantesPage() {
  return (
    <div className="container mx-auto space-y-8">
      <StudentsList
        roleFilter={['student', 'lead']}
        title="Estudiantes"
        subtitle="Gestiona estudiantes y leads"
      />
      <DiagnosticoLeadsSection />
    </div>
  );
}