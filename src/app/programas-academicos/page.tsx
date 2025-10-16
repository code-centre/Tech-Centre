import AcademicOffer from "@/sections/AcademicOffer";
import Testimonials from "@/sections/Testimonials";
import { Ubication } from "@/sections/ubication";

export default function ProgramasAcademicos() {
  return (
    <main className="min-h-screen">
      <AcademicOffer />
      <Testimonials />
      <Ubication />
    </main>
  );
}