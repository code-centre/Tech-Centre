import type { Metadata } from 'next';
import { StudentsList } from '@/components/adminspage/StudentsList';

export const metadata: Metadata = {
  title: 'Administración de Profesores',
  description: 'Panel de administración para gestionar profesores e instructores.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function InstructoresPage() {
  return (
    <div className="container mx-auto">
      <StudentsList
        roleFilter={['instructor']}
        title="Profesores"
        subtitle="Usuarios con rol de instructor"
      />
    </div>
  );
}
