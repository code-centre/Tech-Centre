import type { Metadata } from 'next';
import EstudiantesAdmin from '@/components/adminspage/EstudiantesAdmin';

export const metadata: Metadata = {
  title: 'Administración de Estudiantes',
  description: 'Panel de administración para gestionar estudiantes, exalumnos y leads.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EstudiantesPage() {
  return <EstudiantesAdmin />;
}
