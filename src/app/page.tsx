import AcademicOffer from "@/sections/AcademicOffer";
import Testimonials from "@/sections/Testimonials";
import { WhoWeAre } from "@/sections/WhoWeAre";
import Reviews from "@/sections/Reviews";
import NoticiasSection from "@/sections/Noticias";
import { Ubication } from "@/sections/ubication";
import HeroCarrusel from "@/components/HeroCarrusel";
import heroData from '../../data/herocarrusel.json'

export default function Home() {
  return (
    <>
      <HeroCarrusel 
        items={heroData}
          type="hero"
          effect="fade"
          className="w-full z-10 rounded-lg mt-28"
          itemClassName="group z-10"
          imageClassName=""
        />
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
