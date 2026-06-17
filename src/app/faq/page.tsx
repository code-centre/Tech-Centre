import type { Metadata } from "next";
import PageHero from "@/components/landing/PageHero";
import FaqAccordion from "@/components/landing/FaqAccordion";
import CtaBand from "@/components/landing/CtaBand";
import { FAQS } from "@/components/landing/data";

export const metadata: Metadata = {
  title: "Preguntas frecuentes · Tech Centre",
  description:
    "Resolvemos tus dudas sobre requisitos, horarios, modalidad, inversión, empleabilidad e inscripción en los programas de Tech Centre.",
};

export default function FaqPage() {
  return (
    <div className="landing-v2">
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Preguntas{" "}
            <span className="lv2-mint">frecuentes.</span>
          </>
        }
        subtitle="Todo lo que necesitas saber antes de empezar. Si te queda una duda, escríbenos por WhatsApp."
      />

      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={FAQS} groupByCategory />
        </div>
      </section>

      <CtaBand title="¿Lista tu duda?" highlight="Da el paso." />
    </div>
  );
}
