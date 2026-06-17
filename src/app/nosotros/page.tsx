import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/landing/PageHero";
import Reveal from "@/components/landing/Reveal";
import SparkEyebrow from "@/components/landing/SparkEyebrow";
import EcosistemaStrip from "@/components/landing/EcosistemaStrip";
import PrensaAliados from "@/components/landing/sections/PrensaAliados";
import CtaBand from "@/components/landing/CtaBand";
import { MENTORS } from "@/components/landing/data";

export const metadata: Metadata = {
  title: "Sobre nosotros · Tech Centre y Costa Digital",
  description:
    "La historia de Tech Centre: la convicción de su fundador, Anuar Harb, y su pertenencia al ecosistema Costa Digital. Devolverle al Caribe la oportunidad que transforma.",
};

export default function NosotrosPage() {
  return (
    <div className="landing-v2">
      <PageHero
        eyebrow="Nosotros"
        title={
          <>
            Devolverle al Caribe la oportunidad que{" "}
            <span className="lv2-mint">me transformó.</span>
          </>
        }
      />

      {/* Historia del fundador */}
      <section className="px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="fundador-title">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-[2fr_3fr]">
          <Reveal>
            <figure className="lv2-card overflow-hidden">
              <Image
                src="/community/equipo-selfie.webp"
                alt="Anuar Harb, fundador de Tech Centre, con la comunidad"
                width={768}
                height={1024}
                className="h-auto w-full object-cover"
              />
            </figure>
          </Reveal>
          <Reveal delay={0.1}>
            <SparkEyebrow>La historia</SparkEyebrow>
            <h2 id="fundador-title" className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              De una puerta que se abrió, a abrir esa puerta para otros
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed lv2-soft">
              <p>
                Tech Centre nació de una convicción personal de su fundador,
                Anuar Harb. Nacido en Ciudad de México, Anuar no entró a la
                tecnología por la universidad tradicional, sino a través de un
                bootcamp de desarrollo web, una academia muy parecida a esta.
              </p>
              <p>
                Esa puerta le cambió la vida: lo conectó con mentores, una red y
                un oficio. Tras más de diez años como desarrollador de software y
                como docente de programación, se mudó a Barranquilla con una
                misión: que el talento del Caribe deje de migrar y empiece a
                construir desde aquí.
              </p>
              <p>
                Tech Centre es su forma de abrir, en el Caribe, la misma puerta
                que a él lo transformó en México.
              </p>
            </div>
            <a
              href="https://anuarharb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1 font-semibold text-[var(--mint)]"
            >
              Conoce más de su historia en anuarharb.com
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* Misión */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <div className="flex justify-center">
              <SparkEyebrow>Misión</SparkEyebrow>
            </div>
            <h2 className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              <span className="lv2-mint">Manos que crean.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-[60ch] text-lg leading-relaxed lv2-soft">
              Creemos en la filosofía caribeña de aprender haciendo, con
              seguridad psicológica para equivocarse y volver a intentar. No
              formamos programadores de un lenguaje: formamos personas que
              dominan el oficio de construir sistemas de IA confiables.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Tech Centre y Costa Digital */}
      <section className="px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="costa-title">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SparkEyebrow>La alianza</SparkEyebrow>
            <h2 id="costa-title" className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Tech Centre y Costa Digital
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed lv2-soft">
              <p>
                Tech Centre es la rama de educación del ecosistema Costa Digital,
                el centro de innovación y transformación tecnológica del Caribe
                colombiano, operado por la Fundación Código Abierto desde la Casa
                Tech, en El Prado.
              </p>
              <p>
                Bajo un mismo techo, Costa Digital articula cuatro fuerzas que
                cubren el ciclo completo del talento: educación (Tech Centre),
                comunidad (Código Abierto), innovación (Ciudad Inmersiva) y
                capital (Caribe Ventures). Juntos perseguimos una sola tesis:
                convertir al Caribe colombiano en el próximo epicentro tech de
                Latinoamérica.
              </p>
            </div>
          </Reveal>
        </div>
        <div className="mt-10">
          <EcosistemaStrip />
        </div>
      </section>

      {/* Mentores */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SparkEyebrow>El equipo</SparkEyebrow>
            <h2 className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Mentores activos en la industria
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {MENTORS.map((mentor, i) => (
              <Reveal key={mentor.name} delay={i * 0.08}>
                <article className="lv2-card h-full p-7">
                  <h3 className="lv2-display text-xl text-[var(--paper)]">{mentor.name}</h3>
                  <p className="mt-2 lv2-soft">{mentor.role}</p>
                  {mentor.href && (
                    <a
                      href={mentor.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--mint)]"
                    >
                      Ver más
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* El espacio */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SparkEyebrow>El espacio</SparkEyebrow>
            <h2 className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              La Casa Tech, patrimonio de El Prado
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Reveal>
              <figure className="lv2-card overflow-hidden">
                <Image src="/community/sede-codigo-abierto.webp" alt="Fachada de la Casa Tech en El Prado, Barranquilla" width={768} height={1024} className="h-72 w-full object-cover" />
              </figure>
            </Reveal>
            <Reveal delay={0.1}>
              <figure className="lv2-card overflow-hidden">
                <Image src="/community/sesion-fca.webp" alt="Sesión presencial dentro de la Casa Tech" width={1024} height={768} className="h-72 w-full object-cover" />
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      <PrensaAliados />

      <CtaBand title="Conoce los programas." highlight="Visítanos." primaryLabel="Ver programas" primaryHref="/programas" />
    </div>
  );
}
