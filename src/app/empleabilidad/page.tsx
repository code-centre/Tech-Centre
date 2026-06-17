import type { Metadata } from "next";
import Image from "next/image";
import { Briefcase, FileText, Megaphone, Network } from "lucide-react";
import PageHero from "@/components/landing/PageHero";
import Reveal from "@/components/landing/Reveal";
import SparkEyebrow from "@/components/landing/SparkEyebrow";
import CtaBand from "@/components/landing/CtaBand";
import aliados from "../../../data/aliados.json";

export const metadata: Metadata = {
  title: "Empleabilidad · No te dejamos en la puerta del certificado",
  description:
    "Un mes después de certificarte entras a nuestro programa de empleabilidad: portafolio, skills de industria, cómo venderte y networking con empresas en convenio.",
};

const steps = [
  { icon: FileText, title: "Portafolio real", description: "Sales con productos desplegados que demuestran lo que sabes hacer, no solo un diploma." },
  { icon: Briefcase, title: "Skills de industria", description: "Trabajo en equipo, control de versiones, code review y las prácticas reales del trabajo tech." },
  { icon: Megaphone, title: "Cómo venderte", description: "Hoja de vida, LinkedIn, entrevistas técnicas y cómo contar tu historia con confianza." },
  { icon: Network, title: "Networking", description: "Conexión directa con empresas en convenio y la red del ecosistema Costa Digital." },
];

export default function EmpleabilidadPage() {
  return (
    <div className="landing-v2">
      <PageHero
        eyebrow="Empleabilidad"
        title={
          <>
            No te dejamos en la puerta del{" "}
            <span className="lv2-mint">certificado.</span>
          </>
        }
        subtitle="Un mes después de certificarte entras a nuestro programa de empleabilidad. Te acompañamos hasta que el oficio se convierta en oportunidad."
      />

      {/* Cómo funciona */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SparkEyebrow>Cómo funciona</SparkEyebrow>
            <h2 className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Del certificado al primer empleo tech
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={i * 0.07}>
                  <article className="lv2-card h-full p-7">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)]">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--paper)]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed lv2-soft">{step.description}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Empresas en convenio */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SparkEyebrow>Empresas en convenio</SparkEyebrow>
            <h2 className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Aliados que reciben nuestro talento
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {aliados.allies.map((ally, i) => (
              <Reveal key={ally.name} delay={(i % 4) * 0.06}>
                <div className="lv2-card flex h-24 items-center justify-center p-6">
                  <Image
                    src={ally.logo}
                    alt={ally.name}
                    width={140}
                    height={56}
                    className="h-10 w-auto object-contain opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Tu carrera tech"
        highlight="empieza aquí."
        subtitle="Conoce los programas y empieza el camino hacia tu primer empleo tech."
        primaryLabel="Ver programas"
        primaryHref="/programas"
      />
    </div>
  );
}
