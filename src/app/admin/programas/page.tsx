import type { Metadata } from "next";
import ProgramsAdmon from '@/components/adminspage/ProgramsAdmon';
import AdminRoute from '@/components/auth/AdminRoute';

export const metadata: Metadata = {
  title: "Administración de Programas",
  description: "Panel de administración para gestionar programas académicos.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProgramsAdminPage() {

  return (
    <AdminRoute>
    <main className="container mx-auto p-6 mt-24">
      <h1 className="text-3xl text-blueApp text-center font-bold mb-8">Administración de Programas</h1>
       <ProgramsAdmon /> 
    </main>
    </AdminRoute>
  );
}
