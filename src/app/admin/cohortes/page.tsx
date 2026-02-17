import type { Metadata } from "next";
import CohortesAdmon from '@/components/adminspage/CohortesAdmon';
// import AdminRoute from '@/components/auth/AdminRoute';

export const metadata: Metadata = {
  title: "Administración de Cohortes",
  description: "Panel de administración para gestionar cohortes académicas.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CohortesAdminPage() {
  return (
    // <AdminRoute>
      <main className="container mx-auto p-6">
        <CohortesAdmon />
      </main>
    // </AdminRoute>
  );
}