import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth/require-role';
import EmailTemplatesAdmin from '@/components/adminspage/EmailTemplatesAdmin';

export const metadata: Metadata = {
  title: 'Administración de correos',
  description: 'Plantillas de correo transaccional de Tech Centre.',
  robots: { index: false, follow: false },
};

export default async function AdminCorreosPage() {
  await requireRole(['admin']);

  return (
    <main className="container mx-auto">
      <EmailTemplatesAdmin />
    </main>
  );
}
