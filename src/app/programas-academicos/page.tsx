import AcademicOfferSupa from "@/sections/AcademicOfferSupa";
import Testimonials from "@/sections/Testimonials";
import { Ubication } from "@/sections/ubication";
import ProgramsAdmon from '@/components/adminspage/ProgramsAdmon';
import AcademicOffer from "@/sections/AcademicOffer";

export default function ProgramasAcademicos() {
  return (
    <main className="min-h-screen">
      <AcademicOfferSupa />
      {/* <AcademicOffer /> */}
      <Testimonials />
    </main>
  );
}