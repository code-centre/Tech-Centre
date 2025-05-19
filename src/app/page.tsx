import Image from "next/image";
import Header from "../components/Header";
import Hero from "@/sections/Hero";
import AcademicOffer from "@/sections/AcademicOffer";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <AcademicOffer />
    </>
  );
}
