import Link from "next/link";
import PageHero from "../PageHero";
import Reveal from "../Reveal";
import SparkEyebrow from "../SparkEyebrow";
import IntensityCards from "../IntensityCards";
import CtaBand from "../CtaBand";
import FaqAccordion from "../FaqAccordion";
import Testimonios from "./Testimonios";
import type { RouteData } from "../data";
import { FAQS } from "../data";
import { ArrowRight } from "lucide-react";

export default function ProgramaPage({ route }: { route: RouteData }) {
  const accent = route.tone === "mint" ? "var(--mint)" : "var(--cyan)";
  const faqSubset = FAQS.slice(0, 5);

  return (
    <div className="landing-v2">
      <PageHero
        eyebrow={route.label}
        tone={route.tone}
        title={<span style={{ color: accent }}>{route.name}</span>}
        bgImage="/techcentre-hero.jpg"
        bgAlt="Estudiantes en clase presencial en Tech Centre"
      >
        <p className="lv2-display -mt-2 text-2xl text-[var(--paper)] sm:text-3xl">
          {route.tagline}
        </p>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed lv2-soft">
          {route.subtitle}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/inscripcion" className="lv2-btn">
            Inscríbete
          </Link>
          <a href="#temario" className="lv2-btn-secondary">
            Ver temario
          </a>
        </div>
      </PageHero>

      {/* Para quién + Qué construyes */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
          <Reveal>
            <div className="lv2-card h-full p-7">
              <p className="lv2-mono" style={{ color: accent }}>
                Para quién
              </p>
              <p className="mt-4 text-lg leading-relaxed text-[var(--paper)]">
                {route.forWhom}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="lv2-card h-full p-7">
              <p className="lv2-mono" style={{ color: accent }}>
                Qué vas a construir
              </p>
              <p className="mt-4 text-lg leading-relaxed text-[var(--paper)]">
                {route.build}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Temario */}
      <section id="temario" className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SparkEyebrow tone={route.tone}>El temario</SparkEyebrow>
            <h2 className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Cuatro módulos, de cero a desplegar
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {route.modules.map((m, i) => (
              <Reveal key={m.n} delay={i * 0.07}>
                <article
                  className="lv2-card h-full p-7"
                  style={m.entry ? { borderColor: "rgba(63,224,160,0.4)" } : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-bold ${
                        m.entry ? "lv2-ring text-[var(--ink)]" : "border border-[var(--line)]"
                      }`}
                      style={m.entry ? { background: accent } : { color: accent }}
                      aria-hidden="true"
                    >
                      {m.n}
                    </span>
                    <h3 className="lv2-display text-xl text-[var(--paper)]">{m.title}</h3>
                  </div>
                  <p className="mt-4 leading-relaxed lv2-soft">{m.topics}</p>
                  {m.entry && (
                    <span className="lv2-mono mt-4 block !text-[var(--mint)]">
                      Entrada para perfiles con experiencia
                    </span>
                  )}
                </article>
              </Reveal>
            ))}
          </div>

          {/* Perfil + intensidad */}
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr]">
            <Reveal>
              <div className="lv2-card flex h-full flex-col justify-center p-7">
                <p className="lv2-mono">Perfil al egresar</p>
                <p className="lv2-display mt-2 text-2xl" style={{ color: accent }}>
                  {route.profile}
                </p>
              </div>
            </Reveal>
            <div className="flex items-center">
              <div className="w-full">
                <IntensityCards />
              </div>
            </div>
          </div>

          {/* Callout entrada módulo 3 */}
          <Reveal className="mt-8">
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-[rgba(63,224,160,0.3)] bg-[rgba(63,224,160,0.06)] p-5 sm:flex-row sm:items-center">
              <span className="lv2-mono shrink-0 rounded-full border border-[var(--mint)] px-3 py-1 !text-[var(--mint)]">
                ¿Ya programas?
              </span>
              <p className="lv2-soft">
                Si tienes experiencia, puedes unirte directamente en el Módulo 3
                (IA aplicada), tras una breve validación de nivel.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Inversión resumen */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="lv2-card flex flex-col items-start justify-between gap-5 p-8 md:flex-row md:items-center">
              <div>
                <h2 className="lv2-display text-2xl text-[var(--paper)]">
                  Inversión flexible, con becas y cuotas
                </h2>
                <p className="mt-2 lv2-soft">
                  Estudiar no es un gasto, es la mejor inversión. Conoce los
                  planes de pago y becas disponibles.
                </p>
              </div>
              <Link href="/inversion" className="lv2-btn shrink-0">
                Ver inversión
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Testimonios />

      {/* FAQ corto */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <SparkEyebrow tone={route.tone}>Preguntas frecuentes</SparkEyebrow>
            <h2 className="lv2-display mb-8 mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Lo que más nos preguntan
            </h2>
          </Reveal>
          <FaqAccordion items={faqSubset} />
          <Reveal className="mt-6">
            <Link href="/faq" className="lv2-btn-secondary">
              Ver todas las preguntas
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaBand title="Esta es tu ruta." highlight="Empieza ahora." />
    </div>
  );
}
