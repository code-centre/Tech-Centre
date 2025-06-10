import Image from "next/image";
import { Hero } from "@/sections/Hero";
import AcademicOffer from "@/sections/AcademicOffer";
import Testimonials from "@/sections/Testimonials";
import { WhoWeAre } from "@/sections/WhoWeAre";

export default function Home() {
  return (
    <>
   
      <Hero />
      <AcademicOffer />
      <WhoWeAre/>
      <Testimonials />
    </>
  );
}
