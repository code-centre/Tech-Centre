import AcademicOffer from "@/sections/AcademicOffer";
import Testimonials from "@/sections/Testimonials";
import { Ubication } from "@/sections/ubication";
import ProgramsAdmon from '@/components/adminspage/ProgramsAdmon';

export default function ProgramasAcademicos() {
  return (
    <main className="min-h-screen">
      <AcademicOffer />
      <Testimonials />
      <Ubication />
      <ProgramsAdmon />
    </main>
  );
}