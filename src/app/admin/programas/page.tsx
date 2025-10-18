
import ProgramsAdmon from '@/components/adminspage/ProgramsAdmon';
import AcademicOffer from '@/sections/AcademicOffer';
import AdminRoute from '@/components/auth/AdminRoute';

export default function ProgramsAdminPage() {

  return (
    <AdminRoute>
    <main className="container mx-auto p-6 mt-24">
      <h1 className="text-3xl text-blueApp text-center font-bold mb-8">Administración de Programas</h1>
       <ProgramsAdmon /> 
       <AcademicOffer />
    </main>
    </AdminRoute>
  );
}
