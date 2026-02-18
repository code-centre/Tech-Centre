import type { Metadata } from 'next';
import { StudentsList } from '@/components/adminspage/StudentsList';

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
    <div className="container mx-auto">
      <StudentsList
        roleFilter={['student', 'lead']}
        title="Estudiantes"
        subtitle="Gestiona estudiantes y leads"
      />
    </div>
  );
}