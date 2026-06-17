import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/landing/PageHero";
import Reveal from "@/components/landing/Reveal";

export const metadata: Metadata = {
  title: "Especialización avanzada · Próximamente",
  description:
    "La especialización avanzada de Tech Centre está en camino. Déjanos tus datos y te avisamos cuando abra.",
};

export default function AvanzadoPage() {
  return (
    <div className="landing-v2 min-h-[70vh]">
      <PageHero
        eyebrow="Avanzado"
        title={
          <>
            Especialización avanzada.{" "}
            <span className="lv2-mint">Próximamente.</span>
          </>
        }
        subtitle="Estamos diseñando el siguiente nivel para quienes ya dominan el oficio. Mientras tanto, empieza por una de las dos rutas."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/programas" className="lv2-btn">
            Ver las rutas disponibles
          </Link>
        </div>
      </PageHero>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="lv2-card p-8 text-center">
              <p className="lv2-soft">
                ¿Quieres que te avisemos cuando abra? Escríbenos y te
                contamos primero.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
