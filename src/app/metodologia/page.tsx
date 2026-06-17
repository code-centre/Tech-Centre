import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Code,
  MessageSquare,
  Sparkles,
  UsersRound,
} from "lucide-react";
import PageHero from "@/components/landing/PageHero";
import Reveal from "@/components/landing/Reveal";
import SparkEyebrow from "@/components/landing/SparkEyebrow";
import ModuleTimeline from "@/components/landing/ModuleTimeline";
import PhotoGallery from "@/components/landing/PhotoGallery";
import CtaBand from "@/components/landing/CtaBand";
import { SHARED_MODULES, GALLERY_MOSAIC, GALLERY_MARQUEE } from "@/components/landing/data";

export const metadata: Metadata = {
  title: "Cómo aprendes · El método Tech Centre",
  description:
    "Aprender haciendo, acompañado, en el Caribe. Clases presenciales, proyectos desde el día 1, mentores activos en la industria y una comunidad que no te suelta.",
};

const pillars = [
  {
    icon: Users,
    title: "Clases presenciales y guiadas",
    description:
      "Aprendes en un entorno colaborativo con grupos reducidos. Recibes acompañamiento directo de mentores que resuelven tus dudas en tiempo real, frente a frente, en la Casa Tech.",
  },
  {
    icon: Code,
    title: "Proyectos desde el primer día",
    description:
      "Aprendes haciendo. Desde el inicio trabajas en retos reales del mundo laboral y terminas cada etapa con algo desplegado, no con apuntes.",
  },
  {
    icon: MessageSquare,
    title: "Feedback y seguimiento continuo",
    description:
      "Recibes retroalimentación constante sobre tu progreso y ajustas tu aprendizaje con guía personalizada en cada paso del camino.",
  },
  {
    icon: Sparkles,
    title: "IA como herramienta de trabajo",
    description:
      "Integras inteligencia artificial en tu forma de construir desde el día 1, usando las mismas herramientas que la industria usa hoy.",
  },
  {
    icon: UsersRound,
    title: "Comunidad y eventos",
    description:
      "Te conectas con una red activa de estudiantes, mentores y profesionales del Caribe. Participas en eventos, hackatones y espacios donde la tecnología se vive en comunidad.",
  },
];

export default function MetodologiaPage() {
  return (
    <div className="landing-v2">
      <PageHero
        eyebrow="El método"
        title={
          <>
            Aprender haciendo, acompañado,{" "}
            <span className="lv2-mint">en el Caribe.</span>
          </>
        }
        subtitle="Metodología práctica, acompañamiento cercano y una comunidad que crece contigo. Así formamos el genio."
      />

      {/* Pilares */}
      <section className="px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="pilares-title">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SparkEyebrow>Los pilares</SparkEyebrow>
            <h2 id="pilares-title" className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Una experiencia diseñada para la industria real
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <Reveal key={pillar.title} delay={i * 0.07}>
                  <article className="lv2-card group h-full p-7">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)] transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--paper)]">{pillar.title}</h3>
                    <p className="mt-2 leading-relaxed lv2-soft">{pillar.description}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* El viaje de 4 módulos */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SparkEyebrow>El viaje</SparkEyebrow>
            <h2 className="lv2-display mt-5 max-w-2xl text-3xl text-[var(--paper)] sm:text-4xl">
              De 0 a contratable, en cuatro módulos
            </h2>
            <p className="mb-10 mt-4 max-w-2xl text-lg lv2-soft">
              Empiezas sin saber programar y sales con un perfil que la industria
              nombra y busca: Ingeniero de Aplicaciones de IA.
            </p>
          </Reveal>
          <ModuleTimeline items={SHARED_MODULES} />
        </div>
      </section>

      {/* Galería de la experiencia */}
      <section className="py-12" aria-labelledby="experiencia-metodo-title">
        <div className="mx-auto mb-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SparkEyebrow>La experiencia</SparkEyebrow>
            <h2 id="experiencia-metodo-title" className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Así se vive el salón
            </h2>
          </Reveal>
        </div>
        <PhotoGallery mosaic={GALLERY_MOSAIC} marquee={GALLERY_MARQUEE} floatingMark="Manos que crean." />
      </section>

      {/* Acompañamiento */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { t: "Grupos pequeños", d: "Cupos limitados para que nadie quede atrás." },
              { t: "Mentores de industria", d: "Profesionales que trabajan en tech, no solo teoría." },
              { t: "Feedback continuo", d: "Acompañamiento humano en cada etapa del camino." },
            ].map((item, i) => (
              <Reveal key={item.t} delay={i * 0.08}>
                <div className="lv2-card h-full p-7">
                  <h3 className="lv2-display text-xl text-[var(--paper)]">{item.t}</h3>
                  <p className="mt-2 lv2-soft">{item.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <Link href="/programas" className="lv2-btn">
              Conoce los programas
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Aprende haciendo." highlight="Empieza a explorar." />
    </div>
  );
}
