import type { Metadata } from 'next';
import { StudentsList } from '@/components/adminspage/StudentsList';

export const metadata: Metadata = {
  title: 'Administración de Admins',
  description: 'Panel de administración para gestionar administradores.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminsPage() {
  return (
    <div className="container mx-auto">
      <StudentsList
        roleFilter={['admin']}
        title="Admins"
        subtitle="Gestiona administradores"
      />
    </div>
  );
}
