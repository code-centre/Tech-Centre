import type { Metadata } from "next";
import ProgramsAdmon from '@/components/adminspage/ProgramsAdmon';

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
    <div className="container mx-auto">
      <ProgramsAdmon />
    </div>
  );
}
