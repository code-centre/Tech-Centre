import type { Metadata } from "next";
import { Check, GraduationCap, HandCoins, Sparkles } from "lucide-react";
import PageHero from "@/components/landing/PageHero";
import Reveal from "@/components/landing/Reveal";
import SparkEyebrow from "@/components/landing/SparkEyebrow";
import FaqAccordion from "@/components/landing/FaqAccordion";
import CtaBand from "@/components/landing/CtaBand";
import { FAQS } from "@/components/landing/data";

export const metadata: Metadata = {
  title: "Inversión y becas · Invierte en ti",
  description:
    "Estudiar no es un gasto, es la mejor inversión. Matrícula y cuotas flexibles, becas y convenios. Conoce qué incluye tu ruta en Tech Centre.",
};

const includes = [
  "Clases presenciales con mentores activos en la industria",
  "Proyectos reales desplegados desde el primer día",
  "Portafolio profesional al egresar",
  "Acceso a la comunidad y eventos del ecosistema",
  "Programa de empleabilidad después de certificarte",
];

const payFaqs = FAQS.filter((f) => f.category === "Inversión y pagos");

export default function InversionPage() {
  return (
    <div className="landing-v2">
      <PageHero
        eyebrow="Inversión"
        title={
          <>
            Invierte en ti.{" "}
            <span className="lv2-mint">Sin presión.</span>
          </>
        }
        subtitle="Estudiar no es un gasto, es la mejor inversión. Te damos transparencia y opciones para que el costo no sea la barrera."
      />

      {/* Formas de pago + becas */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
          <Reveal>
            <article className="lv2-card h-full p-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(63,224,160,0.12)] text-[var(--mint)]">
                <HandCoins className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="lv2-display text-2xl text-[var(--paper)]">Precio y formas de pago</h2>
              <p className="mt-3 leading-relaxed lv2-soft">
                Puedes tomar la ruta completa o una etapa individual. Ofrecemos
                matrícula más cuotas mensuales para que avances a tu ritmo.
                Escríbenos y armamos un plan según tu caso.
              </p>
            </article>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="lv2-card h-full p-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(116,186,255,0.12)] text-[var(--cyan)]">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="lv2-display text-2xl text-[var(--paper)]">Becas y alianzas</h2>
              <p className="mt-3 leading-relaxed lv2-soft">
                Contamos con becas y convenios, como Becas Atlántico y alianzas
                con el ecosistema, para que más talento del Caribe pueda
                formarse. Pregúntanos por las que están abiertas.
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SparkEyebrow>Qué incluye</SparkEyebrow>
            <h2 className="lv2-display mt-5 text-3xl text-[var(--paper)] sm:text-4xl">
              Mucho más que clases
            </h2>
          </Reveal>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {includes.map((item, i) => (
              <Reveal key={item} delay={(i % 2) * 0.06}>
                <li className="lv2-card flex items-start gap-3 p-5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--mint)]" aria-hidden="true" />
                  <span className="lv2-soft">{item}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ de pagos */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="mb-8 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[var(--mint)]" aria-hidden="true" />
              <h2 className="lv2-display text-2xl text-[var(--paper)]">Preguntas sobre pagos</h2>
            </div>
          </Reveal>
          <FaqAccordion items={payFaqs.length ? payFaqs : FAQS.slice(0, 3)} />
        </div>
      </section>

      <CtaBand title="Tu mejor inversión" highlight="eres tú." />
    </div>
  );
}
