import type { Metadata } from 'next';
import { StudentsList } from '@/components/adminspage/StudentsList';

export const metadata: Metadata = {
  title: 'Administración de Instructores',
  description: 'Panel de administración para gestionar instructores.',
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
        title="Instructores"
        subtitle="Gestiona instructores"
      />
    </div>
  );
}
