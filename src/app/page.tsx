import Image from "next/image";
import { Hero } from "@/sections/Hero";
import AcademicOffer from "@/sections/AcademicOffer";
import Testimonials from "@/sections/Testimonials";
import { WhoWeAre } from "@/sections/WhoWeAre";
import Reviews from "@/sections/Reviews";
import NoticiasSection from "@/sections/Noticias";
import { Ubication } from "@/sections/ubication";

export default function Home() {
  return (
    <>
      <Hero />
      <div id="quienes-somos">
        <WhoWeAre />
      </div>
      <div id="ubicacion">
        <Ubication />
      </div>
      <div id="testimonios">
        <Reviews />
      </div>
      <div id="programs">
        <AcademicOffer />
      </div>
      <Testimonials />
      <NoticiasSection/>      
    </>
  );
}
