import Image from "next/image";
import { Hero } from "@/sections/Hero";
import AcademicOffer from "@/sections/AcademicOffer";
import Testimonials from "@/sections/Testimonials";
import { WhoWeAre } from "@/sections/WhoWeAre";
import Reviews from "@/sections/Reviews";

export default function Home() {
  return (
    <>
      <Hero />
      <div id="programs">
        <AcademicOffer />
      </div>
      <Testimonials />
      <div id="testimonios">
        <Reviews />
      </div>
      <div id="quienes-somos">
        <WhoWeAre />
      </div>
    </>
  );
}
